import express from 'express';
import db from '../db.js';
import { authMiddleware } from '../auth.js';

const router = express.Router();

router.use(authMiddleware);

const VALID_STATUSES = new Set(['ok', 'parcial', 'erro', 'omitido']);

// GET /api/attempts
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;
    const { specialty_id, station_id, from, to } = req.query;

    const conditions = ['a.user_id = ?'];
    const params = [userId];

    if (specialty_id) {
      conditions.push('st.specialty_id = ?');
      params.push(Number(specialty_id));
    }

    if (station_id) {
      conditions.push('a.station_id = ?');
      params.push(Number(station_id));
    }

    if (from) {
      conditions.push('date(a.performed_at) >= date(?)');
      params.push(String(from));
    }

    if (to) {
      conditions.push('date(a.performed_at) <= date(?)');
      params.push(String(to));
    }

    const whereClause = conditions.join(' AND ');

    const attempts = db
      .prepare(
        `
        SELECT
          a.id,
          a.user_id,
          a.station_id,
          a.performed_at,
          a.duration_sec,
          a.total_score,
          a.max_score,
          a.notes,
          CASE WHEN a.max_score > 0 THEN ROUND((a.total_score * 100.0) / a.max_score, 1) ELSE 0 END AS percentage,
          st.title AS station_title,
          st.difficulty AS station_difficulty,
          sp.id AS specialty_id,
          sp.name AS specialty_name,
          sp.slug AS specialty_slug,
          sp.color AS specialty_color,
          sp.icon AS specialty_icon,
          (SELECT COUNT(*) FROM attempt_items ai WHERE ai.attempt_id = a.id AND ai.status = 'ok') AS ok_count,
          (SELECT COUNT(*) FROM attempt_items ai WHERE ai.attempt_id = a.id AND ai.status = 'parcial') AS parcial_count,
          (SELECT COUNT(*) FROM attempt_items ai WHERE ai.attempt_id = a.id AND ai.status = 'erro') AS erro_count,
          (SELECT COUNT(*) FROM attempt_items ai WHERE ai.attempt_id = a.id AND ai.status = 'omitido') AS omitido_count
        FROM attempts a
        JOIN stations st ON st.id = a.station_id
        JOIN specialties sp ON sp.id = st.specialty_id
        WHERE ${whereClause}
        ORDER BY a.performed_at DESC, a.id DESC
      `
      )
      .all(...params);

    return res.json(attempts);
  } catch (err) {
    console.error('Erro ao listar tentativas:', err);
    return res.status(500).json({ error: 'Erro ao listar histórico de tentativas.' });
  }
});

