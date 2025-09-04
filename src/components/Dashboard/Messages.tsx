import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { getMockDataForUser, Message } from '@/data/mockData';
import {
  Send,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Paperclip,
  ImageIcon,
  FileDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

const Messages = () => {
  const { user } = useAuth();
  const userId = user?.id || '1';
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar mensajes
  useEffect(() => {
    const data = getMockDataForUser(userId);
    const stored = localStorage.getItem(`messages_${userId}`);
    const initialMessages = stored ? JSON.parse(stored) : data.mensajes;

    const withReadStatus = initialMessages.map((msg: Message) => ({
      ...msg,
      leido: msg.remitente === 'cliente' ? true : msg.leido ?? false,
    }));

    setMessages(withReadStatus);
  }, [userId]);

  // Guardar en localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`messages_${userId}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  // Marcar mensajes de asesora como leídos al entrar
  useEffect(() => {
    const unreadMessages = messages.filter(
      (msg) => msg.remitente === 'asesora' && !msg.leido
    );

    const unreadCount = unreadMessages.length;

    if (unreadCount > 0) {
      const updatedMessages = messages.map((msg) =>
        msg.remitente === 'asesora' && !msg.leido ? { ...msg, leido: true } : msg
      );
      setMessages(updatedMessages);
      localStorage.setItem(`unreadMessages_${userId}`, String(unreadCount));
    }
  }, [messages, userId]);

  // Scroll al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const myMessage: Message = {
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      contenido: newMessage,
      remitente: 'cliente',
      estado: 'enviado',
      leido: true,
    };

    setMessages((prev) =>
      [...prev, myMessage].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    );
    setNewMessage('');

    // Simular respuesta
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        fecha: new Date().toISOString(),
        contenido: 'Gracias por tu mensaje. Lo revisaré pronto.',
        remitente: 'asesora',
        estado: 'respondido',
        leido: false,
      };
      setMessages((prev) =>
        [...prev, response].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      );
    }, 1000);

    toast({
      title: 'Mensaje enviado',
      description: 'Tu mensaje fue enviado a la asesora.',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente':
      case 'enviado':
        return <Clock className="h-3 w-3 text-yellow-600" />;
      case 'respondido':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'en_revision':
        return <AlertCircle className="h-3 w-3 text-blue-600" />;
      default:
        return null;
    }
  };

  const renderMessageContent = (msg: Message) => {
    if (msg.archivo) {
      const ext = msg.archivo.nombre.split('.').pop()?.toLowerCase();

      if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) {
        return (
          <div
            className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg shadow-sm cursor-pointer hover:shadow transition-shadow"
            onClick={() => window.open(msg.archivo?.url, '_blank')}
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

      if (ext === 'pdf') {
        return (
          <div
            className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg shadow-sm cursor-pointer hover:shadow transition-shadow"
            onClick={() => window.open(msg.archivo?.url, '_blank')}
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

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  return (
    <div className="mt-8 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-primary/10 rounded-full p-3">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Chat con tu Asesora</h1>
          <p className="text-muted-foreground">Laura Pérez • Asesora Financiera</p>
        </div>
      </div>

      {/* Chat */}
      <Card className="flex-1 flex flex-col overflow-hidden h-full">
        <CardContent className="flex-1 flex flex-col p-0 h-full">
          {/* Área de mensajes con scroll */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {sortedMessages.length > 0 ? (
              sortedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[80%] ${msg.remitente === 'cliente' ? 'ml-auto' : 'mr-auto'}`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      msg.remitente === 'cliente'
                        ? 'bg-primary/10 border-l-4 border-primary'
                        : 'bg-muted border-l-4 border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {msg.remitente === 'cliente' ? 'Tú' : 'Asesora'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(msg.fecha), 'dd/MM HH:mm', { locale: es })}
                      </span>
                    </div>
                    {renderMessageContent(msg)}
                    {msg.remitente === 'cliente' && (
                      <div className="flex justify-end mt-1">
                        {getStatusIcon(msg.estado)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No hay mensajes todavía</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input fijo en la parte inferior */}
          <div className="border-t p-4 space-y-3 bg-background">
            <div className="flex items-end gap-2">
              <Textarea
                placeholder="Escribir nuevo mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={3}
                className="flex-1 resize-none"
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Presiona{' '}
              <kbd className="px-1 bg-background border rounded">Enter</kbd> para enviar.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;