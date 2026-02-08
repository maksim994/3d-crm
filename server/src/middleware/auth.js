import crypto from 'crypto';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

// Хранилище сессий (в production лучше использовать Redis)
const sessions = new Map();

// Учетные данные администратора из переменных окружения
if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
  console.error('⚠️  ADMIN_USERNAME и ADMIN_PASSWORD должны быть установлены в .env файле!');
  process.exit(1);
}

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Генерация токена сессии
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Middleware для проверки авторизации
export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.session;
  
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Требуется авторизация' });
  }
  
  const session = sessions.get(token);
  
  // Проверка срока действия сессии (24 часа)
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Unauthorized', message: 'Сессия истекла' });
  }
  
  req.user = session.user;
  next();
}

// Логин
export function login(req, res) {
  const { username, password } = req.body;
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = generateSessionToken();
    
    sessions.set(token, {
      user: { username },
      createdAt: Date.now()
    });
    
    // Устанавливаем cookie (опционально)
    res.cookie('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 часа
      sameSite: 'lax'
    });
    
    return res.json({ 
      success: true, 
      token,
      user: { username }
    });
  }
  
  return res.status(401).json({ 
    error: 'Invalid credentials', 
    message: 'Неверный логин или пароль' 
  });
}

// Логаут
export function logout(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.session;
  
  if (token) {
    sessions.delete(token);
  }
  
  res.clearCookie('session');
  res.json({ success: true, message: 'Вы вышли из системы' });
}

// Проверка авторизации
export function checkAuth(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.session;
  
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ authenticated: false });
  }
  
  const session = sessions.get(token);
  
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    sessions.delete(token);
    return res.status(401).json({ authenticated: false });
  }
  
  res.json({ 
    authenticated: true, 
    user: session.user 
  });
}
