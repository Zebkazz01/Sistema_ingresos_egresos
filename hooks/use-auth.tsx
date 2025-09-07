import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { authClient } from '@/lib/auth-client';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  phone: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (provider: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
  isAuthenticated: () => boolean;
  refetchSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Cargar sesión inicial y escuchar cambios
  useEffect(() => {
    checkAuth();

    // Escuchar eventos del storage para cambios de sesión
    const handleStorageChange = () => {
      // Validando sesión
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);

    // Polling cada 30 segundos para verificar la sesión
    const interval = setInterval(() => {
      checkAuth();
    }, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const sessionData = await authClient.getSession();
      // Validando el inicio de sesión
      // Better Auth returns { data: {...}, error: ... } estructure
      const session = sessionData?.data;

      if (session?.user) {
        // Usuario validado
        setUser({
          id: session.user.id,
          name: session.user.name || '',
          email: session.user.email || '',
          role: (session.user as any).role || 'ADMIN',
          phone: (session.user as any).phone || '',
          emailVerified: (session.user as any).emailVerified || false,
        });
      } else {
        // No hay usuario con sesión activa
        setUser(null);
      }
    } catch (error) {
      console.error('A ocurrido un problema:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar la sesión manualmente
  const refetchSession = async () => {
    try {
      setLoading(true);
      const sessionData = await authClient.getSession();
      // Refrescando la sesión

      const session = sessionData?.data;

      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.name || '',
          email: session.user.email || '',
          role: (session.user as any).role || 'ADMIN',
          phone: (session.user as any).phone || '',
          emailVerified: (session.user as any).emailVerified || false,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refrescando la sesión:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (provider: string) => {
    try {
      setLoading(true);
      // Iniciando sesión con proveedor

      await authClient.signIn.social({
        provider: provider as any,
        callbackURL: '/auth/callback',
      });
    } catch (error) {
      console.error('Error iniciando sesión:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authClient.signOut();
      setUser(null);
      router.push('/auth/signin');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const isAuthenticated = () => {
    return user !== null && !loading;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        isAdmin,
        isAuthenticated,
        refetchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Protección de rutas
export function withAuth<T extends {}>(
  Component: React.ComponentType<T>,
  options: {
    adminOnly?: boolean;
    redirectTo?: string;
  } = {}
) {
  const { adminOnly = false, redirectTo = '/auth/signin' } = options;
  
  // Crear un nombre único para el componente basado en las opciones
  const componentName = `WithAuth${adminOnly ? 'Admin' : 'User'}(${Component.displayName || Component.name || 'Anonymous'})`;

  function AuthenticatedComponent(props: T) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push(redirectTo);
          return;
        }

        if (adminOnly && user.role !== 'ADMIN') {
          router.push('/dashboard');
          return;
        }
      }
    }, [user, loading, router]);

    if (loading) {
      return (
        <div className='min-h-screen flex items-center justify-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
        </div>
      );
    }
    // Validar sesión
    if (!user) {
      return null;
    }

    if (adminOnly && user.role !== 'ADMIN') {
      return null;
    }

    return <Component {...props} />;
  }
  
  // Asignar displayName para mejorar debugging y Fast Refresh
  AuthenticatedComponent.displayName = componentName;
  
  return AuthenticatedComponent;
}

// Validación de permisos
export function usePermissions() {
  const { user } = useAuth();

  return {
    canManageUsers: user?.role === 'ADMIN',
    canCreateMovements: user?.role === 'ADMIN',
    canViewReports: user?.role === 'ADMIN',
    canExportData: user?.role === 'ADMIN',
    canEditSettings: user?.role === 'ADMIN',
  };
}
