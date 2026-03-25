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
    CREATE TABLE IF NOT EXISTS countries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      name_local TEXT NOT NULL,
      region TEXT NOT NULL,
      currency_code TEXT NOT NULL,
      currency_symbol TEXT NOT NULL,
      currency_name TEXT NOT NULL,
      locale TEXT NOT NULL DEFAULT 'en-US',
      cost_multiplier REAL NOT NULL DEFAULT 1.0,
      energy_tariff REAL NOT NULL,
      irradiation_avg REAL NOT NULL DEFAULT 5.0,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS regional_pricing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      country_code TEXT NOT NULL,
      cost_kwp REAL NOT NULL,
      installation_base REAL NOT NULL,
      labor_multiplier REAL NOT NULL DEFAULT 1.0,
      tax_percent REAL NOT NULL DEFAULT 0.0,
      currency_code TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (country_code) REFERENCES countries(code)
    );
  `);

  // Create default admin if not exists (only if ADMIN_EMAIL and ADMIN_PASSWORD env vars are set)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@solarmap.com';
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  if (!adminExists) {
    const bcrypt = require('bcryptjs');
    const crypto = require('crypto');
    // Use env password or generate a random one (never use a hardcoded weak password)
    const password = adminPassword || crypto.randomBytes(16).toString('hex');
    const hash = bcrypt.hashSync(password, 12);
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
      'Administrador', adminEmail, hash, 'admin'
    );
    if (!adminPassword) {
      console.log(`Default admin created: ${adminEmail}`);
      console.log(`Generated admin password: ${password}`);
      console.log('IMPORTANT: Set ADMIN_PASSWORD env variable in production.');
    } else {
      console.log(`Admin account created: ${adminEmail}`);
    }
  }

  // Seed countries if empty
  const countryCount = db.prepare('SELECT COUNT(*) as count FROM countries').get();
  if (countryCount.count === 0) {
    seedCountries();
  }

  // Seed regional pricing if empty
  const pricingCount = db.prepare('SELECT COUNT(*) as count FROM regional_pricing').get();
  if (pricingCount.count === 0) {
    seedRegionalPricing();
  }
}

function seedCountries() {
  const insert = db.prepare(`
    INSERT INTO countries (code, name, name_local, region, currency_code, currency_symbol, currency_name, locale, cost_multiplier, energy_tariff, irradiation_avg)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const countries = [
    // América do Sul
    ['BR', 'Brazil', 'Brasil', 'south_america', 'BRL', 'R$', 'Real Brasileiro', 'pt-BR', 1.0, 0.85, 5.2],
    ['AR', 'Argentina', 'Argentina', 'south_america', 'ARS', '$', 'Peso Argentino', 'es-AR', 0.45, 0.12, 4.8],
    ['CL', 'Chile', 'Chile', 'south_america', 'CLP', '$', 'Peso Chileno', 'es-CL', 0.85, 110.0, 5.5],
    ['CO', 'Colombia', 'Colombia', 'south_america', 'COP', '$', 'Peso Colombiano', 'es-CO', 0.70, 650.0, 4.5],
    ['PE', 'Peru', 'Perú', 'south_america', 'PEN', 'S/', 'Sol Peruano', 'es-PE', 0.75, 0.65, 5.0],
    ['UY', 'Uruguay', 'Uruguay', 'south_america', 'UYU', '$U', 'Peso Uruguayo', 'es-UY', 0.90, 6.50, 4.3],

    // América do Norte
    ['US', 'United States', 'Estados Unidos', 'north_america', 'USD', '$', 'US Dollar', 'en-US', 1.20, 0.16, 4.5],
    ['MX', 'Mexico', 'México', 'north_america', 'MXN', '$', 'Peso Mexicano', 'es-MX', 0.65, 3.20, 5.3],
    ['CA', 'Canada', 'Canadá', 'north_america', 'CAD', 'CA$', 'Dólar Canadense', 'en-CA', 1.15, 0.13, 3.5],

    // Europa
    ['PT', 'Portugal', 'Portugal', 'europe', 'EUR', '€', 'Euro', 'pt-PT', 1.10, 0.22, 4.8],
    ['ES', 'Spain', 'España', 'europe', 'EUR', '€', 'Euro', 'es-ES', 1.05, 0.25, 5.0],
    ['DE', 'Germany', 'Deutschland', 'europe', 'EUR', '€', 'Euro', 'de-DE', 1.30, 0.35, 3.2],
    ['FR', 'France', 'France', 'europe', 'EUR', '€', 'Euro', 'fr-FR', 1.25, 0.20, 3.8],
    ['IT', 'Italy', 'Italia', 'europe', 'EUR', '€', 'Euro', 'it-IT', 1.15, 0.28, 4.2],
    ['GB', 'United Kingdom', 'Reino Unido', 'europe', 'GBP', '£', 'Libra Esterlina', 'en-GB', 1.35, 0.30, 2.8],

    // África
    ['ZA', 'South Africa', 'África do Sul', 'africa', 'ZAR', 'R', 'Rand Sul-Africano', 'en-ZA', 0.60, 2.80, 5.8],
    ['NG', 'Nigeria', 'Nigéria', 'africa', 'NGN', '₦', 'Naira', 'en-NG', 0.50, 65.0, 5.5],
    ['EG', 'Egypt', 'Egito', 'africa', 'EGP', 'E£', 'Libra Egípcia', 'ar-EG', 0.55, 1.50, 6.0],
    ['KE', 'Kenya', 'Quênia', 'africa', 'KES', 'KSh', 'Xelim Queniano', 'en-KE', 0.55, 22.0, 5.6],

    // Ásia & Oceania
    ['AU', 'Australia', 'Austrália', 'oceania', 'AUD', 'A$', 'Dólar Australiano', 'en-AU', 1.10, 0.28, 5.2],
    ['JP', 'Japan', 'Japão', 'asia', 'JPY', '¥', 'Iene Japonês', 'ja-JP', 1.40, 28.0, 3.8],
    ['IN', 'India', 'Índia', 'asia', 'INR', '₹', 'Rupia Indiana', 'hi-IN', 0.40, 7.50, 5.5],
    ['AE', 'UAE', 'Emirados Árabes', 'middle_east', 'AED', 'د.إ', 'Dirham', 'ar-AE', 0.95, 0.38, 6.2],
  ];

  const insertMany = db.transaction((data) => {
    for (const row of data) {
      insert.run(...row);
    }
  });
  insertMany(countries);
  console.log(`Seeded ${countries.length} countries`);
}

