import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertTriangle, Download, FileBarChart, Filter, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { subscribeToClientReports, type Report } from "@/lib/firestore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Reports: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nameFilter, setNameFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);

  useEffect(() => {
    if (!userId) {
      setReports([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToClientReports(
      userId,
      (fetchedReports) => {
        setReports(fetchedReports);
        setIsLoading(false);
      },
      (firestoreError) => {
        console.error("Error al cargar los informes", firestoreError);
        setError("No se pudieron cargar tus informes. Intenta nuevamente más tarde.");
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  const latestReport = useMemo(() => {
    if (!reports.length) return null;
    return [...reports].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    )[0];
  }, [reports]);

  const filteredReports = useMemo(() => {
    const normalizedName = nameFilter.trim().toLowerCase();
    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

    return reports.filter((report) => {
      const reportDate = new Date(report.fecha);
      const matchesName = normalizedName
        ? report.nombre.toLowerCase().includes(normalizedName)
        : true;
      const matchesStart = start ? reportDate >= start : true;
      const matchesEnd = end ? reportDate <= end : true;
      return matchesName && matchesStart && matchesEnd;
    });
  }, [reports, nameFilter, startDate, endDate]);

  const handleDownloadReport = (report?: Report | null) => {
    if (!report || !report.archivo?.url) return;
    window.open(report.archivo.url, "_blank", "noopener,noreferrer");
  };

  const handleClearFilters = () => {
    setNameFilter("");
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters =
    nameFilter.trim().length > 0 || startDate !== "" || endDate !== "";

  const FiltersForm = ({ className }: { className?: string }) => (
    <div className={cn("grid gap-4", className)}>
      <div className="space-y-2">
        <Label htmlFor="name-filter">Filtrar por nombre</Label>
        <Input
          id="name-filter"
          placeholder="Ej. Informe mensual"
          value={nameFilter}
          onChange={(event) => setNameFilter(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="start-date">Desde</Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          max={endDate || undefined}
          onChange={(event) => setStartDate(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="end-date">Hasta</Label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          min={startDate || undefined}
          onChange={(event) => setEndDate(event.target.value)}
        />
      </div>
    </div>
  );

  return (
    <div className="mt-2 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <FileBarChart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Mis informes</h1>
            <p className="text-muted-foreground">
              Consulta y descarga los reportes que tu asesora comparte contigo.
            </p>
          </div>
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => handleDownloadReport(latestReport)}
          disabled={!latestReport}
        >
          <Download className="mr-2 h-4 w-4" /> Descargar último informe
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de informes</CardTitle>
          <CardDescription>
            Filtra por nombre o por fecha para encontrar rápidamente el documento que
            necesitas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-end md:hidden">
            <Dialog open={isFiltersDialogOpen} onOpenChange={setIsFiltersDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Abrir filtros">
                  <Filter className="h-5 w-5" />
                  <span className="sr-only">Abrir filtros</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Filtros</DialogTitle>
                </DialogHeader>
                <FiltersForm />
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      handleClearFilters();
                      setIsFiltersDialogOpen(false);
                    }}
                    disabled={!hasActiveFilters}
                  >
                    Limpiar filtros
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" className="w-full sm:w-auto">
                      Cerrar
                    </Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="hidden md:block">
            <FiltersForm className="md:grid-cols-3" />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error al cargar</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Cargando informes...
            </div>
          ) : filteredReports.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Descargar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.nombre}</TableCell>
                    <TableCell>
                      {format(new Date(report.fecha), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(report)}
                      >
                        <Download className="mr-2 h-4 w-4" /> Descargar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-lg border border-dashed border-border py-10 text-center">
              <p className="text-sm text-muted-foreground">
                No encontramos informes con los filtros seleccionados. Puedes solicitar
                un nuevo informe o ajustar tus filtros para ver otros resultados.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild>
                  <Link to="/dashboard/messages">Solicitar nuevo informe</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  disabled={!hasActiveFilters}
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
