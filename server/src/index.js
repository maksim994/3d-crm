import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import settingsRoutes from './routes/settings.js';
import printersRoutes from './routes/printers.js';
import packagingRoutes from './routes/packaging.js';
import modelsRoutes from './routes/models.js';
import categoriesRoutes from './routes/categories.js';
import authRoutes from './routes/auth.js';
import { requireAuth } from './middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Для больших base64 изображений
app.use(cookieParser());

// Auth routes (не требуют авторизации)
app.use('/api/auth', authRoutes);

// Health check (не требует авторизации)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DATABASE_PATH || 'default'
  });
});

// API Routes (требуют авторизации)
app.use('/api/settings', requireAuth, settingsRoutes);
app.use('/api/printers', requireAuth, printersRoutes);
app.use('/api/packaging', requireAuth, packagingRoutes);
app.use('/api/categories', requireAuth, categoriesRoutes);
app.use('/api/models', requireAuth, modelsRoutes);

// В production режиме отдаём статические файлы и обрабатываем SPA routing
if (isProduction) {
  // В Docker: WORKDIR /app, код в /app/src, статика в /app/public
  const publicPath = path.join(__dirname, '../public');
  
  // Статические файлы
  app.use(express.static(publicPath));
  
  // Все остальные запросы отправляем на index.html (для React Router)
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Что-то пошло не так!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📡 API доступен на http://localhost:${PORT}/api`);
  console.log(`🌍 Режим: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  if (isProduction) {
    console.log(`📦 Статические файлы из: ${path.join(__dirname, '../public')}`);
  }
});
