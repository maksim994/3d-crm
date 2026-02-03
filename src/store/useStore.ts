import { create } from 'zustand';
import { Model, Packaging, Printer, Settings, DashboardStats } from '@/types';
import { generateId, generateArticle, createEmptyModel, defaultSettings } from '@/utils/storage';
import { calculateModelFinances } from '@/utils/calculations';
import { api } from '@/api/client';

interface AppStore {
  // Данные
  models: Model[];
  packaging: Packaging[];
  printers: Printer[];
  settings: Settings;
  
  // UI состояние
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  showArchived: boolean;
  
  // Инициализация
  initialize: () => Promise<void>;
  
  // Модели
  addModel: (model: Omit<Model, 'id' | 'article' | 'createdAt' | 'updatedAt'>) => Model;
  updateModel: (id: string, updates: Partial<Model>) => void;
  deleteModel: (id: string) => void;
  duplicateModel: (id: string) => Model;
  toggleArchiveModel: (id: string) => void;
  getModel: (id: string) => Model | undefined;
  getActiveModels: () => Model[];
  getArchivedModels: () => Model[];
  searchModels: (query: string) => Model[];
  
  // Упаковка
  addPackaging: (packaging: Omit<Packaging, 'id' | 'createdAt'>) => Packaging;
  updatePackaging: (id: string, updates: Partial<Packaging>) => void;
  deletePackaging: (id: string) => void;
  getPackaging: (id: string) => Packaging | undefined;
  
  // Принтеры
  addPrinter: (printer: Omit<Printer, 'id' | 'createdAt'>) => Printer;
  updatePrinter: (id: string, updates: Partial<Printer>) => void;
  deletePrinter: (id: string) => void;
  getPrinter: (id: string) => Printer | undefined;
  
  // Настройки
  updateSettings: (updates: Partial<Settings>) => void;
  
  // UI
  setSearchQuery: (query: string) => void;
  setShowArchived: (show: boolean) => void;
  
  // Статистика
  getDashboardStats: () => DashboardStats;
  
  // Импорт/экспорт
  exportData: () => string;
  importData: (jsonString: string) => void;
}