// GET /api/attempts/analytics/summary
router.get('/analytics/summary', (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Overall summary metrics
    const overall = db
      .prepare(
        `
        SELECT
          COUNT(*) AS total_attempts,
          COUNT(DISTINCT station_id) AS stations_practiced,
          ROUND(AVG(CASE WHEN max_score > 0 THEN (total_score * 100.0) / max_score ELSE 0 END), 1) AS avg_score
        FROM attempts
        WHERE user_id = ?
      `
      )
      .get(userId);

    const statusCounts = db
      .prepare(
        `
        SELECT
          COALESCE(SUM(CASE WHEN ai.status = 'ok' THEN 1 ELSE 0 END), 0) AS ok_count,
          COALESCE(SUM(CASE WHEN ai.status = 'parcial' THEN 1 ELSE 0 END), 0) AS parcial_count,
          COALESCE(SUM(CASE WHEN ai.status = 'erro' THEN 1 ELSE 0 END), 0) AS erro_count,
          COALESCE(SUM(CASE WHEN ai.status = 'omitido' THEN 1 ELSE 0 END), 0) AS omitido_count,
          COUNT(ai.id) AS total_items
        FROM attempt_items ai
        JOIN attempts a ON a.id = ai.attempt_id
        WHERE a.user_id = ?
      `
      )
      .get(userId);

    // 2. Performance by specialty
    const bySpecialty = db
      .prepare(
        `
        SELECT
          sp.id,
          sp.slug,
          sp.name,
          sp.icon,
          sp.color,
          (SELECT COUNT(*) FROM stations st WHERE st.specialty_id = sp.id) AS total_stations,
          COUNT(a.id) AS attempts,
          COUNT(DISTINCT a.station_id) AS stations_attempted,
          COALESCE(ROUND(AVG(CASE WHEN a.max_score > 0 THEN (a.total_score * 100.0) / a.max_score ELSE 0 END), 1), 0) AS avg_score
        FROM specialties sp
        LEFT JOIN stations st ON st.specialty_id = sp.id
        LEFT JOIN attempts a ON a.station_id = st.id AND a.user_id = ?
        GROUP BY sp.id
        ORDER BY sp.id ASC
      `
      )
      .all(userId);

    // 3. Performance by checklist category
    const byCategoryRaw = db
      .prepare(
        `
        SELECT
          ci.category,
          COUNT(ai.id) AS total,
          SUM(CASE WHEN ai.status = 'ok' THEN 1 ELSE 0 END) AS ok,
          SUM(CASE WHEN ai.status = 'parcial' THEN 1 ELSE 0 END) AS parcial,
          SUM(CASE WHEN ai.status = 'erro' THEN 1 ELSE 0 END) AS erro,
          SUM(CASE WHEN ai.status = 'omitido' THEN 1 ELSE 0 END) AS omitido
        FROM attempt_items ai
        JOIN attempts a ON a.id = ai.attempt_id
        JOIN checklist_items ci ON ci.id = ai.checklist_item_id
        WHERE a.user_id = ?
        GROUP BY ci.category
        ORDER BY total DESC
      `
      )
      .all(userId);

    const byCategory = byCategoryRaw.map((row) => {
      const total = row.total || 1;
      const okPct = Math.round((row.ok * 1000) / total) / 10;
      const parcialPct = Math.round((row.parcial * 1000) / total) / 10;
      const erroPct = Math.round((row.erro * 1000) / total) / 10;
      const omitidoPct = Math.round((row.omitido * 1000) / total) / 10;
      const scorePct = Math.round(((row.ok + row.parcial * 0.5) * 1000) / total) / 10;
      return {
        ...row,
        ok_pct: okPct,
        parcial_pct: parcialPct,
        erro_pct: erroPct,
        omitido_pct: omitidoPct,
        score_pct: scorePct,
      };
    });

    // 4. Top 10 items with most errors/omissions/partial
    const topErrors = db
      .prepare(
        `
        SELECT
          ci.id AS item_id,
          ci.description,
          ci.expected_standard,
          ci.category,
          ci.weight,
          st.id AS station_id,
          st.title AS station_title,
          sp.name AS specialty_name,
          sp.slug AS specialty_slug,
          sp.color AS specialty_color,
          COUNT(ai.id) AS total_attempts,
          SUM(CASE WHEN ai.status = 'erro' THEN 1 ELSE 0 END) AS erro_count,
          SUM(CASE WHEN ai.status = 'omitido' THEN 1 ELSE 0 END) AS omitido_count,
          SUM(CASE WHEN ai.status = 'parcial' THEN 1 ELSE 0 END) AS parcial_count,
          SUM(CASE WHEN ai.status = 'ok' THEN 1 ELSE 0 END) AS ok_count,
          SUM(CASE WHEN ai.status IN ('erro', 'omitido') THEN 1 ELSE 0 END) AS critical_failures
        FROM attempt_items ai
        JOIN attempts a ON a.id = ai.attempt_id
        JOIN checklist_items ci ON ci.id = ai.checklist_item_id
        JOIN stations st ON st.id = ci.station_id
        JOIN specialties sp ON sp.id = st.specialty_id
        WHERE a.user_id = ?
        GROUP BY ci.id
        HAVING (erro_count + omitido_count + parcial_count) > 0
        ORDER BY (erro_count * 3 + omitido_count * 2 + parcial_count) DESC, ci.weight DESC
        LIMIT 10
      `
      )
      .all(userId);

    // 5. Timeline (last 60 days)
    const timeline = db
      .prepare(
        `
        SELECT
          a.id AS attempt_id,
          date(a.performed_at) AS date,
          a.performed_at,
          ROUND(CASE WHEN a.max_score > 0 THEN (a.total_score * 100.0) / a.max_score ELSE 0 END, 1) AS score,
          st.title AS station_title,
          sp.name AS specialty_name,
          sp.color AS specialty_color
        FROM attempts a
        JOIN stations st ON st.id = a.station_id
        JOIN specialties sp ON sp.id = st.specialty_id
        WHERE a.user_id = ?
          AND date(a.performed_at) >= date('now', '-60 days')
        ORDER BY a.performed_at ASC, a.id ASC
      `
      )
      .all(userId);

    return res.json({
      summary: {
        avgScore: overall.avg_score || 0,
        totalAttempts: overall.total_attempts || 0,
        stationsPracticed: overall.stations_practiced || 0,
        totalErrors: statusCounts.erro_count || 0,
        totalOmitted: statusCounts.omitido_count || 0,
        totalParcial: statusCounts.parcial_count || 0,
        totalOk: statusCounts.ok_count || 0,
        totalItemsEvaluated: statusCounts.total_items || 0,
      },
      bySpecialty,
      byCategory,
      topErrors,
      timeline,
    });
  } catch (err) {
    console.error('Erro ao gerar analytics:', err);
    return res.status(500).json({ error: 'Erro ao calcular estatísticas e análises.' });
  }
});

