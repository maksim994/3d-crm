import express from 'express';
import { login, logout, checkAuth } from '../middleware/auth.js';

const router = express.Router();

// Логин
router.post('/login', login);

// Логаут
router.post('/logout', logout);

// Проверка авторизации
router.get('/check', checkAuth);

export default router;
