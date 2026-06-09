"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, X } from "lucide-react";
import {
  applyNexusGuardrails,
  GUARDRAIL_ERROR,
  suggestedPrompts,
} from "@/lib/nexus-guardrails";
import { queryNexus } from "@/lib/nexus-engine";

type Message = { role: "user" | "assistant"; text: string };

function renderMarkdownLite(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part.split("\n").map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}

export default function NexusCopilot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const submit = useCallback(async (text: string) => {
    const query = text.trim();
    if (!query || loading) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", text: query }]);
    setLoading(true);

    if (!applyNexusGuardrails(query)) {
      setMessages((m) => [...m, { role: "assistant", text: GUARDRAIL_ERROR }]);
      setLoading(false);
      return;
    }

    const response = await queryNexus(query);
    setMessages((m) => [...m, { role: "assistant", text: response }]);
    setLoading(false);
  }, [loading]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/40 bg-accent/15 text-accent shadow-[0_0_24px_rgba(14,165,233,0.25)] backdrop-blur-md transition-all hover:bg-accent/25 hover:shadow-[0_0_36px_rgba(14,165,233,0.4)] md:bottom-8 md:right-8"
        aria-label="Open Nexus Context AI"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "110%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "110%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed bottom-4 right-4 top-20 z-50 flex w-[min(100vw-2rem,420px)] flex-col overflow-hidden rounded-2xl border border-border bg-background-elevated/95 shadow-[0_0_60px_rgba(14,165,233,0.12)] backdrop-blur-xl"
              role="dialog"
              aria-label="Nexus Context AI"
            >
              <header className="flex items-center justify-between border-b border-border bg-background-muted/50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <div>
                    <p className="font-display text-sm font-semibold text-foreground">
                      Nexus Context AI
                    </p>
                    <p className="text-[10px] text-foreground-subtle">
                      Portfolio context engine
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-foreground-subtle hover:bg-background-muted hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center px-2 pt-6">
                    <p className="text-sm text-foreground-subtle">
                      Structured briefings on James Wei&apos;s Tesla experience, AI projects,
                      media ops, and contact info.
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {suggestedPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => submit(prompt)}
                          className="rounded-full border border-border bg-background-muted px-3 py-1.5 text-xs text-foreground-muted transition-colors hover:border-accent/30 hover:text-accent"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-accent/10 text-accent border border-accent/25"
                          : "bg-background-muted text-foreground-muted border border-border"
                      }`}
                    >
                      {msg.role === "assistant" ? renderMarkdownLite(msg.text) : msg.text}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-border bg-background-muted px-4 py-3 text-sm text-foreground-subtle">
                      Processing…
                    </div>
                  </div>
                )}
              </div>

              <form
                className="border-t border-border bg-background-muted/40 p-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(input);
                }}
              >
                <div className="relative">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Query portfolio architecture…"
                    className="w-full rounded-xl border border-border bg-background/60 py-3 pl-4 pr-12 text-sm text-foreground placeholder:text-foreground-subtle focus:border-accent/40 focus:outline-none"
                    autoComplete="off"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-accent/15 p-2 text-accent hover:bg-accent/25 disabled:opacity-40"
                    aria-label="Send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
