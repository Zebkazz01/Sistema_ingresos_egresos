import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from './auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    phone: string;
    emailVerified: boolean;
  };
}

export type ApiHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void> | void;

// Middleware para verificar autenticación con Better Auth
export function withAuth(handler: ApiHandler) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      // Verificar sesión usando Better Auth
      const session = await auth.api.getSession({
        headers: new Headers(req.headers as Record<string, string>)
      });
      
      if (!session || !session.user) {
        return res.status(401).json({ 
          error: 'No autorizado - Debe iniciar sesión primero',
          hint: 'Inicie sesión en /auth/signin'
        });
      }

      // Agregar usuario a la request
      req.user = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: (session.user as any).role as 'ADMIN' | 'USER' || 'ADMIN',
        phone: (session.user as any).phone || '',
        emailVerified: (session.user as any).emailVerified || false,
      };

      return handler(req, res);
    } catch (error) {
      console.error('Error en middleware de autenticación:', error);
      return res.status(401).json({ 
        error: 'No autorizado - Error de autenticación',
        hint: 'Inicie sesión en /auth/signin'
      });
    }
  };
}

// Middleware para verificar rol de administrador
export function withAdminAuth(handler: ApiHandler) {
  return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Acceso denegado - Se requieren permisos de administrador' 
      });
    }

    return handler(req, res);
  });
}

// Función helper para manejar errores de API
export function handleApiError(error: any, res: NextApiResponse) {
  console.error('Error en API:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Datos inválidos', 
      details: error.message 
    });
  }

  if (error.code === 'P2002') {
    return res.status(409).json({ 
      error: 'Conflicto - El recurso ya existe' 
    });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({ 
      error: 'Recurso no encontrado' 
    });
  }

  return res.status(500).json({ 
    error: 'Error interno del servidor' 
  });
}

// Función helper para validar métodos HTTP
export function validateMethod(
  req: NextApiRequest, 
  res: NextApiResponse, 
  allowedMethods: string[]
) {
  if (!req.method || !allowedMethods.includes(req.method)) {
    res.setHeader('Allow', allowedMethods.join(', '));
    return res.status(405).json({ 
      error: `Método ${req.method} no permitido` 
    });
  }
  return false; // No error
}

// Función helper para pagination
export function getPagination(req: NextApiRequest) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

// Función helper para validar UUID
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
