import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { getMockDataForUser } from '@/data/mockData';
import { 
  History as HistoryIcon, 
  FileText, 
  MessageSquare, 
  Send, 
  Download,
  DollarSign,
  Calendar,
  Filter
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

const History = () => {
  const { user } = useAuth();
  const mockData = getMockDataForUser(user?.id || '1');
  const [filter, setFilter] = useState<string>('all');

  const getActivityIcon = (tipo: string) => {
    switch (tipo) {
      case 'archivo':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'mensaje_enviado':
        return <Send className="h-5 w-5 text-green-600" />;
      case 'mensaje_recibido':
        return <MessageSquare className="h-5 w-5 text-purple-600" />;
      case 'ingreso_capital':
        return <DollarSign className="h-5 w-5 text-yellow-600" />;
      default:
        return <HistoryIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActivityColor = (tipo: string) => {
    switch (tipo) {
      case 'archivo':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'mensaje_enviado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'mensaje_recibido':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ingreso_capital':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityTypeName = (tipo: string) => {
    switch (tipo) {
      case 'archivo':
        return 'Archivo Recibido';
      case 'mensaje_enviado':
        return 'Mensaje Enviado';
      case 'mensaje_recibido':
        return 'Mensaje Recibido';
      case 'ingreso_capital':
        return 'Ingreso de Capital';
      default:
        return tipo;
    }
  };

  const filteredHistory = mockData.historial.filter(activity => {
    if (filter === 'all') return true;
    return activity.tipo === filter;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  const activityStats = {
    archivo: mockData.historial.filter(h => h.tipo === 'archivo').length,
    mensaje_enviado: mockData.historial.filter(h => h.tipo === 'mensaje_enviado').length,
    mensaje_recibido: mockData.historial.filter(h => h.tipo === 'mensaje_recibido').length,
    ingreso_capital: mockData.historial.filter(h => h.tipo === 'ingreso_capital').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 rounded-full p-3">
            <HistoryIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Historial de Actividad</h1>
            <p className="text-muted-foreground">
              Timeline completo de todas tus actividades
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las actividades</SelectItem>
              <SelectItem value="archivo">Archivos recibidos</SelectItem>
              <SelectItem value="mensaje_enviado">Mensajes enviados</SelectItem>
              <SelectItem value="mensaje_recibido">Mensajes recibidos</SelectItem>
              <SelectItem value="ingreso_capital">Ingresos de capital</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Archivos</p>
                <p className="text-2xl font-bold">{activityStats.archivo}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Send className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enviados</p>
                <p className="text-2xl font-bold">{activityStats.mensaje_enviado}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recibidos</p>
                <p className="text-2xl font-bold">{activityStats.mensaje_recibido}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Capital</p>
                <p className="text-2xl font-bold">{activityStats.ingreso_capital}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline de Actividades</CardTitle>
          <CardDescription>
            Cronología completa de todas tus actividades en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedHistory.length > 0 ? (
            <div className="space-y-6">
              {sortedHistory.map((activity, index) => (
                <div key={activity.id} className="flex items-start gap-4">
                  {/* Timeline line */}
                  <div className="relative">
                    <div className="bg-white border-4 border-primary rounded-full p-2">
                      {getActivityIcon(activity.tipo)}
                    </div>
                    {index < sortedHistory.length - 1 && (
                      <div className="absolute top-12 left-1/2 transform -translate-x-px w-px h-12 bg-border"></div>
                    )}
                  </div>
                  
                  {/* Activity content */}
                  <div className="flex-1 min-w-0 pb-8">
                    <div className={`border rounded-lg p-4 ${getActivityColor(activity.tipo)}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="border-current">
                            {getActivityTypeName(activity.tipo)}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(activity.fecha), 'dd/MM/yyyy HH:mm')}</span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.fecha), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2">
                        {activity.titulo}
                      </h3>
                      
                      <p className="text-foreground/90 leading-relaxed">
                        {activity.descripcion}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                {filter === 'all' ? 'No hay actividad' : 'No hay actividades de este tipo'}
              </h3>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? 'Tu actividad aparecerá aquí cuando comiences a usar la plataforma'
                  : 'Cambia el filtro para ver otros tipos de actividad'
                }
              </p>
              {filter !== 'all' && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setFilter('all')}
                >
                  Ver todas las actividades
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default History;