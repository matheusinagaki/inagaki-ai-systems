import { createHash } from "node:crypto";
import { CHAT_GREETING } from "./chat-constants.ts";
import { safePublicProfileUrl } from "./chat-links.ts";

const MAX_TRACKED_CLIENTS = 5_000;
const CLIENT_LIMIT = 12;
const GLOBAL_LIMIT = 150;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1_000;
const SIGNATURE_PATTERN = /^[A-Za-z0-9_-]{43}$/;

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
  signature?: string;
  issuedAt?: number;
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
      const greeting = extractTextContent(message, "assistant")?.trim();
      if (greeting === CHAT_GREETING) continue;
      return { ok: false, error: "Mensagem inicial inválida." };
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

    if (message.role === "user" && isLikelyPromptInjection(normalizedContent)) {
      return { ok: false, error: "Não posso atender a esse tipo de solicitação." };
    }

    let signature: string | undefined;
    let issuedAt: number | undefined;
    if (message.role === "assistant") {
      const metadata = isRecord(message.metadata) ? message.metadata : null;
      signature = typeof metadata?.signature === "string" ? metadata.signature : undefined;
      issuedAt = typeof metadata?.issuedAt === "number" ? metadata.issuedAt : undefined;
      if (
        !signature ||
        !SIGNATURE_PATTERN.test(signature) ||
        !Number.isSafeInteger(issuedAt)
      ) {
        return { ok: false, error: "Histórico da conversa inválido." };
      }
    }

    messages.push({ role: message.role, content: normalizedContent, signature, issuedAt });
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

export async function checkChatRateLimit(request: Request): Promise<RateLimitResult> {
  const distributedConfig = getDistributedRateLimitConfig();
  if (distributedConfig) {
    return checkDistributedRateLimit(request, distributedConfig);
  }

  const now = Date.now();
  pruneExpiredEntries(now);

  const clientKey = `client:${getClientIdentifier(request)}`;
  const clientResult = consumeRateLimit(clientKey, CLIENT_LIMIT, now);
  if (!clientResult.allowed) return clientResult;

  const globalResult = consumeRateLimit("global", GLOBAL_LIMIT, now);
  if (!globalResult.allowed) return globalResult;

  return clientResult;
}

export async function readLimitedRequestBody(
  request: Request,
  maximumBytes = CHAT_LIMITS.bodyBytes,
): Promise<{ ok: true; text: string } | { ok: false }> {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (
    Number.isFinite(declaredLength) &&
    declaredLength >= 0 &&
    declaredLength > maximumBytes
  ) {
    return { ok: false };
  }

  const reader = request.body?.getReader();
  if (!reader) return { ok: true, text: "" };

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel("Request body exceeds the configured limit");
        return { ok: false };
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { ok: true, text: new TextDecoder().decode(body) };
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const originUrl = new URL(origin);
    if (originUrl.origin === new URL(request.url).origin) return true;

    // Next.js can normalize the internal request URL to localhost in local
    // development. The Host header still represents the browser-visible host.
    const host = firstHeaderValue(request.headers.get("host"));
    if (!host || originUrl.host !== host) return false;

    const forwardedProtocol = firstHeaderValue(request.headers.get("x-forwarded-proto"));
    return !forwardedProtocol || `${forwardedProtocol}:` === originUrl.protocol;
  } catch {
    return false;
  }
}

export function guardModelOutput(
  output: string,
  referenceMaterials: readonly string[],
): { safe: true; text: string } | { safe: false; text: string } {
  const text = output.trim().replaceAll("**", "");
  const normalized = normalizeForSecurityCheck(text);
  const compact = normalized.replaceAll(" ", "");
  const implementationLeak = [
    /system prompt/,
    /hidden instructions?/,
    /developer message/,
    /raw reference/,
    /material de refer[eê]ncia bruto/,
    /instru[cç][oõ]es (?:ocultas|internas|do sistema)/,
    /##\s*(?:summary|linkedin profile)/,
  ].some((pattern) => pattern.test(normalized)) || [
    "systemprompt",
    "hiddeninstructions",
    "developermessage",
    "rawreference",
    "materialdereferenciabruto",
    "instrucoesinternas",
    "instrucoesocultas",
  ].some((term) => compact.includes(term));

  const encodedLeak =
    /[A-Za-z0-9+/_-]{48,}={0,2}/.test(text) ||
    /(?:[0-9a-fA-F]{2}){32,}/.test(text) ||
    /(?:%[0-9a-fA-F]{2}){20,}/.test(text);
  const unauthorizedUrl = Array.from(text.matchAll(/https?:\/\/[^\s<>()\]]+/gi)).some(
    ([url]) => !safePublicProfileUrl(url.replace(/[.,!?;:]+$/, "")),
  );

  if (
    implementationLeak ||
    encodedLeak ||
    unauthorizedUrl ||
    hasLargeReferenceOverlap(text, referenceMaterials)
  ) {
    return {
      safe: false,
      text: "Não posso fornecer instruções internas nem reproduzir o material de referência. Posso responder perguntas objetivas sobre a experiência profissional do Matheus.",
    };
  }

  return { safe: true, text };
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
  const vercelForwarded = process.env.VERCEL
    ? firstHeaderValue(request.headers.get("x-vercel-forwarded-for"))
    : null;
  const forwarded = process.env.TRUST_PROXY_HEADERS === "true"
    ? firstHeaderValue(request.headers.get("x-forwarded-for"))
    : null;
  const candidate =
    vercelForwarded ??
    forwarded ??
    `unknown:${request.headers.get("user-agent") ?? "no-user-agent"}`;

  return createHash("sha256").update(candidate.slice(0, 256)).digest("base64url");
}

