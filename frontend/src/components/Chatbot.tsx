"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Sparkles,
  ChevronDown,
  RotateCcw,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: number;
  role: "user" | "bot";
  text: string;
  found?: boolean;
}

const WELCOME: Message = {
  id: 0,
  role: "bot",
  text: "Salam ! Je suis l'assistant officiel de l'AEMUL 🌙\n\nJe peux répondre à vos questions sur notre association : mission, bureau, activités, adhésion, contact et bien plus.\n\nQue puis-je faire pour vous ?",
  found: true,
};

const SUGGESTIONS = [
  "C'est quoi l'AEMUL ?",
  "Comment adhérer ?",
  "Qui est le président ?",
  "Quelles activités ?",
  "Nous contacter",
];

// ── Rendu Markdown léger ──────────────────────────────────────────────────────

function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line === "---") {
      nodes.push(<div key={key++} className="my-2 border-t border-current opacity-20" />);
      continue;
    }

    if (line.trim() === "") {
      if (i > 0 && lines[i - 1].trim() !== "") nodes.push(<br key={key++} />);
      continue;
    }

    // Bullet list
    if (line.startsWith("- ") || line.startsWith("• ")) {
      nodes.push(
        <div key={key++} className="flex gap-1.5 my-0.5">
          <span className="mt-1.5 w-1 h-1 rounded-full bg-current opacity-60 shrink-0" />
          <span>{parseInline(line.slice(2))}</span>
        </div>
      );
      continue;
    }

    // Heading ##
    if (line.startsWith("## ")) {
      nodes.push(
        <p key={key++} className="font-bold mt-2 mb-0.5 text-sm">
          {parseInline(line.slice(3))}
        </p>
      );
      continue;
    }

    nodes.push(
      <p key={key++} className="leading-relaxed">
        {parseInline(line)}
      </p>
    );
  }
  return <>{nodes}</>;
}

function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// ── Avatar bot ────────────────────────────────────────────────────────────────

function BotAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#14532d] to-[#166534] flex items-center justify-center shrink-0 shadow-sm">
      <Sparkles className="w-3.5 h-3.5 text-white" />
    </div>
  );
}

// ── Bulle message ─────────────────────────────────────────────────────────────