// GET /api/attempts/export
router.get('/export', (req, res) => {
  try {
    const userId = req.user.id;

    const attempts = db
      .prepare(
        `
        SELECT
          a.id,
          a.station_id,
          st.title AS station_title,
          a.performed_at,
          a.duration_sec,
          a.total_score,
          a.max_score,
          a.notes
        FROM attempts a
        JOIN stations st ON st.id = a.station_id
        WHERE a.user_id = ?
        ORDER BY a.performed_at ASC, a.id ASC
      `
      )
      .all(userId);

    const items = db
      .prepare(
        `
        SELECT
          ai.id,
          ai.attempt_id,
          ai.checklist_item_id,
          ci.order_idx,
          ci.description AS item_description,
          ai.status,
          ai.notes
        FROM attempt_items ai
        JOIN attempts a ON a.id = ai.attempt_id
        LEFT JOIN checklist_items ci ON ci.id = ai.checklist_item_id
        WHERE a.user_id = ?
        ORDER BY ai.attempt_id ASC, ai.id ASC
      `
      )
      .all(userId);

    return res.json({
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
      },
      attempts,
      items,
    });
  } catch (err) {
    console.error('Erro ao exportar tentativas:', err);
    return res.status(500).json({ error: 'Erro ao exportar dados.' });
  }
});

