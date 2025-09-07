import axios from 'axios';
import Router from 'next/router';

// Variable para evitar múltiples notificaciones
let isRedirecting = false;

// Función para mostrar notificación
const showAccessDeniedNotification = () => {
  // Crear y mostrar una notificación temporal
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f97316;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      max-width: 300px;
    ">
      🔒 Acceso restringido. Redirigiendo al dashboard...
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Remover la notificación después de 3 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
    isRedirecting = false;
  }, 3000);
};

// Interceptor para manejar errores 403 y redireccionar automáticamente
axios.interceptors.response.use(
  // Si la respuesta es exitosa, la pasamos tal como está
  (response) => response,
  
  // Si hay un error, verificamos si es un 403 para redireccionar
  (error) => {
    if (error.response && error.response.status === 403) {
      console.log('Acceso denegado - Redirigiendo al dashboard...');
      
      // Mostrar notificación solo si no estamos ya redirigiendo
      if (!isRedirecting && typeof window !== 'undefined') {
        isRedirecting = true;
        showAccessDeniedNotification();
      }
      
      // Evitar redireccionar en bucle si ya estamos en el dashboard
      if (Router.asPath !== '/dashboard') {
        // Pequeño delay para que el usuario vea la notificación
        setTimeout(() => {
          Router.push('/dashboard');
        }, 500);
      }
      
      // Retornar un error modificado para no mostrar el mensaje al usuario
      return Promise.reject({
        ...error,
        redirected: true,
        message: 'Acceso restringido - Redirigiendo...'
      });
    }
    
    // Para otros errores, los devolvemos tal como están
    return Promise.reject(error);
  }
);

export default axios;
