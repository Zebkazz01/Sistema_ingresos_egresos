import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prismaClient';
import { getBaseUrl, PRODUCTION_URL, DEVELOPMENT_URL } from './env';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
  },
  emailAndPassword: {
    enabled: false, // Usar GitHub para autenticación
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  // Validación de la sesión    7 días  -  Actualizar cada 24 horas
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'ADMIN',
      },
      phone: {
        type: 'string',
        defaultValue: '',
      },
    },
  },
  callbacks: {
    // nuevo usuario tenga rol ADMIN
    async signUp({ user, account }: any) {
      // Nuevo usuario registrándose

      const updatedUser = {
        ...user,
        role: 'ADMIN',
        phone: user.phone || '',
        emailVerified: true, // GitHub verificado por email
      };

      // Usuario creado con rol ADMIN
      return { user: updatedUser, account };
    },

    async signIn({ user, account, isNewUser }: any) {
      // Usuario iniciando sesión

      // Si es un usuario existente, mantener sus datos
      if (!isNewUser) {
        // Usuario existente
        return { user, account };
      }
      return { user, account };
    },

    // Incluir información adicional en la sesión
    async session({ session, user }: any) {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: user.role || 'ADMIN',
          phone: user.phone || '',
          emailVerified: user.emailVerified,
        },
      };
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: getBaseUrl(),
  trustedOrigins: [
    DEVELOPMENT_URL,
    // URL dinámica de Vercel (siempre actual)
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    // Variable de entorno explícita como fallback
    process.env.BETTER_AUTH_URL,
    // URLs anteriores de Vercel (por compatibilidad)
    'https://app-ingresos-egresos-dudxhd6vv.vercel.app',
    'https://app-ingresos-egresos-dpwnex75n.vercel.app',
  ].filter(Boolean),
});

export type Session = {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: 'ADMIN' | 'USER';
    phone: string;
    emailVerified: boolean;
  };
};

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: 'ADMIN' | 'USER';
  phone: string;
  createdAt: Date;
  updatedAt: Date;
};

// Función verificar si el usuario es admin
export function isAdmin(user: Session['user'] | null): boolean {
  return user?.role === 'ADMIN';
}
