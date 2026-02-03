import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// Преобразование из БД в frontend формат
function transformModelFromDB(model, images = []) {
  return {
    id: model.id,
    article: model.article,
    name: model.name,
    description: model.description || '',
    images: images.map(img => img.image_url),
    specifications: model.specifications || '',
    sourceLink: model.source_link || '',
    weight: model.weight,
    isMulticolor: Boolean(model.is_multicolor),
    dimensions: {
      length: model.dimension_length,
      width: model.dimension_width,
      height: model.dimension_height,
    },
    printTime: model.print_time,
    printerId: model.printer_id || '',
    plasticPrice: model.plastic_price,
    consumablesPercent: model.consumables_percent,
    defectPercent: model.defect_percent,
    packagingId: model.packaging_id || '',
    wbCommission: model.wb_commission,
    wbLogistics: model.wb_logistics,
    wbProductLink: model.wb_product_link || '',
    wbGeneratedTitle: model.wb_generated_title || '',
    wbGeneratedDescription: model.wb_generated_description || '',
    ozonCommission: model.ozon_commission,
    ozonLogistics: model.ozon_logistics,
    ozonProductLink: model.ozon_product_link || '',
    ozonGeneratedTitle: model.ozon_generated_title || '',
    ozonGeneratedDescription: model.ozon_generated_description || '',
    desiredMargin: model.desired_margin,
    isArchived: Boolean(model.is_archived),
    createdAt: model.created_at,
    updatedAt: model.updated_at,
  };
}

// Получить все модели
router.get('/', (req, res) => {
  try {
    const models = db.prepare('SELECT * FROM models ORDER BY created_at DESC').all();
    
    const response = models.map(model => {
      const images = db.prepare('SELECT image_url FROM model_images WHERE model_id = ? ORDER BY position').all(model.id);
      return transformModelFromDB(model, images);
    });
    
    res.json(response);
  } catch (error) {
    console.error('Ошибка получения моделей:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить модель по ID
router.get('/:id', (req, res) => {
  try {
    const model = db.prepare('SELECT * FROM models WHERE id = ?').get(req.params.id);
    
    if (!model) {
      return res.status(404).json({ error: 'Модель не найдена' });
    }
    
    const images = db.prepare('SELECT image_url FROM model_images WHERE model_id = ? ORDER BY position').all(model.id);
    
    res.json(transformModelFromDB(model, images));
  } catch (error) {
    console.error('Ошибка получения модели:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать модель
router.post('/', (req, res) => {
  try {
    const model = req.body;
    
    if (!model.id || !model.article || !model.name) {
      return res.status(400).json({ error: 'Необходимые поля: id, article, name' });
    }
    
    // Вставляем модель
    db.prepare(`
      INSERT INTO models (
        id, article, name, description, specifications, source_link,
        weight, is_multicolor, dimension_length, dimension_width, dimension_height,
        print_time, printer_id, plastic_price, consumables_percent, defect_percent,
        packaging_id,
        wb_commission, wb_logistics, wb_product_link, wb_generated_title, wb_generated_description,
        ozon_commission, ozon_logistics, ozon_product_link, ozon_generated_title, ozon_generated_description,
        desired_margin, is_archived
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?
      )
    `).run(
      model.id,
      model.article,
      model.name,
      model.description,
      model.specifications,
      model.sourceLink,
      model.weight,
      model.isMulticolor ? 1 : 0,
      model.dimensions.length,
      model.dimensions.width,
      model.dimensions.height,
      model.printTime,
      model.printerId || null,
      model.plasticPrice,
      model.consumablesPercent,
      model.defectPercent,
      model.packagingId || null,
      model.wbCommission,
      model.wbLogistics,
      model.wbProductLink,
      model.wbGeneratedTitle,
      model.wbGeneratedDescription,
      model.ozonCommission,
      model.ozonLogistics,
      model.ozonProductLink,
      model.ozonGeneratedTitle,
      model.ozonGeneratedDescription,
      model.desiredMargin,
      model.isArchived ? 1 : 0
    );
    
    // Вставляем изображения
    if (model.images && model.images.length > 0) {
      const insertImage = db.prepare('INSERT INTO model_images (model_id, image_url, position) VALUES (?, ?, ?)');
      model.images.forEach((url, index) => {
        if (url) insertImage.run(model.id, url, index);
      });
    }
    
    const created = db.prepare('SELECT * FROM models WHERE id = ?').get(model.id);
    const images = db.prepare('SELECT image_url FROM model_images WHERE model_id = ? ORDER BY position').all(model.id);
    
    res.status(201).json(transformModelFromDB(created, images));
  } catch (error) {
    console.error('Ошибка создания модели:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить модель
router.put('/:id', (req, res) => {
  try {
    const model = req.body;
    const modelId = req.params.id;
    
    // Обновляем модель
    const result = db.prepare(`
      UPDATE models SET
        name = ?, description = ?, specifications = ?, source_link = ?,
        weight = ?, is_multicolor = ?, dimension_length = ?, dimension_width = ?, dimension_height = ?,
        print_time = ?, printer_id = ?, plastic_price = ?, consumables_percent = ?, defect_percent = ?,
        packaging_id = ?,
        wb_commission = ?, wb_logistics = ?, wb_product_link = ?, wb_generated_title = ?, wb_generated_description = ?,
        ozon_commission = ?, ozon_logistics = ?, ozon_product_link = ?, ozon_generated_title = ?, ozon_generated_description = ?,
        desired_margin = ?, is_archived = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      model.name,
      model.description,
      model.specifications,
      model.sourceLink,
      model.weight,
      model.isMulticolor ? 1 : 0,
      model.dimensions.length,
      model.dimensions.width,
      model.dimensions.height,
      model.printTime,
      model.printerId || null,
      model.plasticPrice,
      model.consumablesPercent,
      model.defectPercent,
      model.packagingId || null,
      model.wbCommission,
      model.wbLogistics,
      model.wbProductLink,
      model.wbGeneratedTitle,
      model.wbGeneratedDescription,
      model.ozonCommission,
      model.ozonLogistics,
      model.ozonProductLink,
      model.ozonGeneratedTitle,
      model.ozonGeneratedDescription,
      model.desiredMargin,
      model.isArchived ? 1 : 0,
      modelId
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Модель не найдена' });
    }
    
    // Обновляем изображения
    db.prepare('DELETE FROM model_images WHERE model_id = ?').run(modelId);
    
    if (model.images && model.images.length > 0) {
      const insertImage = db.prepare('INSERT INTO model_images (model_id, image_url, position) VALUES (?, ?, ?)');
      model.images.forEach((url, index) => {
        if (url) insertImage.run(modelId, url, index);
      });
    }
    
    res.json({ message: 'Модель обновлена' });
  } catch (error) {
    console.error('Ошибка обновления модели:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить модель
router.delete('/:id', (req, res) => {
  try {
    // Изображения удалятся автоматически через CASCADE
    const result = db.prepare('DELETE FROM models WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Модель не найдена' });
    }
    
    res.json({ message: 'Модель удалена' });
  } catch (error) {
    console.error('Ошибка удаления модели:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
