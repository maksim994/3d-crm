import { AppData, Settings, Model, Packaging, Printer } from '@/types';

const STORAGE_KEY = '3d-printing-crm-data';
const STORAGE_VERSION = '1.0.0';

// Дефолтные настройки
export const defaultSettings: Settings = {
  electricityCost: 6.5, // руб/кВт⋅ч (средняя цена по РФ)
  bubbleWrapCost: 15, // руб
  defaultDefectPercent: 5,
  defaultConsumablesPercent: 10,
  defaultWbCommission: 15,
  defaultOzonCommission: 12,
  
  kieApiKey: '',
  wbTitlePrompt: 'Создай SEO-оптимизированное название для товара на Wildberries. Используй ключевые слова, длина до 100 символов. Товар: {name}, описание: {description}, характеристики: {specifications}',
  wbDescriptionPrompt: 'Создай подробное описание для товара на Wildberries с учётом SEO. Включи преимущества, характеристики и применение. Товар: {name}, описание: {description}, характеристики: {specifications}',
  ozonTitlePrompt: 'Создай привлекательное название для товара на Ozon. Используй ключевые слова, длина до 250 символов. Товар: {name}, описание: {description}, характеристики: {specifications}',
  ozonDescriptionPrompt: 'Создай детальное описание для товара на Ozon. Структурируй текст, добавь эмодзи, опиши характеристики и преимущества. Товар: {name}, описание: {description}, характеристики: {specifications}',
  detailedGenerationPrompt: 'Проанализируй изображение товара и создай максимально подробное описание, учитывая все видимые детали, материалы, цвета и особенности.',
};

// Инициализация данных
const initData: AppData = {
  models: [],
  packaging: [],
  printers: [],
  settings: defaultSettings,
  version: STORAGE_VERSION,
};

// Загрузка данных из localStorage
export function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return initData;
    }
    
    const data: AppData = JSON.parse(stored);
    
    // Проверка версии и миграция при необходимости
    if (data.version !== STORAGE_VERSION) {
      return migrateData(data);
    }
    
    // Мерж настроек с дефолтными (для новых полей)
    data.settings = { ...defaultSettings, ...data.settings };
    
    return data;
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    return initData;
  }
}

// Сохранение данных в localStorage
export function saveData(data: AppData): void {
  try {
    data.version = STORAGE_VERSION;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Ошибка сохранения данных:', error);
    throw new Error('Не удалось сохранить данные. Возможно, закончилось место в хранилище.');
  }
}

// Миграция данных между версиями
function migrateData(oldData: AppData): AppData {
  // В будущем здесь будет логика миграции
  console.log('Миграция данных с версии', oldData.version, 'на', STORAGE_VERSION);
  
  return {
    ...oldData,
    version: STORAGE_VERSION,
    settings: { ...defaultSettings, ...oldData.settings },
  };
}

// Экспорт данных в JSON
export function exportData(): string {
  const data = loadData();
  return JSON.stringify(data, null, 2);
}

// Импорт данных из JSON
export function importData(jsonString: string): void {
  try {
    const data: AppData = JSON.parse(jsonString);
    
    // Валидация структуры
    if (!data.models || !data.packaging || !data.printers || !data.settings) {
      throw new Error('Некорректная структура данных');
    }
    
    saveData(data);
  } catch (error) {
    console.error('Ошибка импорта данных:', error);
    throw new Error('Не удалось импортировать данные. Проверьте формат файла.');
  }
}

// Генерация артикула PM-XXXXXX
export function generateArticle(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let article = 'PM-';
  
  for (let i = 0; i < 6; i++) {
    article += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return article;
}

// Генерация уникального ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Создание пустой модели с дефолтными значениями
export function createEmptyModel(settings: Settings): Omit<Model, 'id' | 'article' | 'createdAt' | 'updatedAt'> {
  return {
    name: '',
    description: '',
    images: [],
    specifications: '',
    sourceLink: '',
    
    weight: 0,
    isMulticolor: false,
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
    },
    printTime: 0,
    printerId: '',
    categoryId: '',
    plasticPrice: 0,
    consumablesPercent: settings.defaultConsumablesPercent,
    defectPercent: settings.defaultDefectPercent,
    
    packagingId: '',
    
    wbCommission: settings.defaultWbCommission,
    wbLogistics: 0,
    wbProductLink: '',
    wbGeneratedTitle: '',
    wbGeneratedDescription: '',
    
    ozonCommission: settings.defaultOzonCommission,
    ozonLogistics: 0,
    ozonProductLink: '',
    ozonGeneratedTitle: '',
    ozonGeneratedDescription: '',
    
    desiredMargin: 0,
    
    isArchived: false,
  };
}
