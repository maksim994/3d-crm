#!/bin/bash

echo "🚀 Запуск CRM для 3D-печати..."
echo ""

# Проверяем наличие node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Устанавливаем зависимости frontend..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 Устанавливаем зависимости сервера..."
    cd server && npm install && cd ..
fi

# Проверяем наличие базы данных
if [ ! -f "server/database.sqlite" ]; then
    echo "🗄️  Создаём базу данных..."
    cd server && npm run migrate && cd ..
fi

echo ""
echo "✅ Всё готово! Запускаем приложение..."
echo ""
echo "📡 Сервер: http://localhost:3001"
echo "🌐 Frontend: http://localhost:5173"
echo ""
echo "Для остановки нажмите Ctrl+C"
echo ""

# Запускаем сервер и frontend параллельно
trap 'kill 0' EXIT

cd server && npm run dev &
cd .. && npm run dev &

wait
