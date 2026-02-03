import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// Получить настройки
router.get('/', (req, res) => {
  try {
    const settings = db.prepare(`
      SELECT * FROM settings WHERE id = 1
    `).get();
    
    if (!settings) {
      return res.status(404).json({ error: 'Настройки не найдены' });
    }
    
    // Преобразуем snake_case в camelCase для frontend
    const response = {
      electricityCost: settings.electricity_cost,
      bubbleWrapCost: settings.bubble_wrap_cost,
      defaultDefectPercent: settings.default_defect_percent,
      defaultConsumablesPercent: settings.default_consumables_percent,
      defaultWbCommission: settings.default_wb_commission,
      defaultOzonCommission: settings.default_ozon_commission,
      kieApiKey: settings.kie_api_key || '',
      wbTitlePrompt: settings.wb_title_prompt,
      wbDescriptionPrompt: settings.wb_description_prompt,
      ozonTitlePrompt: settings.ozon_title_prompt,
      ozonDescriptionPrompt: settings.ozon_description_prompt,
      detailedGenerationPrompt: settings.detailed_generation_prompt,
    };
    
    res.json(response);
  } catch (error) {
    console.error('Ошибка получения настроек:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить настройки
router.put('/', (req, res) => {
  try {
    const {
      electricityCost,
      bubbleWrapCost,
      defaultDefectPercent,
      defaultConsumablesPercent,
      defaultWbCommission,
      defaultOzonCommission,
      kieApiKey,
      wbTitlePrompt,
      wbDescriptionPrompt,
      ozonTitlePrompt,
      ozonDescriptionPrompt,
      detailedGenerationPrompt,
    } = req.body;
    
    db.prepare(`
      UPDATE settings SET
        electricity_cost = ?,
        bubble_wrap_cost = ?,
        default_defect_percent = ?,
        default_consumables_percent = ?,
        default_wb_commission = ?,
        default_ozon_commission = ?,
        kie_api_key = ?,
        wb_title_prompt = ?,
        wb_description_prompt = ?,
        ozon_title_prompt = ?,
        ozon_description_prompt = ?,
        detailed_generation_prompt = ?,
        updated_at = datetime('now')
      WHERE id = 1
    `).run(
      electricityCost,
      bubbleWrapCost,
      defaultDefectPercent,
      defaultConsumablesPercent,
      defaultWbCommission,
      defaultOzonCommission,
      kieApiKey,
      wbTitlePrompt,
      wbDescriptionPrompt,
      ozonTitlePrompt,
      ozonDescriptionPrompt,
      detailedGenerationPrompt
    );
    
    res.json({ message: 'Настройки обновлены' });
  } catch (error) {
    console.error('Ошибка обновления настроек:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
