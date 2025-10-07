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
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "./firebase";

// -----------------------------
// Tipos (se mantienen en español)
// -----------------------------
export type TipoInversor = "Conservador" | "Moderado" | "Agresivo";

export interface Broker {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  empresa?: string; // se guarda en notes del broker si querés persistirla
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
  fecha: string; // ISO
  remitente: "cliente" | "asesora";
  estado: "pendiente" | "respondido" | "en_revision" | "enviado";
  leido: boolean;
  archivo?: Archivo;
}

export interface Report {
  id: string;
  clienteId: string;
  nombre: string;
  fecha: string; // ISO
  archivo: Archivo;
  descripcion?: string;
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
  brokerId?: string | null;    // mapeado desde 'broker' (texto) si existiera coincidencia
  broker?: Broker | null;
}

// -----------------------------
// Helpers
// -----------------------------
const toDate = (value: unknown): Date => {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
};

const toISO = (value: unknown): string => toDate(value).toISOString();

const parseString = (value: unknown): string =>
  typeof value === "string" ? value : "";

const parseOptionalString = (value: unknown): string | undefined => {
  const v = parseString(value).trim();
  return v ? v : undefined;
};

const parseTipoInversor = (value: unknown): TipoInversor => {
  if (value === "Conservador" || value === "Moderado" || value === "Agresivo") return value;
  return "Moderado";
};

const parseEstadoMensaje = (value: unknown): Message["estado"] => {
  const allowed = new Set(["pendiente", "respondido", "en_revision", "enviado"]);
  const v = parseString(value);
  return (allowed.has(v) ? (v as Message["estado"]) : "enviado");
};

const normalizeNotes = (value: unknown): Array<{ text: string; date: string }> => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((n) => n && typeof n === "object")
    .map((n) => {
      const r = n as { text?: unknown; date?: unknown };
      return {
        text: parseString(r.text),
        date: typeof r.date === "string" ? r.date : toISO(r.date),
      };
    });
};

const guessNameParts = (user: FirebaseAuthUser) => {
  const displayName = user.displayName ?? "";
  const parts = displayName.split(" ").map((p) => p.trim()).filter(Boolean);
  const firstName = parts[0] ?? (user.email ? user.email.split("@")[0] : "");
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
};

// -----------------------------
// Colecciones (canónicas del store de referencia)
// -----------------------------
const clientsCol = collection(db, "clients");
const brokersCol = collection(db, "brokers");
const messagesCol = collection(db, "messages");
const reportsCol = collection(db, "reports");

// -----------------------------
// Brokers
// -----------------------------
const buildBrokerFromSnapshot = (snap: DocumentSnapshot<DocumentData>): Broker => {
  const data = snap.data() ?? {};
  return {
    id: snap.id,
    nombre: parseString(data.name) || "Bróker",
    email: parseOptionalString(data.email),
    telefono: parseOptionalString(data.phone),
    empresa: parseOptionalString(data.notes), // opcional: usamos 'notes' para empresa
  };
};

