"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { api, MemberCardData } from "@/lib/api";
import { MemberCard } from "@/components/MemberCard";
import { ScreenProtection } from "@/components/ScreenProtection";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

const CARD_DISPLAY_DURATION = 60;

export default function CartePage() {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<MemberCardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(CARD_DISPLAY_DURATION);
  const [expired, setExpired] = useState(false);

  const loadCard = useCallback(async () => {
    setLoading(true);
    setError(null);
    setExpired(false);
    setCountdown(CARD_DISPLAY_DURATION);
    try {
      const data = await api.getCardData(id);
      setMember(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Impossible de charger la carte.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCard();
  }, [loadCard]);

  useEffect(() => {
    if (!member || expired) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [member, expired]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-destructive font-medium">{error}</p>
        <Button onClick={loadCard} variant="outline">
          Réessayer
        </Button>
      </main>
    );
  }

  const watermark = new Date().toLocaleTimeString("fr-CA");

  return (
    <main className="min-h-screen py-8 px-4 bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-sm mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <div className="text-center">
          <h1 className="text-xl font-bold">Carte de membre</h1>
          {!expired && (
            <p className="text-sm text-muted-foreground mt-1">
              Visible pendant encore{" "}
              <span className="font-mono font-bold text-foreground">
                {countdown}s
              </span>
            </p>
          )}
        </div>

        {expired ? (
          <div className="text-center space-y-4 py-12">
            <p className="text-muted-foreground">
              La carte a expiré pour des raisons de sécurité.
            </p>
            <Button onClick={loadCard} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Régénérer la carte
            </Button>
          </div>
        ) : (
          member && (
            <ScreenProtection>
              <MemberCard member={member} watermark={watermark} />
            </ScreenProtection>
          )
        )}
      </div>
    </main>
  );
}
