"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHAT_GREETING } from "@/lib/chat-constants";

export function ChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [showChatInvitation, setShowChatInvitation] = useState(false);
  const [hasOpenedChat, setHasOpenedChat] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { messages, sendMessage, status, error, clearError } = useChat({
    messages: [
      {
        id: "1",
        role: "assistant",
        parts: [{ type: "text", text: CHAT_GREETING }],
      },
    ],
  });

  const isLoading = status === "submitted" || status === "streaming";

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (error) clearError();
    sendMessage({ text: input });
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  useEffect(() => {
    if (hasOpenedChat) return;

    const showTimer = window.setTimeout(() => setShowChatInvitation(true), 1_200);
    const hideTimer = window.setTimeout(() => setShowChatInvitation(false), 7_200);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [hasOpenedChat]);

  const openChat = () => {
    setShowChatInvitation(false);
    setHasOpenedChat(true);
    setIsOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && !hasOpenedChat && showChatInvitation && (
          <motion.button
            data-testid="chat-invitation"
            type="button"
            onClick={openChat}
            aria-label="Abrir o chat para enviar uma mensagem"
            className="fixed bottom-8 right-[5.75rem] z-[60] max-w-[calc(100vw-7.25rem)] rounded-xl border border-[var(--accent)] bg-[var(--surface)] px-4 py-3 text-left text-[var(--text)] shadow-[0_12px_32px_rgba(0,0,0,0.38)] transition-colors hover:bg-[var(--grid)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            initial={{ opacity: 0, x: 10, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
              Chat online
            </span>
            <span id="chat-invitation-text" className="mt-1 block text-sm font-medium leading-snug">
              Envie uma mensagem por aqui.
            </span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-1.5 bottom-4 h-3 w-3 rotate-45 border-r border-t border-[var(--accent)] bg-[var(--surface)]"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <motion.button
        className={cn(
          "fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[var(--text)] text-[var(--bg)] shadow-lg shadow-[var(--accent)]/20 transition-transform hover:scale-110 active:scale-95",
          showChatInvitation && !hasOpenedChat && "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg)]",
        )}
        onClick={openChat}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        aria-label="Open AI Assistant"
        aria-describedby={showChatInvitation ? "chat-invitation-text" : undefined}
      >
        <MessageSquare className="h-6 w-6" />
      </motion.button>

      {/* Drawer Overlay & Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              data-testid="chat-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="chat-title"
              className="fixed bottom-0 right-0 top-0 z-[310] flex w-full max-w-md flex-col overflow-hidden border-l border-[var(--line)] bg-[var(--bg)] shadow-2xl sm:bottom-6 sm:right-6 sm:top-auto sm:h-[calc(100dvh-3rem)] sm:max-h-[600px] sm:w-[400px] sm:rounded-2xl sm:border"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--line)] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--text)] text-[var(--bg)]">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 id="chat-title" className="font-mono text-sm font-bold text-[var(--text)]">SYSTEM_AGENT</h3>
                    <p className="font-mono text-[10px] text-[var(--accent-secondary)]">RAG ONLINE</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Fechar assistente"
                  title="Fechar (Esc)"
                  className="shrink-0 rounded-full border border-[var(--line-strong)] bg-[var(--grid)] p-2 text-[var(--text)] transition-colors hover:bg-[var(--text)] hover:text-[var(--bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 font-sans text-sm">
                <div className="flex min-w-0 flex-col gap-4">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "flex min-w-0 w-fit max-w-[85%] flex-col gap-2 overflow-hidden rounded-2xl px-4 py-3",
                        m.role as string === "user"
                          ? "ml-auto bg-[var(--text)] text-[var(--bg)] rounded-tr-sm"
                          : "bg-[var(--grid)] text-[var(--text)] rounded-tl-sm border border-[var(--line)]"
                      )}
                    >
                      {m.parts.map((p, i) => (
                        p.type === "text" ? (
                          <span key={i} className="min-w-0 max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed">
                            {renderMessageText(p.text)}
                          </span>
                        ) : null
                      ))}
                    </div>
                  ))}
                  {isLoading && (
                    <div data-testid="chat-loading" className="flex w-max max-w-[85%] items-center gap-2 rounded-2xl rounded-tl-sm border border-[var(--line)] bg-[var(--grid)] px-4 py-3 text-[var(--text)]">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:0.2s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:0.4s]" />
                    </div>
                  )}
                  {error && (
                    <div role="alert" className="max-w-[85%] rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 [overflow-wrap:anywhere]">
                      Não foi possível concluir a resposta. Tente novamente em alguns instantes.
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="border-t border-[var(--line)] p-4">
                <form
                  onSubmit={handleFormSubmit}
                  className="flex items-end gap-2 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] p-2 transition-colors focus-within:border-[var(--accent)]"
                >
                  <textarea
                    data-testid="chat-input"
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.currentTarget.style.height = "0px";
                      e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 128)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        e.currentTarget.form?.requestSubmit();
                      }
                    }}
                    maxLength={1600}
                    placeholder="Ask the agent anything..."
                    aria-label="Mensagem para o assistente"
                    className="min-h-10 max-h-32 min-w-0 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2 text-sm leading-6 text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--text)] text-[var(--bg)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                <p className="mt-2 text-center font-mono text-[10px] text-[var(--muted)]">
                  Powered by Vercel AI SDK & OpenRouter
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function renderMessageText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const linkPattern = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<]+)/g;
  let cursor = 0;

  for (const match of text.matchAll(linkPattern)) {
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(text.slice(cursor, index));

    const isMarkdownLink = Boolean(match[2]);
    const rawUrl = match[2] ?? match[3];
    const trailingPunctuation = isMarkdownLink ? "" : rawUrl.match(/[.,!?;:]+$/)?.[0] ?? "";
    const urlValue = trailingPunctuation ? rawUrl.slice(0, -trailingPunctuation.length) : rawUrl;
    const label = match[1] ?? urlValue;
    const href = safeHttpUrl(urlValue);
    if (href) {
      nodes.push(
        <a
          data-chat-link="true"
          key={`${index}-${href}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[var(--accent)] underline decoration-current/40 underline-offset-2 hover:decoration-current"
        >
          {label}
        </a>,
      );
      if (trailingPunctuation) nodes.push(trailingPunctuation);
    } else {
      nodes.push(match[0]);
    }

    cursor = index + match[0].length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function safeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}
