import { NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import {
  withAuth,
  AuthenticatedRequest,
  handleApiError,
  validateMethod,
} from '../../../lib/middleware';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Validar método HTTP
  if (validateMethod(req, res, ['GET', 'PUT', 'DELETE'])) return;

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      error: 'ID de movimiento requerido',
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        await getMovement(req, res, id);
        break;
      case 'PUT':
        await updateMovement(req, res, id);
        break;
      case 'DELETE':
        await deleteMovement(req, res, id);
        break;
    }
  } catch (error) {
    handleApiError(error, res);
  }
}

// GET /api/movements/[id] - Obtener movimiento individual
async function getMovement(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  id: string
) {
  const movement = await prisma.movement.findUnique({
    where: { id },
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

  if (!movement) {
    return res.status(404).json({
      error: 'Movimiento no encontrado',
    });
  }

  res.status(200).json({
    success: true,
    movement,
  });
}

// PUT /api/movements/[id] - Actualizar movimiento Solo admins pueden actualizar movimientos
async function updateMovement(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  id: string
) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Solo los administradores pueden actualizar movimientos',
    });
  }

  // Verificar que el movimiento existe
  const existingMovement = await prisma.movement.findUnique({
    where: { id },
  });

  if (!existingMovement) {
    return res.status(404).json({
      error: 'Movimiento no encontrado',
    });
  }

  const { concept, amount, date, type, description } = req.body;

  // Construir objeto de actualización
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (concept !== undefined) {
    if (!concept.trim()) {
      return res.status(400).json({
        error: 'El concepto no puede estar vacío',
      });
    }
    updateData.concept = concept.trim();
  }

  if (amount !== undefined) {
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        error: 'El monto debe ser un número positivo',
      });
    }
    updateData.amount = parseFloat(amount);
  }

  if (date !== undefined) {
    const movementDate = new Date(date);
    if (isNaN(movementDate.getTime())) {
      return res.status(400).json({
        error: 'Fecha inválida',
      });
    }
    updateData.date = movementDate;
  }

  if (type !== undefined) {
    if (type !== 'INCOME' && type !== 'EXPENSE') {
      return res.status(400).json({
        error: 'El tipo debe ser INCOME o EXPENSE',
      });
    }
    updateData.type = type;
  }

  if (description !== undefined) {
    updateData.description = description || null;
  }

  // Actualizar movimiento
  const movement = await prisma.movement.update({
    where: { id },
    data: updateData,
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

  res.status(200).json({
    success: true,
    message: 'Movimiento actualizado exitosamente',
    movement,
  });
}

// DELETE /api/movements/[id] - Eliminar movimiento Solo admins pueden eliminar movimientos
async function deleteMovement(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  id: string
) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Solo los administradores pueden eliminar movimientos',
    });
  }

  // Verificar que el movimiento existe
  const existingMovement = await prisma.movement.findUnique({
    where: { id },
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

  if (!existingMovement) {
    return res.status(404).json({
      error: 'Movimiento no encontrado',
    });
  }

  // Eliminar movimiento
  await prisma.movement.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: 'Movimiento eliminado exitosamente',
    deletedMovement: existingMovement,
  });
}

export default withAuth(handler);
