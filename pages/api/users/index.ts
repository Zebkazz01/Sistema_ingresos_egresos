import { NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import {
  withAdminAuth,
  AuthenticatedRequest,
  handleApiError,
  validateMethod,
  getPagination,
} from '../../../lib/middleware';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Validar método HTTP
  if (validateMethod(req, res, ['GET'])) return;

  try {
    switch (req.method) {
      case 'GET':
        await getUsers(req, res);
        break;
    }
  } catch (error) {
    handleApiError(error, res);
  }
}

// GET /api/users - Listar usuarios (solo admins)
async function getUsers(req: AuthenticatedRequest, res: NextApiResponse) {
  const { skip, limit, page } = getPagination(req);
  const { search, role } = req.query;

  // Construir filtros
  const where: any = {};

  if (search) {
    where.OR = [
      {
        name: {
          contains: search as string,
          mode: 'insensitive',
        },
      },
      {
        email: {
          contains: search as string,
          mode: 'insensitive',
        },
      },
    ];
  }

  if (role && (role === 'ADMIN' || role === 'USER')) {
    where.role = role;
  }

  // Obtener usuarios
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            sessions: true,
            // Contar movimientos si el usuario tiene
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  // Estadísticas adicionales
  const stats = await prisma.user.groupBy({
    by: ['role'],
    _count: {
      _all: true,
    },
  });

  const roleStats = stats.reduce(
    (acc, stat) => {
      acc[stat.role] = stat._count._all;
      return acc;
    },
    {} as Record<string, number>
  );

  res.status(200).json({
    users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    statistics: {
      totalUsers: total,
      adminCount: roleStats.ADMIN || 0,
      userCount: roleStats.USER || 0,
    },
  });
}

export default withAdminAuth(handler);
