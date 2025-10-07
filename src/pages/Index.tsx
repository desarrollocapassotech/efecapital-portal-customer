import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

type AttachmentPreview = {
  id: string;
  name: string;
  size: string;
  type: string;
  previewUrl?: string;
};

type Message = {
  id: string;
  sender: "customer" | "advisor";
  text?: string;
  timestamp: string;
  attachments?: AttachmentPreview[];
};

const generateId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const formatFileSize = (bytes: number) => {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size < 10 && unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
};

const formatTimestamp = (isoDate: string) =>
  new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));

const initialMessages: Message[] = [
  {
    id: generateId(),
    sender: "advisor",
    text: "¡Hola! Soy Sofía, tu asesora financiera. Comparte tus dudas o documentos y revisamos juntas la mejor opción.",
    timestamp: new Date().toISOString(),
  },
  {
    id: generateId(),
    sender: "customer",
    text: "Hola Sofía, necesito actualizar mi documentación para la solicitud.",
    timestamp: new Date().toISOString(),
  },
];

const Index = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [composerValue, setComposerValue] = useState("");
  const [composerAttachments, setComposerAttachments] = useState<AttachmentPreview[]>([]);
  const [userTyping, setUserTyping] = useState(false);
  const [advisorTyping, setAdvisorTyping] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advisorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (advisorTimeoutRef.current) {
        clearTimeout(advisorTimeoutRef.current);
      }

      previewUrlsRef.current.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (!statusMessage) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setStatusMessage("");
    }, 3200);

    return () => clearTimeout(timeout);
  }, [statusMessage]);

  const canSend = useMemo(
    () => composerValue.trim().length > 0 || composerAttachments.length > 0,
    [composerValue, composerAttachments],
  );

  const triggerTypingIndicator = () => {
    setUserTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setUserTyping(false);
    }, 1500);
  };

  const handleComposerChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setComposerValue(event.target.value);
    triggerTypingIndicator();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;

    if (!files) {
      return;
    }

    const selected = Array.from(files).map<AttachmentPreview>((file) => {
      const hasPreview = file.type.startsWith("image/") || file.type === "application/pdf";
      const previewUrl = hasPreview ? URL.createObjectURL(file) : undefined;

      if (previewUrl) {
        previewUrlsRef.current.push(previewUrl);
      }

      return {
        id: `${generateId()}-${file.lastModified}`,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        previewUrl,
      };
    });

    setComposerAttachments((prev) => [...prev, ...selected]);
    triggerTypingIndicator();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAttachmentRemove = (attachmentId: string) => {
    setComposerAttachments((prev) => {
      const toRemove = prev.find((attachment) => attachment.id === attachmentId);

      if (toRemove?.previewUrl) {
        URL.revokeObjectURL(toRemove.previewUrl);
        previewUrlsRef.current = previewUrlsRef.current.filter((url) => url !== toRemove.previewUrl);
      }

      return prev.filter((attachment) => attachment.id !== attachmentId);
    });

    triggerTypingIndicator();
  };

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSend) {
      return;
    }

    const attachmentPayload = composerAttachments.map((attachment) => ({ ...attachment }));
    const trimmedMessage = composerValue.trim();

    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        sender: "customer",
        text: trimmedMessage || undefined,
        attachments: attachmentPayload,
        timestamp: new Date().toISOString(),
      },
    ]);

    setComposerValue("");
    setComposerAttachments([]);
    setStatusMessage("Mensaje enviado a la asesora.");
    setUserTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setAdvisorTyping(true);

    if (advisorTimeoutRef.current) {
      clearTimeout(advisorTimeoutRef.current);
    }

    advisorTimeoutRef.current = setTimeout(() => {
      setAdvisorTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          sender: "advisor",
          text: "Recibido. Revisaré la documentación y te confirmo en breve.",
          timestamp: new Date().toISOString(),
        },
      ]);
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-2xl bg-white p-6 shadow-lg">
        <header className="flex flex-col gap-1 border-b border-slate-200 pb-4">
          <p className="text-sm font-medium text-sky-600">Asesora asignada</p>
          <h1 className="text-2xl font-semibold text-slate-900">Conversación con Sofía Moreno</h1>
          <p className="text-sm text-slate-500">
            Comparte mensajes, imágenes o PDFs directamente desde este panel. Todo el historial queda guardado
            para que la asesoría continúe sin interrupciones.
          </p>
        </header>

        <div className="flex flex-1 flex-col gap-4">
          <div className="relative flex-1 space-y-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-4 overflow-y-auto pr-2" role="log" aria-live="polite">
              {messages.map((message) => {
                const isCustomer = message.sender === "customer";

                return (
                  <article
                    key={message.id}
                    className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}
                    aria-label={
                      isCustomer ? "Mensaje enviado por la clienta" : "Mensaje enviado por la asesora"
                    }
                  >
                    <div
                      className={`max-w-xl rounded-2xl px-4 py-3 text-sm shadow-sm transition-colors ${
                        isCustomer
                          ? "bg-sky-600 text-white"
                          : "bg-white text-slate-900 ring-1 ring-inset ring-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold">
                          {isCustomer ? "Tú" : "Sofía"}
                        </p>
                        <span className="text-xs opacity-75">{formatTimestamp(message.timestamp)}</span>
                      </div>
                      {message.text && <p className="mt-2 whitespace-pre-wrap leading-relaxed">{message.text}</p>}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-3">
                          {message.attachments.map((attachment) => {
                            const isImage = attachment.type.startsWith("image/");
                            const isPdf = attachment.type === "application/pdf";

                            return (
                              <figure
                                key={attachment.id}
                                className={`overflow-hidden rounded-xl border text-left ${
                                  isCustomer
                                    ? "border-sky-500/30 bg-white/10"
                                    : "border-slate-200 bg-slate-50"
                                }`}
                              >
                                {isImage && attachment.previewUrl ? (
                                  <img
                                    src={attachment.previewUrl}
                                    alt={attachment.name}
                                    className="h-32 w-40 object-cover"
                                  />
                                ) : null}
                                {isPdf && attachment.previewUrl ? (
                                  <object
                                    data={attachment.previewUrl}
                                    type="application/pdf"
                                    className="h-32 w-40"
                                    aria-label={`Vista previa del archivo ${attachment.name}`}
                                  />
                                ) : null}
                                {!isImage && !isPdf && (
                                  <div className="flex h-32 w-40 flex-col items-start justify-center gap-2 p-4 text-xs">
                                    <span className="font-medium">{attachment.name}</span>
                                    <span className="text-slate-500">{attachment.size}</span>
                                  </div>
                                )}
                                <figcaption className="flex items-center justify-between gap-2 border-t border-white/10 bg-slate-900/80 px-3 py-2 text-[11px] uppercase tracking-wide text-white">
                                  <span className="line-clamp-1 font-semibold">{attachment.name}</span>
                                  <span>{attachment.size}</span>
                                </figcaption>
                              </figure>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
              {advisorTyping && (
                <div className="flex items-center gap-2 text-sm text-slate-500" aria-live="polite">
                  <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />
                  Sofía está escribiendo…
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <label htmlFor="message" className="text-sm font-semibold text-slate-700">
                Redacta tu mensaje
              </label>
              {userTyping && (
                <span className="flex items-center gap-2 text-xs text-slate-500" aria-live="polite">
                  <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-sky-500" aria-hidden="true" />
                  Estás escribiendo…
                </span>
              )}
            </div>
            <textarea
              id="message"
              name="message"
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              placeholder="Escribe el mensaje para tu asesora…"
              value={composerValue}
              onChange={handleComposerChange}
              onFocus={triggerTypingIndicator}
            />

            {composerAttachments.length > 0 && (
              <div className="flex flex-wrap gap-3" aria-label="Archivos adjuntos">
                {composerAttachments.map((attachment) => {
                  const isImage = attachment.type.startsWith("image/");
                  const isPdf = attachment.type === "application/pdf";

                  return (
                    <div
                      key={attachment.id}
                      className="group relative flex h-32 w-40 flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                    >
                      {isImage && attachment.previewUrl ? (
                        <img src={attachment.previewUrl} alt={attachment.name} className="h-full w-full object-cover" />
                      ) : null}
                      {isPdf && attachment.previewUrl ? (
                        <object
                          data={attachment.previewUrl}
                          type="application/pdf"
                          className="h-full w-full"
                          aria-label={`Vista previa del archivo ${attachment.name}`}
                        />
                      ) : null}
                      {!isImage && !isPdf && (
                        <div className="flex flex-1 flex-col justify-center gap-1 p-4 text-xs text-slate-600">
                          <span className="font-medium text-slate-900">{attachment.name}</span>
                          <span>{attachment.size}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleAttachmentRemove(attachment.id)}
                        aria-label={`Quitar ${attachment.name}`}
                        className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-slate-900/80 px-3 py-1 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        Quitar
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="attachments"
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-sky-400 hover:text-sky-600"
                >
                  <span aria-hidden="true">📎</span>
                  Adjuntar archivos
                </label>
                <input
                  ref={fileInputRef}
                  id="attachments"
                  name="attachments"
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-slate-500">Se admiten imágenes y PDFs.</p>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={!canSend}
              >
                Enviar
              </button>
            </div>

            <div className="sr-only" aria-live="assertive" aria-atomic="true">
              {statusMessage}
            </div>
            {statusMessage && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 shadow-sm"
              >
                <span aria-hidden="true">✅</span>
                {statusMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Index;
