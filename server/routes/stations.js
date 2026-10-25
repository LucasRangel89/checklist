import express from 'express';
import db from '../db.js';
import { authMiddleware } from '../auth.js';

const router = express.Router();

router.use(authMiddleware);

function getStationDetails(stationId, userId) {
  const station = db
    .prepare(
      `
      SELECT
        st.*,
        sp.name AS specialty_name,
        sp.slug AS specialty_slug,
        sp.color AS specialty_color,
        sp.icon AS specialty_icon,
        sp.skeleton AS specialty_skeleton
      FROM stations st
      JOIN specialties sp ON sp.id = st.specialty_id
      WHERE st.id = ?
    `
    )
    .get(stationId);

  if (!station) return null;

  const items = db
    .prepare(
      `
      SELECT id, station_id, category, order_idx, description, expected_standard, weight
      FROM checklist_items
      WHERE station_id = ?
      ORDER BY order_idx ASC, id ASC
    `
    )
    .all(stationId);

  const recentAttempts = db
    .prepare(
      `
      SELECT
        a.id,
        a.station_id,
        a.performed_at,
        a.duration_sec,
        a.total_score,
        a.max_score,
        a.notes,
        CASE WHEN a.max_score > 0 THEN ROUND((a.total_score * 100.0) / a.max_score, 1) ELSE 0 END AS percentage,
        (SELECT COUNT(*) FROM attempt_items ai WHERE ai.attempt_id = a.id AND ai.status = 'ok') AS ok_count,
        (SELECT COUNT(*) FROM attempt_items ai WHERE ai.attempt_id = a.id AND ai.status = 'parcial') AS parcial_count,
        (SELECT COUNT(*) FROM attempt_items ai WHERE ai.attempt_id = a.id AND ai.status = 'erro') AS erro_count,
        (SELECT COUNT(*) FROM attempt_items ai WHERE ai.attempt_id = a.id AND ai.status = 'omitido') AS omitido_count
      FROM attempts a
      WHERE a.station_id = ? AND a.user_id = ?
      ORDER BY a.performed_at DESC, a.id DESC
      LIMIT 10
    `
    )
    .all(stationId, userId);

  return { station, items, recentAttempts };
}

// GET /api/stations/:id
router.get('/:id', (req, res) => {
  try {
    const stationId = Number(req.params.id);
    const details = getStationDetails(stationId, req.user.id);
    if (!details) {
      return res.status(404).json({ error: 'Estação clínica não encontrada.' });
    }
    return res.json(details);
  } catch (err) {
    console.error('Erro ao buscar estação:', err);
    return res.status(500).json({ error: 'Erro ao buscar estação.' });
  }
});

// POST /api/stations
router.post('/', (req, res) => {
  try {
    const {
      specialty_id,
      title,
      description,
      difficulty = 'intermediário',
      duration_min = 10,
      items = [],
    } = req.body || {};

    if (!specialty_id || !title || !description) {
      return res
        .status(400)
        .json({ error: 'Especialidade, título e descrição são obrigatórios.' });
    }

    const spec = db
      .prepare('SELECT id FROM specialties WHERE id = ?')
      .get(Number(specialty_id));
    if (!spec) {
      return res.status(404).json({ error: 'Especialidade inválida.' });
    }

    const createStationTx = db.transaction(() => {
      const stationInfo = db
        .prepare(
          'INSERT INTO stations (specialty_id, title, description, difficulty, duration_min) VALUES (?, ?, ?, ?, ?)'
        )
        .run(
          Number(specialty_id),
          String(title).trim(),
          String(description).trim(),
          String(difficulty).trim() || 'intermediário',
          Number(duration_min) || 10
        );

      const stationId = Number(stationInfo.lastInsertRowid);

      if (Array.isArray(items) && items.length > 0) {
        const insertItem = db.prepare(
          'INSERT INTO checklist_items (station_id, category, order_idx, description, expected_standard, weight) VALUES (?, ?, ?, ?, ?, ?)'
        );
        items.forEach((it, index) => {
          if (it && it.description && it.expected_standard) {
            insertItem.run(
              stationId,
              String(it.category || 'Avaliação').trim(),
              it.order_idx ? Number(it.order_idx) : index + 1,
              String(it.description).trim(),
              String(it.expected_standard).trim(),
              Number(it.weight) > 0 ? Number(it.weight) : 1.0
            );
          }
        });
      }

      return stationId;
    });

    const newStationId = createStationTx();
    const details = getStationDetails(newStationId, req.user.id);
    return res.status(201).json(details);
  } catch (err) {
    console.error('Erro ao criar estação:', err);
    return res.status(500).json({ error: 'Erro ao criar estação clínica.' });
  }
});

