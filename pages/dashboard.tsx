import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { withAuth, useAuth, usePermissions } from '@/hooks/use-auth';
import PageHead from '@/components/common/page-head';
import { useMovements } from '@/hooks/use-movements';
import { StatsGrid, FinancialStatsCard } from '@/components/custom/stats-card';
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
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  FileText,
  ArrowRight,
  Activity,
  CreditCard,
} from 'lucide-react';

function DashboardPage() {
  const { user } = useAuth();
  const permissions = usePermissions();
  const { movements, fetchMovements, error, setError } = useMovements();
  const [financialStats, setFinancialStats] = React.useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactions: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [dataLoaded, setDataLoaded] = React.useState(false);

  // Cargar datos financieros al montar el componente
  React.useEffect(() => {
    if (!dataLoaded) {
      loadFinancialData();
    }
  }, [dataLoaded]);

  // Procesar datos cuando cambien los movimientos y ya se hayan cargado
  React.useEffect(() => {
    if (dataLoaded && movements) {
      processFinancialData();
      setLoading(false);
    }
  }, [movements, dataLoaded]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Obtener todos los movimientos para las estadísticas
      await fetchMovements({}, { page: 1, limit: 1000 });
      setDataLoaded(true);
    } catch (err: any) {
      console.error('Error loading financial data:', err);
      setLoading(false);
    }
  };

  const processFinancialData = () => {
    if (!movements) {
      setFinancialStats({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactions: 0,
      });
      return;
    }

    const totalIncome = movements
      .filter((movement) => movement.type === 'INCOME')
      .reduce((sum, movement) => sum + movement.amount, 0);

    const totalExpense = movements
      .filter((movement) => movement.type === 'EXPENSE')
      .reduce((sum, movement) => sum + movement.amount, 0);

    const balance = totalIncome - totalExpense;
    const transactions = movements.length;

    setFinancialStats({
      totalIncome,
      totalExpense,
      balance,
      transactions,
    });
  };

  const quickActions = [
    {
      title: 'Nuevo Movimiento',
      description: 'Registrar ingreso o egreso',
      href: '/movements/',
      icon: DollarSign,
      color: 'bg-green-600',
      available: permissions.canCreateMovements,
    },
    {
      title: 'Ver Movimientos',
      description: 'Consultar historial financiero',
      href: '/movements',
      icon: FileText,
      color: 'bg-blue-600',
      available: true,
    },
    {
      title: 'Gestionar Usuarios',
      description: 'Administrar usuarios del sistema',
      href: '/users',
      icon: Users,
      color: 'bg-purple-600',
      available: permissions.canManageUsers,
    },
    {
      title: 'Ver Reportes',
      description: 'Dashboard de análisis financiero',
      href: '/reports',
      icon: BarChart3,
      color: 'bg-orange-600',
      available: permissions.canViewReports,
    },
  ];

  const availableActions = quickActions.filter((action) => action.available);

  // Obtener los últimos 3 movimientos para actividad reciente
  const recentActivity = React.useMemo(() => {
    if (!movements || movements.length === 0) return [];

    return movements
      .slice(0, 3) // Tomar solo los primeros 3
      .map((movement) => ({
        id: movement.id,
        type: movement.type,
        concept: movement.concept,
        amount: movement.amount,
        date: new Date(movement.date).toISOString().split('T')[0],
        user: movement.user.name,
      }));
  }, [movements]);

  return (
    <>
      <PageHead 
        title="Dashboard" 
        description="Panel de control financiero. Visualiza estadísticas, movimientos recientes y acciones rápidas para gestionar tus ingresos y egresos."
        keywords="dashboard, panel de control, estadísticas financieras, resumen, movimientos"
      />
      <MainLayout>
        <div className='space-y-8'>
        {/* Welcome Section */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Bienvenido, {user?.name || 'Usuario'}
            </h1>
            <p className='text-gray-600 mt-1'>
              Aquí tienes un resumen de tu actividad
            </p>
          </div>
          <Badge
            variant={user?.role === 'ADMIN' ? 'default' : 'secondary'}
            className='px-3 py-1'
          >
            {user?.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
          </Badge>
        </div>

        {/* Error Message */}
        {error && (
          <Alert className='border-red-200 bg-red-50'>
            <AlertDescription className='text-red-800'>
              Error al cargar los datos financieros: {error}
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setDataLoaded(false);
                  setError(null);
                }}
                className='ml-2'
              >
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto'></div>
            <p className='mt-2 text-gray-600'>Cargando datos financieros...</p>
          </div>
        )}

        {/* Financial Stats - Only for Admin users */}
        {user?.role === 'ADMIN' && (
          <StatsGrid columns={4}>
            <FinancialStatsCard
              type='balance'
              amount={financialStats.balance}
              trend={{ value: 12, isPositive: true }}
              period='este mes'
            />
            <FinancialStatsCard
              type='income'
              amount={financialStats.totalIncome}
              trend={{ value: 8, isPositive: true }}
              period='este mes'
            />
            <FinancialStatsCard
              type='expense'
              amount={financialStats.totalExpense}
              trend={{ value: 3, isPositive: false }}
              period='este mes'
            />
            <FinancialStatsCard
              type='transactions'
              amount={financialStats.transactions}
              trend={{ value: 15, isPositive: true }}
              period='este mes'
            />
          </StatsGrid>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Activity className='h-5 w-5' />
                Acciones Rápidas
              </CardTitle>
              <CardDescription>
                Accede a las funciones principales del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {availableActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <div className='flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer'>
                    <div
                      className={`p-2 rounded-md ${action.color} text-white mr-4`}
                    >
                      <action.icon className='h-5 w-5' />
                    </div>
                    <div className='flex-1'>
                      <h4 className='font-medium text-gray-900'>
                        {action.title}
                      </h4>
                      <p className='text-sm text-gray-600'>
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className='h-4 w-4 text-gray-400' />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CreditCard className='h-5 w-5' />
                Actividad Reciente
              </CardTitle>
              <CardDescription>
                Últimos movimientos financieros registrados
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {recentActivity.length > 0 ? (
                recentActivity.map((item) => (
                  <div
                    key={item.id}
                    className='flex items-center justify-between p-3 rounded-lg border'
                  >
                    <div className='flex items-center space-x-3'>
                      <div
                        className={`p-1.5 rounded-full ${
                          item.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                        }`}
                      >
                        {item.type === 'INCOME' ? (
                          <TrendingUp className='h-4 w-4 text-green-600' />
                        ) : (
                          <TrendingDown className='h-4 w-4 text-red-600' />
                        )}
                      </div>
                      <div>
                        <p className='font-medium text-gray-900'>
                          {item.concept}
                        </p>
                        <p className='text-xs text-gray-600'>
                          {item.date} • {item.user}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`font-semibold ${
                        item.type === 'INCOME'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {item.type === 'INCOME' ? '+' : '-'}$
                      {item.amount.toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-center py-8 text-gray-500'>
                  <CreditCard className='h-12 w-12 mx-auto mb-2 text-gray-300' />
                  <p>No hay movimientos recientes</p>
                  <p className='text-sm'>
                    Los movimientos aparecerán aquí una vez que sean registrados
                  </p>
                </div>
              )}

              <div className='pt-2'>
                <Link href='/movements'>
                  <Button variant='outline' className='w-full'>
                    Ver todos los movimientos
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
            <CardDescription>
              Información sobre el funcionamiento del sistema financiero
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='text-center p-4'>
                <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2'>
                  <Activity className='h-6 w-6 text-green-600' />
                </div>
                <h4 className='font-medium text-gray-900'>Sistema Operativo</h4>
                <p className='text-sm text-gray-600'>
                  Todos los servicios funcionando correctamente
                </p>
              </div>
              <div className='text-center p-4'>
                <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2'>
                  <BarChart3 className='h-6 w-6 text-blue-600' />
                </div>
                <h4 className='font-medium text-gray-900'>Base de Datos</h4>
                <p className='text-sm text-gray-600'>
                  Sincronizada y actualizada
                </p>
              </div>
              <div className='text-center p-4'>
                <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2'>
                  <Users className='h-6 w-6 text-purple-600' />
                </div>
                <h4 className='font-medium text-gray-900'>Usuarios Activos</h4>
                <p className='text-sm text-gray-600'>
                  1 administrador conectado
                </p>
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
DashboardPage.displayName = 'DashboardPage';

export default withAuth(DashboardPage);
