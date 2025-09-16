import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-card border-b border-border px-4 py-3 shadow-sm z-20">
      <div className="relative flex items-center justify-between">
        <div className="md:hidden z-10">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const event = new CustomEvent('toggle-sidebar');
              window.dispatchEvent(event);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
        </div>

        <Link
          to="/dashboard"
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-1.5">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="font-bold text-lg">AsesoresFin</h1>
              <p className="text-xs text-muted-foreground">Panel Cliente</p>
            </div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-4 mr-2">
          <span className="text-sm text-foreground">
            Hola, <strong>{user?.nombre}</strong>
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              void logout();
            }}
            className="text-foreground/70 hover:text-foreground"
          >
            Cerrar sesión
          </Button>
        </div>

        <div className="w-10 md:hidden"></div>
      </div>
    </nav>
  );
};

export default Navbar;
