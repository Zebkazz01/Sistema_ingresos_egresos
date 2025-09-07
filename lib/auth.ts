import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prismaClient';

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
      console.log('Nuevo usuario registrándose:', user.email);

      const updatedUser = {
        ...user,
        role: 'ADMIN',
        phone: user.phone || '',
        emailVerified: true, // GitHub verificado por email
      };

      console.log('Usuario creado con rol ADMIN:', updatedUser.email);
      return { user: updatedUser, account };
    },

    async signIn({ user, account, isNewUser }: any) {
      console.log('Usuario iniciando sesión:', user.email, { isNewUser });

      // Si es un usuario existente, mantener sus datos
      if (!isNewUser) {
        console.log('Usuario existente:', user.email);
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
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  trustedOrigins: [
    'http://localhost:3000',
    process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  ],
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
