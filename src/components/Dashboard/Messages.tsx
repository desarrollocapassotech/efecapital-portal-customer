import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { getMockDataForUser, Message } from '@/data/mockData';
import { 
  Send, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

const Messages = () => {
  const { user } = useAuth();
  const mockData = getMockDataForUser(user?.id || '1');
  const [messages, setMessages] = useState<Message[]>(mockData.mensajes);
  const [newMessage, setNewMessage] = useState('');
  const [isCapitalEntry, setIsCapitalEntry] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'respondido':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'en_revision':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'respondido':
        return 'bg-green-100 text-green-800';
      case 'en_revision':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      contenido: newMessage,
      remitente: 'cliente',
      estado: 'pendiente',
      esIngresoCapital: isCapitalEntry
    };

    setMessages([message, ...messages]);
    setNewMessage('');
    setIsCapitalEntry(false);

    toast({
      title: "Mensaje enviado",
      description: isCapitalEntry 
        ? "Tu declaración de ingreso de capital ha sido enviada"
        : "Tu mensaje ha sido enviado a la asesora"
    });
  };

  const sortedMessages = [...messages].sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 rounded-full p-3">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Centro de Comunicaciones</h1>
          <p className="text-muted-foreground">
            Comunicación directa con tu asesora financiera
          </p>
        </div>
      </div>

      {/* New Message Form */}
      <Card>
        <CardHeader>
          <CardTitle>Enviar nuevo mensaje</CardTitle>
          <CardDescription>
            Escribe tu consulta o declara un ingreso de capital
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Escribe tu mensaje aquí..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[100px]"
          />
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="capital-entry"
              checked={isCapitalEntry}
              onCheckedChange={(checked) => setIsCapitalEntry(checked as boolean)}
            />
            <label htmlFor="capital-entry" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Marcar como "Ingreso de Capital"
            </label>
            <DollarSign className="h-4 w-4 text-financial-gold" />
          </div>
          
          {isCapitalEntry && (
            <div className="bg-financial-gold/10 border border-financial-gold/20 rounded-lg p-3">
              <p className="text-sm text-financial-gold font-medium">
                Este mensaje será marcado como una declaración de ingreso de capital
              </p>
            </div>
          )}

          <Button 
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-primary to-financial-blue hover:opacity-90"
            disabled={!newMessage.trim()}
          >
            <Send className="mr-2 h-4 w-4" />
            Enviar mensaje
          </Button>
        </CardContent>
      </Card>

      {/* Messages History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de mensajes</CardTitle>
          <CardDescription>
            Todas tus conversaciones con la asesora
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedMessages.length > 0 ? (
            <div className="space-y-6">
              {sortedMessages.map((message) => (
                <div 
                  key={message.id} 
                  className={`p-6 rounded-lg border ${
                    message.remitente === 'cliente' 
                      ? 'bg-blue-50 border-blue-200 ml-8' 
                      : 'bg-green-50 border-green-200 mr-8'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant={message.remitente === 'cliente' ? 'secondary' : 'default'}>
                        {message.remitente === 'cliente' ? 'Tú' : 'Laura (Asesora)'}
                      </Badge>
                      
                      {message.esIngresoCapital && (
                        <Badge className="bg-financial-gold/20 text-financial-gold border-financial-gold/30">
                          <DollarSign className="h-3 w-3 mr-1" />
                          Ingreso de Capital
                        </Badge>
                      )}

                      <Badge className={getStatusColor(message.estado)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(message.estado)}
                          {message.estado === 'pendiente' && 'Pendiente'}
                          {message.estado === 'respondido' && 'Respondido'}
                          {message.estado === 'en_revision' && 'En revisión'}
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{format(new Date(message.fecha), 'dd/MM/yyyy HH:mm')}</div>
                      <div className="text-xs">
                        {formatDistanceToNow(new Date(message.fecha), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-foreground leading-relaxed">
                    {message.contenido}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No hay mensajes
              </h3>
              <p className="text-muted-foreground">
                Envía tu primer mensaje para comenzar la conversación
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;