@echo off
echo 🚀 Запуск CRM для 3D-печати...
echo.

REM Проверяем наличие node_modules
if not exist "node_modules\" (
    echo 📦 Устанавливаем зависимости frontend...
    call npm install
)

if not exist "server\node_modules\" (
    echo 📦 Устанавливаем зависимости сервера...
    cd server
    call npm install
    cd ..
)

REM Проверяем наличие базы данных
if not exist "server\database.sqlite" (
    echo 🗄️  Создаём базу данных...
    cd server
    call npm run migrate
    cd ..
)

echo.
echo ✅ Всё готово! Запускаем приложение...
echo.
echo 📡 Сервер: http://localhost:3001
echo 🌐 Frontend: http://localhost:5173
echo.
echo Для остановки нажмите Ctrl+C в обоих окнах
echo.

REM Запускаем сервер в новом окне
start cmd /k "cd server && npm run dev"

REM Запускаем frontend в текущем окне
call npm run dev
