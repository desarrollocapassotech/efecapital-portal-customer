import React, { createContext, useContext, useEffect, useState } from "react";

import { subscribeToClientReports, markReportAsDownloaded as markReportAsDownloadedInDB, markReportAsViewed as markReportAsViewedInDB, type Report } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";

type UnreadReportsContextValue = {
  unreadReportsCount: number;
  badgeCount: number;
  isLoading: boolean;
  reports: Report[];
  markReportAsDownloaded: (reportId: string) => void;
  markReportAsViewed: (reportId: string) => void;
  latestReport: Report | null;
};

const UnreadReportsContext = createContext<UnreadReportsContextValue>({
  unreadReportsCount: 0,
  badgeCount: 0,
  isLoading: true,
  reports: [],
  markReportAsDownloaded: () => {},
  markReportAsViewed: () => {},
  latestReport: null,
});

export const UnreadReportsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const userId = user?.id;

  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const unreadReportsCount = reports.filter(report => !report.downloaded).length;
  
  const latestReport = reports.length > 0 
    ? [...reports].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0]
    : null;

  // Solo mostrar 1 si el último informe no ha sido descargado
  const hasNewReport = latestReport && !latestReport.downloaded;
  const badgeCount = hasNewReport ? 1 : 0;

  const markReportAsViewed = async (reportId: string) => {
    if (!userId) return;
    
    try {
      // Actualizar en la base de datos
      await markReportAsViewedInDB(userId, reportId);
      
      // Actualizar el estado local inmediatamente para mejor UX
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === reportId 
            ? { 
                ...report, 
                viewed: true, 
                viewedAt: new Date().toISOString() 
              }
            : report
        )
      );
    } catch (error) {
      console.error("Error al marcar informe como visto:", error);
      // En caso de error, aún actualizar el estado local
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === reportId 
            ? { 
                ...report, 
                viewed: true, 
                viewedAt: new Date().toISOString() 
              }
            : report
        )
      );
    }
  };

  const markReportAsDownloaded = async (reportId: string) => {
    if (!userId) return;
    
    try {
      // Actualizar en la base de datos
      await markReportAsDownloadedInDB(userId, reportId);
      
      // Actualizar el estado local inmediatamente para mejor UX
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === reportId 
            ? { 
                ...report, 
                downloaded: true, 
                downloadedAt: new Date().toISOString() 
              }
            : report
        )
      );
    } catch (error) {
      console.error("Error al marcar informe como descargado:", error);
      // En caso de error, aún actualizar el estado local
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === reportId 
            ? { 
                ...report, 
                downloaded: true, 
                downloadedAt: new Date().toISOString() 
              }
            : report
        )
      );
    }
  };

  useEffect(() => {
    if (!userId) {
      setReports([]);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);

    const unsubscribe = subscribeToClientReports(
      userId,
      (fetchedReports) => {
        setReports(fetchedReports);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error al obtener informes", error);
        setReports([]);
        setIsLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [userId]);

  return (
    <UnreadReportsContext.Provider 
      value={{ 
        unreadReportsCount, 
        badgeCount,
        isLoading, 
        reports,
        markReportAsDownloaded,
        markReportAsViewed,
        latestReport
      }}
    >
      {children}
    </UnreadReportsContext.Provider>
  );
};

export const useUnreadReports = () => useContext(UnreadReportsContext);
