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
import {
  MessageCircle,
  FileBarChart,
  Target,
  User,
  Building2,
  Sparkles,
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

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useUnreadMessages();

  const fullName = [user?.nombre, user?.apellido].filter(Boolean).join(" ") || "Inversionista";
  const investorType = user?.tipoInversor || "Sin definir";
  const brokerName = user?.broker?.nombre || user?.brokerId || "Sin asignar";
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
            {unreadCount > 0 && (
              <Badge className="absolute right-4 top-4 min-w-[1.5rem] h-6 px-2 text-xs bg-red-500 text-white flex items-center justify-center">
                {unreadCount}
              </Badge>
            )}
            <div className="space-y-2">
              <CardTitle className="text-xl font-semibold">Hablar con mi asesora</CardTitle>
              <CardDescription>Abre el chat para mantenerte en contacto con tu asesora financiera.</CardDescription>
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
              <CardTitle className="text-xl font-semibold">Mis informes</CardTitle>
              <CardDescription>Consulta los reportes y documentos que comparte tu asesora contigo.</CardDescription>
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
                <CardDescription>Revisa tus metas financieras cuando lo necesites.</CardDescription>
              </div>
              <Target className="h-6 w-6 text-muted-foreground" />
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
                <CardDescription>Información esencial de tu cuenta.</CardDescription>
              </div>
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Nombre completo</dt>
                <dd className="font-medium text-right text-foreground">{fullName}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Perfil de inversor</dt>
                <dd>
                  <Badge className={getTipoInversorColor(investorType)}>{investorType}</Badge>
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Bróker</dt>
                <dd className="font-medium text-right text-foreground">{brokerName}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
