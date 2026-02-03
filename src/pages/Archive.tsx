import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { calculateModelFinances, formatCurrency } from '@/utils/calculations';
import { Search, ArchiveRestore, Trash2, ExternalLink } from 'lucide-react';

export function Archive() {
  const models = useStore((state) => state.getArchivedModels());
  const packaging = useStore((state) => state.packaging);
  const printers = useStore((state) => state.printers);
  const settings = useStore((state) => state.settings);
  const toggleArchive = useStore((state) => state.toggleArchiveModel);
  const deleteModel = useStore((state) => state.deleteModel);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredModels = useMemo(() => {
    if (!searchQuery) return models;

    const query = searchQuery.toLowerCase();
    return models.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.article.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query)
    );
  }, [models, searchQuery]);

  const handleRestore = (id: string) => {
    if (confirm('Восстановить модель из архива?')) {
      toggleArchive(id);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить модель навсегда? Это действие нельзя отменить.')) {
      deleteModel(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Архив моделей</h1>
        <p className="text-muted-foreground">
          Всего в архиве: {models.length}
        </p>
      </div>

      {/* Поиск */}
      {models.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию, артикулу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Список моделей */}
      {filteredModels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Модели не найдены' : 'Архив пуст'}
            </p>
            {!searchQuery && (
              <Link to="/models">
                <Button variant="outline">
                  Перейти к моделям
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredModels.map((model) => {
            const pkg = packaging.find((p) => p.id === model.packagingId);
            const printer = printers.find((p) => p.id === model.printerId);
            const calc = calculateModelFinances(model, pkg, printer, settings);

            return (
              <Card key={model.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Изображение */}
                  <div className="aspect-video bg-muted relative">
                    {model.images.length > 0 ? (
                      <img
                        src={model.images[0]}
                        alt={model.name}
                        className="w-full h-full object-cover opacity-60"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        Нет изображения
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-muted px-2 py-1 rounded text-xs font-medium">
                      Архив
                    </div>
                  </div>

                  {/* Контент */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold line-clamp-1" title={model.name}>
                        {model.name}
                      </h3>
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
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ozon</p>
                        <p className="font-semibold">{formatCurrency(calc.ozonRecommendedPrice)}</p>
                      </div>
                    </div>

                    {/* Действия */}
                    <div className="flex gap-2 pt-2">
                      <Link to={`/models/${model.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="mr-2 h-3 w-3" />
                          Открыть
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(model.id)}
                        title="Восстановить"
                      >
                        <ArchiveRestore className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(model.id)}
                        title="Удалить"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
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
