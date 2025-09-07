import { auth } from '../../../lib/auth';
import { PRODUCTION_URL, DEVELOPMENT_URL } from '../../../lib/env';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Construir la URL completa
    const protocol = req.headers['x-forwarded-proto'] || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    
    // Detectar host automáticamente
    let host = req.headers.host;
    if (!host && process.env.NODE_ENV === 'production') {
      // En Vercel, usar la variable VERCEL_URL si está disponible
      host = process.env.VERCEL_URL || 'prueba-fullstack-deploy-hph4emv1x.vercel.app';
    } else if (!host) {
      host = 'localhost:3000';
    }
    const url = `${protocol}://${host}${req.url}`;

    // Crear el Request object para Better Auth
    const request = new Request(url, {
      method: req.method || 'GET',
      headers: new Headers(req.headers as Record<string, string>),
      body:
        req.method !== 'GET' && req.method !== 'HEAD'
          ? JSON.stringify(req.body)
          : undefined,
    });

    // Llamar al handler de Better Auth
    const response = await auth.handler(request);

    res.status(response.status);

    // Copiar headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Enviar el body si existe
    if (response.body) {
      const body = await response.text();
      res.send(body);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Error in Better Auth handler:', error);
    res.status(500).json({
      error: 'Internal authentication error',
      details:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
