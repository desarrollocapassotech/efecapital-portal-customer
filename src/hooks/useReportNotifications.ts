import { useEffect, useRef } from 'react';
import { useUnreadReports } from '@/contexts/UnreadReportsContext';
import { useNotifications } from '@/hooks/useNotifications';

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

    // Solo mostrar notificación si hay un nuevo informe (badge cambió de 0 a 1)
    if (badgeCount === 1 && previousBadgeCountRef.current === 0) {
      if (isSupported) {
        showReportNotification();
      }
    }

    // Actualizar el contador anterior
    previousBadgeCountRef.current = badgeCount;
  }, [badgeCount, showReportNotification, isSupported]);
};
