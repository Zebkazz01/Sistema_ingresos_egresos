import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/use-auth';
import PageHead from '@/components/common/page-head';

export default function AuthCallback() {
  const router = useRouter();
  const { user, loading, refetchSession } = useAuth();

  useEffect(() => {
    // Intentar obtener la sesión después del callback
    const handleCallback = async () => {
      console.log('Autenticación callback...');

      // Esperar un momento para que Better Auth procese el callback
      await new Promise((resolve) => setTimeout(resolve, 2000));

      try {
        await refetchSession();
      } catch (error) {
        console.error('Error in callback:', error);
      }
    };

    handleCallback();
  }, [refetchSession]);

  useEffect(() => {
    if (!loading && user) {
      console.log('Usuario autenticado:', user);
      router.push('/dashboard');
    } else if (!loading && !user) {
      console.log('No se pudo autenticar el usuario');
      router.push('/auth/signin?error=callback_error');
    }
  }, [user, loading, router]);

  return (
    <>
      <PageHead 
        title="Completando Autenticación" 
        description="Procesando autenticación del usuario. Por favor espera mientras verificamos tu cuenta."
        keywords="autenticación, callback, procesando, verificación"
      />
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <div className='mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Completando autenticación...
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Por favor espera mientras verificamos tu cuenta
          </p>
        </div>
      </div>
      </div>
    </>
  );
}

// Agregar displayName para Fast Refresh
AuthCallback.displayName = 'AuthCallback';