// POST /api/attempts/import
router.post('/import', (req, res) => {
  try {
    const userId = req.user.id;
    const payload = req.body || {};
    const rawAttempts = Array.isArray(payload.attempts) ? payload.attempts : [];
    const rawItems = Array.isArray(payload.items) ? payload.items : [];

    if (rawAttempts.length === 0) {
      return res
        .status(400)
        .json({ error: 'Nenhuma tentativa válida encontrada no JSON de importação.' });
    }

    const importTx = db.transaction(() => {
      const oldToNewAttemptId = new Map();
      let importedAttempts = 0;
      let skippedAttempts = 0;
      let importedItems = 0;

      const findStationById = db.prepare('SELECT id FROM stations WHERE id = ?');
      const findStationByTitle = db.prepare(
        'SELECT id FROM stations WHERE lower(title) = lower(?)'
      );
      const getStationItems = db.prepare(
        'SELECT id, order_idx, description, weight FROM checklist_items WHERE station_id = ? ORDER BY order_idx ASC, id ASC'
      );

      const insertAttempt = db.prepare(
        `
        INSERT INTO attempts (user_id, station_id, performed_at, duration_sec, total_score, max_score, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      );

      const insertAttemptItem = db.prepare(
        `
        INSERT INTO attempt_items (attempt_id, checklist_item_id, status, notes)
        VALUES (?, ?, ?, ?)
      `
      );

      // Group top-level items by old attempt_id
      const itemsByOldAttemptId = new Map();
      for (const item of rawItems) {
        if (!item || item.attempt_id == null) continue;
        const key = Number(item.attempt_id);
        if (!itemsByOldAttemptId.has(key)) {
          itemsByOldAttemptId.set(key, []);
        }
        itemsByOldAttemptId.get(key).push(item);
      }

      for (const att of rawAttempts) {
        if (!att) continue;

        // Resolve station_id (by ID first, fallback to title)
        let stationRow = att.station_id
          ? findStationById.get(Number(att.station_id))
          : null;
        if (!stationRow && att.station_title) {
          stationRow = findStationByTitle.get(String(att.station_title).trim());
        }

        if (!stationRow) {
          skippedAttempts++;
          continue;
        }

        const stationId = stationRow.id;
        const stationChecklist = getStationItems.all(stationId);
        const stationItemMap = new Map(stationChecklist.map((ci) => [ci.id, ci]));

        // Gather items from top-level items[] or nested att.items[]
        const candidateItems =
          (att.id != null && itemsByOldAttemptId.get(Number(att.id))) ||
          (Array.isArray(att.items) ? att.items : []);

        // Calculate score from station weights if possible, or fallback to imported score
        let maxScore = stationChecklist.reduce(
          (sum, ci) => sum + (Number(ci.weight) || 1.0),
          0
        );
        let totalScore = Number(att.total_score) || 0;
        if (!att.max_score && maxScore === 0) {
          maxScore = 1;
        } else if (att.max_score && stationChecklist.length === 0) {
          maxScore = Number(att.max_score);
        }

        const resolvedItems = [];
        for (let idx = 0; idx < candidateItems.length; idx++) {
          const rawIt = candidateItems[idx];
          if (!rawIt) continue;

          let targetCi = stationItemMap.get(Number(rawIt.checklist_item_id));
          if (!targetCi && rawIt.order_idx != null) {
            targetCi = stationChecklist.find(
              (c) => c.order_idx === Number(rawIt.order_idx)
            );
          }
          if (!targetCi && stationChecklist[idx]) {
            targetCi = stationChecklist[idx];
          }
          if (!targetCi) continue;

          const status = VALID_STATUSES.has(rawIt.status)
            ? rawIt.status
            : 'omitido';
          resolvedItems.push({
            checklist_item_id: targetCi.id,
            weight: Number(targetCi.weight) || 1.0,
            status,
            notes: rawIt.notes ? String(rawIt.notes) : '',
          });
        }

        if (resolvedItems.length > 0) {
          totalScore = resolvedItems.reduce((acc, it) => {
            if (it.status === 'ok') return acc + it.weight;
            if (it.status === 'parcial') return acc + it.weight * 0.5;
            return acc;
          }, 0);
        }

        totalScore = Math.round(totalScore * 100) / 100;
        maxScore = Math.round(maxScore * 100) / 100;

        const info = insertAttempt.run(
          userId,
          stationId,
          att.performed_at || new Date().toISOString(),
          Number(att.duration_sec) || 0,
          totalScore,
          maxScore,
          att.notes ? String(att.notes) : ''
        );

        const newAttemptId = Number(info.lastInsertRowid);
        if (att.id != null) {
          oldToNewAttemptId.set(Number(att.id), newAttemptId);
        }
        importedAttempts++;

        for (const rItem of resolvedItems) {
          insertAttemptItem.run(
            newAttemptId,
            rItem.checklist_item_id,
            rItem.status,
            rItem.notes
          );
          importedItems++;
        }
      }

      return {
        importedAttempts,
        importedItems,
        skippedAttempts,
        idMapping: Object.fromEntries(oldToNewAttemptId),
      };
    });

    const result = importTx();
    return res.status(201).json(result);
  } catch (err) {
    console.error('Erro ao importar tentativas:', err);
    return res
      .status(400)
      .json({ error: 'Falha ao importar JSON. Verifique a estrutura do arquivo.' });
  }
});

// GET /api/attempts/:id
router.get('/:id', (req, res) => {
  try {
    const attemptId = Number(req.params.id);
    const userId = req.user.id;

    const attempt = db
      .prepare(
        `
        SELECT
          a.*,
          CASE WHEN a.max_score > 0 THEN ROUND((a.total_score * 100.0) / a.max_score, 1) ELSE 0 END AS percentage,
          st.title AS station_title,
          st.description AS station_description,
          st.difficulty AS station_difficulty,
          st.duration_min AS station_duration_min,
          sp.id AS specialty_id,
          sp.name AS specialty_name,
          sp.slug AS specialty_slug,
          sp.color AS specialty_color,
          sp.icon AS specialty_icon
        FROM attempts a
        JOIN stations st ON st.id = a.station_id
        JOIN specialties sp ON sp.id = st.specialty_id
        WHERE a.id = ? AND a.user_id = ?
      `
      )
      .get(attemptId, userId);

    if (!attempt) {
      return res.status(404).json({ error: 'Tentativa não encontrada.' });
    }

    const items = db
      .prepare(
        `
        SELECT
          ai.id,
          ai.attempt_id,
          ai.checklist_item_id,
          ai.status,
          ai.notes,
          ci.category,
          ci.order_idx,
          ci.description,
          ci.expected_standard,
          ci.weight
        FROM attempt_items ai
        JOIN checklist_items ci ON ci.id = ai.checklist_item_id
        WHERE ai.attempt_id = ?
        ORDER BY ci.order_idx ASC, ci.id ASC
      `
      )
      .all(attemptId);

    return res.json({ attempt, items });
  } catch (err) {
    console.error('Erro ao buscar tentativa:', err);
    return res.status(500).json({ error: 'Erro ao carregar detalhes da tentativa.' });
  }
});

// POST /api/attempts
router.post('/', (req, res) => {
  try {
    const userId = req.user.id;
    const {
      station_id,
      duration_sec = 0,
      notes = '',
      performed_at,
      items = [],
    } = req.body || {};

    if (!station_id) {
      return res.status(400).json({ error: 'ID da estação é obrigatório.' });
    }

    const station = db
      .prepare('SELECT * FROM stations WHERE id = ?')
      .get(Number(station_id));
    if (!station) {
      return res.status(404).json({ error: 'Estação clínica não encontrada.' });
    }

    const checklistItems = db
      .prepare(
        'SELECT id, weight FROM checklist_items WHERE station_id = ? ORDER BY order_idx ASC, id ASC'
      )
      .all(station.id);

    if (checklistItems.length === 0) {
      return res
        .status(400)
        .json({ error: 'Esta estação não possui itens de checklist cadastrados.' });
    }

    // Map submitted statuses by checklist_item_id
    const submittedByItemId = new Map();
    if (Array.isArray(items)) {
      for (const it of items) {
        if (it && it.checklist_item_id != null) {
          const status = VALID_STATUSES.has(it.status) ? it.status : 'omitido';
          submittedByItemId.set(Number(it.checklist_item_id), {
            status,
            notes: it.notes ? String(it.notes).trim() : '',
          });
        }
      }
    }

    // Calculate total_score and max_score on the backend based on item weights
    let totalScore = 0;
    let maxScore = 0;

    for (const ci of checklistItems) {
      const weight = Number(ci.weight) || 1.0;
      maxScore += weight;

      const sub = submittedByItemId.get(ci.id);
      const status = sub ? sub.status : 'omitido';

      if (status === 'ok') {
        totalScore += weight;
      } else if (status === 'parcial') {
        totalScore += weight * 0.5;
      }
    }

    totalScore = Math.round(totalScore * 100) / 100;
    maxScore = Math.round(maxScore * 100) / 100;

    const createAttemptTx = db.transaction(() => {
      const attemptInfo = db
        .prepare(
          `
          INSERT INTO attempts (user_id, station_id, performed_at, duration_sec, total_score, max_score, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `
        )
        .run(
          userId,
          station.id,
          performed_at || new Date().toISOString(),
          Math.max(0, Number(duration_sec) || 0),
          totalScore,
          maxScore,
          String(notes || '').trim()
        );

      const attemptId = Number(attemptInfo.lastInsertRowid);

      const insertAttemptItem = db.prepare(
        `
        INSERT INTO attempt_items (attempt_id, checklist_item_id, status, notes)
        VALUES (?, ?, ?, ?)
      `
      );

      for (const ci of checklistItems) {
        const sub = submittedByItemId.get(ci.id);
        const status = sub ? sub.status : 'omitido';
        const itemNotes = sub ? sub.notes : '';
        insertAttemptItem.run(attemptId, ci.id, status, itemNotes);
      }

      return attemptId;
    });

    const newAttemptId = createAttemptTx();

    const createdAttempt = db
      .prepare(
        `
        SELECT
          a.*,
          CASE WHEN a.max_score > 0 THEN ROUND((a.total_score * 100.0) / a.max_score, 1) ELSE 0 END AS percentage
        FROM attempts a
        WHERE a.id = ?
      `
      )
      .get(newAttemptId);

    const createdItems = db
      .prepare(
        `
        SELECT
          ai.*,
          ci.category,
          ci.order_idx,
          ci.description,
          ci.expected_standard,
          ci.weight
        FROM attempt_items ai
        JOIN checklist_items ci ON ci.id = ai.checklist_item_id
        WHERE ai.attempt_id = ?
        ORDER BY ci.order_idx ASC, ci.id ASC
      `
      )
      .all(newAttemptId);

    return res.status(201).json({
      attempt: createdAttempt,
      items: createdItems,
    });
  } catch (err) {
    console.error('Erro ao salvar tentativa:', err);
    return res.status(500).json({ error: 'Erro interno ao salvar tentativa.' });
  }
});

// DELETE /api/attempts/:id
router.delete('/:id', (req, res) => {
  try {
    const attemptId = Number(req.params.id);
    const userId = req.user.id;

    const existing = db
      .prepare('SELECT id FROM attempts WHERE id = ? AND user_id = ?')
      .get(attemptId, userId);

    if (!existing) {
      return res
        .status(404)
        .json({ error: 'Tentativa não encontrada ou sem permissão.' });
    }

    db.prepare('DELETE FROM attempts WHERE id = ? AND user_id = ?').run(
      attemptId,
      userId
    );

    return res.json({ success: true, deletedId: attemptId });
  } catch (err) {
    console.error('Erro ao remover tentativa:', err);
    return res.status(500).json({ error: 'Erro ao excluir tentativa.' });
  }
});

export default router;
