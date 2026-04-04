"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegistrationForm } from "@/components/RegistrationForm";
import { api, CreateMemberPayload } from "@/lib/api";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function InscriptionPage() {
  const router = useRouter();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [memberNumber, setMemberNumber] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: CreateMemberPayload) {
    setError(null);
    setLoading(true);
    try {
      const member = await api.createMember(data);
      setMemberId(member.id);
      setMemberNumber(member.member_number);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (memberId) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Inscription réussie !</h1>
          <p className="text-muted-foreground">
            Votre numéro de membre est{" "}
            <span className="font-mono font-bold text-foreground">
              {memberNumber}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Conservez le lien ci-dessous pour accéder à votre carte de membre à tout moment.
          </p>
          <div className="space-y-3">
            <Link href={`/carte/${memberId}`}>
              <Button size="lg" className="w-full">
                Voir ma carte de membre
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Retour à l&apos;accueil
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4 bg-gradient-to-b from-primary/10 to-background">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Inscription</h1>
          <p className="text-muted-foreground">
            Devenez membre de l&apos;AEMUL
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <RegistrationForm onSubmit={onSubmit} loading={loading} />
      </div>
    </main>
  );
}
