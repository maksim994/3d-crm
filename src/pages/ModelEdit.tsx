import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Model } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Collapsible } from '@/components/ui/Collapsible';
import { useToast } from '@/components/ui/Toast';
import { calculateModelFinances, formatCurrency, formatNumber } from '@/utils/calculations';
import { generateContent } from '@/utils/ai';
import { createEmptyModel } from '@/utils/storage';
import { api } from '@/api/client';
import { 
  ArrowLeft, 
  Save, 
  Copy, 
  Archive, 
  Trash2, 
  Sparkles, 
  Loader2,
  ExternalLink,
  Calculator,
  Eye
} from 'lucide-react';

export function ModelEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const getModel = useStore((state) => state.getModel);
  const addModel = useStore((state) => state.addModel);
  const updateModel = useStore((state) => state.updateModel);
  const duplicateModel = useStore((state) => state.duplicateModel);
  const toggleArchive = useStore((state) => state.toggleArchiveModel);
  const deleteModel = useStore((state) => state.deleteModel);
  const packaging = useStore((state) => state.packaging);
  const printers = useStore((state) => state.printers);
  const settings = useStore((state) => state.settings);
  
  const [categories, setCategories] = useState<any[]>([]);

  const isNew = !id;
  const existingModel = id ? getModel(id) : null;

  // Форма
  const [formData, setFormData] = useState<Omit<Model, 'id' | 'article' | 'createdAt' | 'updatedAt'>>(() => {
    if (existingModel) {
      const { id, article, createdAt, updatedAt, ...rest } = existingModel;
      return rest;
    }
    return createEmptyModel(settings);
  });

  // AI генерация
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingField, setGeneratingField] = useState<string | null>(null);

  // Загрузка категорий
  useEffect(() => {
    loadCategories();
  }, []);
  
  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Обновление формы при изменении настроек
  useEffect(() => {
    if (isNew) {
      setFormData((prev) => ({
        ...prev,
        consumablesPercent: settings.defaultConsumablesPercent,
        defectPercent: settings.defaultDefectPercent,
        wbCommission: settings.defaultWbCommission,
        ozonCommission: settings.defaultOzonCommission,
      }));
    }
  }, [settings, isNew]);

  // Расчёты
  const calculations = useMemo(() => {
    const pkg = packaging.find((p) => p.id === formData.packagingId);
    const printer = printers.find((p) => p.id === formData.printerId);
    const model = { ...formData, id: '', article: '', createdAt: '', updatedAt: '' } as Model;
    return calculateModelFinances(model, pkg, printer, settings);
  }, [formData, packaging, printers, settings]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      showToast('Введите название модели', 'error');
      return;
    }

    if (isNew) {
      const newModel = addModel(formData);
      showToast('Модель успешно создана', 'success');
      navigate(`/models/${newModel.id}`);
    } else if (id) {
      updateModel(id, formData);
      showToast('Модель успешно обновлена', 'success');
    }
  };

  const handleDuplicate = () => {
    if (id && confirm('Создать копию модели?')) {
      const duplicate = duplicateModel(id);
      navigate(`/models/${duplicate.id}`);
    }
  };

  const handleArchive = () => {
    if (id && confirm('Переместить модель в архив?')) {
      toggleArchive(id);
      navigate('/models');
    }
  };

  const handleDelete = () => {
    if (id && confirm('Удалить модель? Это действие нельзя отменить.')) {
      deleteModel(id);
      navigate('/models');
    }
  };

  const handleGenerate = async (contentType: 'wbTitle' | 'wbDescription' | 'ozonTitle' | 'ozonDescription') => {
    if (!formData.name.trim()) {
      alert('Сначала заполните название модели');
      return;
    }

    const mode = confirm('Использовать детальную генерацию с анализом изображений?\n\nОК — Детальная (с изображениями)\nОтмена — Быстрая (без изображений)') 
      ? 'detailed' 
      : 'fast';

    setIsGenerating(true);
    setGeneratingField(contentType);

    try {
      const model = { ...formData, id: '', article: '', createdAt: '', updatedAt: '' } as Model;
      const generated = await generateContent(model, contentType, mode, settings);
      
      handleChange(
        contentType === 'wbTitle' ? 'wbGeneratedTitle' :
        contentType === 'wbDescription' ? 'wbGeneratedDescription' :
        contentType === 'ozonTitle' ? 'ozonGeneratedTitle' :
        'ozonGeneratedDescription',
        generated
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ошибка генерации');
    } finally {
      setIsGenerating(false);
      setGeneratingField(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/models">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isNew ? 'Новая модель' : 'Редактирование модели'}
            </h1>
            {existingModel && (
              <p className="text-sm text-muted-foreground">{existingModel.article}</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Сохранить
          </Button>
          {!isNew && (
            <>
              <Link to={`/models/${id}/view`}>
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Просмотр
                </Button>
              </Link>
              <Button variant="outline" onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Дублировать
              </Button>
              <Button variant="outline" onClick={handleArchive}>
                <Archive className="mr-2 h-4 w-4" />
                {formData.isArchived ? 'Из архива' : 'В архив'}
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Основная информация */}
      <Collapsible title="Основная информация" defaultOpen={true}>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Например: Фигурка дракона"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sourceLink">Ссылка на источник</Label>
              <Input
                id="sourceLink"
                value={formData.sourceLink}
                onChange={(e) => handleChange('sourceLink', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Краткое описание (для AI)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Опишите модель кратко для генерации описаний"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specifications">Характеристики</Label>
            <Textarea
              id="specifications"
              value={formData.specifications}
              onChange={(e) => handleChange('specifications', e.target.value)}
              placeholder="Например: Материал: PLA, Высота: 15 см, Вес: 50 г"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Изображения (URL или base64)</Label>
            <div className="space-y-2">
              {formData.images.map((img, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={img}
                    onChange={(e) => {
                      const newImages = [...formData.images];
                      newImages[index] = e.target.value;
                      handleChange('images', newImages);
                    }}
                    placeholder="https://... или data:image/..."
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newImages = formData.images.filter((_, i) => i !== index);
                      handleChange('images', newImages);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleChange('images', [...formData.images, ''])}
              >
                Добавить изображение
              </Button>
            </div>
          </div>
        </div>
      </Collapsible>

      {/* Производственные данные */}
      <Collapsible title="Производственные данные" defaultOpen={true}>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="weight">Вес модели (г)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="printTime">Время печати (ч)</Label>
              <Input
                id="printTime"
                type="text"
                value={formData.printTime}
                onChange={(e) => handleChange('printTime', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                placeholder="Например: 1.5 (1 час 30 минут)"
              />
              <p className="text-xs text-muted-foreground">
                Используйте десятичные дроби: 1.5 = 1 час 30 мин, 2.25 = 2 часа 15 мин
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plasticPrice">Цена пластика (руб/кг)</Label>
              <Input
                id="plasticPrice"
                type="number"
                value={formData.plasticPrice}
                onChange={(e) => handleChange('plasticPrice', parseFloat(e.target.value) || 0)}
                min="0"
                step="1"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isMulticolor"
              checked={formData.isMulticolor}
              onChange={(e) => handleChange('isMulticolor', e.target.checked)}
            />
            <Label htmlFor="isMulticolor" className="cursor-pointer">
              Многоцветная печать (+15% к весу)
            </Label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="dimensions.length">Длина (см)</Label>
              <Input
                id="dimensions.length"
                type="number"
                value={formData.dimensions.length}
                onChange={(e) => handleChange('dimensions', {
                  ...formData.dimensions,
                  length: parseFloat(e.target.value) || 0
                })}
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dimensions.width">Ширина (см)</Label>
              <Input
                id="dimensions.width"
                type="number"
                value={formData.dimensions.width}
                onChange={(e) => handleChange('dimensions', {
                  ...formData.dimensions,
                  width: parseFloat(e.target.value) || 0
                })}
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dimensions.height">Высота (см)</Label>
              <Input
                id="dimensions.height"
                type="number"
                value={formData.dimensions.height}
                onChange={(e) => handleChange('dimensions', {
                  ...formData.dimensions,
                  height: parseFloat(e.target.value) || 0
                })}
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Категория</Label>
              <select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Без категории</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Сначала <Link to="/categories" className="underline">создайте категории</Link>
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="printerId">Принтер</Label>
              <select
                id="printerId"
                value={formData.printerId}
                onChange={(e) => handleChange('printerId', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Выберите принтер</option>
                {printers.map((printer) => (
                  <option key={printer.id} value={printer.id}>
                    {printer.name} ({printer.powerConsumption} кВт)
                  </option>
                ))}
              </select>
              {printers.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Сначала <Link to="/printers" className="underline">добавьте принтеры</Link>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="packagingId">Упаковка</Label>
              <select
                id="packagingId"
                value={formData.packagingId}
                onChange={(e) => handleChange('packagingId', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Выберите упаковку</option>
                {packaging.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} ({formatCurrency(pkg.cost)})
                  </option>
                ))}
              </select>
              {packaging.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Сначала <Link to="/packaging" className="underline">добавьте упаковку</Link>
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="consumablesPercent">Процент на расходники (%)</Label>
              <Input
                id="consumablesPercent"
                type="number"
                value={formData.consumablesPercent}
                onChange={(e) => handleChange('consumablesPercent', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
              <p className="text-xs text-muted-foreground">
                Клей, изопропанол, износ сопла
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defectPercent">Процент брака (%)</Label>
              <Input
                id="defectPercent"
                type="number"
                value={formData.defectPercent}
                onChange={(e) => handleChange('defectPercent', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </div>
      </Collapsible>

      {/* Wildberries */}
      <Collapsible title="Wildberries" defaultOpen={false}>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="wbCommission">Комиссия (%)</Label>
              <Input
                id="wbCommission"
                type="number"
                value={formData.wbCommission}
                onChange={(e) => handleChange('wbCommission', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wbLogistics">Логистика (руб)</Label>
              <Input
                id="wbLogistics"
                type="number"
                value={formData.wbLogistics}
                onChange={(e) => handleChange('wbLogistics', parseFloat(e.target.value) || 0)}
                min="0"
                step="1"
              />
              <p className="text-xs text-muted-foreground">
                <a
                  href="https://seller.wildberries.ru/tariffs-and-logistics/logistics-calculator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline inline-flex items-center gap-1"
                >
                  Рассчитать в калькуляторе WB
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wbProductLink">Ссылка на карточку товара</Label>
            <Input
              id="wbProductLink"
              value={formData.wbProductLink}
              onChange={(e) => handleChange('wbProductLink', e.target.value)}
              placeholder="https://www.wildberries.ru/..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="wbGeneratedTitle">Сгенерированное название</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerate('wbTitle')}
                disabled={isGenerating}
              >
                {isGenerating && generatingField === 'wbTitle' ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-3 w-3" />
                )}
                Генерировать
              </Button>
            </div>
            <Textarea
              id="wbGeneratedTitle"
              value={formData.wbGeneratedTitle}
              onChange={(e) => handleChange('wbGeneratedTitle', e.target.value)}
              placeholder="Нажмите 'Генерировать' для создания названия с помощью AI"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="wbGeneratedDescription">Сгенерированное описание</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerate('wbDescription')}
                disabled={isGenerating}
              >
                {isGenerating && generatingField === 'wbDescription' ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-3 w-3" />
                )}
                Генерировать
              </Button>
            </div>
            <Textarea
              id="wbGeneratedDescription"
              value={formData.wbGeneratedDescription}
              onChange={(e) => handleChange('wbGeneratedDescription', e.target.value)}
              placeholder="Нажмите 'Генерировать' для создания описания с помощью AI"
              rows={6}
            />
          </div>
        </div>
      </Collapsible>

      {/* Ozon */}
      <Collapsible title="Ozon" defaultOpen={false}>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ozonCommission">Комиссия (%)</Label>
              <Input
                id="ozonCommission"
                type="number"
                value={formData.ozonCommission}
                onChange={(e) => handleChange('ozonCommission', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ozonLogistics">Логистика (руб)</Label>
              <Input
                id="ozonLogistics"
                type="number"
                value={formData.ozonLogistics}
                onChange={(e) => handleChange('ozonLogistics', parseFloat(e.target.value) || 0)}
                min="0"
                step="1"
              />
              <p className="text-xs text-muted-foreground">
                <a
                  href="https://seller.ozon.ru/app/analytics/fbo-calculator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline inline-flex items-center gap-1"
                >
                  Рассчитать в калькуляторе Ozon
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ozonProductLink">Ссылка на карточку товара</Label>
            <Input
              id="ozonProductLink"
              value={formData.ozonProductLink}
              onChange={(e) => handleChange('ozonProductLink', e.target.value)}
              placeholder="https://www.ozon.ru/..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="ozonGeneratedTitle">Сгенерированное название</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerate('ozonTitle')}
                disabled={isGenerating}
              >
                {isGenerating && generatingField === 'ozonTitle' ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-3 w-3" />
                )}
                Генерировать
              </Button>
            </div>
            <Textarea
              id="ozonGeneratedTitle"
              value={formData.ozonGeneratedTitle}
              onChange={(e) => handleChange('ozonGeneratedTitle', e.target.value)}
              placeholder="Нажмите 'Генерировать' для создания названия с помощью AI"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="ozonGeneratedDescription">Сгенерированное описание</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerate('ozonDescription')}
                disabled={isGenerating}
              >
                {isGenerating && generatingField === 'ozonDescription' ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-3 w-3" />
                )}
                Генерировать
              </Button>
            </div>
            <Textarea
              id="ozonGeneratedDescription"
              value={formData.ozonGeneratedDescription}
              onChange={(e) => handleChange('ozonGeneratedDescription', e.target.value)}
              placeholder="Нажмите 'Генерировать' для создания описания с помощью AI"
              rows={6}
            />
          </div>
        </div>
      </Collapsible>

      {/* Финансы */}
      <Collapsible title="💰 Финансы и расчёты" defaultOpen={true}>
        <p className="text-sm text-muted-foreground mb-4">
          Автоматический расчёт себестоимости и рекомендуемых цен
        </p>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="desiredMargin">Желаемая маржа (руб)</Label>
            <Input
              id="desiredMargin"
              type="number"
              value={formData.desiredMargin}
              onChange={(e) => handleChange('desiredMargin', parseFloat(e.target.value) || 0)}
              min="0"
              step="1"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4 border-t">
            {/* Производственные расчёты */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Производство</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Итоговый вес:</span>
                  <span>{formatNumber(calculations.finalWeight, 2)} г</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Материалы:</span>
                  <span>{formatCurrency(calculations.materialCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Электричество:</span>
                  <span>{formatCurrency(calculations.electricityCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Надбавка брак:</span>
                  <span>{formatCurrency(calculations.defectSurcharge)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Себестоимость:</span>
                  <span>{formatCurrency(calculations.productionCost)}</span>
                </div>
              </div>
            </div>

            {/* Полная себестоимость */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">С упаковкой</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Производство:</span>
                  <span>{formatCurrency(calculations.productionCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Упаковка:</span>
                  <span>{formatCurrency(packaging.find(p => p.id === formData.packagingId)?.cost || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Пупырка/скотч:</span>
                  <span>{formatCurrency(settings.bubbleWrapCost)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t text-base">
                  <span>Полная:</span>
                  <span>{formatCurrency(calculations.fullCost)}</span>
                </div>
              </div>
            </div>

            {/* Wildberries */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Wildberries</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between font-semibold text-base text-blue-600">
                  <span>Рекомендуемая цена:</span>
                  <span>{formatCurrency(calculations.wbRecommendedPrice)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base text-green-600 pt-2 border-t">
                  <span>Чистая прибыль:</span>
                  <span>+{formatCurrency(calculations.wbNetProfit)}</span>
                </div>
              </div>
            </div>

            {/* Ozon */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Ozon</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between font-semibold text-base text-orange-600">
                  <span>Рекомендуемая цена:</span>
                  <span>{formatCurrency(calculations.ozonRecommendedPrice)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base text-green-600 pt-2 border-t">
                  <span>Чистая прибыль:</span>
                  <span>+{formatCurrency(calculations.ozonNetProfit)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Collapsible>

      {/* Кнопки действий */}
      <div className="flex justify-between items-center pb-8">
        <Link to="/models">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Отменить
          </Button>
        </Link>
        
        <Button onClick={handleSave} size="lg">
          <Save className="mr-2 h-5 w-5" />
          Сохранить модель
        </Button>
      </div>
    </div>
  );
}
