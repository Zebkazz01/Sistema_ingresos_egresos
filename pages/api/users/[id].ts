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
  if (validateMethod(req, res, ['GET', 'PUT'])) return;

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      error: 'ID de usuario requerido',
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        await getUser(req, res, id);
        break;
      case 'PUT':
        await updateUser(req, res, id);
        break;
    }
  } catch (error) {
    handleApiError(error, res);
  }
}

// GET /api/users/[id] - Obtener usuario individual (solo admins)
async function getUser(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  id: string
) {
  const user = await prisma.user.findUnique({
    where: { id },
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
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({
      error: 'Usuario no encontrado',
    });
  }

  res.status(200).json({
    success: true,
    user,
  });
}

// PUT /api/users/[id] - Actualizar usuario (solo admins)
async function updateUser(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  id: string
) {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    return res.status(404).json({
      error: 'Usuario no encontrado',
    });
  }

  const { name, role, phone } = req.body;

  // Construir objeto de actualización solo con campos proporcionados
  const updateData: any = {
    updatedAt: new Date(),
  };

  // Validar y actualizar nombre
  if (name !== undefined) {
    if (!name || !name.trim()) {
      return res.status(400).json({
        error: 'El nombre no puede estar vacío',
      });
    }
    updateData.name = name.trim();
  }

  // Validar y actualizar rol
  if (role !== undefined) {
    if (role !== 'ADMIN' && role !== 'USER') {
      return res.status(400).json({
        error: 'El rol debe ser ADMIN o USER',
      });
    }

    // Prevenir que el usuario se quite a sí mismo los permisos de admin
    if (
      existingUser.id === req.user?.id &&
      existingUser.role === 'ADMIN' &&
      role === 'USER'
    ) {
      return res.status(400).json({
        error: 'No puedes cambiar tu propio rol de administrador',
      });
    }

    updateData.role = role;
  }

  // Validar y actualizar teléfono
  if (phone !== undefined) {
    // El teléfono puede estar vacío, pero si se proporciona debe tener formato válido
    if (phone && phone.trim()) {
      const phoneRegex = /^\+?[\d\s\-()]+$/;
      if (!phoneRegex.test(phone.trim())) {
        return res.status(400).json({
          error: 'Formato de teléfono inválido',
        });
      }
    }
    updateData.phone = phone ? phone.trim() : '';
  }

  // Verificar si hay algo que actualizar
  if (Object.keys(updateData).length === 1) {
    return res.status(400).json({
      error: 'No se proporcionaron campos para actualizar',
    });
  }

  // Actualizar usuario
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
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
    },
  });

  res.status(200).json({
    success: true,
    message: 'Usuario actualizado exitosamente',
    user,
  });
}

export default withAdminAuth(handler);
