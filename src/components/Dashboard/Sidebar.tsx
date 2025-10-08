import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageSquare, LogOut, FileBarChart, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnreadMessages } from "@/contexts/UnreadMessagesContext";
import { Spinner } from "@/components/ui/loading-state";

const navigation = [
  { name: "Inicio", href: "/dashboard", icon: Home },
  { name: "Chat", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Informes", href: "/dashboard/reports", icon: FileBarChart },
];

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { unreadCount, isLoading: isUnreadLoading } = useUnreadMessages();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hasUnreadMessages = unreadCount > 0;
  const displayUnreadMessagesCount = unreadCount > 99 ? "99+" : `${unreadCount}`;
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const originalOverflowRef = useRef<string>("");

  useEffect(() => {
    const toggleMenu = () => setIsMenuOpen((prev) => !prev);
    window.addEventListener("toggle-sidebar", toggleMenu);
    return () => window.removeEventListener("toggle-sidebar", toggleMenu);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const body = document.body;

    if (isMenuOpen && window.innerWidth < 768) {
      originalOverflowRef.current = body.style.overflow;
      body.style.overflow = "hidden";
      closeButtonRef.current?.focus();
    } else {
      body.style.overflow = originalOverflowRef.current || "";
    }

    return () => {
      body.style.overflow = originalOverflowRef.current || "";
    };
  }, [isMenuOpen]);

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 sm:hidden"
          aria-hidden="true"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card text-foreground border-r border-border transform transition-transform duration-300 ease-in-out sm:translate-x-0 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role={isMenuOpen ? "dialog" : undefined}
        aria-modal={isMenuOpen ? true : undefined}
        aria-label="Menú principal"
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-border p-6">
            <div className="rounded-lg bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium">Bienvenido/a</h3>
                  <p className="font-semibold text-foreground">
                    {user?.nombre} {user?.apellido}
                  </p>
                </div>
                <Button
                  ref={closeButtonRef}
                  type="button"
                  variant="ghost"
                  className="h-8 w-8 p-0 sm:hidden"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Cerrar menú</span>
                </Button>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-6">
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
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground/70 hover:text-foreground hover:bg-muted"
                      }`}
                      onClick={handleLinkClick}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                      {item.name === "Chat" && (
                        isUnreadLoading ? (
                          <span className="ml-auto flex h-5 w-5 items-center justify-center" aria-live="polite">
                            <Spinner size="sm" className="text-primary" />
                            <span className="sr-only">Cargando mensajes no leídos</span>
                          </span>
                        ) : hasUnreadMessages ? (
                          <Badge className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-2 text-xs text-white">
                            {displayUnreadMessagesCount}
                          </Badge>
                        ) : null
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-border p-6">
            <Button
              onClick={() => {
                void logout();
              }}
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
