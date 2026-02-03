# 🚀 Обзор деплоя в Coolify

## Что было сделано

Ваш проект полностью подготовлен к развертыванию в Coolify. Созданы все необходимые файлы:

### ✅ Созданные файлы

1. **`Dockerfile`** - Multi-stage сборка:
   - Stage 1: Сборка React фронтенда (Vite)
   - Stage 2: Установка зависимостей бэкенда
   - Stage 3: Production образ с фронтендом и бэкендом

2. **`.dockerignore`** - Исключает ненужные файлы из образа

3. **`COOLIFY_DEPLOYMENT.md`** - Полная пошаговая инструкция (7 этапов)

4. **`COOLIFY_CHECKLIST.md`** - Быстрый чек-лист (5-10 минут)

5. **Обновлен `server/src/index.js`**:
   - Добавлена поддержка production режима
   - Отдача статических файлов из `/public`
   - SPA routing для React Router
   - CORS настройки через переменные окружения

6. **Обновлен `server/src/db/database.js`**:
   - Поддержка `DATABASE_PATH` переменной
   - Логирование пути к базе данных

---

## Архитектура приложения

```
┌─────────────────────────────────────────────────────────────┐
│                      Coolify Server                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Docker Container                         │   │
│  │                                                       │   │
│  │  ┌───────────────────────────────────────────────┐   │   │
│  │  │  Node.js Express Server (Port 3000)          │   │   │
│  │  │  ┌────────────┐  ┌──────────────────────┐    │   │   │
│  │  │  │   API      │  │   Static Files       │    │   │   │
│  │  │  │  /api/*    │  │   (React SPA)        │    │   │   │
│  │  │  └────────────┘  └──────────────────────┘    │   │   │
│  │  │         │                                     │   │   │
│  │  │         ▼                                     │   │   │
│  │  │  ┌──────────────────────────────────────┐    │   │   │
│  │  │  │   SQLite Database                    │    │   │   │
│  │  │  │   /app/data/database.sqlite          │    │   │   │
│  │  │  └──────────────────────────────────────┘    │   │   │
│  │  └───────────────────────────────────────────────┘   │   │
│  │                        ▲                             │   │
│  │                        │                             │   │
│  │                   Persistent                         │   │
│  │                    Volume                            │   │
│  │                   /app/data                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ▲                                   │
│                         │                                   │
│                    Nginx Proxy                              │
│                   + SSL (Let's Encrypt)                     │
└─────────────────────────────────────────────────────────────┘
                          ▲
                          │
                     Internet
                   your-domain.com
```

---

## Процесс сборки (Build Pipeline)

```
1. GitHub/GitLab Push
         │
         ▼
2. Coolify Webhook (опционально)
         │
         ▼
3. Git Clone
         │
         ▼
4. Docker Build (Multi-stage)
    ├─► Stage 1: Build Frontend (npm run build)
    │             │
    │             ▼
    │         dist/ files
    │
    ├─► Stage 2: Install Backend Dependencies
    │             │
    │             ▼
    │         node_modules/
    │
    └─► Stage 3: Production Image
                  ├─► Copy backend code
                  ├─► Copy frontend dist → public/
                  └─► Setup entrypoint
         │
         ▼
5. Container Start
    ├─► Run migrations (migrate.js)
    └─► Start server (index.js)
         │
         ▼
6. Health Check (/api/health)
         │
         ▼
7. Application Ready ✅
```

---

## Переменные окружения

| Переменная | Значение | Описание |
|------------|----------|----------|
| `NODE_ENV` | `production` | Режим работы приложения |
| `PORT` | `3000` | Порт сервера |
| `DATABASE_PATH` | `/app/data/database.sqlite` | Путь к базе данных |
| `CORS_ORIGIN` | `https://your-domain.com` | (опционально) Разрешенный origin для CORS |

---

## Persistent Storage

⚠️ **КРИТИЧЕСКИ ВАЖНО!**

Без настройки persistent storage база данных будет теряться при каждом перезапуске контейнера!

```
Host Server            Docker Container
─────────────          ───────────────
/data/3d-crm    ←────► /app/data
                       └── database.sqlite
```

