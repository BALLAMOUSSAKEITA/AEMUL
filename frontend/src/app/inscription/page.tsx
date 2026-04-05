"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegistrationForm } from "@/components/RegistrationForm";
import { api, CreateMemberPayload } from "@/lib/api";
import { CheckCircle2, CreditCard, ArrowLeft, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import Link from "next/link";

export default function InscriptionPage() {
  const router = useRouter();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [memberNumber, setMemberNumber] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function onSubmit(data: CreateMemberPayload) {
    setError(null);
    setLoading(true);
    try {
      const member = await api.createMember(data);
      setMemberId(member.id);
      setMemberNumber(member.member_number);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    const url = `${window.location.origin}/carte/${memberId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (memberId) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 geometric-pattern" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

        <div className="relative z-10 max-w-md w-full text-center space-y-6">
          <div className="bg-card rounded-3xl border shadow-xl p-8 md:p-10 space-y-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-bold font-[var(--font-heading)] mb-2">
                Bienvenue dans l&apos;AEMUL !
              </h1>
              <p className="text-muted-foreground">
                Votre inscription a ete enregistree avec succes.
              </p>
            </div>

            <div className="bg-gradient-to-r from-primary/5 to-[var(--gold)]/5 rounded-xl p-4 border border-primary/10">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                Votre numero de membre
              </p>
              <p className="text-2xl font-mono font-bold text-primary">
                {memberNumber}
              </p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 text-left">
              <p className="text-sm text-muted-foreground">
                Conservez le lien vers votre carte de membre. Vous pourrez la
                consulter a tout moment.
              </p>
              <button
                onClick={copyLink}
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? "Lien copie !" : "Copier le lien de la carte"}
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <Link href={`/carte/${memberId}`}>
                <Button
                  size="lg"
                  className="w-full gap-2 h-12 shadow-lg shadow-primary/20"
                >
                  <CreditCard className="w-4 h-4" />
                  Voir ma carte de membre
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => router.push("/")}
              >
                Retour a l&apos;accueil
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4 relative overflow-hidden">
      <div className="absolute inset-0 geometric-pattern" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

      <div className="relative z-10 max-w-lg mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <div className="text-center mb-10">
          <Logo size={56} className="mx-auto mb-4 shadow-md shadow-primary/20 rounded-xl" />
          <h1 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] mb-2">
            Devenir membre
          </h1>
          <p className="text-muted-foreground">
            Rejoignez l&apos;AEMUL en quelques étapes
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        <RegistrationForm onSubmit={onSubmit} loading={loading} />
      </div>
    </main>
  );
}
