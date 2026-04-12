"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Bot,
  ChevronDown,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type Role = "user" | "bot";

interface Message {
  id: number;
  role: Role;
  text: string;
  found?: boolean;
}

const WELCOME: Message = {
  id: 0,
  role: "bot",
  text: "Salam ! Je suis l'assistant AEMUL 🌙\n\nJe peux répondre à toutes vos questions sur notre association : notre mission, notre bureau, nos activités, l'adhésion et bien plus encore.\n\nQue souhaitez-vous savoir ?",
  found: true,
};

const SUGGESTIONS = [
  "C'est quoi l'AEMUL ?",
  "Comment adhérer ?",
  "Qui est le président ?",
  "Quelles sont les activités ?",
  "Comment nous contacter ?",
];

// ── Markdown léger → JSX ──────────────────────────────────────────────────────

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
      elements.push(
        <p key={key++} className="font-semibold mb-1">
          {line.slice(2, -2)}
        </p>
      );
    } else if (line === "---") {
      elements.push(<hr key={key++} className="my-2 border-white/20" />);
    } else if (line.trim() === "") {
      elements.push(<br key={key++} />);
    } else {
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          part
        )
      );
      elements.push(
        <p key={key++} className="leading-relaxed">
          {parts}
        </p>
      );
    }
  }
  return elements;
}

// ── Bulle de message ──────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-[#14532d] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm shadow-sm">
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <div className="w-7 h-7 rounded-full bg-[#14532d]/10 border border-[#14532d]/20 flex items-center justify-center shrink-0 mt-0.5">
        <Bot className="w-3.5 h-3.5 text-[#14532d]" />
      </div>
      <div
        className={`max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm shadow-sm ${
          msg.found === false
            ? "bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100"
            : "bg-muted text-foreground"
        }`}
      >
        {renderMarkdown(msg.text)}
      </div>
    </div>
  );
}

// ── Indicateur de frappe ──────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2">
      <div className="w-7 h-7 rounded-full bg-[#14532d]/10 border border-[#14532d]/20 flex items-center justify-center shrink-0">
        <Bot className="w-3.5 h-3.5 text-[#14532d]" />
      </div>
      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgId, setMsgId] = useState(1);
  const [showBadge, setShowBadge] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      setTimeout(() => inputRef.current?.focus(), 100);
      setShowBadge(false);
    }
  }, [open, messages]);

  async function send(text?: string) {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    setInput("");
    const userMsg: Message = { id: msgId, role: "user", text: question };
    setMsgId((n) => n + 1);
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.askChatbot(question);
      const botMsg: Message = {
        id: msgId + 1,
        role: "bot",
        text: res.answer,
        found: res.found,
      };
      setMessages((prev) => [...prev, botMsg]);
      setMsgId((n) => n + 2);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: msgId + 1,
          role: "bot",
          text: "Une erreur s'est produite. Veuillez réessayer.",
          found: false,
        },
      ]);
      setMsgId((n) => n + 2);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const showSuggestions = messages.length === 1;

  return (
    <>
      {/* ── Fenêtre de chat ── */}
      <div
        className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] max-h-[75vh] flex flex-col bg-background border shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        style={{ maxHeight: "min(75vh, 560px)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#14532d] shrink-0">
          <Logo size={32} className="rounded-xl" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">
              Assistant AEMUL
            </p>
            <p className="text-white/60 text-xs">
              Posez vos questions sur l&apos;association
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-white/60 hover:text-white transition-colors p-1"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {loading && <TypingIndicator />}

          {/* Suggestions */}
          {showSuggestions && !loading && (
            <div className="pt-1">
              <p className="text-xs text-muted-foreground mb-2">
                Questions fréquentes :
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs bg-[#14532d]/10 hover:bg-[#14532d]/20 text-[#14532d] dark:text-green-400 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-full px-3 py-1.5 transition-colors border border-[#14532d]/20"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t bg-background shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Posez votre question…"
              disabled={loading}
              className="flex-1 rounded-xl text-sm h-10"
            />
            <Button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              size="sm"
              className="bg-[#14532d] hover:bg-[#166534] text-white rounded-xl h-10 px-3"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
            Uniquement dédié aux questions sur l&apos;AEMUL
          </p>
        </div>
      </div>

      {/* ── Bouton flottant ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 rounded-2xl bg-[#14532d] hover:bg-[#166534] text-white shadow-lg shadow-[#14532d]/40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
          open ? "rotate-0" : "rotate-0"
        }`}
        aria-label={open ? "Fermer le chat" : "Ouvrir l'assistant AEMUL"}
      >
        {open ? (
          <X className="w-6 h-6 transition-transform duration-200" />
        ) : (
          <MessageCircle className="w-6 h-6 transition-transform duration-200" />
        )}
        {/* Badge de notification */}
        {showBadge && !open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#c9952b] rounded-full border-2 border-background animate-pulse" />
        )}
      </button>
    </>
  );
}
