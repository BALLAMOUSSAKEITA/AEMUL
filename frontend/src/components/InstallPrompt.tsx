"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "aemul_install_dismissed";
const DISMISS_DAYS = 7;

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }

    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  }

  function dismiss() {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 inset-x-0 z-50 px-3 safe-bottom">
      <div className="max-w-sm mx-auto bg-primary text-primary-foreground rounded-2xl shadow-2xl shadow-primary/30 p-4 flex items-center gap-3">
        <Logo size={40} className="rounded-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">Installer AEMUL</p>
          <p className="text-[11px] text-primary-foreground/70">
            Accédez rapidement à votre espace
          </p>
        </div>
        <button
          onClick={install}
          className="shrink-0 bg-white text-primary font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 active:scale-95 transition-transform"
        >
          <Download className="w-3.5 h-3.5" />
          Installer
        </button>
        <button
          onClick={dismiss}
          className="shrink-0 text-primary-foreground/50 active:text-primary-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
