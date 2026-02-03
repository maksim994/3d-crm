import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// Получить все принтеры
router.get('/', (req, res) => {
  try {
    const printers = db.prepare('SELECT * FROM printers ORDER BY created_at DESC').all();
    
    const response = printers.map(p => ({
      id: p.id,
      name: p.name,
      powerConsumption: p.power_consumption,
      createdAt: p.created_at,
    }));
    
    res.json(response);
  } catch (error) {
    console.error('Ошибка получения принтеров:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить принтер по ID
router.get('/:id', (req, res) => {
  try {
    const printer = db.prepare('SELECT * FROM printers WHERE id = ?').get(req.params.id);
    
    if (!printer) {
      return res.status(404).json({ error: 'Принтер не найден' });
    }
    
    res.json({
      id: printer.id,
      name: printer.name,
      powerConsumption: printer.power_consumption,
      createdAt: printer.created_at,
    });
  } catch (error) {
    console.error('Ошибка получения принтера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать принтер
router.post('/', (req, res) => {
  try {
    const { id, name, powerConsumption } = req.body;
    
    if (!id || !name || !powerConsumption) {
      return res.status(400).json({ error: 'Необходимые поля: id, name, powerConsumption' });
    }
    
    db.prepare(`
      INSERT INTO printers (id, name, power_consumption)
      VALUES (?, ?, ?)
    `).run(id, name, powerConsumption);
    
    const printer = db.prepare('SELECT * FROM printers WHERE id = ?').get(id);
    
    res.status(201).json({
      id: printer.id,
      name: printer.name,
      powerConsumption: printer.power_consumption,
      createdAt: printer.created_at,
    });
  } catch (error) {
    console.error('Ошибка создания принтера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить принтер
router.put('/:id', (req, res) => {
  try {
    const { name, powerConsumption } = req.body;
    
    const result = db.prepare(`
      UPDATE printers
      SET name = ?, power_consumption = ?
      WHERE id = ?
    `).run(name, powerConsumption, req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Принтер не найден' });
    }
    
    res.json({ message: 'Принтер обновлён' });
  } catch (error) {
    console.error('Ошибка обновления принтера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить принтер
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM printers WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Принтер не найден' });
    }
    
    res.json({ message: 'Принтер удалён' });
  } catch (error) {
    console.error('Ошибка удаления принтера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
