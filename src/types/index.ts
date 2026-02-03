// Модель 3D-печати
export interface Model {
  id: string;
  article: string; // PM-XXXXXX
  name: string;
  description: string;
  images: string[]; // URLs или base64
  specifications: string;
  sourceLink: string;
  
  // Производственные данные
  weight: number; // граммы
  isMulticolor: boolean;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  printTime: number; // часы
  printerId: string;
  plasticPrice: number; // руб/кг
  consumablesPercent: number;
  defectPercent: number;
  
  // Упаковка
  packagingId: string;
  
  // Wildberries
  wbCommission: number; // процент
  wbLogistics: number; // рубли
  wbProductLink: string;
  wbGeneratedTitle: string;
  wbGeneratedDescription: string;
  
  // Ozon
  ozonCommission: number; // процент
  ozonLogistics: number; // рубли
  ozonProductLink: string;
  ozonGeneratedTitle: string;
  ozonGeneratedDescription: string;
  
  // Финансы
  desiredMargin: number; // рубли
  
  // Метаданные
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// Расчётные данные модели
export interface ModelCalculations {
  // Вес и материалы
  finalWeight: number;
  materialCost: number;
  electricityCost: number;
  defectSurcharge: number;
  
  // Себестоимость
  productionCost: number;
  fullCost: number;
  
  // Wildberries
  wbRecommendedPrice: number;
  wbNetProfit: number;
  
  // Ozon
  ozonRecommendedPrice: number;
  ozonNetProfit: number;
}

// Упаковка
export interface Packaging {
  id: string;
  name: string;
  length: number; // см
  width: number; // см
  height: number; // см
  weight: number; // граммы
  cost: number; // рубли
  link?: string; // ссылка на товар (Озон, WB, поставщик и т.д.)
  createdAt: string;
}

// Принтер
export interface Printer {
  id: string;
  name: string;
  powerConsumption: number; // кВт
  createdAt: string;
}

// Глобальные настройки
export interface Settings {
  // Константы расчёта
  electricityCost: number; // руб/кВт⋅ч
  bubbleWrapCost: number; // руб за отправку
  defaultDefectPercent: number;
  defaultConsumablesPercent: number;
  defaultWbCommission: number;
  defaultOzonCommission: number;
  
  // AI настройки
  kieApiKey: string;
  wbTitlePrompt: string;
  wbDescriptionPrompt: string;
  ozonTitlePrompt: string;
  ozonDescriptionPrompt: string;
  detailedGenerationPrompt: string;
}

// Статистика для дашборда
export interface DashboardStats {
  totalActiveModels: number;
  averageMargin: number;
  mostProfitableModel: {
    name: string;
    wbMargin: number;
    ozonMargin: number;
  } | null;
  leastProfitableModel: {
    name: string;
    wbMargin: number;
    ozonMargin: number;
  } | null;
}

// Хранилище данных
export interface AppData {
  models: Model[];
  packaging: Packaging[];
  printers: Printer[];
  settings: Settings;
  version: string;
}

// Режим генерации AI
export type GenerationMode = 'fast' | 'detailed';

// Тип контента для генерации
export type ContentType = 'wbTitle' | 'wbDescription' | 'ozonTitle' | 'ozonDescription';
