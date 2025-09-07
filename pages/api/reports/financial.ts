import { NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import {
  withAdminAuth,
  AuthenticatedRequest,
  handleApiError,
  validateMethod,
} from '../../../lib/middleware';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Validar método HTTP
  if (validateMethod(req, res, ['GET'])) return;

  try {
    switch (req.method) {
      case 'GET':
        await getFinancialReport(req, res);
        break;
    }
  } catch (error) {
    handleApiError(error, res);
  }
}

// GET /api/reports/financial - Obtener datos para gráficos financieros
async function getFinancialReport(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { period, startDate, endDate } = req.query;

  // Determinar fechas del periodo
  let dateFilter: any = {};
  const now = new Date();

  if (startDate && endDate) {
    dateFilter = {
      date: {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      },
    };
  } else {
    switch (period) {
      case 'week':
        dateFilter.date = {
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        };
        break;
      case 'month':
        dateFilter.date = {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        };
        break;
      case 'year':
        dateFilter.date = {
          gte: new Date(now.getFullYear(), 0, 1),
        };
        break;
      default:
        break;
    }
  }

  // Resumen general
  const [incomeTotal, expenseTotal, totalMovements] = await Promise.all([
    prisma.movement.aggregate({
      where: { ...dateFilter, type: 'INCOME' },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.movement.aggregate({
      where: { ...dateFilter, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.movement.count({ where: dateFilter }),
  ]);

  const balance =
    (incomeTotal._sum.amount || 0) - (expenseTotal._sum.amount || 0);

  // Movimientos por día (últimos 30 días para gráfico de líneas)
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const dailyMovements = (await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('day', date) as day,
      type,
      SUM(amount) as total_amount,
      COUNT(*) as count
    FROM movement 
    WHERE date >= ${last30Days}
    GROUP BY DATE_TRUNC('day', date), type
    ORDER BY day DESC
  `) as Array<{
    day: Date;
    type: 'INCOME' | 'EXPENSE';
    total_amount: number;
    count: number;
  }>;

  // Movimientos por mes (últimos 12 meses)
  const last12Months = new Date(now.getFullYear() - 1, now.getMonth(), 1);
  const monthlyMovements = (await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', date) as month,
      type,
      SUM(amount) as total_amount,
      COUNT(*) as count
    FROM movement 
    WHERE date >= ${last12Months}
    GROUP BY DATE_TRUNC('month', date), type
    ORDER BY month DESC
  `) as Array<{
    month: Date;
    type: 'INCOME' | 'EXPENSE';
    total_amount: number;
    count: number;
  }>;

  // Top conceptos de egresos e ingresos
  const [topExpenses, topIncomes] = await Promise.all([
    prisma.movement.groupBy({
      by: ['concept'],
      where: { ...dateFilter, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: { _all: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    }),
    prisma.movement.groupBy({
      by: ['concept'],
      where: { ...dateFilter, type: 'INCOME' },
      _sum: { amount: true },
      _count: { _all: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    }),
  ]);

  // Usuarios más activos
  const activeUsers = await prisma.movement.groupBy({
    by: ['userId'],
    where: dateFilter,
    _count: { _all: true },
    _sum: { amount: true },
    orderBy: { _count: { _all: 'desc' } },
    take: 5,
  });

  // Obtener información de usuarios activos
  const userIds = activeUsers.map((u) => u.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });

  const activeUsersWithInfo = activeUsers.map((userStat) => {
    const userInfo = users.find((u) => u.id === userStat.userId);
    return {
      ...userStat,
      user: userInfo,
    };
  });

  // Formatear datos para gráficos
  const chartData = {
    // Datos para gráfico de líneas ingresos vs egresos por día
    dailyChart: formatDailyChart(dailyMovements),

    // Datos para gráfico de barras ingresos vs egresos por mes
    monthlyChart: formatMonthlyChart(monthlyMovements),

    // Datos para gráfico de pie distribución de egresos
    expensePieChart: topExpenses.map((expense) => ({
      name: expense.concept,
      value: expense._sum.amount || 0,
      count: expense._count._all,
    })),

    // Datos para gráfico de pie (distribución de ingresos)
    incomePieChart: topIncomes.map((income) => ({
      name: income.concept,
      value: income._sum.amount || 0,
      count: income._count._all,
    })),
  };

  res.status(200).json({
    summary: {
      totalIncome: incomeTotal._sum.amount || 0,
      totalExpense: expenseTotal._sum.amount || 0,
      balance,
      totalMovements,
      incomeCount: incomeTotal._count._all,
      expenseCount: expenseTotal._count._all,
    },
    chartData,
    topExpenses: topExpenses.map((expense) => ({
      concept: expense.concept,
      amount: expense._sum.amount || 0,
      count: expense._count._all,
    })),
    topIncomes: topIncomes.map((income) => ({
      concept: income.concept,
      amount: income._sum.amount || 0,
      count: income._count._all,
    })),
    activeUsers: activeUsersWithInfo,
    period: period || 'all',
    dateRange: {
      start: startDate || null,
      end: endDate || null,
    },
  });
}

// Función helper para formatear datos diarios
function formatDailyChart(
  dailyMovements: Array<{
    day: Date;
    type: 'INCOME' | 'EXPENSE';
    total_amount: number;
    count: number;
  }>
) {
  const grouped = dailyMovements.reduce(
    (acc, item) => {
      const day = item.day.toISOString().split('T')[0];
      if (!acc[day]) {
        acc[day] = { date: day, income: 0, expense: 0 };
      }
      if (item.type === 'INCOME') {
        acc[day].income = Number(item.total_amount);
      } else {
        acc[day].expense = Number(item.total_amount);
      }
      return acc;
    },
    {} as Record<string, { date: string; income: number; expense: number }>
  );

  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
}

// Función helper para formatear datos mensuales
function formatMonthlyChart(
  monthlyMovements: Array<{
    month: Date;
    type: 'INCOME' | 'EXPENSE';
    total_amount: number;
    count: number;
  }>
) {
  const grouped = monthlyMovements.reduce(
    (acc, item) => {
      const month = item.month.toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { month, income: 0, expense: 0 };
      }
      if (item.type === 'INCOME') {
        acc[month].income = Number(item.total_amount);
      } else {
        acc[month].expense = Number(item.total_amount);
      }
      return acc;
    },
    {} as Record<string, { month: string; income: number; expense: number }>
  );

  return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
}

export default withAdminAuth(handler);
