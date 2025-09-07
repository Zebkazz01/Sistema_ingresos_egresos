import { NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import {
  withAuth,
  AuthenticatedRequest,
  handleApiError,
  validateMethod,
  getPagination,
} from '../../../lib/middleware';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Validar método HTTP
  if (validateMethod(req, res, ['GET', 'POST'])) return;

  try {
    switch (req.method) {
      case 'GET':
        await getMovements(req, res);
        break;
      case 'POST':
        await createMovement(req, res);
        break;
    }
  } catch (error) {
    handleApiError(error, res);
  }
}

// GET /api/movements - Listar movimientos
async function getMovements(req: AuthenticatedRequest, res: NextApiResponse) {
  const { skip, limit, page } = getPagination(req);
  const { search, type, dateFrom, dateTo } = req.query;

  // Construir filtros
  const where: any = {};

  if (search) {
    const searchTerm = search as string;
    where.OR = [
      {
        concept: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      {
        user: {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      },
      {
        user: {
          email: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      },
    ];

    // agregar filtros para 'ingreso' y 'egreso'
    const lowerSearch = searchTerm.toLowerCase();
    if (lowerSearch.includes('ingreso') || lowerSearch.includes('income')) {
      where.OR.push({ type: 'INCOME' });
    }
    if (
      lowerSearch.includes('egreso') ||
      lowerSearch.includes('expense') ||
      lowerSearch.includes('gasto')
    ) {
      where.OR.push({ type: 'EXPENSE' });
    }
  }

  if (type && (type === 'INCOME' || type === 'EXPENSE') && !search) {
    // Solo si no hay filtro de busqueda, agregar el filtro de tipo
    where.type = type;
  } else if (type && (type === 'INCOME' || type === 'EXPENSE') && search) {
    // Si hay filtro de busqueda, agregar el filtro de tipo
    where.AND = [where.OR ? { OR: where.OR } : {}, { type: type }];
    delete where.OR;
  }

  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom as string);
    if (dateTo) where.date.lte = new Date(dateTo as string);
  }

  // Obtener movimientos con información del usuario
  const [movements, total] = await Promise.all([
    prisma.movement.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.movement.count({ where }),
  ]);

  // Calcular totales
  const totals = await prisma.movement.aggregate({
    where,
    _sum: {
      amount: true,
    },
    _count: {
      _all: true,
    },
  });

  // Calcular balance
  const incomeTotal = await prisma.movement.aggregate({
    where: { ...where, type: 'INCOME' },
    _sum: { amount: true },
  });

  const expenseTotal = await prisma.movement.aggregate({
    where: { ...where, type: 'EXPENSE' },
    _sum: { amount: true },
  });

  const balance =
    (incomeTotal._sum.amount || 0) - (expenseTotal._sum.amount || 0);

  res.status(200).json({
    success: true,
    movements,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    summary: {
      totalAmount: totals._sum.amount || 0,
      totalMovements: totals._count._all,
      income: incomeTotal._sum.amount || 0,
      expense: expenseTotal._sum.amount || 0,
      balance,
    },
  });
}

// POST /api/movements - Crear movimiento   Solo admins pueden crear movimientos según los requisitos
async function createMovement(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Solo los administradores pueden crear movimientos',
    });
  }

  const { concept, amount, date, type, description } = req.body;

  // Validaciones
  if (!concept || !amount || !date || !type) {
    return res.status(400).json({
      error: 'Todos los campos son requeridos: concept, amount, date, type',
    });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      error: 'El monto debe ser un número positivo',
    });
  }

  if (type !== 'INCOME' && type !== 'EXPENSE') {
    return res.status(400).json({
      error: 'El tipo debe ser INCOME o EXPENSE',
    });
  }

  // Validar fecha
  const movementDate = new Date(date);
  if (isNaN(movementDate.getTime())) {
    return res.status(400).json({
      error: 'Fecha inválida',
    });
  }

  // Crear movimiento
  const movement = await prisma.movement.create({
    data: {
      id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      concept,
      amount: parseFloat(amount),
      date: movementDate,
      type,
      description: description || null,
      userId: req.user!.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Movimiento creado exitosamente',
    movement,
  });
}

export default withAuth(handler);
