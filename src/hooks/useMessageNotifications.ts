import { useEffect, useRef } from 'react';
import { useUnreadMessages } from '@/contexts/UnreadMessagesContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationPersistence } from '@/hooks/useNotificationPersistence';

export const useMessageNotifications = () => {
  const { unreadCount } = useUnreadMessages();
  const { showMessageNotification, isSupported } = useNotifications();
  const { hasNotificationBeenShown, markNotificationAsShown, clearOldNotifications } = useNotificationPersistence();
  const previousCountRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);

  useEffect(() => {
    // Limpiar notificaciones antiguas al cargar
    clearOldNotifications();
  }, [clearOldNotifications]);

  useEffect(() => {
    // No mostrar notificación en la carga inicial
    if (isInitialLoadRef.current) {
      previousCountRef.current = unreadCount;
      isInitialLoadRef.current = false;
      return;
    }

    // Solo mostrar notificación si hay nuevos mensajes (aumento en el contador)
    if (unreadCount > previousCountRef.current && unreadCount > 0) {
      const newMessagesCount = unreadCount - previousCountRef.current;
      const notificationKey = `messages_${unreadCount}`;
      
      // Solo mostrar si no se ha mostrado antes
      if (isSupported && !hasNotificationBeenShown(notificationKey)) {
        showMessageNotification(newMessagesCount);
        markNotificationAsShown(notificationKey);
      }
    }

    // Actualizar el contador anterior
    previousCountRef.current = unreadCount;
  }, [unreadCount, showMessageNotification, isSupported, hasNotificationBeenShown, markNotificationAsShown]);
};