export const getBrokerById = async (brokerId: string): Promise<Broker | null> => {
  if (!brokerId) return null;
  const ref = doc(brokersCol, brokerId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return buildBrokerFromSnapshot(snap);
};

// Busca o crea broker por nombre (para mantener consistencia como en el store)
const ensureBrokerExistsByName = async (nameRaw: string): Promise<string | null> => {
  const name = nameRaw.trim();
  if (!name) return null;

  // cache por consulta directa
  const q = query(brokersCol, where("name", "==", name));
  const s = await getDocs(q);
  if (!s.empty) return s.docs[0].id;

  const docRef = await addDoc(brokersCol, { name });
  return docRef.id;
};

// -----------------------------
// Clients
// -----------------------------
const mapClientSnapshot = async (snap: DocumentSnapshot<DocumentData>): Promise<ClienteProfile> => {
  const data = snap.data() ?? {};
  const brokerName = parseString(data.broker); // en esquema canónico broker es string (nombre)
  let brokerId: string | null = null;
  let broker: Broker | null = null;

  if (brokerName) {
    // intentamos resolver a un broker real por nombre
    const q = query(brokersCol, where("name", "==", brokerName));
    const r = await getDocs(q);
    if (!r.empty) {
      brokerId = r.docs[0].id;
      broker = buildBrokerFromSnapshot(r.docs[0]);
    }
  }

  return {
    id: snap.id,
    nombre: parseString(data.firstName),
    apellido: parseString(data.lastName),
    email: parseString(data.email),
    telefono: parseString(data.phone),
    tipoInversor: parseTipoInversor(data.investorProfile),
    objetivos: parseString(data.objectives),
    horizonte: parseString(data.investmentHorizon),
    brokerId,
    broker,
  };
};

export const ensureClientProfile = async (firebaseUser: FirebaseAuthUser): Promise<ClienteProfile> => {
  const clientRef = doc(clientsCol, firebaseUser.uid);
  const snap = await getDoc(clientRef);

  if (!snap.exists()) {
    const { firstName, lastName } = guessNameParts(firebaseUser);

    const newDoc = {
      firstName,
      lastName,
      email: firebaseUser.email ?? "",
      phone: firebaseUser.phoneNumber ?? "",
      investorProfile: "Moderado",
      objectives: "",
      investmentHorizon: "",
      broker: "", // nombre, opcional
      notes: [],
      lastContact: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(clientRef, newDoc);
    return {
      id: firebaseUser.uid,
      nombre: firstName,
      apellido: lastName,
      email: newDoc.email,
      telefono: newDoc.phone,
      tipoInversor: "Moderado",
      objetivos: "",
      horizonte: "",
      brokerId: null,
      broker: null,
    };
  }

  // si existe, mapeamos y completamos faltantes
  const profile = await mapClientSnapshot(snap);
  const updates: Record<string, unknown> = {};

  if (!profile.nombre) {
    const { firstName } = guessNameParts(firebaseUser);
    profile.nombre = firstName;
    if (firstName) updates.firstName = firstName;
  }
  if (!profile.apellido) {
    const { lastName } = guessNameParts(firebaseUser);
    profile.apellido = lastName;
    if (lastName) updates.lastName = lastName;
  }
  if (!profile.email && firebaseUser.email) {
    profile.email = firebaseUser.email;
    updates.email = firebaseUser.email;
  }
  if (!profile.telefono && firebaseUser.phoneNumber) {
    profile.telefono = firebaseUser.phoneNumber;
    updates.phone = firebaseUser.phoneNumber;
  }

  if (Object.keys(updates).length > 0) {
    updates.updatedAt = serverTimestamp();
    await setDoc(clientRef, updates, { merge: true });
  }

  return profile;
};

// -----------------------------
// Messages (adaptador a esquema canónico)
// -----------------------------
const parseArchivo = (value: unknown): Archivo | null => {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const nombre = parseString(raw.nombre) || "Documento";
  const url = parseString(raw.url);
  const archivo: Archivo = { nombre, url };

  const id = parseOptionalString(raw.id); if (id) archivo.id = id;
  const tipo = parseOptionalString(raw.tipo); if (tipo) archivo.tipo = tipo;
  const comentario = parseOptionalString(raw.comentario); if (comentario) archivo.comentario = comentario;
  const tamaño = parseOptionalString(raw.tamaño); if (tamaño) archivo.tamaño = tamaño;
  const fechaSubida = parseOptionalString(raw.fechaSubida); if (fechaSubida) archivo.fechaSubida = fechaSubida;

  return archivo;
};

const parseArchivoFlexible = (value: unknown, fallbackName = "Informe"): Archivo | null => {
  const parsed = parseArchivo(value);
  if (parsed && parsed.url) {
    if (!parsed.nombre) parsed.nombre = fallbackName;
    return parsed;
  }

  if (typeof value === "string") {
    const url = parseString(value);
    if (!url) return null;
    return { nombre: fallbackName, url };
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const urlCandidate =
    parseOptionalString(raw.url) ??
    parseOptionalString(raw.link) ??
    parseOptionalString(raw.fileUrl) ??
    parseOptionalString(raw.downloadUrl) ??
    parseOptionalString(raw.urlDescarga);

  if (!urlCandidate) {
    return null;
  }

  const archivo: Archivo = {
    nombre:
      parseOptionalString(raw.nombre) ??
      parseOptionalString(raw.name) ??
      parseOptionalString(raw.title) ??
      parseOptionalString(raw.fileName) ??
      fallbackName,
    url: urlCandidate,
  };

  const tipo = parseOptionalString(raw.tipo) ?? parseOptionalString(raw.type);
  if (tipo) archivo.tipo = tipo;

  const comentario =
    parseOptionalString(raw.comentario) ??
    parseOptionalString(raw.descripcion) ??
    parseOptionalString(raw.description);
  if (comentario) archivo.comentario = comentario;

  const tamaño =
    parseOptionalString(raw.tamaño) ??
    parseOptionalString(raw.size) ??
    parseOptionalString(raw.fileSize);
  if (tamaño) archivo.tamaño = tamaño;

  const fechaSubida =
    parseOptionalString(raw.fechaSubida) ??
    parseOptionalString(raw.uploadedAt) ??
    parseOptionalString(raw.updatedAt);
  if (fechaSubida) archivo.fechaSubida = fechaSubida;

  return archivo;
};

const buildArchivoFromFields = (
  fallbackName: string,
  url?: string,
  extra?: Record<string, unknown>,
): Archivo | null => {
  const link = parseOptionalString(url);
  if (!link) return null;

  const archivo: Archivo = {
    nombre: fallbackName || "Informe",
    url: link,
  };

  if (extra) {
    const tipo = parseOptionalString(extra.tipo) ?? parseOptionalString(extra.type);
    if (tipo) archivo.tipo = tipo;
    const comentario =
      parseOptionalString(extra.comentario) ??
      parseOptionalString(extra.descripcion) ??
      parseOptionalString(extra.description);
    if (comentario) archivo.comentario = comentario;
    const tamaño =
      parseOptionalString(extra.tamaño) ??
      parseOptionalString(extra.size) ??
      parseOptionalString(extra.fileSize);
    if (tamaño) archivo.tamaño = tamaño;
    const fechaSubida =
      parseOptionalString(extra.fechaSubida) ??
      parseOptionalString(extra.uploadedAt) ??
      parseOptionalString(extra.updatedAt);
    if (fechaSubida) archivo.fechaSubida = fechaSubida;
  }

  return archivo;
};

const mapReportSnapshot = (
  snapshot: QueryDocumentSnapshot<DocumentData>,
): Report | null => {
  const data = snapshot.data();
  const clientId = parseString(data.clientId ?? data.clienteId);
  if (!clientId) return null;

  const nombreRaw =
    parseString(data.nombre ?? data.name ?? data.title ?? data.reportName ?? "") ||
    parseString((data.archivo as Record<string, unknown> | undefined)?.nombre ?? "");
  const nombre = nombreRaw || "Informe";

  const archivo =
    parseArchivoFlexible(data.archivo, nombre) ??
    parseArchivoFlexible(data.file, nombre) ??
    parseArchivoFlexible(data.documento, nombre) ??
    buildArchivoFromFields(
      nombre,
      parseOptionalString(data.url) ??
        parseOptionalString(data.fileUrl) ??
        parseOptionalString(data.downloadUrl) ??
        parseOptionalString(data.link) ??
        undefined,
      typeof data.file === "object" && data.file
        ? (data.file as Record<string, unknown>)
        : undefined,
    );

  if (!archivo || !archivo.url) {
    return null;
  }

  const fechaRaw =
    data.fecha ??
    data.date ??
    data.reportDate ??
    data.periodo ??
    data.period ??
    data.uploadedAt ??
    data.createdAt ??
    data.updatedAt ??
    data.timestamp ??
    (snapshot as unknown as { createTime?: Timestamp }).createTime ??
    (snapshot as unknown as { updateTime?: Timestamp }).updateTime;

  const fecha = toISO(fechaRaw);

  const descripcion =
    parseOptionalString(data.descripcion) ??
    parseOptionalString(data.description) ??
    parseOptionalString((data.archivo as Record<string, unknown> | undefined)?.descripcion);

  return {
    id: snapshot.id,
    clienteId: clientId,
    nombre,
    fecha,
    archivo,
    ...(descripcion ? { descripcion } : {}),
  };
};

export const subscribeToClientReports = (
  clienteId: string,
  onData: (reports: Report[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe => {
  if (!clienteId) {
    onData([]);
    return () => undefined;
  }

  const qy = query(reportsCol, where("clientId", "==", clienteId));

  return onSnapshot(
    qy,
    (snapshot) => {
      const reports = snapshot.docs
        .map(mapReportSnapshot)
        .filter((report): report is Report => report !== null)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      onData(reports);
    },
    onError,
  );
};

// Convierte documento del esquema canónico -> tipo Message (español)
const mapMessageSnapshot = (
  snapshot: QueryDocumentSnapshot<DocumentData>,
): Message | null => {
  const data = snapshot.data();
  const clientId = parseString(data.clientId);
  if (!clientId) return null;

  // timestamp canónico -> fecha ISO
  const fecha = toISO(data.timestamp);

  // isFromAdvisor:boolean -> remitente
  const remitente: Message["remitente"] = data.isFromAdvisor ? "asesora" : "cliente";

  // status canónico (usamos tus valores)
  const estado = parseEstadoMensaje(data.status);

  // archivo opcional (si lo guardás colgando del mensaje)
  const archivo = parseArchivo(data.archivo);

  return {
    id: snapshot.id,
    clienteId: clientId,
    contenido: parseString(data.content),
    fecha,
    remitente,
    estado,
    leido: Boolean(data.read),
    ...(archivo ? { archivo } : {}),
  };
};

// Suscripción a mensajes de un cliente (colección canónica 'messages')
export const subscribeToClientMessages = (
  clienteId: string,
  onData: (messages: Message[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe => {
  const qy = query(
    messagesCol,
    where("clientId", "==", clienteId),
    orderBy("timestamp", "asc"),
  );

  return onSnapshot(
    qy,
    (snapshot) => {
      const messages = snapshot.docs
        .map(mapMessageSnapshot)
        .filter((m): m is Message => m !== null)
        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
      onData(messages);
    },
    onError,
  );
};

// Enviar mensaje como CLIENTE (remitente = "cliente")
export const sendClientMessage = async (clienteId: string, contenido: string): Promise<void> => {
  const text = contenido.trim();
  if (!text) return;

  await addDoc(messagesCol, {
    clientId: clienteId,
    content: text,
    isFromAdvisor: false,
    status: "enviado",
    read: false, // el asesor no lo leyó aún
    timestamp: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // actualizamos lastContact del cliente (igual que el store)
  const clientRef = doc(clientsCol, clienteId);
  await updateDoc(clientRef, { lastContact: serverTimestamp() });
};

// Marcar mensajes como leídos (set read=true)
export const markMessagesAsRead = async (messageIds: string[]): Promise<void> => {
  if (!messageIds.length) return;
  const batch = writeBatch(db);
  messageIds.forEach((id) => {
    const ref = doc(messagesCol, id);
    batch.update(ref, { read: true, updatedAt: serverTimestamp() });
  });
  await batch.commit();
};

// Contador de no leídos del remitente "asesora" (isFromAdvisor = true)
export const subscribeToUnreadMessagesCount = (
  clienteId: string,
  onData: (count: number) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe => {
  const qy = query(
    messagesCol,
    where("clientId", "==", clienteId),
    where("isFromAdvisor", "==", true),
    where("read", "==", false),
  );

  return onSnapshot(
    qy,
    (snapshot) => onData(snapshot.size),
    onError,
  );
};

// -----------------------------
// Utilidades para crear/actualizar cliente con esquema canónico
// -----------------------------
export const upsertClienteCanonic = async (cliente: {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  tipoInversor: TipoInversor;
  objetivos: string;
  horizonte: string;
  brokerNombre?: string; // se guarda como 'broker' (texto)
  notes?: Array<{ text: string; date?: string | Date }>;
}) => {
  if (!cliente.id) return;

  if (cliente.brokerNombre) {
    // opcional: nos aseguramos que exista un broker con ese nombre (como en tu store)
    await ensureBrokerExistsByName(cliente.brokerNombre);
  }

  const ref = doc(clientsCol, cliente.id);
  await setDoc(
    ref,
    {
      firstName: cliente.nombre,
      lastName: cliente.apellido,
      email: cliente.email,
      phone: cliente.telefono,
      investorProfile: cliente.tipoInversor,
      objectives: cliente.objetivos,
      investmentHorizon: cliente.horizonte,
      broker: cliente.brokerNombre ?? "",
      notes:
        (cliente.notes ?? []).map((n) => ({
          text: n.text ?? "",
          date:
            typeof n.date === "string"
              ? n.date
              : n.date instanceof Date
              ? n.date.toISOString()
              : new Date().toISOString(),
        })) ?? [],
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};