function seedRegionalPricing() {
  const insert = db.prepare(`
    INSERT INTO regional_pricing (country_code, cost_kwp, installation_base, labor_multiplier, tax_percent, currency_code)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // cost_kwp = custo por kWp na moeda local
  // installation_base = custo base de instalação na moeda local
  const pricing = [
    // América do Sul
    ['BR', 4500, 3500, 1.0, 0, 'BRL'],
    ['AR', 450000, 350000, 0.85, 21, 'ARS'],
    ['CL', 850000, 650000, 0.90, 19, 'CLP'],
    ['CO', 3500000, 2800000, 0.80, 19, 'COP'],
    ['PE', 3200, 2500, 0.85, 18, 'PEN'],
    ['UY', 38000, 30000, 0.95, 22, 'UYU'],

    // América do Norte
    ['US', 2800, 2200, 1.20, 0, 'USD'],
    ['MX', 42000, 33000, 0.75, 16, 'MXN'],
    ['CA', 3200, 2500, 1.25, 13, 'CAD'],

    // Europa
    ['PT', 1400, 1100, 1.10, 23, 'EUR'],
    ['ES', 1350, 1050, 1.05, 21, 'EUR'],
    ['DE', 1500, 1200, 1.30, 19, 'EUR'],
    ['FR', 1600, 1250, 1.25, 20, 'EUR'],
    ['IT', 1450, 1100, 1.15, 22, 'EUR'],
    ['GB', 1800, 1400, 1.35, 20, 'GBP'],

    // África
    ['ZA', 18000, 14000, 0.65, 15, 'ZAR'],
    ['NG', 650000, 500000, 0.55, 7.5, 'NGN'],
    ['EG', 22000, 17000, 0.60, 14, 'EGP'],
    ['KE', 150000, 120000, 0.60, 16, 'KES'],

    // Ásia & Oceania
    ['AU', 2200, 1700, 1.15, 10, 'AUD'],
    ['JP', 320000, 250000, 1.40, 10, 'JPY'],
    ['IN', 45000, 35000, 0.45, 12, 'INR'],
    ['AE', 4500, 3500, 1.00, 5, 'AED'],
  ];

  const insertMany = db.transaction((data) => {
    for (const row of data) {
      insert.run(...row);
    }
  });
  insertMany(pricing);
  console.log(`Seeded ${pricing.length} regional pricing entries`);
}

module.exports = { getDb };
