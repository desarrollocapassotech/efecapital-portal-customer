import React, { createContext, useContext, useEffect, useState } from "react";

import { subscribeToClientMessages, Message } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";

type UnreadMessagesContextValue = {
  unreadCount: number;
  messages: Message[];
  isLoading: boolean;
};

const UnreadMessagesContext = createContext<UnreadMessagesContextValue>({
  unreadCount: 0,
  messages: [],
  isLoading: true,
});

export const UnreadMessagesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const userId = user?.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calcular mensajes no leídos
  const unreadCount = messages.filter(msg => msg.isFromAdvisor && !msg.read).length;
  
  // Log para debuggear el contador
  useEffect(() => {
    console.log('UnreadMessagesContext - Contador actualizado:', unreadCount);
    console.log('UnreadMessagesContext - Total mensajes:', messages.length);
    console.log('UnreadMessagesContext - Mensajes del asesor:', messages.filter(msg => msg.isFromAdvisor).length);
    console.log('UnreadMessagesContext - Mensajes no leídos del asesor:', messages.filter(msg => msg.isFromAdvisor && !msg.read).length);
  }, [unreadCount, messages]);

  useEffect(() => {
    if (!userId) {
      setMessages([]);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);

    const unsubscribe = subscribeToClientMessages(
      userId,
      (fetchedMessages) => {
        console.log('UnreadMessagesContext - Mensajes cargados:', fetchedMessages.length);
        fetchedMessages.forEach(msg => {
          console.log(`UnreadMessagesContext - Mensaje ${msg.id}: isFromAdvisor=${msg.isFromAdvisor}, read=${msg.read}, content="${msg.content.substring(0, 50)}..."`);
        });
        setMessages(fetchedMessages);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error al obtener mensajes no leídos", error);
        setMessages([]);
        setIsLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [userId]);

  return (
    <UnreadMessagesContext.Provider value={{ unreadCount, messages, isLoading }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export const useUnreadMessages = () => useContext(UnreadMessagesContext);

