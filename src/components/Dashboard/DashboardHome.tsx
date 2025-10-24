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
      return "bg-blue-100 text-blue-800";
    case "Moderado":
      return "bg-yellow-100 text-yellow-800";
    case "Agresivo":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
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
    <div key={index} className="border-l-2 border-primary/20 pl-3 py-2">
      <div className="text-xs text-muted-foreground mb-1">
        {formatDate(note.date)}
      </div>
      <div className="text-sm">{note.text}</div>
    </div>
  ));
};

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { unreadCount, isLoading: isUnreadLoading } = useUnreadMessages();
  const hasUnreadMessages = unreadCount > 0;
  const displayUnreadMessagesCount = unreadCount > 99 ? '99+' : `${unreadCount}`;

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
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <Card
          role="button"
          tabIndex={0}
          onClick={() => navigate("/dashboard/messages")}
          onKeyDown={(event) => handleCardKeyDown(event, "/dashboard/messages")}
          className="group relative col-span-1 overflow-hidden border border-border/70 bg-card/80 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:col-span-2"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-primary/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-start justify-between">
            {isUnreadLoading ? (
              <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center" aria-live="polite">
                <Spinner size="sm" className="text-primary" />
                <span className="sr-only">Cargando mensajes no leídos</span>
              </span>
            ) : hasUnreadMessages ? (
              <Badge className="absolute right-4 top-4 flex h-6 min-w-[1.5rem] items-center justify-center px-2 text-xs bg-red-500 text-white">
                {displayUnreadMessagesCount}
              </Badge>
            ) : null}
            <div className="space-y-2">
              <CardTitle className="text-xl font-semibold">Hablar con mi asesora</CardTitle>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageCircle className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-sm font-medium text-primary">Ir al chat</p>
          </CardContent>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          onClick={() => navigate("/dashboard/reports")}
          onKeyDown={(event) => handleCardKeyDown(event, "/dashboard/reports")}
          className="group relative col-span-1 overflow-hidden border border-border/70 bg-card/80 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:col-span-2"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-primary/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl font-semibold">Informes</CardTitle>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileBarChart className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-sm font-medium text-primary">Ver informes</p>
          </CardContent>
        </Card>

        <Card className="col-span-1 border border-border/70 bg-card/80 md:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold">Mis objetivos</CardTitle>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Target className="h-6 w-6" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="objetivos">
                <AccordionTrigger className="text-left text-sm font-medium">Mostrar objetivos</AccordionTrigger>
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

        <Card className="col-span-1 border border-border/70 bg-card/80 md:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold">Mi perfil</CardTitle>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-6 w-6" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="perfil">
                <AccordionTrigger className="text-left text-sm font-medium">Ver información completa</AccordionTrigger>
                <AccordionContent>
                  <dl className="space-y-4 text-sm">
                    {/* Información básica */}
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nombre completo
                      </dt>
                      <dd className="font-medium text-right text-foreground">{fullName}</dd>
                    </div>

                    {/* Email */}
                    {email && (
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-muted-foreground flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </dt>
                        <dd className="font-medium text-right text-foreground">{email}</dd>
                      </div>
                    )}

                    {/* Teléfono */}
                    {phone && (
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-muted-foreground flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Teléfono
                        </dt>
                        <dd className="font-medium text-right text-foreground">{phone}</dd>
                      </div>
                    )}

                    {/* Perfil de inversor */}
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-muted-foreground flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Perfil de inversor
                      </dt>
                      <dd>
                        <Badge className={getTipoInversorColor(investorType)}>{investorType}</Badge>
                      </dd>
                    </div>

                    {/* Horizonte de inversión */}
                    {investmentHorizon && (
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Horizonte de inversión
                        </dt>
                        <dd className="font-medium text-right text-foreground">{investmentHorizon}</dd>
                      </div>
                    )}

                    {/* Bróker */}
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-muted-foreground flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Bróker
                      </dt>
                      <dd className="font-medium text-right text-foreground">{brokerName}</dd>
                    </div>

                    {/* Último contacto */}
                    {lastContact && (
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Último contacto
                        </dt>
                        <dd className="font-medium text-right text-foreground">{formatDate(lastContact)}</dd>
                      </div>
                    )}

                    {/* Notas */}
                    {notes && notes.length > 0 && (
                      <div className="space-y-2">
                        <dt className="text-muted-foreground flex items-center gap-2">
                          <StickyNote className="h-4 w-4" />
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
