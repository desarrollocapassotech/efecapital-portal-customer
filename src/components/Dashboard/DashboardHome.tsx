import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getMockDataForUser } from '@/data/mockData';
import { 
  User, 
  Target, 
  Calendar, 
  Building2, 
  MessageSquare, 
  FileText, 
  Bell,
  TrendingUp,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const DashboardHome = () => {
  const { user } = useAuth();
  const mockData = getMockDataForUser(user?.id || '1');

  const getTipoInversorColor = (tipo: string) => {
    switch (tipo) {
      case 'conservador':
        return 'bg-blue-100 text-blue-800';
      case 'moderado':
        return 'bg-green-100 text-green-800';
      case 'agresivo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const recentActivity = mockData.historial.slice(0, 3);
  const recentMessages = mockData.mensajes.slice(0, 2);
  const recentFiles = mockData.archivos.slice(0, 2);
  const unreadNotifications = mockData.notificaciones.filter(n => !n.leida);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-financial-blue rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 rounded-full p-4">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              ¡Hola, {user?.nombre}!
            </h1>
            <p className="text-white/90 text-lg">
              Bienvenido/a a tu panel de inversiones
            </p>
          </div>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipo de Inversor</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getTipoInversorColor(user?.tipoInversor || '')}>
              {user?.tipoInversor}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horizonte</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.horizonte}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bróker</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">{user?.broker}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notificaciones</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-financial-gold">
              {unreadNotifications.length}
            </div>
            <p className="text-xs text-muted-foreground">sin leer</p>
          </CardContent>
        </Card>
      </div>

      {/* Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objetivos de Inversión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {user?.objetivos}
          </p>
        </CardContent>
      </Card>

      {/* Recent Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Mensajes Recientes
            </CardTitle>
            <CardDescription>
              Últimas comunicaciones con tu asesora
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMessages.length > 0 ? (
              recentMessages.map((message) => (
                <div key={message.id} className="border-l-4 border-primary pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={message.remitente === 'cliente' ? 'secondary' : 'default'}>
                      {message.remitente === 'cliente' ? 'Tú' : 'Asesora'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.fecha), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {message.contenido}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No hay mensajes recientes</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Files */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Archivos Recientes
            </CardTitle>
            <CardDescription>
              Últimos informes subidos por tu asesora
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentFiles.length > 0 ? (
              recentFiles.map((file) => (
                <div key={file.id} className="border-l-4 border-success pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{file.tipo}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(file.fechaSubida), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{file.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.comentario}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No hay archivos recientes</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>
            Resumen de tu actividad más reciente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="relative">
                  <div className="h-3 w-3 bg-primary rounded-full"></div>
                  {index < recentActivity.length - 1 && (
                    <div className="absolute top-3 left-1.5 w-px h-6 bg-border"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.descripcion}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.fecha), { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;