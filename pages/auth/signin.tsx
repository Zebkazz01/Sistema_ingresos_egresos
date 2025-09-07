import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/use-auth';
import PageHead from '@/components/common/page-head';

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);
  const { signIn, loading, isAuthenticated, user, refetchSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Manejar parámetros de consulta
    const { error: queryError, success: querySuccess } = router.query;

    if (queryError === 'callback_error') {
      setError(
        'Hubo un problema al completar la autenticación. Por favor intenta de nuevo.'
      );
    }

    if (querySuccess) {
      console.log('Autenticación completada con exito!');
    }
  }, [router.query]);

  // Verificar si ya tiene sesión activa
  useEffect(() => {
    if (isAuthenticated() && user) {
      console.log('El usuario ya tiene una sesión activa, redirigiendo...');
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const handleGitHubSignIn = async () => {
    setError(null);

    try {
      console.log('Iniciando sesión con GitHub...');
      await signIn('github');

      // Después de iniciar el proceso de login refrescar la sesión
      setTimeout(async () => {
        try {
          await refetchSession();
        } catch (err) {
          console.error('Error en autenticación con GitHub:', err);
        }
      }, 2000);
    } catch (err) {
      console.error('Error en autenticación:', err);
      setError(
        'Error al iniciar sesión con GitHub. Por favor, inténtalo de nuevo.'
      );
    }
  };

  return (
    <>
      <PageHead 
        title="Iniciar Sesión" 
        description="Accede a tu panel de administración financiera. Inicia sesión de forma segura para gestionar tus ingresos y egresos."
        keywords="login, sesión, autenticación, panel administrativo, finanzas"
      />
      <div className='min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Iniciar Sesión
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Accede a tu panel de administración
          </p>
        </div>

        <div className='mt-8 space-y-6'>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative'>
              <span className='block sm:inline'>{error}</span>
            </div>
          )}

          <div>
            <button
              onClick={handleGitHubSignIn}
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <svg
                className='w-5 h-5 mr-2'
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
              </svg>
              {loading ? 'Iniciando sesión...' : 'Continuar con GitHub'}
            </button>
          </div>

          <div className='text-center'>
            <p className='mt-2 text-xs text-gray-500'>
              Al continuar, aceptas nuestros términos de servicio y política de
              privacidad.
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

// Agregar displayName para Fast Refresh
SignInPage.displayName = 'SignInPage';
