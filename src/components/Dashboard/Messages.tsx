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
    <div className="mt-2 flex h-full flex-col gap-6 pb-6">
      <div className="flex items-center gap-4 rounded-3xl border border-white/60 bg-white/70 p-4 shadow-[0_20px_60px_-38px_rgba(15,23,42,0.45)]">
        <div className="rounded-full bg-financial-mint/50 p-3 text-primary">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Conversa cuando quieras</p>
          <h1 className="text-xl font-semibold text-foreground">Chat con tu asesora</h1>
        </div>
      </div>

      <Card className="glass-card flex h-full flex-1 flex-col overflow-hidden">
        <CardContent className="flex h-full flex-1 flex-col p-0">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {isLoading ? (
              <LoadingState
                label="Cargando mensajes..."
                className="h-full justify-center"
              />
            ) : sortedMessages.length > 0 ? (
              sortedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[80%] ${msg.isFromAdvisor ? "mr-auto" : "ml-auto"}`}
                >
                  <div
                    className={`rounded-2xl border px-4 py-3 shadow-[0_12px_32px_-28px_rgba(15,23,42,0.3)] ${
                      msg.isFromAdvisor
                        ? "border-white/60 bg-white/80"
                        : "border-primary/20 bg-primary/10"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {msg.isFromAdvisor ? "Florencia Foos" : "Tú"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(msg.timestamp, "dd/MM HH:mm", { locale: es })}
                      </span>
                    </div>
                    {renderMessageContent(msg)}
                    {!msg.isFromAdvisor && (
                      <div className="mt-1 flex justify-end text-xs text-muted-foreground">
                        {getStatusIcon(msg)}
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

          <div className="space-y-3 border-t border-white/50 bg-white/70 p-4">
            <div className="flex items-end gap-3">
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
                className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-[0_15px_40px_-30px_rgba(37,99,235,0.9)] hover:bg-primary/90"
              >
                {isSending ? (
                  <Spinner size="sm" className="text-primary-foreground" />
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
