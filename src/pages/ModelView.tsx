import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Package, Printer, Tag, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { api } from '@/api/client';

interface Model {
  id: string;
  article: string;
  name: string;
  description: string | null;
  specifications: string | null;
  source_link: string | null;
  weight: number;
  is_multicolor: number;
  dimension_length: number;
  dimension_width: number;
  dimension_height: number;
  print_time: number;
  printer_id: string | null;
  category_id: string | null;
  plastic_price: number;
  consumables_percent: number;
  defect_percent: number;
  packaging_id: string | null;
  wb_commission: number;
  wb_logistics: number;
  wb_product_link: string | null;
  ozon_commission: number;
  ozon_logistics: number;
  ozon_product_link: string | null;
  desired_margin: number;
  created_at: string;
  updated_at: string;
}

export function ModelView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadModel();
    }
  }, [id]);

  const loadModel = async () => {
    try {
      const data = await api.get(`/models/${id}`);
      setModel(data);
    } catch (error) {
      console.error('Error loading model:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Модель не найдена</h2>
        <Button onClick={() => navigate('/models')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Вернуться к списку
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/models')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{model.name}</h1>
            <p className="text-muted-foreground mt-1">Артикул: {model.article}</p>
          </div>
        </div>
        <Link to={`/models/${model.id}`}>
          <Button>
            <Pencil className="mr-2 h-4 w-4" />
            Редактировать
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Описание</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {model.description || 'Описание отсутствует'}
            </p>
          </Card>

          {model.specifications && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Характеристики</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{model.specifications}</p>
            </Card>
          )}

          {/* Параметры печати */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Параметры печати</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Вес</p>
                <p className="font-medium">{model.weight} г</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Время печати</p>
                <p className="font-medium">{model.print_time} ч</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Размеры</p>
                <p className="font-medium">
                  {model.dimension_length} × {model.dimension_width} × {model.dimension_height} мм
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Многоцветная</p>
                <p className="font-medium">{model.is_multicolor ? 'Да' : 'Нет'}</p>
              </div>
            </div>
          </Card>

          {/* Wildberries */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Wildberries</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Комиссия</p>
                <p className="font-medium">{model.wb_commission}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Логистика</p>
                <p className="font-medium">{model.wb_logistics} ₽</p>
              </div>
              {model.wb_product_link && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ссылка на товар</p>
                  <a
                    href={model.wb_product_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Открыть на WB
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          </Card>

          {/* Ozon */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Ozon</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Комиссия</p>
                <p className="font-medium">{model.ozon_commission}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Логистика</p>
                <p className="font-medium">{model.ozon_logistics} ₽</p>
              </div>
              {model.ozon_product_link && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ссылка на товар</p>
                  <a
                    href={model.ozon_product_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Открыть на Ozon
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Быстрая информация */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Информация</h2>
            <div className="space-y-3">
              {model.category_id && (
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Категория:</span>
                  <span className="font-medium">ID: {model.category_id}</span>
                </div>
              )}
              {model.printer_id && (
                <div className="flex items-center gap-2 text-sm">
                  <Printer className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Принтер:</span>
                  <span className="font-medium">ID: {model.printer_id}</span>
                </div>
              )}
              {model.packaging_id && (
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Упаковка:</span>
                  <span className="font-medium">ID: {model.packaging_id}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Создана:</span>
                <span className="font-medium">
                  {new Date(model.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
          </Card>

          {/* Ссылка на источник */}
          {model.source_link && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Источник</h2>
              <a
                href={model.source_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1 text-sm"
              >
                Открыть ссылку
                <ExternalLink className="h-4 w-4" />
              </a>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
