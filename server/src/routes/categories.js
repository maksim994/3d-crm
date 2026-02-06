import express from 'express';
import db from '../db/database.js';
import { nanoid } from 'nanoid';

const router = express.Router();

// Получить все категории
router.get('/', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT * FROM categories 
      ORDER BY name ASC
    `).all();
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получить категорию по ID
router.get('/:id', (req, res) => {
  try {
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Создать категорию
router.post('/', (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Название категории обязательно' });
    }
    
    const id = nanoid();
    
    const stmt = db.prepare(`
      INSERT INTO categories (id, name, description, color)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(id, name, description || null, color || '#3B82F6');
    
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    
    res.status(201).json(category);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Категория с таким названием уже существует' });
    }
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Обновить категорию
router.put('/:id', (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    
    const stmt = db.prepare(`
      UPDATE categories 
      SET name = ?, description = ?, color = ?
      WHERE id = ?
    `);
    
    stmt.run(
      name || existing.name,
      description !== undefined ? description : existing.description,
      color || existing.color,
      req.params.id
    );
    
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    
    res.json(category);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Категория с таким названием уже существует' });
    }
    console.error('Error updating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Удалить категорию
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    
    // Проверяем, используется ли категория
    const modelsCount = db.prepare('SELECT COUNT(*) as count FROM models WHERE category_id = ?').get(req.params.id);
    if (modelsCount.count > 0) {
      return res.status(400).json({ 
        error: `Категория используется в ${modelsCount.count} моделях. Удалите или измените категорию у этих моделей.` 
      });
    }
    
    const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
    stmt.run(req.params.id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
