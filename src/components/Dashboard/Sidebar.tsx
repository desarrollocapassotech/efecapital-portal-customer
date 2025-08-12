import React from 'react';
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

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Comunicaciones', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Archivos', href: '/dashboard/files', icon: FileText },
  { name: 'Notificaciones', href: '/dashboard/notifications', icon: Bell },
  { name: 'Historial', href: '/dashboard/history', icon: History },
];

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

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
          <p className="text-xs text-muted-foreground mt-1">
            Perfil: {user?.tipoInversor}
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