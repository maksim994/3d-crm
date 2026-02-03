# Multi-stage build для оптимизации размера образа

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Копируем package.json и устанавливаем зависимости frontend
COPY package*.json ./
RUN npm ci

# Копируем исходники frontend
COPY . .

# Собираем frontend
RUN npm run build

# Stage 2: Setup backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/server

# Копируем package.json сервера и устанавливаем зависимости
COPY server/package*.json ./
RUN npm ci --production

# Stage 3: Production image
FROM node:20-alpine

WORKDIR /app

# Устанавливаем необходимые системные зависимости для better-sqlite3
RUN apk add --no-cache python3 make g++

# Копируем backend зависимости и код
COPY --from=backend-builder /app/server/node_modules ./node_modules
COPY server/package*.json ./
COPY server/src ./src

# Копируем собранный frontend в папку public сервера
COPY --from=frontend-builder /app/dist ./public

# Создаём директорию для базы данных
RUN mkdir -p /app/data

# Переменная окружения для указания пути к базе
ENV DATABASE_PATH=/app/data/database.sqlite
ENV NODE_ENV=production
ENV PORT=3000

# Создаём volume для persistent storage базы данных
VOLUME ["/app/data"]

# Expose порт
EXPOSE 3000

# Запускаем миграции и сервер
CMD ["sh", "-c", "node src/db/migrate.js && node src/index.js"]
