import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Поддерживаем обе переменные для обратной совместимости
const dbPath = process.env.DATABASE_PATH || process.env.DB_PATH || join(__dirname, '../../database.sqlite');

console.log(`📁 Используется база данных: ${dbPath}`);

const db = new Database(dbPath);

// Включаем внешние ключи
db.pragma('foreign_keys = ON');

export default db;
