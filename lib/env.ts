// Environment configuration helper
export const getBaseUrl = () => {
  // En el servidor, usar la variable de entorno o detectar automáticamente
  if (typeof window === 'undefined') {
    // En producción, priorizar la URL personalizada
    if (process.env.NODE_ENV === 'production') {
      // Primero intentar variable de entorno explícita (URL personalizada)
      if (process.env.BETTER_AUTH_URL) {
        return process.env.BETTER_AUTH_URL;
      }
      
      // Como fallback, usar la URL dinámica de Vercel
      const vercelUrl = process.env.VERCEL_URL;
      if (vercelUrl) {
        return `https://${vercelUrl}`;
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