export const useStore = create<AppStore>((set, get) => ({
  // Начальное состояние
  models: [],
  packaging: [],
  printers: [],
  settings: defaultSettings,
  isLoading: true,
  error: null,
  searchQuery: '',
  showArchived: false,
  
  // Инициализация
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const [models, packaging, printers, settings] = await Promise.all([
        api.getModels(),
        api.getPackaging(),
        api.getPrinters(),
        api.getSettings(),
      ]);
      
      set({
        models,
        packaging,
        printers,
        settings,
        isLoading: false,
      });
    } catch (error) {
      console.error('Ошибка инициализации:', error);
      set({
        error: error instanceof Error ? error.message : 'Ошибка загрузки данных',
        isLoading: false,
      });
    }
  },
  
  // === МОДЕЛИ ===
  
  addModel: async (modelData) => {
    const newModel: Model = {
      ...modelData,
      id: generateId(),
      article: generateArticle(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    try {
      const created = await api.createModel(newModel);
      set((state) => ({
        models: [...state.models, created],
      }));
      return created;
    } catch (error) {
      console.error('Ошибка создания модели:', error);
      throw error;
    }
  },
  
  updateModel: async (id, updates) => {
    const model = get().models.find(m => m.id === id);
    if (!model) throw new Error('Модель не найдена');
    
    const updatedModel = {
      ...model,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    try {
      await api.updateModel(id, updatedModel);
      set((state) => ({
        models: state.models.map((m) => m.id === id ? updatedModel : m),
      }));
    } catch (error) {
      console.error('Ошибка обновления модели:', error);
      throw error;
    }
  },
  
  deleteModel: async (id) => {
    try {
      await api.deleteModel(id);
      set((state) => ({
        models: state.models.filter((model) => model.id !== id),
      }));
    } catch (error) {
      console.error('Ошибка удаления модели:', error);
      throw error;
    }
  },
  
  duplicateModel: async (id) => {
    const original = get().models.find((m) => m.id === id);
    if (!original) throw new Error('Модель не найдена');
    
    const duplicate: Model = {
      ...original,
      id: generateId(),
      article: generateArticle(),
      name: `${original.name} (копия)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    try {
      const created = await api.createModel(duplicate);
      set((state) => ({
        models: [...state.models, created],
      }));
      return created;
    } catch (error) {
      console.error('Ошибка дублирования модели:', error);
      throw error;
    }
  },
  
  toggleArchiveModel: async (id) => {
    const model = get().models.find(m => m.id === id);
    if (!model) throw new Error('Модель не найдена');
    
    const updated = {
      ...model,
      isArchived: !model.isArchived,
      updatedAt: new Date().toISOString(),
    };
    
    try {
      await api.updateModel(id, updated);
      set((state) => ({
        models: state.models.map((m) => m.id === id ? updated : m),
      }));
    } catch (error) {
      console.error('Ошибка архивирования модели:', error);
      throw error;
    }
  },
  
  getModel: (id) => {
    return get().models.find((m) => m.id === id);
  },
  
  getActiveModels: () => {
    return get().models.filter((m) => !m.isArchived);
  },
  
  getArchivedModels: () => {
    return get().models.filter((m) => m.isArchived);
  },
  
  searchModels: (query) => {
    const { models, showArchived } = get();
    const filteredByArchive = showArchived ? models : models.filter((m) => !m.isArchived);
    
    if (!query) return filteredByArchive;
    
    const lowerQuery = query.toLowerCase();
    return filteredByArchive.filter(
      (m) =>
        m.name.toLowerCase().includes(lowerQuery) ||
        m.article.toLowerCase().includes(lowerQuery) ||
        m.description.toLowerCase().includes(lowerQuery)
    );
  },
  
  // === УПАКОВКА ===
  
  addPackaging: async (packagingData) => {
    const newPackaging: Packaging = {
      ...packagingData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    try {
      const created = await api.createPackaging(newPackaging);
      set((state) => ({
        packaging: [...state.packaging, created],
      }));
      return created;
    } catch (error) {
      console.error('Ошибка создания упаковки:', error);
      throw error;
    }
  },
  
  updatePackaging: async (id, updates) => {
    const pkg = get().packaging.find(p => p.id === id);
    if (!pkg) throw new Error('Упаковка не найдена');
    
    const updated = { ...pkg, ...updates };
    
    try {
      await api.updatePackaging(id, updated);
      set((state) => ({
        packaging: state.packaging.map((p) => p.id === id ? updated : p),
      }));
    } catch (error) {
      console.error('Ошибка обновления упаковки:', error);
      throw error;
    }
  },
  
  deletePackaging: async (id) => {
    try {
      await api.deletePackaging(id);
      set((state) => ({
        packaging: state.packaging.filter((p) => p.id !== id),
      }));
    } catch (error) {
      console.error('Ошибка удаления упаковки:', error);
      throw error;
    }
  },
  
  getPackaging: (id) => {
    return get().packaging.find((p) => p.id === id);
  },
  
  // === ПРИНТЕРЫ ===
  
  addPrinter: async (printerData) => {
    const newPrinter: Printer = {
      ...printerData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    try {
      const created = await api.createPrinter(newPrinter);
      set((state) => ({
        printers: [...state.printers, created],
      }));
      return created;
    } catch (error) {
      console.error('Ошибка создания принтера:', error);
      throw error;
    }
  },
  
  updatePrinter: async (id, updates) => {
    const printer = get().printers.find(p => p.id === id);
    if (!printer) throw new Error('Принтер не найден');
    
    const updated = { ...printer, ...updates };
    
    try {
      await api.updatePrinter(id, updated);
      set((state) => ({
        printers: state.printers.map((p) => p.id === id ? updated : p),
      }));
    } catch (error) {
      console.error('Ошибка обновления принтера:', error);
      throw error;
    }
  },
  
  deletePrinter: async (id) => {
    try {
      await api.deletePrinter(id);
      set((state) => ({
        printers: state.printers.filter((p) => p.id !== id),
      }));
    } catch (error) {
      console.error('Ошибка удаления принтера:', error);
      throw error;
    }
  },
  
  getPrinter: (id) => {
    return get().printers.find((p) => p.id === id);
  },
  
  // === НАСТРОЙКИ ===
  
  updateSettings: async (updates) => {
    const newSettings = { ...get().settings, ...updates };
    
    try {
      await api.updateSettings(newSettings);
      set({ settings: newSettings });
    } catch (error) {
      console.error('Ошибка обновления настроек:', error);
      throw error;
    }
  },
  
  // === UI ===
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  
  setShowArchived: (show) => {
    set({ showArchived: show });
  },
  
  // === СТАТИСТИКА ===
  
  getDashboardStats: () => {
    const { models, packaging, printers, settings } = get();
    const activeModels = models.filter((m) => !m.isArchived);
    
    if (activeModels.length === 0) {
      return {
        totalActiveModels: 0,
        averageMargin: 0,
        mostProfitableModel: null,
        leastProfitableModel: null,
      };
    }
    
    let totalMargin = 0;
    let mostProfitable = activeModels[0];
    let leastProfitable = activeModels[0];
    
    activeModels.forEach((model) => {
      const pkg = packaging.find((p) => p.id === model.packagingId);
      const printer = printers.find((p) => p.id === model.printerId);
      const calc = calculateModelFinances(model, pkg, printer, settings);
      
      totalMargin += calc.wbNetProfit;
      
      const mostCalc = calculateModelFinances(mostProfitable, pkg, printer, settings);
      const leastCalc = calculateModelFinances(leastProfitable, pkg, printer, settings);
      
      if (calc.wbNetProfit > mostCalc.wbNetProfit) {
        mostProfitable = model;
      }
      
      if (calc.wbNetProfit < leastCalc.wbNetProfit) {
        leastProfitable = model;
      }
    });
    
    const avgMargin = totalMargin / activeModels.length;
    
    const mostPkg = packaging.find((p) => p.id === mostProfitable.packagingId);
    const mostPrinter = printers.find((p) => p.id === mostProfitable.printerId);
    const mostCalc = calculateModelFinances(mostProfitable, mostPkg, mostPrinter, settings);
    
    const leastPkg = packaging.find((p) => p.id === leastProfitable.packagingId);
    const leastPrinter = printers.find((p) => p.id === leastProfitable.printerId);
    const leastCalc = calculateModelFinances(leastProfitable, leastPkg, leastPrinter, settings);
    
    return {
      totalActiveModels: activeModels.length,
      averageMargin: avgMargin,
      mostProfitableModel: {
        name: mostProfitable.name,
        wbMargin: mostCalc.wbNetProfit,
        ozonMargin: mostCalc.ozonNetProfit,
      },
      leastProfitableModel: {
        name: leastProfitable.name,
        wbMargin: leastCalc.wbNetProfit,
        ozonMargin: leastCalc.ozonNetProfit,
      },
    };
  },
  
  // === ИМПОРТ/ЭКСПОРТ ===
  
  exportData: () => {
    const { models, packaging, printers, settings } = get();
    return JSON.stringify(
      { models, packaging, printers, settings, version: '1.0.0' },
      null,
      2
    );
  },
  
  importData: async (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      
      // Импортируем через API
      await api.updateSettings(data.settings);
      
      // Удаляем старые данные и импортируем новые
      for (const model of data.models || []) {
        await api.createModel(model);
      }
      for (const pkg of data.packaging || []) {
        await api.createPackaging(pkg);
      }
      for (const printer of data.printers || []) {
        await api.createPrinter(printer);
      }
      
      // Перезагружаем данные
      await get().initialize();
    } catch (error) {
      console.error('Ошибка импорта данных:', error);
      throw error;
    }
  },
}));
