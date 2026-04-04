"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { access_token } = await api.login(email, password);
      localStorage.setItem("admin_token", access_token);
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Identifiants invalides."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex relative overflow-hidden">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#14532d] via-[#1b6b3a] to-[#14532d] relative items-center justify-center p-12">
        <div className="absolute inset-0 geometric-pattern opacity-10" />
        <div className="relative z-10 text-white max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c9952b] to-[#e6b94d] flex items-center justify-center mb-8 shadow-lg">
            <span className="text-2xl font-bold">A</span>
          </div>
          <h1 className="text-4xl font-bold font-[var(--font-heading)] mb-4 leading-tight">
            Panneau d&apos;administration
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Gerez les membres de l&apos;AEMUL, suivez les inscriptions et
            administrez l&apos;association depuis un seul endroit.
          </p>
          <div className="mt-10 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/20" />
            <span className="text-white/40 text-sm">AEMUL Admin</span>
            <div className="h-px flex-1 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-lg font-bold text-white">A</span>
            </div>
            <span className="font-bold text-lg">AEMUL Admin</span>
          </div>

          <div className="mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold font-[var(--font-heading)]">
              Connexion
            </h2>
            <p className="text-muted-foreground mt-1">
              Entrez vos identifiants administrateur
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-3.5 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aemul.ca"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Se connecter
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
