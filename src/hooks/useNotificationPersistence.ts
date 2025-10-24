import { useEffect, useRef } from 'react';

const NOTIFICATIONS_STORAGE_KEY = 'efecapital_notifications_shown';

interface NotificationRecord {
  reportId: string;
  timestamp: number;
}

export const useNotificationPersistence = () => {
  const shownNotificationsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Cargar notificaciones mostradas desde localStorage
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        const notifications: NotificationRecord[] = JSON.parse(stored);
        const now = Date.now();
        const validNotifications = notifications.filter(
          (n) => now - n.timestamp < 7 * 24 * 60 * 60 * 1000 // 7 días
        );
        
        shownNotificationsRef.current = new Set(
          validNotifications.map(n => n.reportId)
        );
        
        // Actualizar localStorage con solo las notificaciones válidas
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(validNotifications));
      }
    } catch (error) {
      console.error('Error al cargar notificaciones mostradas:', error);
      shownNotificationsRef.current = new Set();
    }
  }, []);

  const hasNotificationBeenShown = (reportId: string): boolean => {
    const hasBeenShown = shownNotificationsRef.current.has(reportId);
    console.log('hasNotificationBeenShown - reportId:', reportId, 'hasBeenShown:', hasBeenShown);
    console.log('hasNotificationBeenShown - current set:', Array.from(shownNotificationsRef.current));
    return hasBeenShown;
  };

  const markNotificationAsShown = (reportId: string): void => {
    console.log('markNotificationAsShown - reportId:', reportId);
    shownNotificationsRef.current.add(reportId);
    console.log('markNotificationAsShown - added to set, current set:', Array.from(shownNotificationsRef.current));
    
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const notifications: NotificationRecord[] = stored ? JSON.parse(stored) : [];
      
      // Agregar nueva notificación
      notifications.push({
        reportId,
        timestamp: Date.now(),
      });
      
      // Mantener solo las últimas 50 notificaciones para evitar que crezca demasiado
      const sortedNotifications = notifications
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 50);
      
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(sortedNotifications));
      console.log('markNotificationAsShown - saved to localStorage:', sortedNotifications);
    } catch (error) {
      console.error('Error al guardar notificación mostrada:', error);
    }
  };

  const clearOldNotifications = (): void => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        const notifications: NotificationRecord[] = JSON.parse(stored);
        const now = Date.now();
        const validNotifications = notifications.filter(
          (n) => now - n.timestamp < 7 * 24 * 60 * 60 * 1000 // 7 días
        );
        
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(validNotifications));
        shownNotificationsRef.current = new Set(
          validNotifications.map(n => n.reportId)
        );
      }
    } catch (error) {
      console.error('Error al limpiar notificaciones antiguas:', error);
    }
  };

  return {
    hasNotificationBeenShown,
    markNotificationAsShown,
    clearOldNotifications,
  };
};
