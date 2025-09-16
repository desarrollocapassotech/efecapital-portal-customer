import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToClientMessages, type Message } from "@/lib/firestore";
import {
  User,
  Target,
  Calendar,
  Building2,
  MessageSquare,
  Mail,
  Phone,
  Loader2,
  Paperclip,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const getTipoInversorColor = (tipo: string) => {
  switch (tipo) {
    case "conservador":
      return "bg-blue-100 text-blue-800";
    case "moderado":
      return "bg-green-100 text-green-800";
    case "agresivo":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getEstadoBadgeStyles = (estado: Message["estado"]) => {
  switch (estado) {
    case "respondido":
      return "bg-green-100 text-green-700";
    case "en_revision":
      return "bg-blue-100 text-blue-700";
    case "pendiente":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const formatEstadoLabel = (estado: Message["estado"]) => {
  switch (estado) {
    case "en_revision":
      return "En revisión";
    case "respondido":
      return "Respondido";
    case "pendiente":
      return "Pendiente";
    case "enviado":
      return "Enviado";
    default:
      return estado;
  }
};

const DashboardHome = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setMessages([]);
      setIsLoadingMessages(false);
      return;
    }

    setIsLoadingMessages(true);
    const unsubscribe = subscribeToClientMessages(
      user.id,
      (fetchedMessages) => {
        setMessages(fetchedMessages);
        setIsLoadingMessages(false);
      },
      (error) => {
        console.error("Error al obtener los mensajes recientes", error);
        setIsLoadingMessages(false);
        setMessages([]);
      },
    );

    return () => unsubscribe();
  }, [user?.id]);

  const unreadMessages = useMemo(
    () => messages.filter((msg) => msg.remitente === "asesora" && !msg.leido).length,
    [messages],
  );

  const recentMessages = useMemo(
    () =>
      [...messages]
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 2),
    [messages],
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-financial-blue rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 rounded-full p-4">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              ¡Hola, {user?.nombre}!
            </h1>
            <p className="text-white/90 text-lg">
              Bienvenido/a a tu panel de inversiones
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipo de Inversor</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getTipoInversorColor(user?.tipoInversor || "")}>
              {user?.tipoInversor || "Sin definir"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bróker asignado</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {user?.broker?.nombre || user?.brokerId || "Sin asignar"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horizonte de inversión</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {user?.horizonte || "Actualiza tu horizonte desde tu perfil"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes sin leer</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              Mensajes recientes de tu asesora pendientes de revisar
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objetivos de inversión
          </CardTitle>
          <CardDescription>
            Visualiza los objetivos que definiste junto a tu asesora
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {user?.objetivos || "Comparte tus objetivos financieros con tu asesora para recibir recomendaciones personalizadas."}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Mensajes recientes
            </CardTitle>
            <CardDescription>
              Un resumen de tus últimas conversaciones con tu asesora
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingMessages ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando mensajes...
              </div>
            ) : recentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aún no tienes mensajes. Inicia la conversación desde la sección de comunicaciones.
              </p>
            ) : (
              recentMessages.map((msg) => {
                const hasAttachment = Boolean(msg.archivo?.url);
                return (
                  <div
                    key={msg.id}
                    className="rounded-lg border border-border bg-muted/30 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        {msg.remitente === "cliente" ? "Tú" : "Asesora"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(msg.fecha), { addSuffix: true, locale: es })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {msg.contenido || "Mensaje con archivo adjunto"}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge className={`${getEstadoBadgeStyles(msg.estado)} capitalize`}>
                        {formatEstadoLabel(msg.estado)}
                      </Badge>
                      {hasAttachment && (
                        <span className="flex items-center gap-1 text-xs text-primary">
                          <Paperclip className="h-3 w-3" /> Archivo adjunto
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Datos de contacto
            </CardTitle>
            <CardDescription>
              Información personal para mantenernos comunicados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{user?.telefono || "Agrega un teléfono de contacto"}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{user?.email || "Agrega un correo electrónico"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Tu bróker
            </CardTitle>
            <CardDescription>
              Datos de contacto del bróker asignado a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {user?.broker ? (
              <>
                <div>
                  <p className="text-lg font-semibold">{user.broker.nombre}</p>
                  {user.broker.empresa && (
                    <p className="text-sm text-muted-foreground">{user.broker.empresa}</p>
                  )}
                </div>
                {user.broker.email && (
                  <div className="flex items-center gap-3 text-muted-foreground text-sm">
                    <Mail className="h-4 w-4" />
                    <span>{user.broker.email}</span>
                  </div>
                )}
                {user.broker.telefono && (
                  <div className="flex items-center gap-3 text-muted-foreground text-sm">
                    <Phone className="h-4 w-4" />
                    <span>{user.broker.telefono}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Todavía no tienes un bróker asignado. Ponte en contacto con tu asesora para actualizar esta información.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
