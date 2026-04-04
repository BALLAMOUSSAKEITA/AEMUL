"use client";

import { useEffect, useState, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function ScreenProtection({ children }: Props) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) {
        setHidden(true);
      } else {
        setHidden(false);
      }
    }

    function handleBlur() {
      setHidden(true);
    }

    function handleFocus() {
      setHidden(false);
    }

    function preventContext(e: MouseEvent) {
      e.preventDefault();
    }

    function preventKeys(e: KeyboardEvent) {
      if (
        e.key === "PrintScreen" ||
        (e.ctrlKey && e.shiftKey && e.key === "S") ||
        (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5"))
      ) {
        e.preventDefault();
        setHidden(true);
        setTimeout(() => setHidden(false), 2000);
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("contextmenu", preventContext);
    document.addEventListener("keydown", preventKeys);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("contextmenu", preventContext);
      document.removeEventListener("keydown", preventKeys);
    };
  }, []);

  return (
    <div
      className="relative select-none"
      style={{ WebkitUserSelect: "none", userSelect: "none" }}
      onDragStart={(e) => e.preventDefault()}
    >
      {hidden && (
        <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center rounded-2xl">
          <p className="text-muted-foreground font-medium">
            Carte masquée pour votre sécurité
          </p>
        </div>
      )}
      {children}
    </div>
  );
}
