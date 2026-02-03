import { useStore } from '@/store/useStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/calculations';
import { Box, TrendingUp, TrendingDown, Activity } from 'lucide-react';

export function Dashboard() {
  const getDashboardStats = useStore((state) => state.getDashboardStats);
  const stats = getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Дашборд</h1>
        <p className="text-muted-foreground">
          Обзор ключевых показателей вашего бизнеса
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Общее количество активных моделей */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активных моделей</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActiveModels}</div>
            <p className="text-xs text-muted-foreground">
              Готовых к продаже
            </p>
          </CardContent>
        </Card>

        {/* Средняя маржа */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Средняя маржа</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalActiveModels > 0 ? formatCurrency(stats.averageMargin) : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              На одну модель
            </p>
          </CardContent>
        </Card>

        {/* Самая прибыльная модель */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Самая прибыльная</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {stats.mostProfitableModel ? (
              <>
                <div className="text-lg font-bold truncate" title={stats.mostProfitableModel.name}>
                  {stats.mostProfitableModel.name}
                </div>
                <p className="text-xs text-muted-foreground">
                  WB: {formatCurrency(stats.mostProfitableModel.wbMargin)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ozon: {formatCurrency(stats.mostProfitableModel.ozonMargin)}
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Нет данных</div>
            )}
          </CardContent>
        </Card>

        {/* Самая невыгодная модель */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Самая невыгодная</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {stats.leastProfitableModel ? (
              <>
                <div className="text-lg font-bold truncate" title={stats.leastProfitableModel.name}>
                  {stats.leastProfitableModel.name}
                </div>
                <p className="text-xs text-muted-foreground">
                  WB: {formatCurrency(stats.leastProfitableModel.wbMargin)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ozon: {formatCurrency(stats.leastProfitableModel.ozonMargin)}
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Нет данных</div>
            )}
          </CardContent>
        </Card>
      </div>

      {stats.totalActiveModels === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Добро пожаловать!</CardTitle>
            <CardDescription>
              У вас пока нет активных моделей
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Начните с создания первой модели для 3D-печати. Система автоматически рассчитает
              себестоимость, рекомендуемые цены для маркетплейсов и вашу прибыль.
            </p>
            <a
              href="/models/new"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Создать первую модель
            </a>
          </CardContent>
        </Card>
      )}

      {/* Инструкция для новых пользователей */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрый старт</CardTitle>
          <CardDescription>
            Следуйте этим шагам для настройки системы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              <strong>Настройте константы</strong> — перейдите в раздел "Настройки" и укажите
              стоимость электричества, проценты брака и расходников, комиссии маркетплейсов
            </li>
            <li>
              <strong>Добавьте принтеры</strong> — укажите ваши 3D-принтеры с их мощностью
              потребления
            </li>
            <li>
              <strong>Создайте справочник упаковки</strong> — добавьте типы упаковки с размерами
              и стоимостью
            </li>
            <li>
              <strong>Создайте модели</strong> — добавьте ваши 3D-модели с параметрами печати
            </li>
            <li>
              <strong>Настройте AI (опционально)</strong> — добавьте API-ключ kie.ai для
              автоматической генерации названий и описаний
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
