import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Target,
  Building2,
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perfil de Inversor</CardTitle>
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
            <CardTitle className="text-sm font-medium">Bróker</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {user?.broker?.nombre || user?.brokerId || "Sin asignar"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Tus objetivos de inversión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: user?.objetivos || "Comparte tus objetivos financieros con tu asesora para recibir recomendaciones personalizadas."
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;