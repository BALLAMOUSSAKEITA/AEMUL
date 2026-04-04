"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, CreditCard, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center bg-gradient-to-b from-primary/10 to-background">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-6">
          <span className="text-3xl font-bold text-primary-foreground">A</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          AEMUL
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mb-2">
          Association des Étudiants Musulmans
        </p>
        <p className="text-lg text-muted-foreground max-w-md mb-8">
          de l&apos;Université Laval
        </p>

        <Link href="/inscription">
          <Button size="lg" className="text-lg px-8 py-6 rounded-xl">
            S&apos;inscrire comme membre
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-card">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Inscription rapide</h3>
            <p className="text-muted-foreground text-sm">
              Remplissez le formulaire en quelques minutes et devenez membre officiel de l&apos;AEMUL.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Carte de membre</h3>
            <p className="text-muted-foreground text-sm">
              Générez votre carte de membre numérique avec QR Code et code-barres unique.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Sécurisé</h3>
            <p className="text-muted-foreground text-sm">
              Vos données sont protégées. Votre carte est générée dynamiquement à chaque consultation.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} AEMUL - Tous droits réservés</p>
        <Link
          href="/admin/login"
          className="text-xs text-muted-foreground/50 hover:text-muted-foreground mt-1 inline-block"
        >
          Administration
        </Link>
      </footer>
    </main>
  );
}
