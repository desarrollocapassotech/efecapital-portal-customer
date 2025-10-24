import { useEffect, useRef } from 'react';
import { useUnreadReports } from '@/contexts/UnreadReportsContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationPersistence } from '@/hooks/useNotificationPersistence';

export const useReportNotifications = () => {
  const { badgeCount, latestReport } = useUnreadReports();
  const { showReportNotification, isSupported } = useNotifications();
  const previousBadgeCountRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);

  useEffect(() => {
    // No mostrar notificación en la carga inicial
    if (isInitialLoadRef.current) {
      previousBadgeCountRef.current = badgeCount;
      isInitialLoadRef.current = false;
      return;
    }

    // Solo mostrar notificación si el badge cambió de 0 a 1 (nuevo informe no descargado)
    if (badgeCount === 1 && previousBadgeCountRef.current === 0) {
      console.log('useReportNotifications - Mostrando notificación para nuevo informe no descargado:', latestReport?.id);
      if (isSupported) {
        showReportNotification();
      }
    }

    // Actualizar el contador anterior
    previousBadgeCountRef.current = badgeCount;
  }, [badgeCount, latestReport, showReportNotification, isSupported]);
};
