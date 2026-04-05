"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Member } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  User,
  CreditCard,
  LogOut,
  Menu,
  X,
  Home,
} from "lucide-react";

export default function EspaceMembreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [checked, setChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("member_token");
    if (!token) {
      router.replace("/connexion");
      return;
    }
    api
      .getMyProfile()
      .then((m) => {
        setMember(m);
        setChecked(true);
      })
      .catch(() => {
        localStorage.removeItem("member_token");
        router.replace("/connexion");
      });
  }, [router]);

  function logout() {
    localStorage.removeItem("member_token");
    router.push("/connexion");
  }

  if (!checked) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/espace-membre" className="flex items-center gap-2.5">
            <Logo size={32} className="rounded-lg" />
            <span className="font-bold text-sm">Mon espace</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            <Link href="/espace-membre">
              <Button variant="ghost" size="sm" className="gap-2 text-xs">
                <Home className="w-3.5 h-3.5" />
                Accueil
              </Button>
            </Link>
            <Link href="/espace-membre?tab=profil">
              <Button variant="ghost" size="sm" className="gap-2 text-xs">
                <User className="w-3.5 h-3.5" />
                Profil
              </Button>
            </Link>
            <Link href="/espace-membre?tab=carte">
              <Button variant="ghost" size="sm" className="gap-2 text-xs">
                <CreditCard className="w-3.5 h-3.5" />
                Ma carte
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-xs text-muted-foreground">
              <LogOut className="w-3.5 h-3.5" />
              Déconnexion
            </Button>
          </nav>

          {/* Mobile menu button */}
          <button className="sm:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="sm:hidden border-t px-4 py-3 space-y-1 bg-background">
            <Link href="/espace-membre" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs">
                <Home className="w-3.5 h-3.5" /> Accueil
              </Button>
            </Link>
            <Link href="/espace-membre?tab=profil" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs">
                <User className="w-3.5 h-3.5" /> Profil
              </Button>
            </Link>
            <Link href="/espace-membre?tab=carte" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs">
                <CreditCard className="w-3.5 h-3.5" /> Ma carte
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start gap-2 text-xs text-muted-foreground">
              <LogOut className="w-3.5 h-3.5" /> Déconnexion
            </Button>
          </nav>
        )}
      </header>

      {/* Inject member context */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {member && children}
      </main>
    </div>
  );
}
