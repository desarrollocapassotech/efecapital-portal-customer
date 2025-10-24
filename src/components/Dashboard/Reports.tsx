import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertTriangle, Download, FileBarChart, FileText } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useUnreadReports } from "@/contexts/UnreadReportsContext";
import { subscribeToClientReports, type Report } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingState } from "@/components/ui/loading-state";

const Reports: React.FC = () => {
  const { user } = useAuth();
  const { reports, isLoading, markReportAsDownloaded, markReportAsViewed, latestReport } = useUnreadReports();
  const [error, setError] = useState<string | null>(null);


  const handleDownloadReport = (report?: Report | null) => {
    if (!report || !report.archivo?.url) return;
    window.open(report.archivo.url, "_blank", "noopener,noreferrer");
    // Marcar como descargado
    markReportAsDownloaded(report.id);
  };

  // Ya no marcamos automáticamente como visto al entrar
  // Solo se marca como descargado cuando el usuario descarga el informe

  return (
    <div className="mt-2 space-y-4 sm:space-y-6 px-4 sm:px-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="rounded-full bg-primary/10 p-2 sm:p-3 text-primary">
            <FileBarChart className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Informes</h1>
          </div>
        </div>
        <Button
          className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 text-sm sm:text-base"
          onClick={() => handleDownloadReport(latestReport)}
          disabled={!latestReport}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded bg-white/20">
              <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </div>
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Descargar último informe</span>
            <span className="xs:hidden">Último informe</span>
          </div>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de informes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error al cargar</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <LoadingState
              label="Cargando informes..."
              className="justify-center py-10"
            />
          ) : reports.length ? (
            <>
              {/* Vista de tabla para desktop */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow 
                        key={report.id}
                        className="group cursor-pointer hover:bg-muted/50 transition-colors duration-200"
                        onClick={() => handleDownloadReport(report)}
                      >
                        <TableCell className="w-12">
                          <div className="flex items-center justify-center">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-100 text-red-600 shadow-sm group-hover:bg-red-200 group-hover:shadow-md transition-all duration-200">
                              <FileText className="h-4 w-4" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className="group-hover:text-primary transition-colors duration-200">
                              {report.nombre}
                            </span>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                              PDF
                            </span>
                            {!report.downloaded && latestReport && report.id === latestReport.id && (
                              <span className="text-xs text-white bg-emerald-500 px-2 py-1 rounded-full font-medium animate-pulse">
                                NUEVO
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(report.fecha), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadReport(report);
                            }}
                            className="group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200"
                          >
                            <Download className="mr-2 h-4 w-4" /> Descargar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Vista de cards para mobile */}
              <div className="md:hidden space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="group cursor-pointer rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-all duration-200 hover:shadow-md"
                    onClick={() => handleDownloadReport(report)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 shadow-sm group-hover:bg-red-200 group-hover:shadow-md transition-all duration-200">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm group-hover:text-primary transition-colors duration-200 truncate">
                            {report.nombre}
                          </h3>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full flex-shrink-0">
                            PDF
                          </span>
                          {!report.downloaded && latestReport && report.id === latestReport.id && (
                            <span className="text-xs text-white bg-emerald-500 px-2 py-1 rounded-full font-medium animate-pulse flex-shrink-0">
                              NUEVO
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          {format(new Date(report.fecha), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadReport(report);
                          }}
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200"
                        >
                          <Download className="mr-2 h-4 w-4" /> Descargar PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-border py-8 sm:py-10 text-center">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    No tienes informes disponibles.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Los informes aparecerán aquí cuando estén disponibles.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
