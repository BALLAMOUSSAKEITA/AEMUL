"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegistrationForm } from "@/components/RegistrationForm";
import { api, CreateMemberPayload } from "@/lib/api";
import { CheckCircle2, LogIn, ArrowLeft, Copy, Check, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import Link from "next/link";

export default function InscriptionPage() {
  const router = useRouter();
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [memberNumber, setMemberNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedPw, setCopiedPw] = useState(false);

  async function onSubmit(data: CreateMemberPayload) {
    setError(null);
    setLoading(true);
    try {
      const result = await api.createMember(data);
      setGeneratedPassword(result.generated_password);
      setMemberNumber(result.member.member_number);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  function copyPassword() {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setCopiedPw(true);
    setTimeout(() => setCopiedPw(false), 2000);
  }

  function copyNumber() {
    navigator.clipboard.writeText(memberNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (generatedPassword) {
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
                Votre inscription a été enregistrée avec succès.
              </p>
            </div>

            <div className="bg-gradient-to-r from-primary/5 to-[var(--gold)]/5 rounded-xl p-4 border border-primary/10">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                Votre numéro de membre
              </p>
              <p className="text-2xl font-mono font-bold text-primary">
                {memberNumber}
              </p>
              <button
                onClick={copyNumber}
                className="mt-1 inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copié !" : "Copier"}
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <p className="text-sm font-semibold text-amber-800">Votre mot de passe temporaire</p>
              </div>
              <p className="font-mono text-lg font-bold text-amber-900 bg-amber-500/10 rounded-lg px-3 py-2 text-center">
                {generatedPassword}
              </p>
              <button
                onClick={copyPassword}
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-900 font-medium transition-colors"
              >
                {copiedPw ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPw ? "Copié !" : "Copier le mot de passe"}
              </button>
              <p className="text-[11px] text-amber-700/70 mt-2">
                Notez-le bien ! Vous devrez le changer lors de votre première connexion.
              </p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 text-left">
              <p className="text-sm text-muted-foreground">
                Un administrateur doit approuver votre inscription avant que vous puissiez
                générer votre carte de membre.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link href="/connexion">
                <Button
                  size="lg"
                  className="w-full gap-2 h-12 shadow-lg shadow-primary/20"
                >
                  <LogIn className="w-4 h-4" />
                  Se connecter
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => router.push("/")}
              >
                Retour à l&apos;accueil
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
