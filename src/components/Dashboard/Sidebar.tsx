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
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/40 bg-white/65 pb-6 pt-8 shadow-[0_25px_70px_-40px_rgba(30,64,175,0.65)] backdrop-blur-xl transition-transform duration-300 ease-in-out sm:translate-x-0 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role={isMenuOpen ? "dialog" : undefined}
        aria-modal={isMenuOpen ? true : undefined}
        aria-label="Menú principal"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-4 h-32 w-32 -translate-x-1/2 rounded-full bg-financial-blue/15 blur-2xl" />
          <div className="absolute bottom-10 right-6 h-24 w-24 rounded-full bg-financial-mint/25 blur-2xl" />
        </div>

        <div className="flex h-full flex-col px-6">
          <div className="relative mb-6 rounded-3xl border border-white/50 bg-white/70 p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Bienvenida</p>
                <p className="text-lg font-semibold text-foreground">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="text-xs text-muted-foreground">
                  Gestiona tus inversiones con tranquilidad.
                </p>
              </div>
              <Button
                ref={closeButtonRef}
                type="button"
                variant="ghost"
                className="h-8 w-8 rounded-full border border-transparent p-0 text-muted-foreground transition hover:border-border hover:text-foreground sm:hidden"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Cerrar menú</span>
              </Button>
            </div>
          </div>

          <nav className="relative z-10 flex-1 overflow-y-auto pb-6">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-gradient-to-r from-primary to-financial-blue text-primary-foreground shadow-[0_12px_40px_-26px_rgba(37,99,235,0.75)]"
                          : "text-foreground/70 hover:text-foreground hover:shadow-[0_16px_40px_-28px_rgba(15,23,42,0.28)] hover:bg-white/75"
                      }`}
                      onClick={handleLinkClick}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-2xl border text-sm transition ${
                          isActive
                            ? "border-white/30 bg-white/20 text-primary-foreground"
                            : "border-white/50 bg-white/80 text-primary"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>{item.name}</span>
                      {item.name === "Chat" && (
                        isUnreadLoading ? (
                          <span className="ml-auto flex h-5 w-5 items-center justify-center" aria-live="polite">
                            <Spinner size="sm" className="text-primary" />
                            <span className="sr-only">Cargando mensajes no leídos</span>
                          </span>
                        ) : hasUnreadMessages ? (
                          <Badge className="ml-auto rounded-full bg-financial-rose/80 px-2 text-[11px] font-semibold text-financial-navy">
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

          <div className="relative z-10 mt-auto">
            <div className="rounded-3xl border border-white/50 bg-white/70 p-4 shadow-[0_14px_45px_-30px_rgba(15,23,42,0.45)]">
              <p className="mb-3 text-xs text-muted-foreground">
                ¿Necesitas salir?
              </p>
              <Button
                onClick={() => {
                  void logout();
                }}
                variant="ghost"
                className="w-full justify-center rounded-full border border-transparent bg-white/80 text-sm font-medium text-foreground transition hover:border-destructive/30 hover:bg-white"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
