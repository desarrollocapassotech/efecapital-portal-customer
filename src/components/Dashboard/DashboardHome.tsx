import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getMockDataForUser } from '@/data/mockData';
import { Mail, Phone } from 'lucide-react';

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
            <CardTitle className="text-sm font-medium">Bróker</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">{user?.broker}</div>
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
      {/* Contact */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Mail className="h-5 w-5" />
      Contacto
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-2">
    <p className="text-muted-foreground leading-relaxed">
      📞 {user?.telefono}
    </p>
    <p className="text-muted-foreground leading-relaxed">
      📧 {user?.email}
    </p>
  </CardContent>
</Card>

    </div>
  );
};

export default DashboardHome;