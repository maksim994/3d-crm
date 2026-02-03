import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Settings as SettingsType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { defaultSettings } from '@/utils/storage';
import { validateApiKey } from '@/utils/ai';
import { Save, Download, Upload, RotateCcw, Loader2 } from 'lucide-react';

export function Settings() {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  const exportData = useStore((state) => state.exportData);
  const importData = useStore((state) => state.importData);

  const [formData, setFormData] = useState<SettingsType>(settings);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidationResult, setKeyValidationResult] = useState<'valid' | 'invalid' | null>(null);

  const handleChange = (field: keyof SettingsType, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'kieApiKey') {
      setKeyValidationResult(null);
    }
  };

  const handleSave = () => {
    updateSettings(formData);
    alert('Настройки сохранены');
  };

  const handleReset = () => {
    if (confirm('Сбросить все настройки на значения по умолчанию?')) {
      setFormData(defaultSettings);
      updateSettings(defaultSettings);
    }
  };

  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `3d-crm-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Ошибка экспорта данных');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        importData(text);
        alert('Данные успешно импортированы');
        window.location.reload();
      } catch (error) {
        alert('Ошибка импорта данных. Проверьте формат файла.');
      }
    };
    input.click();
  };

  const handleValidateApiKey = async () => {
    if (!formData.kieApiKey) {
      alert('Введите API-ключ');
      return;
    }

    setIsValidatingKey(true);
    setKeyValidationResult(null);

    try {
      const isValid = await validateApiKey(formData.kieApiKey);
      setKeyValidationResult(isValid ? 'valid' : 'invalid');
      if (isValid) {
        alert('API-ключ действителен!');
      } else {
        alert('API-ключ недействителен');
      }
    } catch {
      setKeyValidationResult('invalid');
      alert('Ошибка проверки API-ключа');
    } finally {
      setIsValidatingKey(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
          <p className="text-muted-foreground">
            Глобальные константы и конфигурация системы
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Сбросить
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Сохранить
          </Button>
        </div>
      </div>

      {/* Константы расчёта */}
      <Card>
        <CardHeader>
          <CardTitle>Константы расчёта</CardTitle>
          <CardDescription>
            Используются для автоматического расчёта себестоимости и цен
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="electricityCost">Стоимость электричества (руб/кВт⋅ч)</Label>
              <Input
                id="electricityCost"
                type="number"
                value={formData.electricityCost}
                onChange={(e) => handleChange('electricityCost', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bubbleWrapCost">Пупырка/скотч на отправку (руб)</Label>
              <Input
                id="bubbleWrapCost"
                type="number"
                value={formData.bubbleWrapCost}
                onChange={(e) => handleChange('bubbleWrapCost', parseFloat(e.target.value) || 0)}
                min="0"
                step="1"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="defaultDefectPercent">Дефолтный процент брака (%)</Label>
              <Input
                id="defaultDefectPercent"
                type="number"
                value={formData.defaultDefectPercent}
                onChange={(e) => handleChange('defaultDefectPercent', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultConsumablesPercent">Дефолтный процент расходников (%)</Label>
              <Input
                id="defaultConsumablesPercent"
                type="number"
                value={formData.defaultConsumablesPercent}
                onChange={(e) => handleChange('defaultConsumablesPercent', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
              <p className="text-xs text-muted-foreground">
                Клей, изопропанол, износ сопла
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="defaultWbCommission">Дефолтная комиссия WB (%)</Label>
              <Input
                id="defaultWbCommission"
                type="number"
                value={formData.defaultWbCommission}
                onChange={(e) => handleChange('defaultWbCommission', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultOzonCommission">Дефолтная комиссия Ozon (%)</Label>
              <Input
                id="defaultOzonCommission"
                type="number"
                value={formData.defaultOzonCommission}
                onChange={(e) => handleChange('defaultOzonCommission', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI-генерация */}
      <Card>
        <CardHeader>
          <CardTitle>AI-генерация (kie.ai)</CardTitle>
          <CardDescription>
            Настройки для автоматической генерации названий и описаний
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kieApiKey">API-ключ kie.ai</Label>
            <div className="flex gap-2">
              <Input
                id="kieApiKey"
                type="password"
                value={formData.kieApiKey}
                onChange={(e) => handleChange('kieApiKey', e.target.value)}
                placeholder="Введите API-ключ из kie.ai"
              />
              <Button
                variant="outline"
                onClick={handleValidateApiKey}
                disabled={isValidatingKey || !formData.kieApiKey}
              >
                {isValidatingKey ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Проверить'
                )}
              </Button>
            </div>
            {keyValidationResult === 'valid' && (
              <p className="text-sm text-green-600">✓ API-ключ действителен</p>
            )}
            {keyValidationResult === 'invalid' && (
              <p className="text-sm text-red-600">✗ API-ключ недействителен</p>
            )}
            <p className="text-xs text-muted-foreground">
              Получить ключ можно на{' '}
              <a
                href="https://kie.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                kie.ai
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wbTitlePrompt">Промпт для названия WB</Label>
            <Textarea
              id="wbTitlePrompt"
              value={formData.wbTitlePrompt}
              onChange={(e) => handleChange('wbTitlePrompt', e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Используйте {'{name}'}, {'{description}'}, {'{specifications}'} для подстановки данных
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wbDescriptionPrompt">Промпт для описания WB</Label>
            <Textarea
              id="wbDescriptionPrompt"
              value={formData.wbDescriptionPrompt}
              onChange={(e) => handleChange('wbDescriptionPrompt', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ozonTitlePrompt">Промпт для названия Ozon</Label>
            <Textarea
              id="ozonTitlePrompt"
              value={formData.ozonTitlePrompt}
              onChange={(e) => handleChange('ozonTitlePrompt', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ozonDescriptionPrompt">Промпт для описания Ozon</Label>
            <Textarea
              id="ozonDescriptionPrompt"
              value={formData.ozonDescriptionPrompt}
              onChange={(e) => handleChange('ozonDescriptionPrompt', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="detailedGenerationPrompt">Промпт для детальной генерации</Label>
            <Textarea
              id="detailedGenerationPrompt"
              value={formData.detailedGenerationPrompt}
              onChange={(e) => handleChange('detailedGenerationPrompt', e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Используется при детальной генерации с анализом изображений
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Резервное копирование */}
      <Card>
        <CardHeader>
          <CardTitle>Резервное копирование</CardTitle>
          <CardDescription>
            Экспорт и импорт всех данных системы
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Экспортировать данные
            </Button>
            <Button variant="outline" onClick={handleImport}>
              <Upload className="mr-2 h-4 w-4" />
              Импортировать данные
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Экспорт создаст JSON-файл со всеми моделями, упаковкой, принтерами и настройками.
            Импорт восстановит данные из ранее сохранённого файла.
          </p>
        </CardContent>
      </Card>

      {/* Кнопка сохранения */}
      <div className="flex justify-end pb-8">
        <Button onClick={handleSave} size="lg">
          <Save className="mr-2 h-5 w-5" />
          Сохранить все настройки
        </Button>
      </div>
    </div>
  );
}
