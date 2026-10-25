import express from 'express';
import db from '../db.js';
import { authMiddleware } from '../auth.js';

const router = express.Router();

router.use(authMiddleware);

// GET /api/specialties
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;

    const specialties = db
      .prepare(
        `
        SELECT
          sp.id,
          sp.slug,
          sp.name,
          sp.icon,
          sp.color,
          sp.description,
          sp.skeleton,
          (
            SELECT COUNT(*)
            FROM stations st
            WHERE st.specialty_id = sp.id
          ) AS total_stations,
          (
            SELECT COUNT(*)
            FROM attempts a
            JOIN stations st ON st.id = a.station_id
            WHERE st.specialty_id = sp.id AND a.user_id = ?
          ) AS total_attempts,
          (
            SELECT ROUND(AVG(CASE WHEN a.max_score > 0 THEN (a.total_score * 100.0 / a.max_score) ELSE 0 END), 1)
            FROM attempts a
            JOIN stations st ON st.id = a.station_id
            WHERE st.specialty_id = sp.id AND a.user_id = ?
          ) AS avg_score,
          (
            SELECT COUNT(DISTINCT a.station_id)
            FROM attempts a
            JOIN stations st ON st.id = a.station_id
            WHERE st.specialty_id = sp.id AND a.user_id = ?
          ) AS stations_attempted
        FROM specialties sp
        ORDER BY sp.id ASC
      `
      )
      .all(userId, userId, userId);

    return res.json(specialties);
  } catch (err) {
    console.error('Erro ao listar especialidades:', err);
    return res.status(500).json({ error: 'Erro ao buscar especialidades.' });
  }
});

// GET /api/specialties/:slug
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    const specialty = db
      .prepare(
        `
        SELECT
          sp.*,
          (
            SELECT COUNT(*)
            FROM stations st
            WHERE st.specialty_id = sp.id
          ) AS total_stations,
          (
            SELECT COUNT(*)
            FROM attempts a
            JOIN stations st ON st.id = a.station_id
            WHERE st.specialty_id = sp.id AND a.user_id = ?
          ) AS total_attempts,
          (
            SELECT ROUND(AVG(CASE WHEN a.max_score > 0 THEN (a.total_score * 100.0 / a.max_score) ELSE 0 END), 1)
            FROM attempts a
            JOIN stations st ON st.id = a.station_id
            WHERE st.specialty_id = sp.id AND a.user_id = ?
          ) AS avg_score,
          (
            SELECT COUNT(DISTINCT a.station_id)
            FROM attempts a
            JOIN stations st ON st.id = a.station_id
            WHERE st.specialty_id = sp.id AND a.user_id = ?
          ) AS stations_attempted
        FROM specialties sp
        WHERE sp.slug = ?
      `
      )
      .get(userId, userId, userId, slug);

    if (!specialty) {
      return res.status(404).json({ error: 'Especialidade não encontrada.' });
    }

    const stations = db
      .prepare(
        `
        SELECT
          st.id,
          st.specialty_id,
          st.title,
          st.description,
          st.difficulty,
          st.duration_min,
          st.created_at,
          (
            SELECT COUNT(*)
            FROM checklist_items ci
            WHERE ci.station_id = st.id
          ) AS item_count,
          (
            SELECT ROUND(COALESCE(SUM(ci.weight), 0), 2)
            FROM checklist_items ci
            WHERE ci.station_id = st.id
          ) AS max_score,
          (
            SELECT COUNT(*)
            FROM attempts a
            WHERE a.station_id = st.id AND a.user_id = ?
          ) AS attempt_count,
          (
            SELECT ROUND(AVG(CASE WHEN a.max_score > 0 THEN (a.total_score * 100.0 / a.max_score) ELSE 0 END), 1)
            FROM attempts a
            WHERE a.station_id = st.id AND a.user_id = ?
          ) AS avg_score,
          (
            SELECT MAX(a.performed_at)
            FROM attempts a
            WHERE a.station_id = st.id AND a.user_id = ?
          ) AS last_attempt_at
        FROM stations st
        WHERE st.specialty_id = ?
        ORDER BY st.id ASC
      `
      )
      .all(userId, userId, userId, specialty.id);

    return res.json({ specialty, stations });
  } catch (err) {
    console.error('Erro ao buscar especialidade:', err);
    return res.status(500).json({ error: 'Erro ao carregar detalhes da especialidade.' });
  }
});

export default router;
