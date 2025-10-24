import { useEffect, useRef } from 'react';
import { useUnreadMessages } from '@/contexts/UnreadMessagesContext';
import { useNotifications } from '@/hooks/useNotifications';

export const useMessageNotifications = () => {
  const { messages } = useUnreadMessages();
  const { showIndividualMessageNotification, isSupported } = useNotifications();
  const previousMessagesRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef<boolean>(true);

  // Función de prueba temporal - REMOVER EN PRODUCCIÓN
  const testAdvisorMessage = () => {
    console.log('TEST: Simulando mensaje del asesor');
    showIndividualMessageNotification('Este es un mensaje de prueba del asesor');
  };

  // Exponer función de prueba en window para testing
  useEffect(() => {
    (window as any).testAdvisorMessage = testAdvisorMessage;
    console.log('TEST: Función testAdvisorMessage disponible en window.testAdvisorMessage()');
  }, [testAdvisorMessage]);

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
    const unreadAdvisorMessages = messages.filter(msg => {
      const isAdvisor = msg.isFromAdvisor;
      const isUnread = !msg.read;
      console.log(`useMessageNotifications - Mensaje ${msg.id}: isFromAdvisor=${isAdvisor}, read=${msg.read}, isUnread=${isUnread}`);
      return isAdvisor && isUnread;
    });
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
