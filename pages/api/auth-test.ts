import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '../../lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar si hay una sesión activa
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    });

    if (!session) {
      return res.status(401).json({
        message: 'No hay sesión activa',
        authUrls: {
          signIn: '/auth/signin',
          signInPage: '/auth/signin',
        },
      });
    }

    return res.status(200).json({
      message: 'Sesión activa detectada',
      user: session.user,
      session: {
        id: session.session?.id,
        expiresAt: session.session?.expiresAt,
      },
    });
  } catch (error) {
    console.error('Error checking session:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      details:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
