import React, { createContext, useContext, useEffect, useState } from "react";

import { subscribeToClientMessages, type Message } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";

type UnreadMessagesContextValue = {
  unreadCount: number;
};

const UnreadMessagesContext = createContext<UnreadMessagesContextValue>({
  unreadCount: 0,
});

export const UnreadMessagesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const userId = user?.id;

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      return undefined;
    }

    const unsubscribe = subscribeToClientMessages(
      userId,
      (messages: Message[]) => {
        const count = messages.filter(
          (message) => message.isFromAdvisor && !message.read,
        ).length;

        setUnreadCount(count);
      },
      (error) => {
        console.error("Error al obtener mensajes no leídos", error);
        setUnreadCount(0);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [userId]);

  return (
    <UnreadMessagesContext.Provider value={{ unreadCount }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export const useUnreadMessages = () => useContext(UnreadMessagesContext);