// PUT /api/stations/:id
router.put('/:id', (req, res) => {
  try {
    const stationId = Number(req.params.id);
    const existing = db
      .prepare('SELECT * FROM stations WHERE id = ?')
      .get(stationId);

    if (!existing) {
      return res.status(404).json({ error: 'Estação não encontrada.' });
    }

    const {
      specialty_id = existing.specialty_id,
      title = existing.title,
      description = existing.description,
      difficulty = existing.difficulty,
      duration_min = existing.duration_min,
      items,
    } = req.body || {};

    const updateTx = db.transaction(() => {
      db.prepare(
        `
        UPDATE stations
        SET specialty_id = ?, title = ?, description = ?, difficulty = ?, duration_min = ?
        WHERE id = ?
      `
      ).run(
        Number(specialty_id),
        String(title).trim(),
        String(description).trim(),
        String(difficulty).trim(),
        Number(duration_min) || 10,
        stationId
      );

      // Optional full items sync if items array is provided
      if (Array.isArray(items)) {
        const updateItemStmt = db.prepare(
          `
          UPDATE checklist_items
          SET category = ?, order_idx = ?, description = ?, expected_standard = ?, weight = ?
          WHERE id = ? AND station_id = ?
        `
        );
        const insertItemStmt = db.prepare(
          `
          INSERT INTO checklist_items (station_id, category, order_idx, description, expected_standard, weight)
          VALUES (?, ?, ?, ?, ?, ?)
        `
        );

        items.forEach((it, idx) => {
          const orderIdx = it.order_idx ? Number(it.order_idx) : idx + 1;
          const weight = Number(it.weight) > 0 ? Number(it.weight) : 1.0;
          if (it.id) {
            updateItemStmt.run(
              String(it.category || 'Avaliação').trim(),
              orderIdx,
              String(it.description).trim(),
              String(it.expected_standard).trim(),
              weight,
              Number(it.id),
              stationId
            );
          } else if (it.description && it.expected_standard) {
            insertItemStmt.run(
              stationId,
              String(it.category || 'Avaliação').trim(),
              orderIdx,
              String(it.description).trim(),
              String(it.expected_standard).trim(),
              weight
            );
          }
        });
      }
    });

    updateTx();
    const details = getStationDetails(stationId, req.user.id);
    return res.json(details);
  } catch (err) {
    console.error('Erro ao atualizar estação:', err);
    return res.status(500).json({ error: 'Erro ao atualizar estação.' });
  }
});

// DELETE /api/stations/:id
router.delete('/:id', (req, res) => {
  try {
    const stationId = Number(req.params.id);
    const existing = db
      .prepare('SELECT id FROM stations WHERE id = ?')
      .get(stationId);

    if (!existing) {
      return res.status(404).json({ error: 'Estação não encontrada.' });
    }

    db.prepare('DELETE FROM stations WHERE id = ?').run(stationId);
    return res.json({ success: true, deletedId: stationId });
  } catch (err) {
    console.error('Erro ao remover estação:', err);
    return res.status(500).json({ error: 'Erro ao remover estação.' });
  }
});

