const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'solar.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'usuario' CHECK(role IN ('usuario', 'consultor', 'admin')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      nome TEXT NOT NULL DEFAULT 'Área selecionada',
      coordenadas TEXT NOT NULL,
      area_m2 REAL NOT NULL,
      perimetro_m REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Create default admin if not exists
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@solarmap.com');
  if (!adminExists) {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
      'Administrador', 'admin@solarmap.com', hash, 'admin'
    );
    console.log('Default admin created: admin@solarmap.com / admin123');
  }
}

module.exports = { getDb };
