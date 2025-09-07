// Environment configuration helper
export const getBaseUrl = () => {
  // En el servidor, usar la variable de entorno o detectar automáticamente
  if (typeof window === 'undefined') {
    // En producción (Vercel), usar las variables automáticas
    if (process.env.NODE_ENV === 'production') {
      // Vercel proporciona estas variables automáticamente
      // VERCEL_URL siempre contiene la URL actual del deployment
      const vercelUrl = process.env.VERCEL_URL;
      if (vercelUrl) {
        return `https://${vercelUrl}`;
      }
      
      // Como fallback, intentar variable de entorno explícita
      if (process.env.BETTER_AUTH_URL) {
        return process.env.BETTER_AUTH_URL;
      }
    }
    
    // En desarrollo, usar variable explícita o localhost
    if (process.env.BETTER_AUTH_URL) {
      return process.env.BETTER_AUTH_URL;
    }
    
    // Fallback para desarrollo
    return 'http://localhost:3000';
  }
  
  // En el cliente, usar el origin del window
  return window.location.origin;
};

export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

// URLs de configuración (ahora dinámicas)
export const PRODUCTION_URL = getBaseUrl();
export const DEVELOPMENT_URL = 'http://localhost:3000';
