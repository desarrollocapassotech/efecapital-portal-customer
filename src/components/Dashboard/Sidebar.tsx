// src/components/Sidebar.tsx
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getMockDataForUser, Message } from '@/data/mockData';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Comunicaciones', href: '/dashboard/messages', icon: MessageSquare },
];

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const userId = user?.id || '1';

  const [unreadCount, setUnreadCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Cargar mensajes no leídos
  useEffect(() => {
    const loadUnreadCount = () => {
      const data = getMockDataForUser(userId);
      const storedMessages = localStorage.getItem(`messages_${userId}`);
      const messages: Message[] = storedMessages ? JSON.parse(storedMessages) : data.mensajes;

      const unread = messages.filter(
        (msg: Message) => msg.remitente === 'asesora' && !msg.leido
      ).length;

      setUnreadCount(unread);
      localStorage.setItem(`unreadMessages_${userId}`, String(unread));
    };

    loadUnreadCount();
  }, [userId]);

  // Escuchar cambios en localStorage (entre pestañas)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `unreadMessages_${userId}` && e.newValue !== null) {
        setUnreadCount(parseInt(e.newValue, 10));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userId]);

  // 🔥 Escuchar evento global para abrir/cerrar menú desde el navbar
  useEffect(() => {
    const toggleMenu = () => setIsMenuOpen((prev) => !prev);
    window.addEventListener('toggle-sidebar', toggleMenu);
    return () => window.removeEventListener('toggle-sidebar', toggleMenu);
  }, []);

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      {/* Overlay de fondo oscuro (solo en móvil cuando está abierto) */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar lateral */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card text-foreground border-r border-border transform transition-transform duration-300 ease-in-out sm:translate-x-0 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Información del usuario */}
          <div className="p-6 border-b border-border">
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="font-medium text-sm">Bienvenido/a</h3>
              <p className="text-foreground font-semibold">
                {user?.nombre} {user?.apellido}
              </p>
            </div>
          </div>

          {/* Menú de navegación */}
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
                      onClick={handleLinkClick}
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

          {/* Cerrar sesión */}
          <div className="p-6 border-t border-border">
            <Button
              onClick={logout}
              variant="ghost"
              className="w-full justify-start text-foreground/70 hover:text-foreground hover:bg-muted"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;