import { useEffect, useRef } from 'react';
import { useUnreadMessages } from '@/contexts/UnreadMessagesContext';
import { useNotifications } from '@/hooks/useNotifications';

export const useMessageNotifications = () => {
  const { messages } = useUnreadMessages();
  const { showIndividualMessageNotification, isSupported } = useNotifications();
  const previousMessagesRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef<boolean>(true);

  useEffect(() => {
    // No procesar notificaciones en la carga inicial
    if (isInitialLoadRef.current) {
      // Guardar IDs de mensajes iniciales
      messages.forEach(msg => {
        if (msg.isFromAdvisor && !msg.read) {
          previousMessagesRef.current.add(msg.id);
        }
      });
      isInitialLoadRef.current = false;
      return;
    }

    // Obtener mensajes no leídos del asesor
    const unreadAdvisorMessages = messages.filter(msg => msg.isFromAdvisor && !msg.read);
    const currentMessageIds = new Set(unreadAdvisorMessages.map(msg => msg.id));

    // Encontrar mensajes nuevos (que no estaban en la carga anterior)
    const newMessages = unreadAdvisorMessages.filter(msg => 
      !previousMessagesRef.current.has(msg.id)
    );

    // Mostrar notificación para cada mensaje nuevo
    if (isSupported && newMessages.length > 0) {
      newMessages.forEach(message => {
        console.log('useMessageNotifications - Mostrando notificación para mensaje:', message.id);
        showIndividualMessageNotification(message.content);
      });
    }

    // Actualizar el conjunto de mensajes conocidos
    previousMessagesRef.current = currentMessageIds;
  }, [messages, showIndividualMessageNotification, isSupported]);
};
