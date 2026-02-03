# Backend Server для CRM 3D-печати

REST API сервер на Node.js + Express с базой данных SQLite.

## Структура

```
server/
├── src/
│   ├── db/
│   │   ├── database.js      # Подключение к БД
│   │   └── migrate.js       # Миграции (создание таблиц)
│   ├── routes/
│   │   ├── settings.js      # API настроек
│   │   ├── printers.js      # API принтеров
│   │   ├── packaging.js     # API упаковки
│   │   └── models.js        # API моделей
│   └── index.js             # Точка входа
├── package.json
├── .env                     # Переменные окружения
└── database.sqlite          # БД (создаётся автоматически)
```

## Установка и запуск

```bash
# Установка зависимостей
npm install

# Создание базы данных
npm run migrate

# Запуск в режиме разработки (с auto-reload)
npm run dev

# Запуск в продакшене
npm start
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Settings
```
GET    /api/settings      - Получить настройки
PUT    /api/settings      - Обновить настройки
```

### Printers
```
GET    /api/printers      - Список всех принтеров
GET    /api/printers/:id  - Получить принтер по ID
POST   /api/printers      - Создать принтер
PUT    /api/printers/:id  - Обновить принтер
DELETE /api/printers/:id  - Удалить принтер
```

### Packaging
```
GET    /api/packaging      - Список всей упаковки
GET    /api/packaging/:id  - Получить упаковку по ID
POST   /api/packaging      - Создать упаковку
PUT    /api/packaging/:id  - Обновить упаковку
DELETE /api/packaging/:id  - Удалить упаковку
```

### Models
```
GET    /api/models      - Список всех моделей
GET    /api/models/:id  - Получить модель по ID
POST   /api/models      - Создать модель
PUT    /api/models/:id  - Обновить модель
DELETE /api/models/:id  - Удалить модель
```

## Переменные окружения

Создайте файл `.env`:

```env
PORT=3001
DB_PATH=./database.sqlite
NODE_ENV=development
```

## База данных

### Схема

- **settings** - Глобальные настройки (константы расчёта, AI промпты)
- **printers** - Справочник 3D-принтеров
- **packaging** - Справочник упаковки
- **models** - Модели для 3D-печати
- **model_images** - Изображения моделей

### Индексы

Созданы индексы для оптимизации:
- `idx_models_article` - по артикулу модели
- `idx_models_archived` - по статусу архивации
- `idx_models_created` - по дате создания
- `idx_model_images_model_id` - по связи изображений с моделями

### Внешние ключи

- `models.printer_id` → `printers.id` (SET NULL при удалении)
- `models.packaging_id` → `packaging.id` (SET NULL при удалении)
- `model_images.model_id` → `models.id` (CASCADE при удалении)

## Миграция на PostgreSQL

Для продакшена рекомендуется PostgreSQL:

1. Установите `pg` вместо `better-sqlite3`
2. Обновите `src/db/database.js` для подключения к PostgreSQL
3. Адаптируйте миграции под PostgreSQL синтаксис
4. Обновите типы данных (TEXT → VARCHAR, INTEGER → SERIAL и т.д.)

## Резервное копирование

```bash
# Простое копирование файла
cp database.sqlite database.backup.sqlite

# Или используйте sqlite3 для создания дампа
sqlite3 database.sqlite .dump > backup.sql
```

## Разработка

```bash
# Автоматический перезапуск при изменениях
npm run dev

# Пересоздать БД с нуля
rm database.sqlite
npm run migrate
```

## Безопасность

⚠️ **Важно для продакшена:**

- Используйте HTTPS
- Добавьте аутентификацию (JWT, sessions)
- Настройте rate limiting
- Валидируйте все входные данные
- Используйте параметризованные запросы (уже реализовано)
- Настройте CORS для конкретных доменов
- Используйте переменные окружения для конфиденциальных данных
