import React, { createContext, useContext, useEffect, useState } from "react";

import { subscribeToUnreadMessagesCount } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";

type UnreadMessagesContextValue = {
  unreadCount: number;
  isLoading: boolean;
};

const UnreadMessagesContext = createContext<UnreadMessagesContextValue>({
  unreadCount: 0,
  isLoading: true,
});

export const UnreadMessagesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const userId = user?.id;

  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);

    const unsubscribe = subscribeToUnreadMessagesCount(
      userId,
      (count) => {
        setUnreadCount(count);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error al obtener mensajes no leídos", error);
        setUnreadCount(0);
        setIsLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [userId]);

  return (
    <UnreadMessagesContext.Provider value={{ unreadCount, isLoading }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export const useUnreadMessages = () => useContext(UnreadMessagesContext);

