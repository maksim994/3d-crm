import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Package, Printer, Tag, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useStore } from '@/store/useStore';

import { Model } from '@/types';

export function ModelView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getModel = useStore((state) => state.getModel);
  const model = id ? getModel(id) : null;

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
                <p className="font-medium">{model.printTime} ч</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Размеры</p>
                <p className="font-medium">
                  {model.dimensions.length} × {model.dimensions.width} × {model.dimensions.height} мм
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Многоцветная</p>
                <p className="font-medium">{model.isMulticolor ? 'Да' : 'Нет'}</p>
              </div>
            </div>
          </Card>

          {/* Wildberries */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Wildberries</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Комиссия</p>
                <p className="font-medium">{model.wbCommission}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Логистика</p>
                <p className="font-medium">{model.wbLogistics} ₽</p>
              </div>
              {model.wbProductLink && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ссылка на товар</p>
                  <a
                    href={model.wbProductLink}
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
                <p className="font-medium">{model.ozonCommission}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Логистика</p>
                <p className="font-medium">{model.ozonLogistics} ₽</p>
              </div>
              {model.ozonProductLink && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ссылка на товар</p>
                  <a
                    href={model.ozonProductLink}
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
              {model.categoryId && (
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Категория:</span>
                  <span className="font-medium">ID: {model.categoryId}</span>
                </div>
              )}
              {model.printerId && (
                <div className="flex items-center gap-2 text-sm">
                  <Printer className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Принтер:</span>
                  <span className="font-medium">ID: {model.printerId}</span>
                </div>
              )}
              {model.packagingId && (
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Упаковка:</span>
                  <span className="font-medium">ID: {model.packagingId}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Создана:</span>
                <span className="font-medium">
                  {new Date(model.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
          </Card>

          {/* Ссылка на источник */}
          {model.sourceLink && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Источник</h2>
              <a
                href={model.sourceLink}
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
