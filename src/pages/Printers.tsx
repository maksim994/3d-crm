import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Printer as PrinterType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';

export function Printers() {
  const printers = useStore((state) => state.printers);
  const addPrinter = useStore((state) => state.addPrinter);
  const updatePrinter = useStore((state) => state.updatePrinter);
  const deletePrinter = useStore((state) => state.deletePrinter);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<PrinterType, 'id' | 'createdAt'>>({
    name: '',
    powerConsumption: 0,
  });

  const handleEdit = (printer: PrinterType) => {
    setEditingId(printer.id);
    setIsEditing(true);
    const { id, createdAt, ...rest } = printer;
    setFormData(rest);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: '',
      powerConsumption: 0,
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Введите название принтера');
      return;
    }

    if (formData.powerConsumption <= 0) {
      alert('Укажите мощность принтера');
      return;
    }

    if (editingId) {
      updatePrinter(editingId, formData);
    } else {
      addPrinter(formData);
    }

    handleCancel();
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить принтер? Модели с этим принтером останутся, но нужно будет выбрать другой.')) {
      deletePrinter(id);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Справочник принтеров</h1>
          <p className="text-muted-foreground">
            Всего принтеров: {printers.length}
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить принтер
          </Button>
        )}
      </div>

      {/* Форма добавления/редактирования */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Редактирование принтера' : 'Новый принтер'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder='Например: "Bambu Lab P1S"'
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="powerConsumption">Мощность потребления (кВт) *</Label>
              <Input
                id="powerConsumption"
                type="number"
                value={formData.powerConsumption}
                onChange={(e) => setFormData({ ...formData, powerConsumption: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                placeholder="Например: 0.35"
              />
              <p className="text-xs text-muted-foreground">
                Средняя мощность потребления принтера во время печати
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave}>
                <Check className="mr-2 h-4 w-4" />
                Сохранить
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Список принтеров */}
      {printers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              У вас пока нет принтеров
            </p>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить первый принтер
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {printers.map((printer) => (
            <Card key={printer.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{printer.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(printer)}
                      disabled={isEditing}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(printer.id)}
                      disabled={isEditing}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between font-semibold text-base">
                    <span>Мощность:</span>
                    <span>{printer.powerConsumption} кВт</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Подсказки */}
      <Card>
        <CardHeader>
          <CardTitle>Справка</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Мощность потребления</strong> указывается в киловаттах (кВт) и используется для
            расчёта стоимости электроэнергии при печати модели.
          </p>
          <p>
            Примерная мощность популярных принтеров:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Bambu Lab P1S / X1 Carbon: 0.35 кВт</li>
            <li>Prusa MK4: 0.24 кВт</li>
            <li>Ender 3 V2: 0.27 кВт</li>
            <li>Creality K1: 0.40 кВт</li>
          </ul>
          <p className="text-muted-foreground">
            Точные данные можно найти в характеристиках вашего принтера или измерить ваттметром.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
