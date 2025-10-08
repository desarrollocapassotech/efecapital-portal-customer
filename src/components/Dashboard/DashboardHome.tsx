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
import { Button } from "@/components/ui/button";
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
  CalendarCheck,
  NotebookPen,
  ShieldCheck,
} from "lucide-react";

const getTipoInversorColor = (tipo: string) => {
  switch (tipo) {
    case "Conservador":
      return "bg-financial-mint/70 text-financial-navy";
    case "Moderado":
      return "bg-financial-sand/80 text-foreground";
    case "Agresivo":
      return "bg-financial-rose/80 text-financial-navy";
    default:
      return "bg-white/60 text-foreground";
  }
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
  const objetivosContent = user?.objetivos?.trim()
    ? user.objetivos
    : "Comparte tus objetivos financieros con tu asesora para recibir recomendaciones personalizadas.";

  const nextSteps = [
    {
      title: "Agenda una revisión",
      description: "Coordina una reunión con tu asesora para analizar tus avances del trimestre.",
      icon: CalendarCheck,
    },
    {
      title: "Actualiza tus objetivos",
      description: "Cuéntanos si tus metas cambiaron para ajustar tus inversiones.",
      icon: NotebookPen,
    },
    {
      title: "Confirma tu perfil",
      description: "Revisa si tu tolerancia al riesgo sigue vigente o si prefieres mayor estabilidad.",
      icon: ShieldCheck,
    },
  ];

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, path: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(path);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br from-primary via-financial-blue to-financial-navy p-8 text-primary-foreground shadow-[0_55px_140px_-70px_rgba(15,23,42,0.85)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-[-3rem] top-[-3rem] h-60 w-60 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-[-4rem] left-1/3 h-48 w-48 rounded-full bg-financial-mint/40 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-6">
            <Badge className="w-fit rounded-full border border-white/40 bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/90">
              Bienvenida
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold sm:text-4xl">Hola, {fullName}</h1>
              <p className="text-base text-primary-foreground/80">
                Tienes a tu disposición toda tu información financiera, recomendaciones personalizadas y el contacto directo con tu asesora.
                Disfruta de una experiencia cálida y clara para tomar mejores decisiones.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => navigate("/dashboard/messages")}
                className="rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-primary shadow-[0_18px_40px_-28px_rgba(15,23,42,0.65)] transition hover:bg-white"
              >
                Abrir chat
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/dashboard/reports")}
                className="rounded-full border border-white/60 bg-transparent px-5 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/15"
              >
                Ver informes
              </Button>
            </div>
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-3 lg:w-auto">
            <div className="rounded-3xl border border-white/30 bg-white/15 p-4 backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground/70">Perfil</p>
              <p className="mt-2 text-lg font-semibold">{investorType}</p>
              <p className="mt-1 text-xs text-primary-foreground/80">Tipo de inversor</p>
            </div>
            <div className="rounded-3xl border border-white/30 bg-white/15 p-4 backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground/70">Bróker</p>
              <p className="mt-2 text-lg font-semibold">{brokerName}</p>
              <p className="mt-1 text-xs text-primary-foreground/80">Entidad asignada</p>
            </div>
            <div className="rounded-3xl border border-white/30 bg-white/15 p-4 backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground/70">Mensajes</p>
              <div className="mt-2 flex items-center gap-2 text-lg font-semibold">
                {isUnreadLoading ? (
                  <Spinner size="sm" className="text-white" />
                ) : (
                  <span>{hasUnreadMessages ? displayUnreadMessagesCount : "Al día"}</span>
                )}
              </div>
              <p className="mt-1 text-xs text-primary-foreground/80">Estado del chat</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          role="button"
          tabIndex={0}
          onClick={() => navigate("/dashboard/messages")}
          onKeyDown={(event) => handleCardKeyDown(event, "/dashboard/messages")}
          className="glass-card group relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-financial-mint/40 via-transparent to-financial-blue/20 opacity-0 transition duration-200 group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-start justify-between">
            {isUnreadLoading ? (
              <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center" aria-live="polite">
                <Spinner size="sm" className="text-primary" />
                <span className="sr-only">Cargando mensajes no leídos</span>
              </span>
            ) : hasUnreadMessages ? (
              <Badge className="absolute right-4 top-4 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-financial-rose px-2 text-xs font-semibold text-financial-navy">
                {displayUnreadMessagesCount}
              </Badge>
            ) : null}
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold">Hablar con mi asesora</CardTitle>
              <CardDescription className="max-w-md text-sm text-muted-foreground">
                Mantente en contacto con tu asesora financiera y recibe orientación en segundos.
              </CardDescription>
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
          className="glass-card group relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-financial-sand/50 via-transparent to-financial-blue/15 opacity-0 transition duration-200 group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold">Mis informes</CardTitle>
              <CardDescription className="max-w-md text-sm text-muted-foreground">
                Consulta los reportes y documentos que tu asesora comparte contigo para seguir el progreso de tus inversiones.
              </CardDescription>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileBarChart className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-sm font-medium text-primary">Ver informes</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold">Mis objetivos</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Revisa tus metas financieras cuando lo necesites.
              </CardDescription>
            </div>
            <Target className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="objetivos" className="border-none">
                <AccordionTrigger className="rounded-2xl bg-white/60 px-4 text-left text-sm font-semibold text-foreground shadow-[0_14px_45px_-30px_rgba(15,23,42,0.25)] hover:bg-white/80">
                  Ver mis objetivos
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div
                    className="prose prose-sm max-w-none rounded-2xl bg-white/70 p-4 text-muted-foreground shadow-[0_10px_35px_-26px_rgba(15,23,42,0.25)]"
                    dangerouslySetInnerHTML={{ __html: objetivosContent }}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold">Mi perfil</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Información esencial de tu cuenta.
              </CardDescription>
            </div>
            <User className="h-6 w-6 text-muted-foreground" />
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
                  <Badge className={`${getTipoInversorColor(investorType)} rounded-full px-3 py-1 text-xs font-semibold`}>{investorType}</Badge>
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Bróker</dt>
                <dd className="font-medium text-right text-foreground">{brokerName}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold">Próximos pasos sugeridos</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Ideas concretas para seguir avanzando con calma.
              </CardDescription>
            </div>
            <Sparkles className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            {nextSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="flex items-start gap-3 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-financial-mint/40 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="space-y-1">
                    <p className="font-medium text-sm text-foreground">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold">Tu equipo de confianza</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Datos clave de tu asesora y del bróker que te acompaña día a día.
              </CardDescription>
            </div>
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/50 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Bróker</p>
              <p className="mt-2 text-base font-semibold text-foreground">{brokerName}</p>
              <p className="mt-1 text-sm text-muted-foreground">Entidad que resguarda tus inversiones.</p>
            </div>
            <div className="rounded-2xl border border-white/50 bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Contacto</p>
              <p className="mt-2 text-base font-semibold text-foreground">Florencia Foos</p>
              <p className="mt-1 text-sm text-muted-foreground">Tu asesora financiera dedicada.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default DashboardHome;
