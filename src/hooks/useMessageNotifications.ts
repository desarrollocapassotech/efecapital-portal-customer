import { useEffect, useRef } from 'react';
import { useUnreadMessages } from '@/contexts/UnreadMessagesContext';
import { useNotifications } from '@/hooks/useNotifications';

export const useMessageNotifications = () => {
  const { messages } = useUnreadMessages();
  const { showIndividualMessageNotification, isSupported } = useNotifications();
  const previousMessagesRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef<boolean>(true);

  useEffect(() => {
    console.log('useMessageNotifications - messages changed:', messages.length, 'messages');
    console.log('useMessageNotifications - isInitialLoad:', isInitialLoadRef.current);
    
    // No procesar notificaciones en la carga inicial
    if (isInitialLoadRef.current) {
      // Guardar IDs de mensajes iniciales
      messages.forEach(msg => {
        if (msg.isFromAdvisor && !msg.read) {
          previousMessagesRef.current.add(msg.id);
          console.log('useMessageNotifications - Mensaje inicial no leído:', msg.id);
        }
      });
      console.log('useMessageNotifications - Mensajes iniciales guardados:', previousMessagesRef.current.size);
      isInitialLoadRef.current = false;
      return;
    }

    // Obtener mensajes no leídos del asesor
    const unreadAdvisorMessages = messages.filter(msg => msg.isFromAdvisor && !msg.read);
    const currentMessageIds = new Set(unreadAdvisorMessages.map(msg => msg.id));
    
    console.log('useMessageNotifications - Mensajes no leídos actuales:', unreadAdvisorMessages.length);
    console.log('useMessageNotifications - IDs actuales:', Array.from(currentMessageIds));

    // Encontrar mensajes nuevos (que no estaban en la carga anterior)
    const newMessages = unreadAdvisorMessages.filter(msg => 
      !previousMessagesRef.current.has(msg.id)
    );
    
    console.log('useMessageNotifications - Mensajes nuevos encontrados:', newMessages.length);

    // Mostrar notificación para cada mensaje nuevo
    if (isSupported && newMessages.length > 0) {
      newMessages.forEach(message => {
        console.log('useMessageNotifications - Mostrando notificación para mensaje:', message.id, message.content);
        showIndividualMessageNotification(message.content);
      });
    }

    // Actualizar el conjunto de mensajes conocidos
    previousMessagesRef.current = currentMessageIds;
  }, [messages, showIndividualMessageNotification, isSupported]);
};
