# Настройка переменных окружения для Coolify

## Обязательные переменные

При развертывании на Coolify необходимо добавить следующие переменные окружения в настройках приложения:

### Production
```env
NODE_ENV=production
PORT=3000
DATABASE_PATH=/app/data/database.sqlite

# Admin Credentials - ОБЯЗАТЕЛЬНО изменить!
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password
```

## Как настроить в Coolify

1. Откройте ваше приложение в Coolify
2. Перейдите в раздел **"Environment Variables"**
3. Добавьте переменные выше
4. **ВАЖНО**: Измените `ADMIN_USERNAME` и `ADMIN_PASSWORD` на свои значения!
5. Сохраните и передеплойте приложение

## Безопасность

⚠️ **НЕ коммитьте файл `.env` в git!**

- Локальная разработка: используйте `server/.env`
- Production (Coolify): устанавливайте через интерфейс Coolify
- `.env` файлы уже добавлены в `.gitignore`

## Для локальной разработки

1. Скопируйте пример:
   ```bash
   cp server/.env.example server/.env
   ```

2. Отредактируйте `server/.env` и установите свои значения:
   ```env
   ADMIN_USERNAME=madmin
   ADMIN_PASSWORD=wUQH4Twc
   ```

3. Запустите сервер:
   ```bash
   cd server
   npm run dev
   ```
