import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { withAuth, useAuth } from '@/hooks/use-auth';
import PageHead from '@/components/common/page-head';
import { useMovements } from '@/hooks/use-movements';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyData {
  month: string;
  ingresos: number;
  egresos: number;
  balance: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface TrendData {
  period: string;
  value: number;
  change: number;
}

function ReportsPage() {
  const { user } = useAuth();
  const { getMovementsStats, movements, fetchMovements, error, setError } =
    useMovements();
  const [timeRange, setTimeRange] = React.useState('6months');
  const [reportType, setReportType] = React.useState('overview');
  const [loading, setLoading] = React.useState(true);
  const [monthlyData, setMonthlyData] = React.useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = React.useState<CategoryData[]>([]);
  const [trendData, setTrendData] = React.useState<TrendData[]>([]);
  const [currentBalance, setCurrentBalance] = React.useState(0);

  // Cargar información financiera al montar el componente
  React.useEffect(() => {
    loadFinancialData();
  }, [timeRange]);

  // Procesar datos de movimientos cuando cambian
  React.useEffect(() => {
    if (movements && movements.length > 0) {
      processMovementsData();
    }
  }, [movements]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener estadísticas de movimientos
      await fetchMovements({}, { page: 1, limit: 1000 });

      // Procesar datos
      processMovementsData();
    } catch (err: any) {
      // No mostrar error si es una redirección por permisos o error silencioso
      if (err.message !== 'Redirección por permisos' && !err.silent) {
        console.error('Error loading financial data:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const processMovementsData = () => {
    if (!movements || movements.length === 0) {
      // Limpiar datos si no hay movimientos
      setMonthlyData([]);
      setCategoryData([]);
      setTrendData([]);
      setCurrentBalance(0);
      return;
    }

    // Datos por mes
    const monthlyStats = processMonthlyStats(movements);
    setMonthlyData(monthlyStats);

    // Datos por categoría
    const categoryStats = processCategoryStats(movements);
    setCategoryData(categoryStats);

    // Datos de tendencia
    const trendStats = processTrendStats(movements);
    setTrendData(trendStats);

    // Balance actual
    const balance = calculateCurrentBalance(movements);
    setCurrentBalance(balance);
  };

  const processMonthlyStats = (data: any[]): MonthlyData[] => {
    const monthlyMap = new Map<string, { ingresos: number; egresos: number }>();

    data.forEach((movement) => {
      const date = new Date(movement.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { ingresos: 0, egresos: 0 });
      }

      const stats = monthlyMap.get(monthKey)!;
      if (movement.type === 'INCOME') {
        stats.ingresos += movement.amount;
      } else {
        stats.egresos += movement.amount;
      }
    });
    // Obtener los 6 meses recientes
    return Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, stats]) => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month));
        return {
          month: date.toLocaleDateString('es-ES', { month: 'short' }),
          ingresos: stats.ingresos,
          egresos: stats.egresos,
          balance: stats.ingresos - stats.egresos,
        };
      });
  };

  const processCategoryStats = (data: any[]): CategoryData[] => {
    const categoryMap = new Map<string, number>();
    const expenses = data.filter((m) => m.type === 'EXPENSE');
    const totalExpenses = expenses.reduce((sum, m) => sum + m.amount, 0);

    expenses.forEach((movement) => {
      const category = movement.category || 'otros';
      categoryMap.set(
        category,
        (categoryMap.get(category) || 0) + movement.amount
      );
    });

    return Array.from(categoryMap.entries())
      .map(([name, amount], index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value:
          totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  };

  const processTrendStats = (data: any[]): TrendData[] => {
    const now = new Date();
    const thisMonth = data.filter((m) => {
      const date = new Date(m.date);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });

    const lastMonth = data.filter((m) => {
      const date = new Date(m.date);
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
      return (
        date.getMonth() === lastMonthDate.getMonth() &&
        date.getFullYear() === lastMonthDate.getFullYear()
      );
    });

    const thisMonthBalance = calculateBalance(thisMonth);
    const lastMonthBalance = calculateBalance(lastMonth);
    const thisMonthChange =
      lastMonthBalance !== 0
        ? ((thisMonthBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) *
          100
        : 0;

    return [
      { period: 'Este mes', value: thisMonthBalance, change: thisMonthChange },
      {
        period: 'Mes anterior',
        value: lastMonthBalance,
        change: -thisMonthChange,
      },
      {
        period: 'Balance actual',
        value: calculateCurrentBalance(data),
        change: 0,
      },
      { period: 'Total movimientos', value: data.length, change: 0 },
    ];
  };

  const calculateBalance = (data: any[]): number => {
    return data.reduce((balance, movement) => {
      return movement.type === 'INCOME'
        ? balance + movement.amount
        : balance - movement.amount;
    }, 0);
  };

  const calculateCurrentBalance = (data: any[]): number => {
    return calculateBalance(data);
  };

  const handleExportReport = () => {
    // Generar CSV
    const csvData = monthlyData
      .map(
        (item) =>
          `${item.month},${item.ingresos},${item.egresos},${item.balance}`
      )
      .join('\n');

    const blob = new Blob([`Mes,Ingresos,Egresos,Balance\n${csvData}`], {
      type: 'text/csv;charset=utf-8;',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_financiero_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatCompactCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
          <p className='font-medium text-gray-900'>{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className='text-sm' style={{ color: item.color }}>
              {item.name}: {formatCurrency(item.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <PageHead 
        title="Reportes Financieros" 
        description="Análisis y visualización de datos financieros. Gráficos de tendencias, estadísticas y reportes detallados para la toma de decisiones."
        keywords="reportes, análisis financiero, gráficos, estadísticas, tendencias, datos"
      />
      <MainLayout>
        <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Reportes Financieros
            </h1>
            <p className='text-gray-600'>
              Análisis y visualización de datos financieros de la empresa
            </p>
          </div>
          <div className='flex items-center space-x-3'>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className='w-48'>
                <Calendar className='mr-2 h-4 w-4' />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='3months'>Últimos 3 meses</SelectItem>
                <SelectItem value='6months'>Últimos 6 meses</SelectItem>
                <SelectItem value='1year'>Último año</SelectItem>
                <SelectItem value='2years'>Últimos 2 años</SelectItem>
              </SelectContent>
            </Select>
            <Button variant='outline' onClick={handleExportReport}>
              <Download className='mr-2 h-4 w-4' />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Trend Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {trendData.map((trend, index) => (
            <Card key={index}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-gray-600'>
                  {trend.period}
                </CardTitle>
                <div
                  className={`flex items-center text-sm ${
                    trend.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {trend.change >= 0 ? (
                    <ArrowUpRight className='h-4 w-4' />
                  ) : (
                    <ArrowDownRight className='h-4 w-4' />
                  )}
                  {Math.abs(trend.change)}%
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-gray-900'>
                  {formatCompactCurrency(trend.value)}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    trend.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {trend.change >= 0 ? '+' : ''}
                  {trend.change}% vs período anterior
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Charts */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Income vs Expenses Trend */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5' />
                Tendencia de Ingresos vs Egresos
              </CardTitle>
              <CardDescription>
                Evolución mensual de los flujos de efectivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis tickFormatter={formatCompactCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='ingresos'
                    name='Ingresos'
                    stroke='#10b981'
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2 }}
                  />
                  <Line
                    type='monotone'
                    dataKey='egresos'
                    name='Egresos'
                    stroke='#ef4444'
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Balance */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BarChart3 className='h-5 w-5' />
                Balance Mensual
              </CardTitle>
              <CardDescription>
                Resultado neto por mes (Ingresos - Egresos)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis tickFormatter={formatCompactCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey='balance'
                    name='Balance'
                    fill='#3b82f6'
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Charts */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Expenses by Category */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <PieChart className='h-5 w-5' />
                Distribución de Egresos
              </CardTitle>
              <CardDescription>
                Egresos organizados por categoría de gasto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cumulative Flow */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <DollarSign className='h-5 w-5' />
                Flujo de Efectivo Acumulado
              </CardTitle>
              <CardDescription>
                Vista acumulativa de ingresos y egresos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis tickFormatter={formatCompactCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type='monotone'
                    dataKey='ingresos'
                    name='Ingresos'
                    stackId='1'
                    stroke='#10b981'
                    fill='#10b981'
                    fillOpacity={0.3}
                  />
                  <Area
                    type='monotone'
                    dataKey='egresos'
                    name='Egresos'
                    stackId='2'
                    stroke='#ef4444'
                    fill='#ef4444'
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen Estadístico</CardTitle>
            <CardDescription>
              Métricas clave del período seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4'>
              <div className='text-center p-4 bg-green-50 rounded-lg'>
                <div className='text-2xl font-bold text-green-600'>
                  {formatCompactCurrency(
                    monthlyData.reduce((sum, item) => sum + item.ingresos, 0)
                  )}
                </div>
                <div className='text-sm text-green-700'>Ingresos Totales</div>
              </div>

              <div className='text-center p-4 bg-red-50 rounded-lg'>
                <div className='text-2xl font-bold text-red-600'>
                  {formatCompactCurrency(
                    monthlyData.reduce((sum, item) => sum + item.egresos, 0)
                  )}
                </div>
                <div className='text-sm text-red-700'>Egresos Totales</div>
              </div>

              <div className='text-center p-4 bg-blue-50 rounded-lg'>
                <div className='text-2xl font-bold text-blue-600'>
                  {formatCompactCurrency(
                    monthlyData.reduce((sum, item) => sum + item.balance, 0)
                  )}
                </div>
                <div className='text-sm text-blue-700'>Balance Neto</div>
              </div>

              <div className='text-center p-4 bg-gray-50 rounded-lg'>
                <div className='text-2xl font-bold text-gray-600'>
                  {formatCompactCurrency(
                    monthlyData.reduce((sum, item) => sum + item.ingresos, 0) /
                      monthlyData.length
                  )}
                </div>
                <div className='text-sm text-gray-700'>Ingreso Promedio</div>
              </div>

              <div className='text-center p-4 bg-gray-50 rounded-lg'>
                <div className='text-2xl font-bold text-gray-600'>
                  {formatCompactCurrency(
                    monthlyData.reduce((sum, item) => sum + item.egresos, 0) /
                      monthlyData.length
                  )}
                </div>
                <div className='text-sm text-gray-700'>Egreso Promedio</div>
              </div>

              <div className='text-center p-4 bg-purple-50 rounded-lg'>
                <div className='text-2xl font-bold text-purple-600'>
                  {(
                    (monthlyData.reduce((sum, item) => sum + item.ingresos, 0) /
                      monthlyData.reduce(
                        (sum, item) => sum + item.egresos,
                        0
                      )) *
                    100
                  ).toFixed(1)}
                  %
                </div>
                <div className='text-sm text-purple-700'>Margen Neto</div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </MainLayout>
    </>
  );
}

// Agregar displayName para Fast Refresh
ReportsPage.displayName = 'ReportsPage';

export default withAuth(ReportsPage, { adminOnly: true });
