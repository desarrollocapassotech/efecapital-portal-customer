import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadMessages } from "@/contexts/UnreadMessagesContext";
import { useUnreadReports } from "@/contexts/UnreadReportsContext";
import { useNotifications } from "@/hooks/useNotifications";
import { Spinner } from "@/components/ui/loading-state";
import {
  MessageCircle,
  FileBarChart,
  Target,
  User,
  Building2,
  Sparkles,
  Mail,
  Phone,
  Calendar,
  Clock,
  StickyNote,
} from "lucide-react";

const getTipoInversorColor = (tipo: string) => {
  switch (tipo) {
    case "Conservador":
      return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300/50 shadow-sm";
    case "Moderado":
      return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300/50 shadow-sm";
    case "Agresivo":
      return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300/50 shadow-sm";
    default:
      return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300/50 shadow-sm";
  }
};

const formatDate = (dateValue: string | Date) => {
  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return typeof dateValue === 'string' ? dateValue : dateValue.toString();
  }
};

const formatNotes = (notes: any[]) => {
  if (!notes || notes.length === 0) return null;
  
  return notes.map((note, index) => (
    <div key={index} className="border-l-2 border-primary/30 pl-3 py-2 bg-gradient-to-r from-primary/5 to-transparent rounded-r-md transition-all duration-200 hover:from-primary/10 hover:border-primary/50">
      <div className="text-xs text-muted-foreground mb-1 font-medium">
        {formatDate(note.date)}
      </div>
      <div className="text-sm text-foreground/90">{note.text}</div>
    </div>
  ));
};

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { unreadCount, isLoading: isUnreadLoading } = useUnreadMessages();
  const { badgeCount, isLoading: isUnreadReportsLoading } = useUnreadReports();
  const { isSupported, permission } = useNotifications();
  const hasUnreadMessages = unreadCount > 0;
  const hasUnreadReports = badgeCount > 0;
  const displayUnreadMessagesCount = unreadCount > 99 ? '99+' : `${unreadCount}`;
  const displayUnreadReportsCount = badgeCount > 0 ? "1" : "0";

  const fullName = [user?.nombre, user?.apellido].filter(Boolean).join(" ") || "Inversionista";
  const investorType = user?.tipoInversor || "Sin definir";
  const brokerName = user?.broker?.nombre || user?.brokerId || "Sin asignar";
  const email = user?.email;
  const phone = user?.telefono;
  const investmentHorizon = user?.horizonte;
  const lastContact = user?.lastContact;
  const notes = user?.notes;
  const objetivosContent = user?.objetivos?.trim()
    ? user.objetivos
    : "Comparte tus objetivos financieros con tu asesora para recibir recomendaciones personalizadas.";

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, path: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(path);
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 pointer-events-none" />
      
      {/* Banner de notificaciones */}
      {isSupported && permission === 'default' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800">
                Activa las notificaciones
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Recibe notificaciones cuando tengas nuevos mensajes o informes disponibles.
              </p>
            </div>
            <button
              onClick={() => {
                if ('Notification' in window) {
                  Notification.requestPermission();
                }
              }}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Activar
            </button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-4 relative">
        <Card
          role="button"
          tabIndex={0}
          onClick={() => navigate("/dashboard/messages")}
          onKeyDown={(event) => handleCardKeyDown(event, "/dashboard/messages")}
          className="group relative col-span-1 overflow-hidden border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:col-span-2"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tl from-transparent via-primary/5 to-primary/10 opacity-0 transition-all duration-500 group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-center justify-between p-4 md:p-6">
            {isUnreadLoading ? (
              <span className="absolute right-3 top-3 md:right-4 md:top-4 flex h-5 w-5 md:h-6 md:w-6 items-center justify-center" aria-live="polite">
                <Spinner size="sm" className="text-primary" />
                <span className="sr-only">Cargando mensajes no leídos</span>
              </span>
            ) : hasUnreadMessages ? (
              <Badge className="absolute right-3 top-3 md:right-4 md:top-4 flex h-5 w-5 md:h-6 md:w-6 min-w-[1.25rem] md:min-w-[1.5rem] items-center justify-center px-1.5 md:px-2 text-xs bg-gradient-to-r from-red-500 to-red-600 text-white border border-red-400/50 shadow-lg shadow-red-500/30 animate-pulse">
                {displayUnreadMessagesCount}
              </Badge>
            ) : null}
            <div className="space-y-1 md:space-y-2">
              <CardTitle className="text-lg md:text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Hablar con mi asesora</CardTitle>
            </div>
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-lg shadow-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/30">
              <MessageCircle className="h-5 w-5 md:h-6 md:w-6 transition-transform duration-300 group-hover:scale-110" />
            </div>
          </CardHeader>
          <CardContent className="relative p-4 pt-0 md:p-6 md:pt-0">
            <p className="text-sm font-medium bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Ir al chat</p>
          </CardContent>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          onClick={() => navigate("/dashboard/reports")}
          onKeyDown={(event) => handleCardKeyDown(event, "/dashboard/reports")}
          className="group relative col-span-1 overflow-hidden border border-emerald-200/50 bg-gradient-to-br from-card via-card to-emerald-50/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 md:col-span-2"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tl from-transparent via-emerald-500/5 to-emerald-500/10 opacity-0 transition-all duration-500 group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-center justify-between p-4 md:p-6">
            {isUnreadReportsLoading ? (
              <span className="absolute right-3 top-3 md:right-4 md:top-4 flex h-5 w-5 md:h-6 md:w-6 items-center justify-center" aria-live="polite">
                <Spinner size="sm" className="text-emerald-600" />
                <span className="sr-only">Cargando informes no descargados</span>
              </span>
            ) : hasUnreadReports ? (
              <Badge className="absolute right-3 top-3 md:right-4 md:top-4 flex h-5 w-5 md:h-6 md:w-6 min-w-[1.25rem] md:min-w-[1.5rem] items-center justify-center px-1.5 md:px-2 text-xs bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border border-emerald-400/50 shadow-lg shadow-emerald-500/30 animate-pulse">
                {displayUnreadReportsCount}
              </Badge>
            ) : null}
            <div className="space-y-1 md:space-y-2">
              <CardTitle className="text-lg md:text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Informes</CardTitle>
            </div>
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 text-emerald-600 shadow-lg shadow-emerald-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-emerald-500/30">
              <FileBarChart className="h-5 w-5 md:h-6 md:w-6 transition-transform duration-300 group-hover:scale-110" />
            </div>
          </CardHeader>
          <CardContent className="relative p-4 pt-0 md:p-6 md:pt-0">
            <p className="text-sm font-medium bg-gradient-to-r from-emerald-600 to-emerald-500/80 bg-clip-text text-transparent">Ver informes</p>
          </CardContent>
        </Card>

        <Card className="col-span-1 border border-amber-200/50 bg-gradient-to-br from-card via-card to-amber-50/30 shadow-lg shadow-amber-500/5 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 md:col-span-2">
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-center justify-between gap-3 md:gap-4">
              <div>
                <CardTitle className="text-base md:text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Mis objetivos</CardTitle>
              </div>
              <div className="flex h-8 w-8 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/10 text-amber-600 shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-amber-500/30">
                <Target className="h-4 w-4 md:h-6 md:w-6 transition-transform duration-300 hover:scale-110" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="objetivos">
                <AccordionTrigger className="text-left text-sm font-medium hover:text-amber-600 transition-colors duration-200">Mostrar objetivos</AccordionTrigger>
                <AccordionContent>
                  <div
                    className="prose prose-sm max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: objetivosContent }}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className="col-span-1 border border-blue-200/50 bg-gradient-to-br from-card via-card to-blue-50/30 shadow-lg shadow-blue-500/5 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 md:col-span-2">
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-center justify-between gap-3 md:gap-4">
              <div>
                <CardTitle className="text-base md:text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Mi perfil</CardTitle>
              </div>
              <div className="flex h-8 w-8 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/10 text-blue-600 shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-blue-500/30">
                <User className="h-4 w-4 md:h-6 md:w-6 transition-transform duration-300 hover:scale-110" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="perfil">
                <AccordionTrigger className="text-left text-sm font-medium hover:text-blue-600 transition-colors duration-200">Ver información completa</AccordionTrigger>
                <AccordionContent>
                  <dl className="space-y-3 md:space-y-4 text-sm">
                    {/* Información básica */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <dt className="text-muted-foreground flex items-center gap-2">
                        <User className="h-3 w-3 md:h-4 md:w-4" />
                        Nombre completo
                      </dt>
                      <dd className="font-medium text-foreground sm:text-right">{fullName}</dd>
                    </div>

                    {/* Email */}
                    {email && (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <dt className="text-muted-foreground flex items-center gap-2">
                          <Mail className="h-3 w-3 md:h-4 md:w-4" />
                          Email
                        </dt>
                        <dd className="font-medium text-foreground sm:text-right break-all">{email}</dd>
                      </div>
                    )}

                    {/* Teléfono */}
                    {phone && (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <dt className="text-muted-foreground flex items-center gap-2">
                          <Phone className="h-3 w-3 md:h-4 md:w-4" />
                          Teléfono
                        </dt>
                        <dd className="font-medium text-foreground sm:text-right">{phone}</dd>
                      </div>
                    )}

                    {/* Perfil de inversor */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <dt className="text-muted-foreground flex items-center gap-2">
                        <Target className="h-3 w-3 md:h-4 md:w-4" />
                        Perfil de inversor
                      </dt>
                      <dd>
                        <Badge className={getTipoInversorColor(investorType)}>{investorType}</Badge>
                      </dd>
                    </div>

                    {/* Horizonte de inversión */}
                    {investmentHorizon && (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <dt className="text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                          Horizonte de inversión
                        </dt>
                        <dd className="font-medium text-foreground sm:text-right">{investmentHorizon}</dd>
                      </div>
                    )}

                    {/* Bróker */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <dt className="text-muted-foreground flex items-center gap-2">
                        <Building2 className="h-3 w-3 md:h-4 md:w-4" />
                        Bróker
                      </dt>
                      <dd className="font-medium text-foreground sm:text-right">{brokerName}</dd>
                    </div>

                    {/* Último contacto */}
                    {lastContact && (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <dt className="text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3 md:h-4 md:w-4" />
                          Último contacto
                        </dt>
                        <dd className="font-medium text-foreground sm:text-right text-xs md:text-sm">{formatDate(lastContact)}</dd>
                      </div>
                    )}

                    {/* Notas */}
                    {notes && notes.length > 0 && (
                      <div className="space-y-2">
                        <dt className="text-muted-foreground flex items-center gap-2">
                          <StickyNote className="h-3 w-3 md:h-4 md:w-4" />
                          Notas
                        </dt>
                        <dd className="space-y-2">
                          {formatNotes(notes)}
                        </dd>
                      </div>
                    )}
                  </dl>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
