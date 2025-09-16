import { User as FirebaseAuthUser } from "firebase/auth";
import {
  type DocumentData,
  type DocumentSnapshot,
  type FirestoreError,
  type QueryDocumentSnapshot,
  type Unsubscribe,
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "./firebase";

export type TipoInversor = "conservador" | "moderado" | "agresivo";

export interface Broker {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  empresa?: string;
}

export interface Archivo {
  id?: string;
  nombre: string;
  url: string;
  tipo?: string;
  comentario?: string;
  tamaño?: string;
  fechaSubida?: string;
}

export interface Message {
  id: string;
  clienteId: string;
  contenido: string;
  fecha: string;
  remitente: "cliente" | "asesora";
  estado: "pendiente" | "respondido" | "en_revision" | "enviado";
  leido: boolean;
  archivo?: Archivo;
}

export interface ClienteProfile {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  tipoInversor: TipoInversor;
  objetivos: string;
  horizonte: string;
  brokerId?: string | null;
  broker?: Broker | null;
}

const clientesCollection = collection(db, "clientes");
const brokersCollection = collection(db, "brokers");
const mensajesCollection = collection(db, "mensajes");

const parseString = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }
  return "";
};

const parseOptionalString = (value: unknown): string | undefined => {
  const parsed = parseString(value).trim();
  return parsed ? parsed : undefined;
};

const parseTipoInversor = (value: unknown): TipoInversor => {
  if (value === "conservador" || value === "moderado" || value === "agresivo") {
    return value;
  }
  return "moderado";
};

const parseEstadoMensaje = (
  value: unknown,
): Message["estado"] => {
  if (
    value === "pendiente" ||
    value === "respondido" ||
    value === "en_revision" ||
    value === "enviado"
  ) {
    return value;
  }
  return "enviado";
};

const buildBroker = (snapshot: DocumentSnapshot<DocumentData>): Broker => {
  const data = snapshot.data() ?? {};

  return {
    id: snapshot.id,
    nombre: parseString(data.nombre) || "Bróker",
    email: parseOptionalString(data.email),
    telefono: parseOptionalString(data.telefono),
    empresa: parseOptionalString(data.empresa),
  };
};

export const getBrokerById = async (brokerId: string): Promise<Broker | null> => {
  if (!brokerId) {
    return null;
  }

  const brokerRef = doc(brokersCollection, brokerId);
  const snapshot = await getDoc(brokerRef);

  if (!snapshot.exists()) {
    return null;
  }

  return buildBroker(snapshot);
};

const parseArchivo = (value: unknown): Archivo | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const nombre = parseString(raw.nombre) || "Documento";
  const url = parseString(raw.url);

  const archivo: Archivo = {
    nombre,
    url,
  };

  const id = parseOptionalString(raw.id);
  if (id) {
    archivo.id = id;
  }

  const tipo = parseOptionalString(raw.tipo);
  if (tipo) {
    archivo.tipo = tipo;
  }

  const comentario = parseOptionalString(raw.comentario);
  if (comentario) {
    archivo.comentario = comentario;
  }

  const tamaño = parseOptionalString(raw.tamaño);
  if (tamaño) {
    archivo.tamaño = tamaño;
  }

  const fechaSubida = parseOptionalString(raw.fechaSubida);
  if (fechaSubida) {
    archivo.fechaSubida = fechaSubida;
  }

  return archivo;
};

const mapClienteSnapshot = async (
  snapshot: DocumentSnapshot<DocumentData>,
): Promise<ClienteProfile> => {
  const data = snapshot.data() ?? {};
  const brokerIdRaw = parseString(data.brokerId);
  const brokerId = brokerIdRaw ? brokerIdRaw : null;
  const broker = brokerId ? await getBrokerById(brokerId) : null;

  return {
    id: snapshot.id,
    nombre: parseString(data.nombre),
    apellido: parseString(data.apellido),
    email: parseString(data.email),
    telefono: parseString(data.telefono),
    tipoInversor: parseTipoInversor(data.tipoInversor),
    objetivos: parseString(data.objetivos),
    horizonte: parseString(data.horizonte),
    brokerId,
    broker,
  };
};

const guessNameParts = (user: FirebaseAuthUser) => {
  const displayName = user.displayName ?? "";
  const parts = displayName
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  const firstName = parts[0] ?? (user.email ? user.email.split("@")[0] ?? "" : "");
  const lastName = parts.slice(1).join(" ") ?? "";

  return { firstName, lastName };
};

