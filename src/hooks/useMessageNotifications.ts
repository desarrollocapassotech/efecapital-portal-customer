import { useEffect, useRef } from 'react';
import { useUnreadMessages } from '@/contexts/UnreadMessagesContext';
import { useNotifications } from '@/hooks/useNotifications';

export const useMessageNotifications = () => {
  const { unreadCount } = useUnreadMessages();
  const { showMessageNotification, isSupported } = useNotifications();
  const previousCountRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);

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
      
      if (isSupported) {
        showMessageNotification(newMessagesCount);
      }
    }

    // Actualizar el contador anterior
    previousCountRef.current = unreadCount;
  }, [unreadCount, showMessageNotification, isSupported]);
};
