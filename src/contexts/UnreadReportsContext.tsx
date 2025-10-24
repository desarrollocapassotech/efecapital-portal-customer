import React, { createContext, useContext, useEffect, useState } from "react";

import { subscribeToClientReports, type Report } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";

type UnreadReportsContextValue = {
  unreadReportsCount: number;
  badgeCount: number;
  isLoading: boolean;
  reports: Report[];
  markReportAsDownloaded: (reportId: string) => void;
  latestReport: Report | null;
};

const UnreadReportsContext = createContext<UnreadReportsContextValue>({
  unreadReportsCount: 0,
  badgeCount: 0,
  isLoading: true,
  reports: [],
  markReportAsDownloaded: () => {},
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

  const markReportAsDownloaded = (reportId: string) => {
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
        latestReport
      }}
    >
      {children}
    </UnreadReportsContext.Provider>
  );
};

export const useUnreadReports = () => useContext(UnreadReportsContext);
