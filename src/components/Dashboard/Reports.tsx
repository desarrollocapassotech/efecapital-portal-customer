import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileBarChart } from "lucide-react";

const Reports = () => {
  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <FileBarChart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Mis informes</h1>
            <p className="text-muted-foreground">
              Aquí encontrarás tus reportes y documentos financieros cuando estén disponibles.
            </p>
          </div>
        </div>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Próximamente</CardTitle>
          <CardDescription>Estamos preparando esta sección para ti.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Serás notificado cuando tus informes estén disponibles para su consulta.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
