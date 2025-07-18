import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getMockDataForUser } from '@/data/mockData';
import { 
  FileText, 
  Download, 
  Eye, 
  TrendingUp, 
  Lightbulb, 
  BarChart3,
  Calendar,
  HardDrive
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

const Files = () => {
  const { user } = useAuth();
  const mockData = getMockDataForUser(user?.id || '1');
  const archivos = mockData.archivos;

  const getFileIcon = (tipo: string) => {
    switch (tipo) {
      case 'rendimiento':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'recomendaciones':
        return <Lightbulb className="h-5 w-5 text-blue-600" />;
      case 'mercado':
        return <BarChart3 className="h-5 w-5 text-purple-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getFileTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'rendimiento':
        return 'bg-green-100 text-green-800';
      case 'recomendaciones':
        return 'bg-blue-100 text-blue-800';
      case 'mercado':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileTypeName = (tipo: string) => {
    switch (tipo) {
      case 'rendimiento':
        return 'Rendimiento';
      case 'recomendaciones':
        return 'Recomendaciones';
      case 'mercado':
        return 'Informe de Mercado';
      default:
        return tipo;
    }
  };

  const handleDownload = (fileName: string) => {
    toast({
      title: "Descarga iniciada",
      description: `Descargando ${fileName}...`
    });
  };

  const handleView = (fileName: string) => {
    toast({
      title: "Abriendo archivo",
      description: `Visualizando ${fileName}...`
    });
  };

  const sortedFiles = [...archivos].sort((a, b) => 
    new Date(b.fechaSubida).getTime() - new Date(a.fechaSubida).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 rounded-full p-3">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Archivos e Informes</h1>
          <p className="text-muted-foreground">
            Todos los documentos e informes de tu asesora
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rendimiento</p>
                <p className="text-2xl font-bold">
                  {archivos.filter(f => f.tipo === 'rendimiento').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recomendaciones</p>
                <p className="text-2xl font-bold">
                  {archivos.filter(f => f.tipo === 'recomendaciones').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mercado</p>
                <p className="text-2xl font-bold">
                  {archivos.filter(f => f.tipo === 'mercado').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{archivos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos disponibles</CardTitle>
          <CardDescription>
            Haz clic en los archivos para verlos o descargarlos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedFiles.length > 0 ? (
            <div className="space-y-4">
              {sortedFiles.map((archivo) => (
                <div key={archivo.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        {getFileIcon(archivo.tipo)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg truncate">
                            {archivo.nombre}
                          </h3>
                          <Badge className={getFileTypeColor(archivo.tipo)}>
                            {getFileTypeName(archivo.tipo)}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-3 leading-relaxed">
                          {archivo.comentario}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(archivo.fechaSubida), 'dd/MM/yyyy HH:mm')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <HardDrive className="h-4 w-4" />
                            <span>{archivo.tamaño}</span>
                          </div>
                          <span>
                            {formatDistanceToNow(new Date(archivo.fechaSubida), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(archivo.nombre)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(archivo.nombre)}
                        className="bg-gradient-to-r from-primary to-financial-blue hover:opacity-90"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No hay archivos disponibles
              </h3>
              <p className="text-muted-foreground">
                Los informes de tu asesora aparecerán aquí
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Files;