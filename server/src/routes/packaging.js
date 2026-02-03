import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// Получить всю упаковку
router.get('/', (req, res) => {
  try {
    const packaging = db.prepare('SELECT * FROM packaging ORDER BY created_at DESC').all();
    
    const response = packaging.map(p => ({
      id: p.id,
      name: p.name,
      length: p.length,
      width: p.width,
      height: p.height,
      weight: p.weight,
      cost: p.cost,
      createdAt: p.created_at,
    }));
    
    res.json(response);
  } catch (error) {
    console.error('Ошибка получения упаковки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить упаковку по ID
router.get('/:id', (req, res) => {
  try {
    const packaging = db.prepare('SELECT * FROM packaging WHERE id = ?').get(req.params.id);
    
    if (!packaging) {
      return res.status(404).json({ error: 'Упаковка не найдена' });
    }
    
    res.json({
      id: packaging.id,
      name: packaging.name,
      length: packaging.length,
      width: packaging.width,
      height: packaging.height,
      weight: packaging.weight,
      cost: packaging.cost,
      createdAt: packaging.created_at,
    });
  } catch (error) {
    console.error('Ошибка получения упаковки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать упаковку
router.post('/', (req, res) => {
  try {
    const { id, name, length, width, height, weight, cost } = req.body;
    
    if (!id || !name) {
      return res.status(400).json({ error: 'Необходимые поля: id, name' });
    }
    
    db.prepare(`
      INSERT INTO packaging (id, name, length, width, height, weight, cost)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, length, width, height, weight, cost);
    
    const packaging = db.prepare('SELECT * FROM packaging WHERE id = ?').get(id);
    
    res.status(201).json({
      id: packaging.id,
      name: packaging.name,
      length: packaging.length,
      width: packaging.width,
      height: packaging.height,
      weight: packaging.weight,
      cost: packaging.cost,
      createdAt: packaging.created_at,
    });
  } catch (error) {
    console.error('Ошибка создания упаковки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить упаковку
router.put('/:id', (req, res) => {
  try {
    const { name, length, width, height, weight, cost } = req.body;
    
    const result = db.prepare(`
      UPDATE packaging
      SET name = ?, length = ?, width = ?, height = ?, weight = ?, cost = ?
      WHERE id = ?
    `).run(name, length, width, height, weight, cost, req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Упаковка не найдена' });
    }
    
    res.json({ message: 'Упаковка обновлена' });
  } catch (error) {
    console.error('Ошибка обновления упаковки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить упаковку
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM packaging WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Упаковка не найдена' });
    }
    
    res.json({ message: 'Упаковка удалена' });
  } catch (error) {
    console.error('Ошибка удаления упаковки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
