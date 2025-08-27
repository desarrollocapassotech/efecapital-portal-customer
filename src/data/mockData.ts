export interface Message {
  id: string;
  fecha: string;
  contenido: string;
  remitente: 'cliente' | 'asesora';
  estado: 'pendiente' | 'respondido' | 'en_revision'| 'enviado';
  leido: boolean;
  archivo?: Archivo;
}

export interface Archivo {
  id: string;
  nombre: string;
  tipo: 'rendimiento' | 'recomendaciones' | 'mercado';
  fechaSubida: string;
  comentario: string;
  tamaño: string;
  url: string;
}

export interface Notificacion {
  id: string;
  tipo: 'archivo' | 'mensaje' | 'general';
  titulo: string;
  descripcion: string;
  fecha: string;
  leida: boolean;
}

export interface ActividadHistorial {
  id: string;
  tipo: 'archivo' | 'mensaje_enviado' | 'mensaje_recibido' | 'ingreso_capital';
  titulo: string;
  descripcion: string;
  fecha: string;
}

// Mock data for user 1 (María González)
export const mockDataUser1 = {
  mensajes: [
    {
      id: '1',
      fecha: '2024-01-18T10:30:00Z',
      contenido: 'Hola Laura, ¿podrías revisar mi cartera actual? He tenido algunas dudas sobre la diversificación.',
      remitente: 'cliente' as const,
      estado: 'respondido' as const,
      leido: true
    },
    {
      id: '2',
      fecha: '2024-01-18T14:15:00Z',
      contenido: 'Hola María, por supuesto. He revisado tu cartera y está bien balanceada para tu perfil moderado. Te envío un informe detallado.',
      remitente: 'asesora' as const,
      estado: 'respondido' as const,
      leido: false,
      archivo: { // ← Mensaje con archivo adjunto
      nombre: 'Informe_Cartera_Maria.pdf',
      url: '/uploads/informe_cartera_maría.pdf'
    }
    },
    {
      id: '3',
      fecha: '2024-01-17T09:00:00Z',
      contenido: 'Tengo disponibles $50,000 adicionales para invertir. ¿Cuál sería tu recomendación?',
      remitente: 'cliente' as const,
      estado: 'pendiente' as const,
      leido: true
    }
  ] as Message[],

  archivos: [
    {
      id: '1',
      nombre: 'Informe_Rendimiento_Enero_2024.pdf',
      tipo: 'rendimiento' as const,
      fechaSubida: '2024-01-18T15:00:00Z',
      comentario: 'Análisis completo del rendimiento de tu cartera durante enero.',
      tamaño: '2.3 MB'
    },
    {
      id: '2',
      nombre: 'Recomendaciones_Diversificacion.pdf',
      tipo: 'recomendaciones' as const,
      fechaSubida: '2024-01-15T11:30:00Z',
      comentario: 'Estrategias para optimizar la diversificación según tu perfil.',
      tamaño: '1.8 MB'
    },
    {
      id: '3',
      nombre: 'Analisis_Mercado_Q1_2024.pdf',
      tipo: 'mercado' as const,
      fechaSubida: '2024-01-10T16:45:00Z',
      comentario: 'Perspectivas del mercado para el primer trimestre.',
      tamaño: '3.1 MB'
    }
  ] as Archivo[],

  notificaciones: [
    {
      id: '1',
      tipo: 'archivo' as const,
      titulo: 'Nuevo informe disponible',
      descripcion: 'Se ha subido tu informe de rendimiento mensual',
      fecha: '2024-01-18T15:00:00Z',
      leida: false
    },
    {
      id: '2',
      tipo: 'mensaje' as const,
      titulo: 'Respuesta recibida',
      descripcion: 'Laura respondió a tu consulta sobre diversificación',
      fecha: '2024-01-18T14:15:00Z',
      leida: true
    }
  ] as Notificacion[],

  historial: [
    {
      id: '1',
      tipo: 'archivo' as const,
      titulo: 'Informe de rendimiento',
      descripcion: 'Nuevo informe subido: Informe_Rendimiento_Enero_2024.pdf',
      fecha: '2024-01-18T15:00:00Z'
    },
    {
      id: '2',
      tipo: 'mensaje_recibido' as const,
      titulo: 'Mensaje de asesora',
      descripcion: 'Laura respondió sobre diversificación de cartera',
      fecha: '2024-01-18T14:15:00Z'
    },
    {
      id: '3',
      tipo: 'mensaje_enviado' as const,
      titulo: 'Consulta enviada',
      descripcion: 'Pregunta sobre diversificación de cartera',
      fecha: '2024-01-18T10:30:00Z'
    },
    {
      id: '4',
      tipo: 'ingreso_capital' as const,
      titulo: 'Declaración de capital',
      descripcion: 'Declaraste $50,000 disponibles para inversión',
      fecha: '2024-01-17T09:00:00Z'
    }
  ] as ActividadHistorial[]
};

// Mock data for other users (similar structure)
export const mockDataUser2 = {
  mensajes: [
    {
      id: '1',
      fecha: '2024-01-18T08:45:00Z',
      contenido: 'Buenos días Laura, quiero aumentar mi exposición a acciones tech. ¿Qué opinas?',
      remitente: 'cliente' as const,
      estado: 'en_revision' as const
    }
  ] as Message[],
  archivos: [] as Archivo[],
  notificaciones: [] as Notificacion[],
  historial: [] as ActividadHistorial[]
};

export const mockDataUser3 = {
  mensajes: [
    {
      id: '1',
      fecha: '2024-01-17T16:20:00Z',
      contenido: 'Hola, me gustaría revisar las opciones de bonos para 2024.',
      remitente: 'cliente' as const,
      estado: 'respondido' as const
    }
  ] as Message[],
  archivos: [] as Archivo[],
  notificaciones: [] as Notificacion[],
  historial: [] as ActividadHistorial[]
};

export const getMockDataForUser = (userId: string) => {
  switch (userId) {
    case '1':
      return mockDataUser1;
    case '2':
      return mockDataUser2;
    case '3':
      return mockDataUser3;
    default:
      return mockDataUser1;
  }
};