function MessageBubble({ msg, isLast }: { msg: Message; isLast: boolean }) {
  if (msg.role === "user") {
    return (
      <div className={`flex justify-end ${isLast ? "animate-in slide-in-from-right-4 fade-in duration-200" : ""}`}>
        <div className="max-w-[82%] bg-[#14532d] text-white rounded-2xl rounded-tr-md px-4 py-2.5 text-sm shadow-sm">
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-2 ${isLast ? "animate-in slide-in-from-left-4 fade-in duration-200" : ""}`}>
      <BotAvatar />
      <div
        className={`max-w-[84%] rounded-2xl rounded-tl-md px-4 py-3 text-sm shadow-sm leading-relaxed ${
          msg.found === false
            ? "bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-700/60 text-amber-900 dark:text-amber-100"
            : "bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
        }`}
      >
        <MarkdownText text={msg.text} />
      </div>
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 animate-in slide-in-from-left-4 fade-in duration-200">
      <BotAvatar />
      <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl rounded-tl-md px-4 py-3.5 flex gap-1 items-center shadow-sm">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce"
            style={{ animationDelay: `${i * 160}ms`, animationDuration: "0.8s" }}
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
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 60);
  }, []);

  // When open or new messages
  useEffect(() => {
    if (open) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
      setShowBadge(false);
    }
  }, [open, messages, scrollToBottom]);

  // Block body scroll on mobile when open
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = open ? "hidden" : "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open, isMobile]);

  // Send message
  async function send(text?: string) {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    setInput("");
    const id = msgId;
    setMsgId((n) => n + 2);
    setMessages((prev) => [...prev, { id, role: "user", text: question }]);
    setLoading(true);

    try {
      const res = await api.askChatbot(question);
      setMessages((prev) => [
        ...prev,
        { id: id + 1, role: "bot", text: res.answer, found: res.found },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: id + 1,
          role: "bot",
          text: "Une erreur s'est produite. Veuillez réessayer.",
          found: false,
        },
      ]);
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

  function reset() {
    setMessages([WELCOME]);
    setMsgId(1);
    setInput("");
  }

  const showSuggestions = messages.length === 1 && !loading;

  // ── Layout classes ──────────────────────────────────────────────────────────

  const windowClasses = isMobile
    ? // Mobile : plein écran
      `fixed inset-0 z-[60] flex flex-col bg-zinc-50 dark:bg-zinc-900 transition-all duration-300 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none translate-y-full"
      }`
    : // Desktop : popover coin bas-droite
      `fixed bottom-[84px] right-5 z-50 w-[390px] flex flex-col bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 ${
        open
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 translate-y-4 scale-95 pointer-events-none"
      }`;

  return (
    <>
      {/* ── Fenêtre de chat ── */}
      <div className={windowClasses} style={isMobile ? undefined : { maxHeight: "min(78vh, 600px)" }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 bg-[#14532d] shrink-0 shadow-md">
          <Logo size={34} className="rounded-xl border-2 border-white/20" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">Assistant AEMUL</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60" />
              <p className="text-white/60 text-xs">Disponible · Propulsé par Gemini AI</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 1 && (
              <button
                onClick={reset}
                title="Nouvelle conversation"
                className="text-white/50 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/10"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="text-white/50 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/10"
            >
              {isMobile ? <X className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Zone messages */}
        <div
          ref={scrollAreaRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0"
          style={{ overscrollBehavior: "contain" }}
        >
          {messages.map((msg, i) => (
            <MessageBubble key={msg.id} msg={msg} isLast={i === messages.length - 1} />
          ))}

          {loading && <TypingIndicator />}

          {/* Questions suggérées */}
          {showSuggestions && (
            <div className="pt-1">
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2 font-medium">
                Questions fréquentes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs bg-white dark:bg-zinc-800 hover:bg-[#14532d] hover:text-white dark:hover:bg-[#14532d] text-[#14532d] dark:text-emerald-400 rounded-full px-3 py-1.5 transition-all duration-150 border border-[#14532d]/25 dark:border-emerald-700/40 shadow-sm font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Zone de saisie */}
        <div
          className="px-4 pt-3 pb-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 shrink-0"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Posez votre question…"
                disabled={loading}
                className="w-full rounded-2xl text-sm h-11 pr-4 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:border-[#14532d] dark:focus:border-emerald-600 transition-colors"
              />
            </div>
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="h-11 w-11 rounded-2xl bg-[#14532d] hover:bg-[#166534] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-150 active:scale-95 shadow-sm shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-600 text-center mt-2">
            Dédié exclusivement aux questions sur l&apos;AEMUL
          </p>
        </div>
      </div>

      {/* ── Overlay mobile ── */}
      {isMobile && open && (
        <div className="fixed inset-0 z-[59] bg-black/20 backdrop-blur-[2px]" />
      )}

      {/* ── Bouton flottant ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-2xl bg-[#14532d] hover:bg-[#166534] text-white shadow-lg shadow-[#14532d]/30 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label={open ? "Fermer le chat" : "Ouvrir l'assistant AEMUL"}
      >
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
            open ? "opacity-100 rotate-0" : "opacity-0 rotate-90 scale-50"
          }`}
        >
          <X className="w-6 h-6" />
        </span>
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
            open ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0"
          }`}
        >
          <MessageCircle className="w-6 h-6" />
        </span>

        {/* Badge doré */}
        {showBadge && !open && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c9952b] opacity-60" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#c9952b] border-2 border-white dark:border-zinc-900" />
          </span>
        )}
      </button>
    </>
  );
}