type DistributedRateLimitConfig = { url: string; token: string };

function getDistributedRateLimitConfig(): DistributedRateLimitConfig | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

async function checkDistributedRateLimit(
  request: Request,
  config: DistributedRateLimitConfig,
): Promise<RateLimitResult> {
  const clientKey = `portfolio-chat:client:${getClientIdentifier(request)}`;
  const globalKey = "portfolio-chat:global";
  const script = `
local clientCount = tonumber(redis.call('GET', KEYS[1]) or '0')
local globalCount = tonumber(redis.call('GET', KEYS[2]) or '0')
local window = tonumber(ARGV[1])
local clientLimit = tonumber(ARGV[2])
local globalLimit = tonumber(ARGV[3])
if clientCount >= clientLimit then
  return {0, clientLimit, 0, redis.call('PTTL', KEYS[1])}
end
if globalCount >= globalLimit then
  return {0, globalLimit, 0, redis.call('PTTL', KEYS[2])}
end
clientCount = redis.call('INCR', KEYS[1])
if clientCount == 1 then redis.call('PEXPIRE', KEYS[1], window) end
globalCount = redis.call('INCR', KEYS[2])
if globalCount == 1 then redis.call('PEXPIRE', KEYS[2], window) end
return {1, clientLimit, clientLimit - clientCount, redis.call('PTTL', KEYS[1])}
`;

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      "EVAL",
      script,
      2,
      clientKey,
      globalKey,
      RATE_LIMIT_WINDOW_MS,
      CLIENT_LIMIT,
      GLOBAL_LIMIT,
    ]),
    cache: "no-store",
    signal: AbortSignal.timeout(3_000),
  });

  if (!response.ok) throw new Error("Distributed rate limiter unavailable");
  const payload: unknown = await response.json();
  if (!isRecord(payload) || !Array.isArray(payload.result)) {
    throw new Error("Invalid distributed rate limiter response");
  }

  const [allowed, limit, remaining, ttl] = payload.result.map(Number);
  if (![allowed, limit, remaining, ttl].every(Number.isFinite)) {
    throw new Error("Invalid distributed rate limiter values");
  }

  return {
    allowed: allowed === 1,
    limit,
    remaining: Math.max(0, remaining),
    retryAfterSeconds: Math.max(1, Math.ceil(Math.max(ttl, 1) / 1_000)),
  };
}

function isLikelyPromptInjection(value: string): boolean {
  const normalized = normalizeForSecurityCheck(value);
  const compact = normalized.replaceAll(" ", "");
  const targetsImplementation = [
    /system prompt/,
    /developer (?:message|mode|instructions?)/,
    /hidden instructions?/,
    /internal instructions?/,
    /reference material/,
    /raw (?:context|prompt|instructions?)/,
    /prompt (?:do sistema|interno|oculto)/,
    /instru[cç][oõ]es (?:do sistema|internas|ocultas)/,
    /material de refer[eê]ncia/,
    /contexto (?:bruto|interno|oculto)/,
  ].some((pattern) => pattern.test(normalized)) || [
    "systemprompt",
    "developermessage",
    "developerinstructions",
    "hiddeninstructions",
    "internalinstructions",
    "referencematerial",
    "rawcontext",
    "rawprompt",
    "promptdosistema",
    "promptinterno",
    "promptoculto",
    "instrucoesdosistema",
    "instrucoesinternas",
    "instrucoesocultas",
    "materialdereferencia",
    "contextobruto",
    "contextointerno",
    "contextooculto",
  ].some((term) => compact.includes(term));
  const requestsBypass = [
    /ignore|disregard|override|bypass|jailbreak/,
    /ignore|desconsidere|substitua|contorne|burle/,
    /reveal|show|print|repeat|translate|encode|decode|transcribe/,
    /revele|mostre|imprima|repita|traduza|codifique|decodifique|transcreva/,
    /role\s*play|developer mode|modo desenvolvedor|finja que|aja como/,
  ].some((pattern) => pattern.test(normalized)) || [
    "ignorepreviousinstructions",
    "disregardpreviousinstructions",
    "mododesenvolvedor",
    "developermode",
    "finjaque",
    "ajacomo",
    "roleplay",
    "revele",
    "mostre",
    "imprima",
    "repita",
    "traduza",
    "codifique",
    "decodifique",
    "transcreva",
    "reveal",
    "print",
    "repeat",
    "translate",
    "encode",
    "decode",
  ].some((term) => compact.includes(term));

  return targetsImplementation && requestsBypass;
}

function hasLargeReferenceOverlap(output: string, references: readonly string[]): boolean {
  const outputWords = normalizeForSecurityCheck(output).split(/\s+/).filter(Boolean);
  if (outputWords.length < 12) return false;

  const outputShingles = new Set<string>();
  for (let index = 0; index <= outputWords.length - 10; index += 1) {
    outputShingles.add(outputWords.slice(index, index + 10).join(" "));
  }

  let matches = 0;
  for (const reference of references) {
    const words = normalizeForSecurityCheck(reference).split(/\s+/).filter(Boolean);
    for (let index = 0; index <= words.length - 10; index += 1) {
      if (outputShingles.has(words.slice(index, index + 10).join(" "))) {
        matches += 1;
        if (matches >= 6) return true;
      }
    }
  }
  return false;
}

function normalizeForSecurityCheck(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\p{Cf}\p{Cc}]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9#]+/g, " ")
    .trim();
}

function firstHeaderValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() || null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
