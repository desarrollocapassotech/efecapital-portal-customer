import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FirebaseError } from "firebase/app";
import { Spinner } from "@/components/ui/loading-state";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = { email: "", password: "" };

    if (!email.trim()) {
      validationErrors.email = "Ingresa tu correo electrónico.";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email.trim())) {
      validationErrors.email = "Formato de correo inválido.";
    }

    if (!password) {
      validationErrors.password = "Ingresa tu contraseña.";
    }

    const hasErrors = Object.values(validationErrors).some(Boolean);

    if (hasErrors) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({ email: "", password: "" });

    try {
      await login(email.trim(), password);
    } catch (error) {
      let description = "Email o contraseña incorrectos";
      const fieldErrors = { email: "", password: "" };

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/invalid-credential":
          case "auth/wrong-password":
            fieldErrors.password = "Email o contraseña incorrectos.";
            description = fieldErrors.password;
            break;
          case "auth/user-not-found":
            fieldErrors.email = "No encontramos una cuenta con este correo.";
            description = fieldErrors.email;
            break;
          case "auth/too-many-requests":
            fieldErrors.password =
              "Demasiados intentos. Intenta nuevamente más tarde.";
            description = fieldErrors.password;
            break;
          case "auth/network-request-failed":
            description = "Error de conexión. Revisa tu red e intenta otra vez.";
            break;
          default:
            description = "No se pudo iniciar sesión. Intenta nuevamente.";
            break;
        }
      }

      setErrors((prev) => ({ ...prev, ...fieldErrors }));

      toast({
        title: "Error de autenticación",
        description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("maria.gonzalez@email.com");
    setPassword("password123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-financial-blue via-primary to-financial-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <TrendingUp className="h-8 w-8 text-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            EFECapital
          </h1>
          <p className="text-foreground/80">
            Tu plataforma de asesoría financiera
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-elegant">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-financial-navy">
              Iniciar sesión
            </CardTitle>
            <CardDescription className="text-center">
              Accede a tu panel de inversiones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: "" }));
                    }
                  }}
                  required
                  className="h-11"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-pressed={showPassword}
                    className="text-xs font-medium text-primary hover:underline focus:outline-none"
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-20"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm">
                <label htmlFor="remember-me" className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span>Recordarme</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    toast({
                      title: "Recuperar contraseña",
                      description:
                        "Contacta a tu administrador o utiliza la opción de restablecimiento en la app principal.",
                    })
                  }
                  className="text-primary hover:underline text-left"
                >
                  Olvidé mi contraseña
                </button>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-primary to-financial-blue hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2 text-primary-foreground" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
