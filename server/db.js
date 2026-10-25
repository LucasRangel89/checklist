import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, 'revalida.db');
const db = new Database(dbPath);

// Enable WAL mode and foreign key constraints
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS specialties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    description TEXT NOT NULL,
    skeleton TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    specialty_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'intermediário',
    duration_min INTEGER NOT NULL DEFAULT 10,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS checklist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    order_idx INTEGER NOT NULL DEFAULT 1,
    description TEXT NOT NULL,
    expected_standard TEXT NOT NULL,
    weight REAL NOT NULL DEFAULT 1.0,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    station_id INTEGER NOT NULL,
    performed_at TEXT DEFAULT (datetime('now')),
    duration_sec INTEGER NOT NULL DEFAULT 0,
    total_score REAL NOT NULL DEFAULT 0,
    max_score REAL NOT NULL DEFAULT 0,
    notes TEXT DEFAULT '',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS attempt_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attempt_id INTEGER NOT NULL,
    checklist_item_id INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('ok', 'parcial', 'erro', 'omitido')),
    notes TEXT DEFAULT '',
    FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (checklist_item_id) REFERENCES checklist_items(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_stations_specialty ON stations(specialty_id);
  CREATE INDEX IF NOT EXISTS idx_checklist_station ON checklist_items(station_id, order_idx);
  CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id, performed_at);
  CREATE INDEX IF NOT EXISTS idx_attempts_station ON attempts(station_id);
  CREATE INDEX IF NOT EXISTS idx_attempt_items_attempt ON attempt_items(attempt_id);
  CREATE INDEX IF NOT EXISTS idx_attempt_items_item ON attempt_items(checklist_item_id);
`);

export default db;
