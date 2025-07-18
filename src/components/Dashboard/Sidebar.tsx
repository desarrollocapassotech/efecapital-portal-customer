import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  FileText, 
  Bell, 
  History, 
  LogOut,
  TrendingUp
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
    <div className="flex flex-col h-full bg-financial-navy text-white">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-financial-gold/20 rounded-lg p-2">
            <TrendingUp className="h-6 w-6 text-financial-gold" />
          </div>
          <div>
            <h2 className="font-bold text-lg">AsesoresFin</h2>
            <p className="text-sm text-white/70">Panel Cliente</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-white/10">
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="font-medium text-sm">Bienvenido/a</h3>
          <p className="text-white/90 font-semibold">
            {user?.nombre} {user?.apellido}
          </p>
          <p className="text-xs text-white/60 mt-1">
            Perfil: {user?.tipoInversor}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6">
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
                      ? 'bg-financial-gold/20 text-financial-gold'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
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
      <div className="p-6 border-t border-white/10">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;