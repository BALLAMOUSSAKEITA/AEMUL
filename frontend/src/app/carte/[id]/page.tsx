"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { api, MemberCardData } from "@/lib/api";
import { MemberCard } from "@/components/MemberCard";
import { ScreenProtection } from "@/components/ScreenProtection";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, ArrowLeft, Shield, Clock } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

const CARD_DISPLAY_DURATION = 60;

export default function CartePage() {
  const { t } = useI18n();
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
      setError(
        err instanceof Error ? err.message : t("member.load_card_error")
      );
    } finally {
      setLoading(false);
    }
  }, [id, t]);

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
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {t("card.loading")}
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <div className="bg-card rounded-2xl border p-8 text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-destructive" />
          </div>
          <h2 className="font-bold text-lg mb-2">{t("card.inaccessible")}</h2>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <Button onClick={loadCard} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {t("card.retry")}
          </Button>
        </div>
      </main>
    );
  }

  const watermark = new Date().toLocaleTimeString("fr-CA");
  const progressPercent = (countdown / CARD_DISPLAY_DURATION) * 100;

  return (
    <main className="min-h-screen py-8 px-4 relative overflow-y-auto">
      <div className="absolute inset-0 geometric-pattern" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

      <div className="relative z-10 max-w-sm mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </Link>

        <div className="text-center">
          <h1 className="text-xl font-bold font-[var(--font-heading)]">
            {t("card.title")}
          </h1>
          {!expired && (
            <div className="mt-3">
              <div className="inline-flex items-center gap-2 bg-card border rounded-full px-4 py-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t("card.expires_in")}{" "}
                  <span
                    className={`font-mono font-bold ${countdown <= 10 ? "text-destructive" : "text-foreground"}`}
                  >
                    {countdown}s
                  </span>
                </span>
              </div>
              {/* Progress bar */}
              <div className="mt-3 mx-auto max-w-[200px] h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-linear ${countdown <= 10 ? "bg-destructive" : "bg-primary"}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {expired ? (
          <div className="bg-card rounded-2xl border p-10 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-lg mb-1">{t("card.expired")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("card.expired_desc")}
              </p>
            </div>
            <Button onClick={loadCard} className="gap-2 shadow-lg shadow-primary/20">
              <RefreshCw className="w-4 h-4" />
              {t("card.regenerate")}
            </Button>
          </div>
        ) : (
          member && (
            <ScreenProtection>
              <MemberCard member={member} watermark={watermark} />
            </ScreenProtection>
          )
        )}

        <p className="text-center text-[11px] text-muted-foreground/60 leading-relaxed">
          {t("card.protected")}
        </p>
      </div>
    </main>
  );
}
