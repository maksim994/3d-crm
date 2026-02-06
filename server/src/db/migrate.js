import db from './database.js';

console.log('🚀 Запуск миграций...');

// Таблица настроек
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    electricity_cost REAL NOT NULL DEFAULT 6.5,
    bubble_wrap_cost REAL NOT NULL DEFAULT 15,
    default_defect_percent REAL NOT NULL DEFAULT 5,
    default_consumables_percent REAL NOT NULL DEFAULT 10,
    default_wb_commission REAL NOT NULL DEFAULT 15,
    default_ozon_commission REAL NOT NULL DEFAULT 12,
    kie_api_key TEXT,
    wb_title_prompt TEXT,
    wb_description_prompt TEXT,
    ozon_title_prompt TEXT,
    ozon_description_prompt TEXT,
    detailed_generation_prompt TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Таблица категорий
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Таблица принтеров
db.exec(`
  CREATE TABLE IF NOT EXISTS printers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    power_consumption REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Таблица упаковки
db.exec(`
  CREATE TABLE IF NOT EXISTS packaging (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    length REAL NOT NULL,
    width REAL NOT NULL,
    height REAL NOT NULL,
    weight REAL NOT NULL,
    cost REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Таблица моделей
db.exec(`
  CREATE TABLE IF NOT EXISTS models (
    id TEXT PRIMARY KEY,
    article TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    specifications TEXT,
    source_link TEXT,
    
    weight REAL NOT NULL DEFAULT 0,
    is_multicolor INTEGER NOT NULL DEFAULT 0,
    dimension_length REAL NOT NULL DEFAULT 0,
    dimension_width REAL NOT NULL DEFAULT 0,
    dimension_height REAL NOT NULL DEFAULT 0,
    print_time REAL NOT NULL DEFAULT 0,
    printer_id TEXT,
    category_id TEXT,
    plastic_price REAL NOT NULL DEFAULT 0,
    consumables_percent REAL NOT NULL DEFAULT 10,
    defect_percent REAL NOT NULL DEFAULT 5,
    
    packaging_id TEXT,
    
    wb_commission REAL NOT NULL DEFAULT 15,
    wb_logistics REAL NOT NULL DEFAULT 0,
    wb_product_link TEXT,
    wb_generated_title TEXT,
    wb_generated_description TEXT,
    
    ozon_commission REAL NOT NULL DEFAULT 12,
    ozon_logistics REAL NOT NULL DEFAULT 0,
    ozon_product_link TEXT,
    ozon_generated_title TEXT,
    ozon_generated_description TEXT,
    
    desired_margin REAL NOT NULL DEFAULT 0,
    
    is_archived INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    FOREIGN KEY (printer_id) REFERENCES printers(id) ON DELETE SET NULL,
    FOREIGN KEY (packaging_id) REFERENCES packaging(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  );
`);

// Таблица изображений моделей
db.exec(`
  CREATE TABLE IF NOT EXISTS model_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
  );
`);

// Индексы для оптимизации
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_models_article ON models(article);
  CREATE INDEX IF NOT EXISTS idx_models_archived ON models(is_archived);
  CREATE INDEX IF NOT EXISTS idx_models_created ON models(created_at);
  CREATE INDEX IF NOT EXISTS idx_model_images_model_id ON model_images(model_id);
`);

// Вставляем дефолтные настройки, если их нет
const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get();
if (settingsCount.count === 0) {
  db.prepare(`
    INSERT INTO settings (
      id,
      electricity_cost,
      bubble_wrap_cost,
      default_defect_percent,
      default_consumables_percent,
      default_wb_commission,
      default_ozon_commission,
      wb_title_prompt,
      wb_description_prompt,
      ozon_title_prompt,
      ozon_description_prompt,
      detailed_generation_prompt
    ) VALUES (
      1,
      6.5,
      15,
      5,
      10,
      15,
      12,
      'Создай SEO-оптимизированное название для товара на Wildberries. Используй ключевые слова, длина до 100 символов. Товар: {name}, описание: {description}, характеристики: {specifications}',
      'Создай подробное описание для товара на Wildberries с учётом SEO. Включи преимущества, характеристики и применение. Товар: {name}, описание: {description}, характеристики: {specifications}',
      'Создай привлекательное название для товара на Ozon. Используй ключевые слова, длина до 250 символов. Товар: {name}, описание: {description}, характеристики: {specifications}',
      'Создай детальное описание для товара на Ozon. Структурируй текст, добавь эмодзи, опиши характеристики и преимущества. Товар: {name}, описание: {description}, характеристики: {specifications}',
      'Проанализируй изображение товара и создай максимально подробное описание, учитывая все видимые детали, материалы, цвета и особенности.'
    )
  `).run();
  
  console.log('✅ Дефолтные настройки созданы');
}

console.log('✅ Миграции выполнены успешно!');
console.log('📊 База данных готова к работе');

db.close();