**Настройка в Coolify:**
- Mount Path: `/app/data`
- Все файлы в этой папке будут сохраняться между перезапусками

---

## Порты и сетевые настройки

```
Internet (443/HTTPS)
    ↓
Coolify Nginx (Reverse Proxy + SSL)
    ↓
Docker Container (3000)
    ├─► /api/*          → API endpoints
    └─► /*              → React SPA (в production)
```

---

## Следующие шаги

1. **Сейчас**: Создать Git репозиторий и запушить код
2. **5 минут**: Настроить приложение в Coolify (следовать COOLIFY_CHECKLIST.md)
3. **10 минут**: Первый деплой и проверка работы
4. **15 минут**: Настроить автоматический деплой и мониторинг

---

## Команды для работы

### Подготовка к деплою

```bash
# 1. Добавить файлы в git
git add Dockerfile .dockerignore COOLIFY_*.md DEPLOYMENT_OVERVIEW.md

# 2. Коммит изменений
git commit -m "feat: add Coolify deployment configuration"

# 3. Создать репозиторий на GitHub/GitLab
# Перейти на github.com и создать новый репозиторий

# 4. Добавить remote и запушить
git remote add origin https://github.com/username/3d-crm.git
git branch -M main
git push -u origin main
```

### После деплоя

```bash
# Проверка работы API
curl https://your-domain.com/api/health

# Проверка моделей (должен вернуть пустой массив или данные)
curl https://your-domain.com/api/models

# Просмотр логов (на сервере Coolify)
ssh user@your-server
docker logs -f $(docker ps | grep 3d-crm | awk '{print $1}')
```

---

## Дальнейшая разработка

### Обновление приложения

```bash
# 1. Внести изменения в код
# 2. Коммит и push
git add .
git commit -m "feat: add new feature"
git push origin main

# 3. Если настроен webhook - деплой произойдет автоматически
# Если нет - нажать "Redeploy" в Coolify
```

### Откат к предыдущей версии

В Coolify можно легко откатиться к предыдущему деплою:
1. Перейти в "Deployments"
2. Выбрать нужную версию
3. Нажать "Redeploy"

---

## Мониторинг и отладка

### Проверка логов в реальном времени

В Coolify:
- Вкладка "Logs" → выбрать "Live"

### Проверка базы данных

```bash
# Подключиться к контейнеру
docker exec -it <container-name> sh

# Проверить базу данных
ls -lh /app/data/database.sqlite
```

### Бэкап и восстановление

```bash
# Бэкап через API (из браузера)
Настройки → Экспорт данных

# Бэкап через Docker (на сервере)
docker cp <container-id>:/app/data/database.sqlite ./backup-$(date +%Y%m%d).sqlite

# Восстановление
docker cp ./backup.sqlite <container-id>:/app/data/database.sqlite
docker restart <container-id>
```

---

## Безопасность

✅ **Автоматически настроено:**
- HTTPS через Let's Encrypt
- Изоляция в Docker контейнере
- .gitignore для секретов

⚠️ **Рекомендуется настроить:**
- Регулярные бэкапы базы данных
- Ограничение доступа по IP (если нужно)
- Мониторинг и алерты

---

## Стоимость и ресурсы

**Рекомендуемые ресурсы:**
- CPU: 0.5-1 core
- RAM: 512MB - 1GB
- Disk: 5-10GB (с запасом для базы данных)

**Подходящие серверы:**
- Hetzner CX11 (2.89€/мес)
- DigitalOcean Droplet Basic ($6/мес)
- Contabo VPS S ($3.99/мес)

---

## Поддержка

**Документация:**
- 📖 [Полная инструкция](./COOLIFY_DEPLOYMENT.md) - подробный гайд на 7 этапов
- ✅ [Чек-лист](./COOLIFY_CHECKLIST.md) - быстрый старт за 5-10 минут

**Coolify:**
- 🌐 https://coolify.io/docs
- 💬 https://discord.gg/coolify
- 🐛 https://github.com/coollabsio/coolify

---

**Готово к деплою! Следуйте COOLIFY_CHECKLIST.md для быстрого старта. 🚀**
