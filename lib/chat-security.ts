const MAX_TRACKED_CLIENTS = 5_000;
const CLIENT_LIMIT = 12;
const GLOBAL_LIMIT = 150;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1_000;

export const CHAT_LIMITS = {
  bodyBytes: 32_000,
  messages: 12,
  messageCharacters: 1_600,
  totalCharacters: 8_000,
  outputTokens: 500,
} as const;

export type SafeChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, RateLimitEntry>;

const rateLimitGlobal = globalThis as typeof globalThis & {
  chatRateLimitStore?: RateLimitStore;
};

const rateLimitStore =
  rateLimitGlobal.chatRateLimitStore ?? new Map<string, RateLimitEntry>();

rateLimitGlobal.chatRateLimitStore = rateLimitStore;

export type ChatValidationResult =
  | { ok: true; messages: SafeChatMessage[] }
  | { ok: false; error: string };

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
};

export function validateChatPayload(payload: unknown): ChatValidationResult {
  if (!isRecord(payload) || !Array.isArray(payload.messages)) {
    return { ok: false, error: "Formato de requisição inválido." };
  }

  if (payload.messages.length === 0 || payload.messages.length > CHAT_LIMITS.messages + 1) {
    return { ok: false, error: "Quantidade de mensagens inválida." };
  }

  const messages: SafeChatMessage[] = [];
  let totalCharacters = 0;

  for (let index = 0; index < payload.messages.length; index += 1) {
    const message = payload.messages[index];
    if (!isRecord(message)) {
      return { ok: false, error: "Mensagem inválida." };
    }

    if (index === 0 && message.id === "1" && message.role === "assistant") {
      continue;
    }

    if (message.role !== "user" && message.role !== "assistant") {
      return { ok: false, error: "Papel de mensagem não permitido." };
    }

    const content = extractTextContent(message, message.role);
    if (content === null) {
      return { ok: false, error: "Somente mensagens de texto são permitidas." };
    }

    const normalizedContent = content.trim();
    if (
      normalizedContent.length === 0 ||
      normalizedContent.length > CHAT_LIMITS.messageCharacters
    ) {
      return { ok: false, error: "Tamanho de mensagem inválido." };
    }

    totalCharacters += normalizedContent.length;
    if (totalCharacters > CHAT_LIMITS.totalCharacters) {
      return { ok: false, error: "A conversa excede o tamanho permitido." };
    }

    const expectedRole = messages.length % 2 === 0 ? "user" : "assistant";
    if (message.role !== expectedRole) {
      return { ok: false, error: "Sequência de mensagens inválida." };
    }

    messages.push({ role: message.role, content: normalizedContent });
  }

  if (
    messages.length === 0 ||
    messages.length > CHAT_LIMITS.messages ||
    messages[messages.length - 1]?.role !== "user"
  ) {
    return { ok: false, error: "A conversa deve terminar com uma mensagem do usuário." };
  }

  return { ok: true, messages };
}

export function checkChatRateLimit(request: Request): RateLimitResult {
  const now = Date.now();
  pruneExpiredEntries(now);

  const clientKey = `client:${getClientIdentifier(request)}`;
  const clientResult = consumeRateLimit(clientKey, CLIENT_LIMIT, now);
  if (!clientResult.allowed) return clientResult;

  const globalResult = consumeRateLimit("global", GLOBAL_LIMIT, now);
  if (!globalResult.allowed) return globalResult;

  return clientResult;
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    if (originUrl.origin === requestUrl.origin) return true;

    const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));
    const host = forwardedHost ?? firstHeaderValue(request.headers.get("host"));
    const forwardedProtocol = firstHeaderValue(request.headers.get("x-forwarded-proto"));
    const protocol = forwardedProtocol ?? requestUrl.protocol.replace(":", "");
    if (!host || (protocol !== "http" && protocol !== "https")) return false;

    return originUrl.origin === new URL(`${protocol}://${host}`).origin;
  } catch {
    return false;
  }
}

function extractTextContent(
  message: Record<string, unknown>,
  role: "user" | "assistant",
): string | null {
  if (Array.isArray(message.parts)) {
    if (message.parts.length === 0 || message.parts.length > 32) return null;

    const textParts: string[] = [];
    for (const part of message.parts) {
      if (!isRecord(part) || typeof part.type !== "string") return null;

      if (part.type === "text" && typeof part.text === "string") {
        textParts.push(part.text);
        continue;
      }

      // The AI SDK adds internal parts such as `step-start` to assistant
      // messages. They are not model context and can be ignored safely.
      if (role === "assistant") continue;

      return null;
    }
    return textParts.length > 0 ? textParts.join("\n") : null;
  }

  return typeof message.content === "string" ? message.content : null;
}

function consumeRateLimit(key: string, limit: number, now: number): RateLimitResult {
  const existing = rateLimitStore.get(key);
  const entry =
    !existing || existing.resetAt <= now
      ? { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS }
      : existing;

  if (!existing && rateLimitStore.size >= MAX_TRACKED_CLIENTS) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfterSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1_000),
    };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1_000)),
    };
  }

  entry.count += 1;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - entry.count),
    retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1_000)),
  };
}

function pruneExpiredEntries(now: number): void {
  if (rateLimitStore.size < MAX_TRACKED_CLIENTS / 2) return;

  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) rateLimitStore.delete(key);
  }
}

function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const candidate =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    forwarded ??
    "unknown";

  return candidate.slice(0, 64);
}

function firstHeaderValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() || null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
