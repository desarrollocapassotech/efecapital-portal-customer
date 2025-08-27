import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

const Messages = () => {
  const { user } = useAuth();
  const userId = user?.id || '1';
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar mensajes desde mock y sincronizar con localStorage
  useEffect(() => {
    const data = getMockDataForUser(userId);
    const stored = localStorage.getItem(`messages_${userId}`);
    const initialMessages = stored ? JSON.parse(stored) : data.mensajes;

    // Aseguramos que los mensajes tengan `leido`
    const withReadStatus = initialMessages.map((msg: Message) => ({
      ...msg,
      leido: msg.remitente === 'cliente' ? true : msg.leido ?? false,
    }));

    setMessages(withReadStatus);
  }, [userId]);

  // Guardar mensajes en localStorage cuando cambien
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`messages_${userId}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  // Marcar mensajes del asesor como leídos al entrar al chat
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
      leido: true
    };

    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, myMessage];
      return updatedMessages.sort((a, b) =>
        new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      );
    });

    setNewMessage('');

    // Simular respuesta del asesor
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        fecha: new Date().toISOString(),
        contenido: 'Gracias por tu mensaje. Lo revisaré pronto.',
        remitente: 'asesora',
        estado: 'respondido',
        leido: false
      };
      setMessages((prev) => {
        const updatedMessages = [response, ...prev];
        return updatedMessages.sort((a, b) =>
          new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        );
      });
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

  const renderContent = (msg: Message) => {
    if (msg.archivo) {
      const ext = msg.archivo.nombre.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) {
        return (
          <div className="mt-2">
            <img
              src={msg.archivo.url}
              alt={msg.archivo.nombre}
              className="max-w-xs rounded-lg"
            />
            <p className="text-xs text-muted-foreground mt-1">{msg.archivo.nombre}</p>
          </div>
        );
      }
      if (ext === 'pdf') {
        return (
          <div className="mt-2">
            <a
              href={msg.archivo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <Paperclip className="h-4 w-4" />
              {msg.archivo.nombre}
            </a>
          </div>
        );
      }
    }
    return <p>{msg.contenido}</p>;
  };

  const sortedMessages = [...messages].sort((a, b) =>
    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 rounded-full p-3">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Chat con tu Asesora</h1>
          <p className="text-muted-foreground">Laura Pérez • Asesora Financiera</p>
        </div>
      </div>

      {/* Chat */}
      <Card className="overflow-hidden">
        <CardContent className="max-h-96 overflow-y-auto space-y-4 p-4">
          {sortedMessages.length > 0 ? (
            sortedMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.remitente === 'cliente' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.remitente === 'cliente'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-gray-100 rounded-tl-none'
                  }`}
                >
                  {renderContent(msg)}
                  <div
                    className={`text-xs mt-1 flex items-center gap-1 ${
                      msg.remitente === 'cliente' ? 'text-primary-foreground/80' : 'text-gray-500'
                    }`}
                  >
                    {format(new Date(msg.fecha), 'HH:mm')}
                    {msg.remitente === 'cliente' && getStatusIcon(msg.estado)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">No hay mensajes aún.</p>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input */}
        <div className="border-t p-4">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Escribe tu mensaje..."
            className="resize-none mb-2"
            rows={1}
          />
          <div className="flex items-center justify-between">
            <Button onClick={handleSendMessage} size="sm" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4 mr-1" />
              Enviar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Messages;