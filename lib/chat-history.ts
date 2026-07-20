import { createHmac, timingSafeEqual } from "node:crypto";
import type { SafeChatMessage } from "./chat-security.ts";

export function verifyChatHistory(messages: readonly SafeChatMessage[], secret: string): boolean {
  const authenticatedMessages: SafeChatMessage[] = [];

  for (const message of messages) {
    authenticatedMessages.push(message);
    if (message.role !== "assistant") continue;

    const expected = signChatTranscript(authenticatedMessages, secret);
    const received = message.signature ?? "";
    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(received);
    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return false;
    }
  }

  return true;
}

export function signAssistantResponse(
  messages: readonly SafeChatMessage[],
  assistantText: string,
  secret: string,
): string {
  return signChatTranscript(
    [...messages, { role: "assistant", content: assistantText }],
    secret,
  );
}

function signChatTranscript(messages: readonly SafeChatMessage[], secret: string): string {
  const canonicalTranscript = messages
    .map(({ role, content }) => `${role}:${content.length}:${content}`)
    .join("\n");
  return createHmac("sha256", secret).update(canonicalTranscript).digest("base64url");
}