// POST /api/stations/:id/items — Add checklist item to station
router.post('/:id/items', (req, res) => {
  try {
    const stationId = Number(req.params.id);
    const station = db
      .prepare('SELECT id FROM stations WHERE id = ?')
      .get(stationId);
    if (!station) {
      return res.status(404).json({ error: 'Estação não encontrada.' });
    }

    const {
      category = 'Avaliação',
      description,
      expected_standard,
      weight = 1.0,
      order_idx,
    } = req.body || {};

    if (!description || !expected_standard) {
      return res.status(400).json({
        error: 'Descrição e Padrão Esperado de Procedimento são obrigatórios.',
      });
    }

    const maxOrderRow = db
      .prepare(
        'SELECT COALESCE(MAX(order_idx), 0) AS max_order FROM checklist_items WHERE station_id = ?'
      )
      .get(stationId);
    const nextOrder = order_idx ? Number(order_idx) : maxOrderRow.max_order + 1;

    const info = db
      .prepare(
        `
        INSERT INTO checklist_items (station_id, category, order_idx, description, expected_standard, weight)
        VALUES (?, ?, ?, ?, ?, ?)
      `
      )
      .run(
        stationId,
        String(category).trim(),
        nextOrder,
        String(description).trim(),
        String(expected_standard).trim(),
        Number(weight) > 0 ? Number(weight) : 1.0
      );

    const item = db
      .prepare('SELECT * FROM checklist_items WHERE id = ?')
      .get(info.lastInsertRowid);

    return res.status(201).json({ item });
  } catch (err) {
    console.error('Erro ao adicionar item:', err);
    return res.status(500).json({ error: 'Erro ao adicionar item ao checklist.' });
  }
});

// PUT /api/stations/:id/items/:itemId — Edit checklist item
router.put('/:id/items/:itemId', (req, res) => {
  try {
    const stationId = Number(req.params.id);
    const itemId = Number(req.params.itemId);

    const existing = db
      .prepare('SELECT * FROM checklist_items WHERE id = ? AND station_id = ?')
      .get(itemId, stationId);
    if (!existing) {
      return res.status(404).json({ error: 'Item do checklist não encontrado.' });
    }

    const {
      category = existing.category,
      description = existing.description,
      expected_standard = existing.expected_standard,
      weight = existing.weight,
      order_idx = existing.order_idx,
    } = req.body || {};

    db.prepare(
      `
      UPDATE checklist_items
      SET category = ?, order_idx = ?, description = ?, expected_standard = ?, weight = ?
      WHERE id = ? AND station_id = ?
    `
    ).run(
      String(category).trim(),
      Number(order_idx) || existing.order_idx,
      String(description).trim(),
      String(expected_standard).trim(),
      Number(weight) > 0 ? Number(weight) : 1.0,
      itemId,
      stationId
    );

    const item = db
      .prepare('SELECT * FROM checklist_items WHERE id = ?')
      .get(itemId);
    return res.json({ item });
  } catch (err) {
    console.error('Erro ao editar item:', err);
    return res.status(500).json({ error: 'Erro ao atualizar item do checklist.' });
  }
});

// DELETE /api/stations/:id/items/:itemId — Delete checklist item
router.delete('/:id/items/:itemId', (req, res) => {
  try {
    const stationId = Number(req.params.id);
    const itemId = Number(req.params.itemId);

    const existing = db
      .prepare('SELECT id FROM checklist_items WHERE id = ? AND station_id = ?')
      .get(itemId, stationId);
    if (!existing) {
      return res.status(404).json({ error: 'Item do checklist não encontrado.' });
    }

    db.prepare('DELETE FROM checklist_items WHERE id = ? AND station_id = ?').run(
      itemId,
      stationId
    );

    // Reindex remaining items
    const remaining = db
      .prepare('SELECT id FROM checklist_items WHERE station_id = ? ORDER BY order_idx ASC, id ASC')
      .all(stationId);
    const updateIdx = db.prepare('UPDATE checklist_items SET order_idx = ? WHERE id = ?');
    const reindexTx = db.transaction(() => {
      remaining.forEach((row, index) => {
        updateIdx.run(index + 1, row.id);
      });
    });
    reindexTx();

    return res.json({ success: true, deletedItemId: itemId });
  } catch (err) {
    console.error('Erro ao excluir item:', err);
    return res.status(500).json({ error: 'Erro ao remover item do checklist.' });
  }
});

export default router;
