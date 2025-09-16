import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
  type Message,
  subscribeToClientMessages,
  sendClientMessage,
  markMessagesAsRead,
} from "@/lib/firestore";
import {
  Send,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Paperclip,
  ImageIcon,
  FileDown,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

const Messages = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToClientMessages(
      userId,
      (fetchedMessages) => {
        setMessages(fetchedMessages);
        setIsLoading(false);

        const unread = fetchedMessages
          .filter((msg) => msg.remitente === "asesora" && !msg.leido)
          .map((msg) => msg.id);

        if (unread.length > 0) {
          markMessagesAsRead(unread).catch((error) => {
            console.error("Error al marcar mensajes como leídos", error);
          });
        }
      },
      (error) => {
        console.error("Error al cargar los mensajes", error);
        setIsLoading(false);
        toast({
          title: "No se pudieron cargar los mensajes",
          description: "Intenta nuevamente en unos segundos.",
          variant: "destructive",
        });
      },
    );

    return () => unsubscribe();
  }, [userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId) {
      return;
    }

    setIsSending(true);
    try {
      await sendClientMessage(userId, newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Error al enviar el mensaje", error);
      toast({
        title: "No se pudo enviar el mensaje",
        description: "Revisa tu conexión e intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendiente":
      case "enviado":
        return <Clock className="h-3 w-3 text-yellow-600" />;
      case "respondido":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "en_revision":
        return <AlertCircle className="h-3 w-3 text-blue-600" />;
      default:
        return null;
    }
  };

  const renderMessageContent = (msg: Message) => {
    if (msg.archivo) {
      const ext = msg.archivo.nombre.split(".").pop()?.toLowerCase();

      if (ext && ["jpg", "jpeg", "png", "gif"].includes(ext)) {
        return (
          <div
            className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg shadow-sm cursor-pointer hover:shadow transition-shadow"
            onClick={() => {
              if (msg.archivo?.url) {
                window.open(msg.archivo.url, "_blank");
              }
            }}
          >
            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">{msg.archivo.nombre}</h4>
              <p className="text-xs text-muted-foreground">Imagen</p>
            </div>
            <FileDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
        );
      }

      if (ext === "pdf") {
        return (
          <div
            className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg shadow-sm cursor-pointer hover:shadow transition-shadow"
            onClick={() => {
              if (msg.archivo?.url) {
                window.open(msg.archivo.url, "_blank");
              }
            }}
          >
            <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
              <Paperclip className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">{msg.archivo.nombre}</h4>
              <p className="text-xs text-muted-foreground">Documento PDF</p>
            </div>
            <FileDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
        );
      }
    }

    return <p className="text-sm">{msg.contenido}</p>;
  };

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
      ),
    [messages],
  );

  return (
    <div className="mt-8 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-primary/10 rounded-full p-3">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Chat con tu Asesora</h1>
          <p className="text-muted-foreground">Laura Pérez • Asesora Financiera</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden h-full">
        <CardContent className="flex-1 flex flex-col p-0 h-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-muted-foreground gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Cargando mensajes...
              </div>
            ) : sortedMessages.length > 0 ? (
              sortedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[80%] ${msg.remitente === "cliente" ? "ml-auto" : "mr-auto"}`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      msg.remitente === "cliente"
                        ? "bg-primary/10 border-l-4 border-primary"
                        : "bg-muted border-l-4 border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {msg.remitente === "cliente" ? "Tú" : "Asesora"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(msg.fecha), "dd/MM HH:mm", { locale: es })}
                      </span>
                    </div>
                    {renderMessageContent(msg)}
                    {msg.remitente === "cliente" && (
                      <div className="flex justify-end mt-1">
                        {getStatusIcon(msg.estado)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No hay mensajes todavía
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4 space-y-3 bg-background">
            <div className="flex items-end gap-2">
              <Textarea
                placeholder="Escribir nuevo mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={3}
                className="flex-1 resize-none"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending || !userId}
                size="icon"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Presiona {" "}
              <kbd className="px-1 bg-background border rounded">Enter</kbd> para enviar.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;
