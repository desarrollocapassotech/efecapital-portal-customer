import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getMockDataForUser, Notificacion } from '@/data/mockData';
import { 
  Bell, 
  FileText, 
  MessageSquare, 
  Info, 
  Check, 
  Trash2,
  BellRing
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

const Notifications = () => {
  const { user } = useAuth();
  const mockData = getMockDataForUser(user?.id || '1');
  const [notifications, setNotifications] = useState<Notificacion[]>(mockData.notificaciones);

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'archivo':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'mensaje':
        return <MessageSquare className="h-5 w-5 text-green-600" />;
      case 'general':
        return <Info className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (tipo: string) => {
    switch (tipo) {
      case 'archivo':
        return 'bg-blue-100 text-blue-800';
      case 'mensaje':
        return 'bg-green-100 text-green-800';
      case 'general':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationTypeName = (tipo: string) => {
    switch (tipo) {
      case 'archivo':
        return 'Archivo';
      case 'mensaje':
        return 'Mensaje';
      case 'general':
        return 'General';
      default:
        return tipo;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, leida: true } : notif
    ));
    toast({
      title: "Notificación marcada como leída",
      description: "La notificación ha sido marcada como leída"
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
    toast({
      title: "Notificación eliminada",
      description: "La notificación ha sido eliminada"
    });
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, leida: true })));
    toast({
      title: "Todas las notificaciones marcadas como leídas",
      description: "Se han marcado todas las notificaciones como leídas"
    });
  };

  const unreadCount = notifications.filter(n => !n.leida).length;
  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 rounded-full p-3">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Notificaciones</h1>
            <p className="text-muted-foreground">
              Mantente al día con todas las actualizaciones
            </p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <Check className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BellRing className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sin leer</p>
                <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Archivos</p>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => n.tipo === 'archivo').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mensajes</p>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => n.tipo === 'mensaje').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Todas las notificaciones</CardTitle>
          <CardDescription>
            Lista completa de tus notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedNotifications.length > 0 ? (
            <div className="space-y-4">
              {sortedNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`border rounded-lg p-4 transition-all ${
                    !notification.leida 
                      ? 'bg-blue-50 border-blue-200 shadow-sm' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`rounded-lg p-2 ${!notification.leida ? 'bg-white' : 'bg-gray-100'}`}>
                        {getNotificationIcon(notification.tipo)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`font-semibold ${!notification.leida ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notification.titulo}
                          </h3>
                          <Badge className={getNotificationColor(notification.tipo)}>
                            {getNotificationTypeName(notification.tipo)}
                          </Badge>
                          {!notification.leida && (
                            <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        
                        <p className={`mb-3 ${!notification.leida ? 'text-gray-700' : 'text-gray-500'}`}>
                          {notification.descripcion}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {format(new Date(notification.fecha), 'dd/MM/yyyy HH:mm')}
                          </span>
                          <span>
                            {formatDistanceToNow(new Date(notification.fecha), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {!notification.leida && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Marcar como leída
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No hay notificaciones
              </h3>
              <p className="text-muted-foreground">
                Las notificaciones aparecerán aquí cuando haya actividad
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;