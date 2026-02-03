import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, Package, Truck } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Collapsible } from '@/components/ui/Collapsible';
import { formatCurrency } from '@/utils/calculations';

// Типы товаров по способу расчета
type CalculationType = 'fixed' | 'volume';

// Базовые тарифы по категориям (руб)
const BASE_TARIFFS: Record<string, { delivery: number; calculationType: CalculationType }> = {
  'small': { delivery: 30, calculationType: 'fixed' },
  'medium': { delivery: 55, calculationType: 'fixed' },
  'large': { delivery: 80, calculationType: 'fixed' },
  'volume': { delivery: 50, calculationType: 'volume' }, // за 5л, далее +5₽/л
};

// Грейды складов (процент от базы)
const WAREHOUSE_GRADES: Record<string, number> = {
  'kolomna': 0, // Базовый
  'kazan': -30,
  'ekb': -20,
  'spb': 10,
  'krasnodar': -25,
};

interface CalculatorState {
  // Основные параметры товара
  category: string;
  volumeLiters: number;
  warehouse: string;
  
  // Ценообразование
  retailPrice: number;
  discount: number;
  sppPercent: number;
  
  // Логистика
  purchasePercent: number;
  isMonoPallet: boolean;
  isFBS: boolean;
  
  // Дополнительно
  storageCoef: number; // коэффициент хранения от базы (%)
  
  // Упаковка
  boxName: string;
  boxLink: string;
  boxPrice: number;
}

