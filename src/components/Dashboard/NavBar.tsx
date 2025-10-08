import React from "react";
import { MessageSquare, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useUnreadMessages } from "@/contexts/UnreadMessagesContext";
import { Spinner } from "@/components/ui/loading-state";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount, isLoading: isUnreadLoading } = useUnreadMessages();
  const hasUnreadMessages = unreadCount > 0;
  const displayUnreadMessagesCount = unreadCount > 99 ? "99+" : `${unreadCount}`;

  return (
    <nav className="mx-4 mt-6 md:mx-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 px-4 py-4 shadow-[0_20px_60px_-38px_rgba(30,64,175,0.65)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-6 right-0 h-32 w-32 rounded-full bg-financial-blue/15 blur-2xl" />
          <div className="absolute bottom-[-3rem] left-[20%] h-28 w-28 rounded-full bg-financial-mint/30 blur-2xl" />
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3 md:gap-4">
            <div className="md:hidden">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full border-white/60 bg-white/70 text-foreground shadow-none"
                onClick={() => {
                  const event = new CustomEvent("toggle-sidebar");
                  window.dispatchEvent(event);
                }}
                aria-label="Abrir menú"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
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
              className="group flex items-center gap-3 rounded-full bg-white/70 px-3 py-2 text-sm font-semibold text-foreground shadow-[0_10px_35px_-20px_rgba(37,99,235,0.55)] transition hover:bg-white/90"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-inner">
                <TrendingUp className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="leading-tight">
                <span className="block text-xs font-medium text-muted-foreground">Panel cliente</span>
                EFECapital
              </span>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="hidden items-center gap-3 md:flex">
              <Button
                asChild
                variant="secondary"
                className="relative rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm font-medium text-foreground shadow-none transition hover:border-primary/40 hover:bg-white"
              >
                <Link to="/dashboard/messages" className="flex items-center gap-2" aria-label="Ir al chat">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Mensajes
                  {isUnreadLoading ? (
                    <span className="flex h-5 w-5 items-center justify-center" aria-live="polite">
                      <Spinner size="sm" className="text-primary" />
                      <span className="sr-only">Cargando mensajes no leídos</span>
                    </span>
                  ) : hasUnreadMessages ? (
                    <Badge className="ml-1 rounded-full bg-financial-rose/70 px-2 text-[11px] font-semibold text-financial-navy">
                      {displayUnreadMessagesCount}
                    </Badge>
                  ) : null}
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground">
                Hola, <strong className="text-foreground">{user?.nombre}</strong>
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full border border-transparent text-sm font-medium text-foreground/80 transition hover:border-destructive/20 hover:text-foreground"
                onClick={() => {
                  void logout();
                }}
              >
                Cerrar sesión
              </Button>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-full border border-white/60 bg-white/80 text-foreground shadow-none"
              >
                <Link
                  to="/dashboard/messages"
                  className="relative flex items-center justify-center"
                  aria-label="Abrir chat"
                >
                  <MessageSquare className="h-4 w-4" />
                  {isUnreadLoading ? (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center" aria-live="polite">
                      <Spinner size="sm" className="text-primary" />
                      <span className="sr-only">Cargando mensajes no leídos</span>
                    </span>
                  ) : hasUnreadMessages ? (
                    <Badge className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-financial-rose px-1.5 text-[10px] leading-none text-financial-navy">
                      {displayUnreadMessagesCount}
                    </Badge>
                  ) : null}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
