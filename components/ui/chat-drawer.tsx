"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  
  const { messages, sendMessage, status } = useChat({
    messages: [
      {
        id: "1",
        role: "assistant",
        parts: [{ type: "text", text: "Olá! Eu sou o assistente de IA treinado no dossiê do Matheus. Como posso te ajudar hoje? Você pode me perguntar sobre a experiência, os projetos ou as habilidades dele." }],
      },
    ],
  });

  const isLoading = status === "submitted" || status === "streaming";

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--text)] text-[var(--bg)] shadow-lg shadow-[var(--accent)]/20 transition-transform hover:scale-110 active:scale-95"
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        aria-label="Open AI Assistant"
      >
        <MessageSquare className="h-6 w-6" />
      </motion.button>

      {/* Drawer Overlay & Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 right-0 top-0 z-[70] flex w-full max-w-md flex-col border-l border-[var(--line)] bg-[var(--bg)] shadow-2xl sm:bottom-6 sm:right-6 sm:top-auto sm:h-[600px] sm:w-[400px] sm:rounded-2xl sm:border"
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
                    <h3 className="font-mono text-sm font-bold text-[var(--text)]">SYSTEM_AGENT</h3>
                    <p className="font-mono text-[10px] text-[var(--accent-secondary)]">RAG ONLINE</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-[var(--muted-strong)] hover:bg-[var(--grid)] hover:text-[var(--text)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 font-sans text-sm">
                <div className="flex flex-col gap-4">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "flex w-max max-w-[85%] flex-col gap-2 rounded-2xl px-4 py-3",
                        m.role as string === "user"
                          ? "ml-auto bg-[var(--text)] text-[var(--bg)] rounded-tr-sm"
                          : "bg-[var(--grid)] text-[var(--text)] rounded-tl-sm border border-[var(--line)]"
                      )}
                    >
                      {m.parts.map((p, i) => (
                        <span key={i} className="whitespace-pre-wrap leading-relaxed">
                          {p.type === "text" ? p.text : ""}
                        </span>
                      ))}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex w-max max-w-[85%] items-center gap-2 rounded-2xl rounded-tl-sm border border-[var(--line)] bg-[var(--grid)] px-4 py-3 text-[var(--text)]">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:0.2s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:0.4s]" />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="border-t border-[var(--line)] p-4">
                <form
                  onSubmit={handleFormSubmit}
                  className="relative flex items-center rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] transition-colors focus-within:border-[var(--accent)]"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask the agent anything..."
                    className="w-full bg-transparent py-3 pl-4 pr-12 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--text)] text-[var(--bg)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
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
