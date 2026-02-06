import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { calculateModelFinances, formatCurrency } from '@/utils/calculations';
import { Plus, Search, Archive, Eye, Pencil, Copy, Trash2 } from 'lucide-react';

export function Models() {
  const models = useStore((state) => state.getActiveModels());
  const packaging = useStore((state) => state.packaging);
  const printers = useStore((state) => state.printers);
  const settings = useStore((state) => state.settings);
  const toggleArchive = useStore((state) => state.toggleArchiveModel);
  const deleteModel = useStore((state) => state.deleteModel);
  const duplicateModel = useStore((state) => state.duplicateModel);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'profit'>('date');

  const filteredAndSortedModels = useMemo(() => {
    let filtered = models;

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.article.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query)
      );
    }

    // Сортировка
    const sorted = [...filtered];
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'date':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'profit':
        sorted.sort((a, b) => {
          const pkgA = packaging.find((p) => p.id === a.packagingId);
          const printerA = printers.find((p) => p.id === a.printerId);
          const calcA = calculateModelFinances(a, pkgA, printerA, settings);

          const pkgB = packaging.find((p) => p.id === b.packagingId);
          const printerB = printers.find((p) => p.id === b.printerId);
          const calcB = calculateModelFinances(b, pkgB, printerB, settings);

          return calcB.wbNetProfit - calcA.wbNetProfit;
        });
        break;
    }

    return sorted;
  }, [models, searchQuery, sortBy, packaging, printers, settings]);

  const handleDuplicate = (id: string) => {
    if (confirm('Создать копию модели?')) {
      duplicateModel(id);
    }
  };

  const handleArchive = (id: string) => {
    if (confirm('Переместить модель в архив?')) {
      toggleArchive(id);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить модель? Это действие нельзя отменить.')) {
      deleteModel(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Модели</h1>
          <p className="text-muted-foreground">
            Всего активных моделей: {models.length}
          </p>
        </div>
        <Link to="/models/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Добавить модель
          </Button>
        </Link>
      </div>

      {/* Поиск и фильтры */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию, артикулу или описанию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="date">По дате добавления</option>
          <option value="name">По названию</option>
          <option value="profit">По прибыльности</option>
        </select>
      </div>

      {/* Список моделей */}
      {filteredAndSortedModels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Модели не найдены' : 'У вас пока нет моделей'}
            </p>
            {!searchQuery && (
              <Link to="/models/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Создать первую модель
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedModels.map((model) => {
            const pkg = packaging.find((p) => p.id === model.packagingId);
            const printer = printers.find((p) => p.id === model.printerId);
            const calc = calculateModelFinances(model, pkg, printer, settings);

            return (
              <Card key={model.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Изображение */}
                  <div className="aspect-video bg-muted relative">
                    {model.images.length > 0 ? (
                      <img
                        src={model.images[0]}
                        alt={model.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        Нет изображения
                      </div>
                    )}
                  </div>

                  {/* Контент */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold line-clamp-1" title={model.name}>
                          {model.name}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground">{model.article}</p>
                    </div>

                    {model.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {model.description}
                      </p>
                    )}

                    {/* Финансы */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">WB</p>
                        <p className="font-semibold">{formatCurrency(calc.wbRecommendedPrice)}</p>
                        <p className="text-xs text-green-600">+{formatCurrency(calc.wbNetProfit)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ozon</p>
                        <p className="font-semibold">{formatCurrency(calc.ozonRecommendedPrice)}</p>
                        <p className="text-xs text-green-600">+{formatCurrency(calc.ozonNetProfit)}</p>
                      </div>
                    </div>

                    {/* Действия */}
                    <div className="flex gap-2 pt-2">
                      <Link to={`/models/${model.id}/view`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="mr-2 h-3 w-3" />
                          Просмотр
                        </Button>
                      </Link>
                      <Link to={`/models/${model.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Pencil className="mr-2 h-3 w-3" />
                          Изменить
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicate(model.id)}
                        title="Дублировать"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchive(model.id)}
                        title="В архив"
                      >
                        <Archive className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(model.id)}
                        title="Удалить"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