export const ensureClientProfile = async (
  firebaseUser: FirebaseAuthUser,
): Promise<ClienteProfile> => {
  const clientRef = doc(clientesCollection, firebaseUser.uid);
  const snapshot = await getDoc(clientRef);

  if (!snapshot.exists()) {
    const { firstName, lastName } = guessNameParts(firebaseUser);

    const newProfile: ClienteProfile = {
      id: firebaseUser.uid,
      nombre: firstName,
      apellido: lastName,
      email: firebaseUser.email ?? "",
      telefono: firebaseUser.phoneNumber ?? "",
      tipoInversor: "moderado",
      objetivos: "",
      horizonte: "",
      brokerId: null,
      broker: null,
    };

    await setDoc(clientRef, {
      nombre: newProfile.nombre,
      apellido: newProfile.apellido,
      email: newProfile.email,
      telefono: newProfile.telefono,
      tipoInversor: newProfile.tipoInversor,
      objetivos: newProfile.objetivos,
      horizonte: newProfile.horizonte,
      brokerId: newProfile.brokerId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return newProfile;
  }

  const profile = await mapClienteSnapshot(snapshot);
  const updates: Record<string, unknown> = {};

  if (!profile.nombre) {
    const { firstName } = guessNameParts(firebaseUser);
    profile.nombre = firstName;
    if (firstName) {
      updates.nombre = firstName;
    }
  }

  if (!profile.apellido) {
    const { lastName } = guessNameParts(firebaseUser);
    profile.apellido = lastName;
    if (lastName) {
      updates.apellido = lastName;
    }
  }

  if (!profile.email && firebaseUser.email) {
    profile.email = firebaseUser.email;
    updates.email = firebaseUser.email;
  }

  if (!profile.telefono && firebaseUser.phoneNumber) {
    profile.telefono = firebaseUser.phoneNumber;
    updates.telefono = firebaseUser.phoneNumber;
  }

  if (!snapshot.data()?.tipoInversor) {
    updates.tipoInversor = profile.tipoInversor;
  }

  if (Object.keys(updates).length > 0) {
    updates.updatedAt = serverTimestamp();
    await setDoc(clientRef, updates, { merge: true });
  }

  return profile;
};

const mapMessageSnapshot = (
  snapshot: QueryDocumentSnapshot<DocumentData>,
): Message | null => {
  const data = snapshot.data();
  const clienteId = parseString(data.clienteId);

  if (!clienteId) {
    return null;
  }

  const fechaValue = data.fecha;
  let fecha: string;

  if (fechaValue instanceof Timestamp) {
    fecha = fechaValue.toDate().toISOString();
  } else if (typeof fechaValue === "string") {
    fecha = new Date(fechaValue).toISOString();
  } else {
    fecha = new Date().toISOString();
  }

  const archivo = parseArchivo(data.archivo);

  return {
    id: snapshot.id,
    clienteId,
    contenido: parseString(data.contenido),
    fecha,
    remitente: data.remitente === "asesora" ? "asesora" : "cliente",
    estado: parseEstadoMensaje(data.estado),
    leido: Boolean(data.leido),
    ...(archivo ? { archivo } : {}),
  };
};

export const subscribeToClientMessages = (
  clienteId: string,
  onData: (messages: Message[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe => {
  const messagesQuery = query(
    mensajesCollection,
    where("clienteId", "==", clienteId),
    orderBy("fecha", "asc"),
  );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs
        .map(mapMessageSnapshot)
        .filter((message): message is Message => message !== null)
        .sort(
          (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
        );

      onData(messages);
    },
    onError,
  );
};

export const sendClientMessage = async (
  clienteId: string,
  contenido: string,
): Promise<void> => {
  const text = contenido.trim();

  if (!text) {
    return;
  }

  await addDoc(mensajesCollection, {
    clienteId,
    contenido: text,
    remitente: "cliente",
    estado: "enviado",
    leido: true,
    fecha: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const markMessagesAsRead = async (
  messageIds: string[],
): Promise<void> => {
  if (messageIds.length === 0) {
    return;
  }

  const batch = writeBatch(db);

  messageIds.forEach((messageId) => {
    const messageRef = doc(mensajesCollection, messageId);
    batch.update(messageRef, {
      leido: true,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
};

export const subscribeToUnreadMessagesCount = (
  clienteId: string,
  onData: (count: number) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe => {
  const unreadQuery = query(
    mensajesCollection,
    where("clienteId", "==", clienteId),
    where("remitente", "==", "asesora"),
    where("leido", "==", false),
  );

  return onSnapshot(
    unreadQuery,
    (snapshot) => {
      onData(snapshot.size);
    },
    onError,
  );
};
