import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  CheckCheck,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { LoadingState, Spinner } from "@/components/ui/loading-state";

const Messages = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
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
          .filter((msg) => msg.isFromAdvisor && !msg.read)
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
    if (!newMessage.trim() || !userId || isSending) {
      return;
    }

    const messageContent = newMessage.trim();
    
    // Limpiar input inmediatamente
    setNewMessage("");
    
    // Mostrar mensaje temporal con loader
    setPendingMessage(messageContent);
    
    // Bloquear interfaz
    setIsSending(true);
    
    try {
      await sendClientMessage(userId, messageContent);
    } catch (error) {
      console.error("Error al enviar el mensaje", error);
      // Restaurar el mensaje en el input si hay error
      setNewMessage(messageContent);
      toast({
        title: "No se pudo enviar el mensaje",
        description: "Revisa tu conexión e intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      // Limpiar estado de envío
      setIsSending(false);
      setPendingMessage(null);
    }
  };

  const getStatusIcon = (msg: Message) => {
    if (!msg.isFromAdvisor) {
      if (msg.read) {
        return <CheckCheck className="h-3 w-3 text-green-600" />;
      }

      return <Check className="h-3 w-3 text-gray-400" />;
    }

    switch (msg.status) {
      case "pendiente":
        return <Clock className="h-3 w-3 text-yellow-600" />;
      case "respondido":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "en_revision":
        return <AlertCircle className="h-3 w-3 text-blue-600" />;
      default:
        return null;
    }
  };

  const renderMessageContent = (msg: Message) => <p className="text-sm">{msg.content}</p>;

  const sortedMessages = useMemo(
    () =>
      [...messages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
    [messages],
  );

  return (
    <div className="mt-2 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-primary/10 rounded-full p-3">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-bold">Chat con tu asesora</h1>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden h-full">
        <CardContent className="flex-1 flex flex-col p-0 h-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <LoadingState
                label="Cargando mensajes..."
                className="h-full justify-center"
              />
            ) : sortedMessages.length > 0 || pendingMessage ? (
              <>
                {sortedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[80%] ${msg.isFromAdvisor ? "mr-auto" : "ml-auto"}`}
                  >
                    <div
                      className={`p-3 rounded-lg ${
                        msg.isFromAdvisor
                          ? "bg-muted border-l-4 border-border"
                          : "bg-primary/10 border-l-4 border-primary"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {msg.isFromAdvisor ? "Florencia Foos" : "Tú"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(msg.timestamp, "dd/MM HH:mm", { locale: es })}
                        </span>
                      </div>
                      {renderMessageContent(msg)}
                      {!msg.isFromAdvisor && (
                        <div className="flex justify-end mt-1">
                          {getStatusIcon(msg)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Mensaje temporal con loader */}
                {pendingMessage && (
                  <div className="max-w-[80%] ml-auto">
                    <div className="p-3 rounded-lg bg-primary/10 border-l-4 border-primary opacity-75">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Tú</span>
                        <div className="flex items-center gap-1">
                          <Spinner size="sm" className="text-primary" />
                          <span className="text-xs text-muted-foreground">Enviando...</span>
                        </div>
                      </div>
                      <p className="text-sm">{pendingMessage}</p>
                      <div className="flex justify-end mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </div>
                )}
              </>
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
                placeholder={isSending ? "Enviando mensaje..." : "Escribir nuevo mensaje..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isSending) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={3}
                className="flex-1 resize-none"
                disabled={isSending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending || !userId}
                size="icon"
              >
                {isSending ? (
                  <Spinner size="sm" className="text-primary" />
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
