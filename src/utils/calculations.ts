import { Model, ModelCalculations, Packaging, Printer, Settings } from '@/types';

/**
 * Расчёт всех финансовых показателей модели
 */
export function calculateModelFinances(
  model: Model,
  packaging: Packaging | undefined,
  printer: Printer | undefined,
  settings: Settings
): ModelCalculations {
  // Вес_итоговый = Вес_модели × (многоцветная_печать ? 1.15 : 1)
  const finalWeight = model.weight * (model.isMulticolor ? 1.15 : 1);
  
  // Стоимость_материала = (Вес_итоговый / 1000) × Цена_пластика × (1 + Процент_расходников / 100)
  const materialCost = (finalWeight / 1000) * model.plasticPrice * (1 + model.consumablesPercent / 100);
  
  // Стоимость_электричества = Время_печати × Мощность_принтера × Стоимость_электричества_кВтч
  const electricityCost = model.printTime * (printer?.powerConsumption || 0) * settings.electricityCost;
  
  // Надбавка_на_брак = (Стоимость_материала + Стоимость_электричества) × (Процент_брака / 100)
  const defectSurcharge = (materialCost + electricityCost) * (model.defectPercent / 100);
  
  // Себестоимость_производства = Стоимость_материала + Стоимость_электричества + Надбавка_на_брак
  const productionCost = materialCost + electricityCost + defectSurcharge;
  
  // Себестоимость_полная = Себестоимость_производства + Стоимость_упаковки + Стоимость_пупырки_скотча
  const packagingCost = packaging?.cost || 0;
  const fullCost = productionCost + packagingCost + settings.bubbleWrapCost;
  
  // Цена_WB = (Себестоимость_полная + Логистика_WB + Маржа) / (1 - Комиссия_WB / 100)
  const wbRecommendedPrice = (fullCost + model.wbLogistics + model.desiredMargin) / (1 - model.wbCommission / 100);
  
  // Прибыль_WB = Маржа
  const wbNetProfit = model.desiredMargin;
  
  // Цена_Ozon = (Себестоимость_полная + Логистика_Ozon + Маржа) / (1 - Комиссия_Ozon / 100)
  const ozonRecommendedPrice = (fullCost + model.ozonLogistics + model.desiredMargin) / (1 - model.ozonCommission / 100);
  
  // Прибыль_Ozon = Маржа
  const ozonNetProfit = model.desiredMargin;
  
  return {
    finalWeight,
    materialCost,
    electricityCost,
    defectSurcharge,
    productionCost,
    fullCost,
    wbRecommendedPrice,
    wbNetProfit,
    ozonRecommendedPrice,
    ozonNetProfit,
  };
}

/**
 * Форматирование числа как валюта (руб)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Форматирование числа с разделителями тысяч
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Безопасное преобразование строки в число
 */
export function safeParseFloat(value: string | number, defaultValue: number = 0): number {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Безопасное преобразование строки в целое число
 */
export function safeParseInt(value: string | number, defaultValue: number = 0): number {
  if (typeof value === 'number') return Math.floor(value);
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}
