import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { SafeChatMessage } from "./chat-security.ts";

export const CHAT_SESSION_COOKIE = "portfolio_chat_session";
export const CHAT_HISTORY_MAX_AGE_MS = 24 * 60 * 60 * 1_000;

const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const CLOCK_SKEW_MS = 5 * 60 * 1_000;

export function getOrCreateChatSession(cookieHeader: string | null): {
  id: string;
  isNew: boolean;
} {
  const sessionId = readCookie(cookieHeader, CHAT_SESSION_COOKIE);
  if (sessionId && SESSION_ID_PATTERN.test(sessionId)) {
    return { id: sessionId, isNew: false };
  }

  return { id: randomBytes(32).toString("base64url"), isNew: true };
}

export function serializeChatSessionCookie(sessionId: string, secure: boolean): string {
  const attributes = [
    `${CHAT_SESSION_COOKIE}=${sessionId}`,
    "Path=/api/chat",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${Math.floor(CHAT_HISTORY_MAX_AGE_MS / 1_000)}`,
  ];
  if (secure) attributes.push("Secure");
  return attributes.join("; ");
}

export function deriveChatSigningSecret(apiKey: string): string {
  return createHmac("sha256", apiKey)
    .update("portfolio-chat-history-signing-v1")
    .digest("base64url");
}

export function verifyChatHistory(
  messages: readonly SafeChatMessage[],
  secret: string,
  sessionId: string,
  now = Date.now(),
): boolean {
  const authenticatedMessages: SafeChatMessage[] = [];
  let previousIssuedAt = 0;

  for (const message of messages) {
    authenticatedMessages.push(message);
    if (message.role !== "assistant") continue;

    const issuedAt = message.issuedAt ?? 0;
    if (
      !Number.isSafeInteger(issuedAt) ||
      issuedAt < now - CHAT_HISTORY_MAX_AGE_MS ||
      issuedAt > now + CLOCK_SKEW_MS ||
      issuedAt < previousIssuedAt
    ) {
      return false;
    }

    const expected = signChatTranscript(authenticatedMessages, secret, sessionId, issuedAt);
    const received = message.signature ?? "";
    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(received);
    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return false;
    }
    previousIssuedAt = issuedAt;
  }

  return true;
}

export function signAssistantResponse(
  messages: readonly SafeChatMessage[],
  assistantText: string,
  secret: string,
  sessionId: string,
  issuedAt = Date.now(),
): { signature: string; issuedAt: number } {
  const transcript = [
    ...messages,
    { role: "assistant" as const, content: assistantText, issuedAt },
  ];
  return {
    signature: signChatTranscript(transcript, secret, sessionId, issuedAt),
    issuedAt,
  };
}

function signChatTranscript(
  messages: readonly SafeChatMessage[],
  secret: string,
  sessionId: string,
  issuedAt: number,
): string {
  const canonicalTranscript = messages
    .map(({ role, content, issuedAt: messageIssuedAt }) =>
      `${role}:${content.length}:${content}:${messageIssuedAt ?? ""}`,
    )
    .join("\n");
  return createHmac("sha256", secret)
    .update(`${sessionId}\n${issuedAt}\n${canonicalTranscript}`)
    .digest("base64url");
}

function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const pair of cookieHeader.split(";")) {
    const separator = pair.indexOf("=");
    if (separator < 0 || pair.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(pair.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}
