import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  FileText,
  Bell,
  History,
  LogOut,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getMockDataForUser, Message } from '@/data/mockData'; // ✅ Importamos los datos y tipo

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Comunicaciones', href: '/dashboard/messages', icon: MessageSquare },
];

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const userId = user?.id || '1';

  const [unreadCount, setUnreadCount] = useState(0);

  // 🔥 Calcular mensajes no leídos al montar y cuando cambia el usuario
  useEffect(() => {
    const loadUnreadCount = () => {
      // Obtener mensajes: desde localStorage o fallback a mock
      const data = getMockDataForUser(userId);
      const storedMessages = localStorage.getItem(`messages_${userId}`);
      const messages: Message[] = storedMessages ? JSON.parse(storedMessages) : data.mensajes;

      // Contar mensajes de la asesora que no han sido leídos
      const unread = messages.filter(
        (msg: Message) => msg.remitente === 'asesora' && !msg.leido
      ).length;

      // Actualizar estado y localStorage para mantener sincronización
      setUnreadCount(unread);
      localStorage.setItem(`unreadMessages_${userId}`, String(unread));
    };

    loadUnreadCount();
  }, [userId]);

  // 🔥 Escuchar cambios en localStorage (entre pestañas o desde otros componentes)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `unreadMessages_${userId}` && e.newValue !== null) {
        setUnreadCount(parseInt(e.newValue, 10));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userId]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col h-full bg-card text-foreground border-r border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="bg-primary rounded-lg p-2">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg">AsesoresFin</h2>
            <p className="text-sm text-muted-foreground">Panel Cliente</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-border">
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="font-medium text-sm">Bienvenido/a</h3>
          <p className="text-foreground font-semibold">
            {user?.nombre} {user?.apellido}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 overflow-y-auto">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                  {item.name === 'Comunicaciones' && unreadCount > 0 && (
                    <Badge className="ml-auto bg-red-500 text-white text-xs px-2 min-w-5 h-5 flex items-center justify-center rounded-full">
                      {unreadCount}
                    </Badge>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-border">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-foreground/70 hover:text-foreground hover:bg-muted"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;