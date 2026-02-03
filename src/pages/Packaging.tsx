import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Packaging as PackagingType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/calculations';
import { Plus, Edit2, Trash2, X, Check, ExternalLink } from 'lucide-react';

export function Packaging() {
  const packaging = useStore((state) => state.packaging);
  const addPackaging = useStore((state) => state.addPackaging);
  const updatePackaging = useStore((state) => state.updatePackaging);
  const deletePackaging = useStore((state) => state.deletePackaging);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<PackagingType, 'id' | 'createdAt'>>({
    name: '',
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
    cost: 0,
    link: '',
  });

  const handleEdit = (pkg: PackagingType) => {
    setEditingId(pkg.id);
    setIsEditing(true);
    const { id, createdAt, ...rest } = pkg;
    setFormData(rest);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: '',
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      cost: 0,
      link: '',
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Введите название упаковки');
      return;
    }

    if (editingId) {
      updatePackaging(editingId, formData);
    } else {
      addPackaging(formData);
    }

    handleCancel();
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить упаковку? Модели с этой упаковкой останутся, но нужно будет выбрать другую.')) {
      deletePackaging(id);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Справочник упаковки</h1>
          <p className="text-muted-foreground">
            Всего типов упаковки: {packaging.length}
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить упаковку
          </Button>
        )}
      </div>

      {/* Форма добавления/редактирования */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Редактирование упаковки' : 'Новая упаковка'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder='Например: "Коробка 20×15×10"'
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Ссылка на товар</Label>
              <div className="flex gap-2">
                <Input
                  id="link"
                  type="url"
                  value={formData.link || ''}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://www.ozon.ru/..."
                />
                {formData.link && (
                  <a
                    href={formData.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-3 border rounded-md hover:bg-accent shrink-0"
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
                Ссылка на страницу товара (Озон, WB, поставщик и т.д.)
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="length">Длина (см)</Label>
                <Input
                  id="length"
                  type="number"
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Ширина (см)</Label>
                <Input
                  id="width"
                  type="number"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Высота (см)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="weight">Вес упаковки (г)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Стоимость (руб)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="1"
                />
              </div>
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

      {/* Список упаковки */}
      {packaging.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              У вас пока нет типов упаковки
            </p>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить первую упаковку
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {packaging.map((pkg) => (
            <Card key={pkg.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{pkg.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pkg.length} × {pkg.width} × {pkg.height} см
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(pkg)}
                      disabled={isEditing}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(pkg.id)}
                      disabled={isEditing}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Вес:</span>
                    <span>{pkg.weight} г</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-2 border-t">
                    <span>Стоимость:</span>
                    <span>{formatCurrency(pkg.cost)}</span>
                  </div>
                  {pkg.link && (
                    <div className="pt-2 border-t">
                      <a
                        href={pkg.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Открыть ссылку на товар</span>
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
