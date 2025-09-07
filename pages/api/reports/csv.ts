import { NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import {
  withAdminAuth,
  AuthenticatedRequest,
  handleApiError,
  validateMethod,
} from '../../../lib/middleware';
import Papa from 'papaparse';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Validar método HTTP
  if (validateMethod(req, res, ['GET'])) return;

  try {
    switch (req.method) {
      case 'GET':
        await downloadCSV(req, res);
        break;
    }
  } catch (error) {
    handleApiError(error, res);
  }
}

// GET /api/reports/csv - Descargar reporte en CSV
async function downloadCSV(req: AuthenticatedRequest, res: NextApiResponse) {
  const {
    type = 'movements',
    period,
    startDate,
    endDate,
    includeUser = 'true',
  } = req.query;

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
        // Sin filtro de fecha
        break;
    }
  }

  let csvData: any[] = [];
  let filename = 'reporte';

  switch (type) {
    case 'movements':
      csvData = await generateMovementsCSV(dateFilter, includeUser === 'true');
      filename = 'movimientos_financieros';
      break;

    case 'summary':
      csvData = await generateSummaryCSV(dateFilter);
      filename = 'resumen_financiero';
      break;

    case 'users':
      csvData = await generateUsersCSV();
      filename = 'usuarios';
      break;

    default:
      return res.status(400).json({
        error: 'Tipo de reporte no válido. Use: movements, summary, o users',
      });
  }

  if (csvData.length === 0) {
    return res.status(404).json({
      error: 'No se encontraron datos para generar el reporte',
    });
  }

  // Generar CSV
  const csv = Papa.unparse(csvData, {
    header: true,
    encoding: 'utf-8',
  });

  // Configurar headers para descarga
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const finalFilename = `${filename}_${timestamp}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${finalFilename}"`
  );
  res.setHeader('Cache-Control', 'no-cache');

  // Agregar BOM para UTF-8 (para Excel)
  const csvWithBOM = '\uFEFF' + csv;

  res.status(200).send(csvWithBOM);
}

// Generar CSV de movimientos
async function generateMovementsCSV(dateFilter: any, includeUser: boolean) {
  const movements = await prisma.movement.findMany({
    where: dateFilter,
    include: includeUser
      ? {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        }
      : undefined,
    orderBy: {
      date: 'desc',
    },
  });

  return movements.map((movement) => ({
    ID: movement.id,
    Concepto: movement.concept,
    Monto: movement.amount,
    Tipo: movement.type === 'INCOME' ? 'Ingreso' : 'Egreso',
    Fecha: movement.date.toISOString().split('T')[0],
    'Fecha Creación': movement.createdAt.toISOString(),
    ...(includeUser && movement.user
      ? {
          'Usuario ID': movement.user.id,
          'Usuario Nombre': movement.user.name,
          'Usuario Email': movement.user.email,
        }
      : {}),
  }));
}

// Generar CSV de resumen
async function generateSummaryCSV(dateFilter: any) {
  // Resumen por tipo
  const summary = await prisma.movement.groupBy({
    by: ['type'],
    where: dateFilter,
    _sum: { amount: true },
    _count: { _all: true },
    _avg: { amount: true },
  });

  // Resumen por concepto // Top 50 conceptos
  const conceptSummary = await prisma.movement.groupBy({
    by: ['concept', 'type'],
    where: dateFilter,
    _sum: { amount: true },
    _count: { _all: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 50,
  });

  // Resumen por mes
  const monthlySummary = (await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', date) as mes,
      type as tipo,
      SUM(amount) as total_monto,
      COUNT(*) as cantidad,
      AVG(amount) as promedio
    FROM movement 
    WHERE ${dateFilter.date ? `date >= '${dateFilter.date.gte?.toISOString()}' AND date <= '${dateFilter.date.lte?.toISOString() || new Date().toISOString()}'` : '1=1'}
    GROUP BY DATE_TRUNC('month', date), type
    ORDER BY mes DESC, tipo
  `) as Array<{
    mes: Date;
    tipo: 'INCOME' | 'EXPENSE';
    total_monto: number;
    cantidad: number;
    promedio: number;
  }>;

  const csvData: any[] = [];

  // Sección: Resumen General
  csvData.push({
    Seccion: 'RESUMEN GENERAL',
    Concepto: '',
    Tipo: '',
    Monto: '',
    Cantidad: '',
    Promedio: '',
  });
  summary.forEach((item) => {
    csvData.push({
      Seccion: '',
      Concepto: 'Total',
      Tipo: item.type === 'INCOME' ? 'Ingresos' : 'Egresos',
      Monto: item._sum.amount || 0,
      Cantidad: item._count._all,
      Promedio: Number(item._avg.amount || 0).toFixed(2),
    });
  });

  csvData.push({
    Seccion: '',
    Concepto: '',
    Tipo: '',
    Monto: '',
    Cantidad: '',
    Promedio: '',
  });

  // Sección: Por Concepto
  csvData.push({
    Seccion: 'POR CONCEPTO',
    Concepto: '',
    Tipo: '',
    Monto: '',
    Cantidad: '',
    Promedio: '',
  });
  conceptSummary.forEach((item) => {
    csvData.push({
      Seccion: '',
      Concepto: item.concept,
      Tipo: item.type === 'INCOME' ? 'Ingreso' : 'Egreso',
      Monto: item._sum.amount || 0,
      Cantidad: item._count._all,
      Promedio: '',
    });
  });

  csvData.push({
    Seccion: '',
    Concepto: '',
    Tipo: '',
    Monto: '',
    Cantidad: '',
    Promedio: '',
  });

  // Sección: Por Mes // YYYY-MM
  csvData.push({
    Seccion: 'POR MES',
    Concepto: '',
    Tipo: '',
    Monto: '',
    Cantidad: '',
    Promedio: '',
  });
  monthlySummary.forEach((item) => {
    csvData.push({
      Seccion: '',
      Concepto: item.mes.toISOString().slice(0, 7),
      Tipo: item.tipo === 'INCOME' ? 'Ingresos' : 'Egresos',
      Monto: Number(item.total_monto),
      Cantidad: Number(item.cantidad),
      Promedio: Number(item.promedio).toFixed(2),
    });
  });

  return csvData;
}

// Generar CSV de usuarios
async function generateUsersCSV() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          sessions: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Obtener estadísticas de movimientos por usuario
  const userMovements = await prisma.movement.groupBy({
    by: ['userId'],
    _count: { _all: true },
    _sum: { amount: true },
  });

  const movementStats = userMovements.reduce(
    (acc, stat) => {
      acc[stat.userId] = {
        movementCount: stat._count._all,
        totalAmount: stat._sum.amount || 0,
      };
      return acc;
    },
    {} as Record<string, { movementCount: number; totalAmount: number }>
  );

  return users.map((user) => ({
    ID: user.id,
    Nombre: user.name,
    Email: user.email,
    Teléfono: user.phone || 'No especificado',
    Rol: user.role,
    'Email Verificado': user.emailVerified ? 'Sí' : 'No',
    'Fecha Registro': user.createdAt.toISOString().split('T')[0],
    'Última Actualización': user.updatedAt.toISOString().split('T')[0],
    'Sesiones Activas': user._count.sessions,
    'Total Movimientos': movementStats[user.id]?.movementCount || 0,
    'Monto Total Movimientos': movementStats[user.id]?.totalAmount || 0,
  }));
}

export default withAdminAuth(handler);
