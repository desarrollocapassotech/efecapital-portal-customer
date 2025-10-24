import { useEffect, useRef } from 'react';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export const useNotifications = () => {
  const permissionRef = useRef<NotificationPermission | null>(null);

  useEffect(() => {
    // Verificar si el navegador soporta notificaciones
    if (!('Notification' in window)) {
      console.log('Este navegador no soporta notificaciones');
      return;
    }

    // Obtener el estado actual del permiso
    permissionRef.current = Notification.permission;

    // Si no se ha solicitado permiso, solicitarlo
    if (permissionRef.current === 'default') {
      Notification.requestPermission().then((permission) => {
        permissionRef.current = permission;
        if (permission === 'granted') {
          console.log('Permiso de notificaciones concedido');
        } else {
          console.log('Permiso de notificaciones denegado');
        }
      });
    }
  }, []);

  const showNotification = (options: NotificationOptions) => {
    // Verificar si las notificaciones están permitidas
    if (!('Notification' in window) || permissionRef.current !== 'granted') {
      console.log('Notificaciones no disponibles o no permitidas');
      return;
    }

    // Cerrar notificaciones anteriores con el mismo tag
    if (options.tag) {
      // Las notificaciones con el mismo tag se reemplazan automáticamente
    }

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      badge: options.badge || '/favicon.ico',
      tag: options.tag,
      requireInteraction: options.requireInteraction || false,
    });

    // Auto-cerrar después de 5 segundos si no requiere interacción
    if (!options.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    // Manejar click en la notificación
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  };

  const showMessageNotification = (messageCount: number) => {
    const title = messageCount === 1 
      ? 'Nuevo mensaje' 
      : `${messageCount} mensajes nuevos`;
    
    const body = messageCount === 1
      ? 'Tu asesora te ha enviado un nuevo mensaje'
      : `${messageCount} mensajes nuevos de tu asesora`;

    showNotification({
      title,
      body,
      tag: 'new-message',
      icon: '/favicon.ico',
    });
  };

  const showIndividualMessageNotification = (messageContent: string) => {
    console.log('showIndividualMessageNotification - Llamada con contenido:', messageContent);
    console.log('showIndividualMessageNotification - isSupported:', 'Notification' in window);
    console.log('showIndividualMessageNotification - permission:', permissionRef.current);
    
    // Verificar si las notificaciones están permitidas
    if (!('Notification' in window) || permissionRef.current !== 'granted') {
      console.log('showIndividualMessageNotification - Notificaciones no disponibles o no permitidas');
      return;
    }

    // Truncar el contenido si es muy largo
    const truncatedContent = messageContent.length > 100 
      ? messageContent.substring(0, 100) + '...'
      : messageContent;

    console.log('showIndividualMessageNotification - Mostrando notificación con contenido:', truncatedContent);

    showNotification({
      title: 'Nuevo mensaje de tu asesora',
      body: truncatedContent,
      tag: `message-${Date.now()}`, // Tag único para cada mensaje
      icon: '/favicon.ico',
      requireInteraction: false,
    });
  };

  const showReportNotification = () => {
    showNotification({
      title: 'Nuevo informe disponible',
      body: 'Tienes un nuevo informe disponible para descargar',
      tag: 'new-report',
      icon: '/favicon.ico',
      requireInteraction: true,
    });
  };

  return {
    showNotification,
    showMessageNotification,
    showIndividualMessageNotification,
    showReportNotification,
    isSupported: 'Notification' in window,
    permission: permissionRef.current,
  };
};