export function LogisticsCalculator() {
  const [state, setState] = useState<CalculatorState>({
    category: 'medium',
    volumeLiters: 3,
    warehouse: 'kolomna',
    retailPrice: 1000,
    discount: 30,
    sppPercent: 0,
    purchasePercent: 70,
    isMonoPallet: false,
    isFBS: false,
    storageCoef: 100,
    boxName: '',
    boxLink: '',
    boxPrice: 0,
  });

  const updateState = (field: keyof CalculatorState, value: any) => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  // Расчеты
  const calculations = useMemo(() => {
    const tariff = BASE_TARIFFS[state.category];
    
    // 1. Базовая логистика
    let baseLogistics = tariff.delivery;
    if (tariff.calculationType === 'volume') {
      if (state.volumeLiters <= 5) {
        baseLogistics = 50; // Минимум за 5л
      } else {
        baseLogistics = 50 + Math.ceil(state.volumeLiters - 5) * 5;
      }
    }

    // 2. Применяем грейд склада
    const warehouseGrade = WAREHOUSE_GRADES[state.warehouse] || 0;
    const logisticsWithGrade = baseLogistics * (1 + warehouseGrade / 100);

    // 3. Стоимость возврата
    const returnCost = 33;

    // 4. Средняя логистика с учетом процента выкупа
    // Формула: (доставка + возвраты × (1 - %выкупа)) / %выкупа
    const purchaseRate = state.purchasePercent / 100;
    const avgReturns = returnCost * (1 - purchaseRate);
    const totalLogistics = (logisticsWithGrade + avgReturns) / purchaseRate;

    // 5. Доп. расходы для FBS
    let fbsProcessing = 0;
    if (state.isFBS) {
      fbsProcessing = Math.max(70, 20 + logisticsWithGrade * 0.1); // минимум 70₽
    }

    // 6. Хранение (базовый тариф 0.10₽ за 5л в сутки)
    let dailyStorage = 0.10;
    if (state.volumeLiters > 5) {
      dailyStorage = 0.10 + (state.volumeLiters - 5) * 0.01;
    }
    dailyStorage *= (state.storageCoef / 100);

    // 7. Ценообразование
    const priceAfterDiscount = state.retailPrice * (1 - state.discount / 100);
    const priceAfterSPP = priceAfterDiscount * (1 - state.sppPercent / 100);

    return {
      baseLogistics,
      logisticsWithGrade,
      totalLogistics: totalLogistics + fbsProcessing,
      fbsProcessing,
      dailyStorage,
      priceAfterDiscount,
      priceAfterSPP,
      returnCost: avgReturns,
    };
  }, [state]);

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Calculator className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Калькулятор логистики Wildberries</h1>
          <p className="text-sm text-muted-foreground">
            Расчет стоимости доставки с учетом всех факторов
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка - Параметры */}
        <div className="lg:col-span-2 space-y-6">
          {/* Основные параметры товара */}
          <Collapsible title="📦 Параметры товара" defaultOpen={true}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Категория товара</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={state.category}
                    onChange={(e) => updateState('category', e.target.value)}
                  >
                    <option value="small">Маленький (30₽)</option>
                    <option value="medium">Средний (55₽)</option>
                    <option value="large">Большой (80₽)</option>
                    <option value="volume">По объему (в литрах)</option>
                  </select>
                </div>

                {state.category === 'volume' && (
                  <div className="space-y-2">
                    <Label htmlFor="volumeLiters">Объем (литры)</Label>
                    <Input
                      id="volumeLiters"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={state.volumeLiters}
                      onChange={(e) => updateState('volumeLiters', parseFloat(e.target.value) || 0.1)}
                    />
                    <p className="text-xs text-muted-foreground">
                      До 5л = 50₽, далее +5₽/литр
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="warehouse">Склад хранения</Label>
                  <select
                    id="warehouse"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={state.warehouse}
                    onChange={(e) => updateState('warehouse', e.target.value)}
                  >
                    <option value="kolomna">Коледино (базовый)</option>
                    <option value="kazan">Казань (-30%)</option>
                    <option value="ekb">Екатеринбург (-20%)</option>
                    <option value="spb">Санкт-Петербург (+10%)</option>
                    <option value="krasnodar">Краснодар (-25%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchasePercent">Процент выкупа</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="purchasePercent"
                      type="number"
                      min="1"
                      max="100"
                      value={state.purchasePercent}
                      onChange={(e) => updateState('purchasePercent', parseFloat(e.target.value) || 50)}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Учитывает "покатушки" товара
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storageCoef">Хранение (% от базы)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="storageCoef"
                      type="number"
                      min="0"
                      max="500"
                      value={state.storageCoef}
                      onChange={(e) => updateState('storageCoef', parseFloat(e.target.value) || 100)}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={state.isFBS}
                    onChange={(e) => updateState('isFBS', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">FBS (со своего склада)</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={state.isMonoPallet}
                    onChange={(e) => updateState('isMonoPallet', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Монопаллет</span>
                </label>
              </div>
            </div>
          </Collapsible>

          {/* Упаковка */}
          <Collapsible title="📦 Упаковка (коробка)" defaultOpen={false}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="boxName">Название коробки</Label>
                <Input
                  id="boxName"
                  type="text"
                  placeholder="Например: Коробка 20x15x10 см"
                  value={state.boxName}
                  onChange={(e) => updateState('boxName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="boxLink">Ссылка на коробку</Label>
                <div className="flex gap-2">
                  <Input
                    id="boxLink"
                    type="url"
                    placeholder="https://..."
                    value={state.boxLink}
                    onChange={(e) => updateState('boxLink', e.target.value)}
                  />
                  {state.boxLink && (
                    <a
                      href={state.boxLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-3 border rounded-md hover:bg-accent"
                      title="Открыть ссылку"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ссылка на страницу с коробкой (Озон, WB, поставщик и т.д.)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="boxPrice">Стоимость коробки</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="boxPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={state.boxPrice || ''}
                    onChange={(e) => updateState('boxPrice', parseFloat(e.target.value) || 0)}
                  />
                  <span className="text-sm text-muted-foreground">₽</span>
                </div>
              </div>

              {state.boxName && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <Package className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {state.boxName}
                      </p>
                      {state.boxPrice > 0 && (
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          Стоимость: {formatCurrency(state.boxPrice)}
                        </p>
                      )}
                      {state.boxLink && (
                        <a 
                          href={state.boxLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                        >
                          Открыть ссылку →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Collapsible>

          {/* Ценообразование */}
          <Collapsible title="💰 Ценообразование" defaultOpen={true}>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="retailPrice">Розничная цена</Label>
                  <Input
                    id="retailPrice"
                    type="number"
                    min="0"
                    value={state.retailPrice}
                    onChange={(e) => updateState('retailPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Скидка</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={state.discount}
                      onChange={(e) => updateState('discount', parseFloat(e.target.value) || 0)}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sppPercent">СПП покупателя</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="sppPercent"
                      type="number"
                      min="0"
                      max="100"
                      value={state.sppPercent}
                      onChange={(e) => updateState('sppPercent', parseFloat(e.target.value) || 0)}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Цена после скидки</p>
                  <p className="text-lg font-semibold">{formatCurrency(calculations.priceAfterDiscount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Цена после СПП</p>
                  <p className="text-lg font-semibold">{formatCurrency(calculations.priceAfterSPP)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Итоговая скидка</p>
                  <p className="text-lg font-semibold text-orange-600">
                    -{((1 - calculations.priceAfterSPP / state.retailPrice) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </Collapsible>

          {/* Детализация расчетов */}
          <Collapsible title="📊 Детализация расчетов" defaultOpen={true}>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                <span className="text-sm">Базовый тариф доставки</span>
                <span className="font-medium">{formatCurrency(calculations.baseLogistics)}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                <span className="text-sm">
                  С учетом грейда склада ({WAREHOUSE_GRADES[state.warehouse] > 0 ? '+' : ''}{WAREHOUSE_GRADES[state.warehouse]}%)
                </span>
                <span className="font-medium">{formatCurrency(calculations.logisticsWithGrade)}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded">
                <div>
                  <span className="text-sm">Средняя стоимость возвратов</span>
                  <p className="text-xs text-muted-foreground">
                    При выкупе {state.purchasePercent}% товар делает {(100 / state.purchasePercent).toFixed(1)} "кругов"
                  </p>
                </div>
                <span className="font-medium">{formatCurrency(calculations.returnCost)}</span>
              </div>

              {state.isFBS && (
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                  <span className="text-sm">Обработка заказа FBS</span>
                  <span className="font-medium">{formatCurrency(calculations.fbsProcessing)}</span>
                </div>
              )}

              <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                <span className="text-sm">Хранение (в сутки)</span>
                <span className="font-medium">{formatCurrency(calculations.dailyStorage)}</span>
              </div>
            </div>
          </Collapsible>
        </div>

        {/* Правая колонка - Результаты */}
        <div className="space-y-4">
          {/* Итоговая логистика */}
          <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-5 w-5 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">ИТОГО ЛОГИСТИКА</p>
            </div>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(calculations.totalLogistics)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              на единицу товара
            </p>
          </div>

          {/* Хранение за 30 дней */}
          <div className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border-2 border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-blue-600" />
              <p className="text-sm font-medium text-muted-foreground">ХРАНЕНИЕ (30 дней)</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(calculations.dailyStorage * 30)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(calculations.dailyStorage)}/день
            </p>
          </div>

          {/* Стоимость упаковки */}
          {state.boxPrice > 0 && (
            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border-2 border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-purple-600" />
                <p className="text-sm font-medium text-muted-foreground">КОРОБКА</p>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {formatCurrency(state.boxPrice)}
              </p>
              {state.boxName && (
                <p className="text-xs text-muted-foreground mt-1">
                  {state.boxName}
                </p>
              )}
            </div>
          )}

          {/* Общая стоимость расходов */}
          {state.boxPrice > 0 && (
            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border-2 border-orange-500/20">
              <p className="text-xs font-medium text-muted-foreground mb-1">ИТОГО РАСХОДЫ</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Логистика:</span>
                  <span className="font-medium">{formatCurrency(calculations.totalLogistics)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Коробка:</span>
                  <span className="font-medium">{formatCurrency(state.boxPrice)}</span>
                </div>
                <div className="h-px bg-orange-200 dark:bg-orange-800 my-2"></div>
                <div className="flex justify-between">
                  <span className="font-medium">Всего:</span>
                  <span className="font-bold text-orange-600">
                    {formatCurrency(calculations.totalLogistics + state.boxPrice)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Статистика */}
          <div className="p-4 bg-card rounded-lg border space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Статистика</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Выкупов из 100:</span>
                <span className="font-medium">{state.purchasePercent} шт</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Возвратов:</span>
                <span className="font-medium">{100 - state.purchasePercent} шт</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Среднее "кругов":</span>
                <span className="font-medium">{(100 / state.purchasePercent).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Подсказка */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-900 dark:text-amber-100">
              💡 <strong>Совет:</strong> При низком проценте выкупа стоимость логистики значительно возрастает 
              из-за множественных "покатушек" товара между складом и покупателями.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
