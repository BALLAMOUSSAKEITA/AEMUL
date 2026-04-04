"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Star,
} from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-20 md:py-28 text-center overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 geometric-pattern" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background/80 to-background" />

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/5 animate-float hidden md:block" />
        <div className="absolute top-40 right-16 w-14 h-14 rounded-full bg-[var(--gold)]/10 animate-float-delay hidden md:block" />
        <div className="absolute bottom-32 left-1/4 w-10 h-10 rounded-full bg-primary/8 animate-float-delay hidden md:block" />

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Logo */}
          <div className="animate-fade-in-up">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-500">
              <span className="text-4xl md:text-5xl font-bold text-primary-foreground font-[var(--font-heading)]">
                A
              </span>
            </div>
          </div>

          <div className="animate-fade-in-up-delay">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3 font-[var(--font-heading)]">
              <span className="text-primary">AEM</span>
              <span className="text-[var(--gold)]">UL</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-1">
              Association des Etudiants Musulmans
            </p>
            <p className="text-lg md:text-xl text-muted-foreground mb-10">
              de l&apos;Universite Laval
            </p>
          </div>

          <div className="animate-fade-in-up-delay-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/inscription">
              <Button
                size="lg"
                className="text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 gap-2 w-full sm:w-auto"
              >
                S&apos;inscrire comme membre
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-secondary/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Star className="w-3.5 h-3.5" />
              Pourquoi nous rejoindre
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-heading)]">
              Tout ce qu&apos;il vous faut
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: "Inscription rapide",
                desc: "Remplissez le formulaire en quelques minutes et devenez membre officiel de l'AEMUL.",
                gradient: "from-primary/10 to-primary/5",
                iconBg: "bg-primary/15",
                iconColor: "text-primary",
              },
              {
                icon: CreditCard,
                title: "Carte de membre",
                desc: "Generez votre carte de membre numerique avec QR Code et code-barres unique.",
                gradient: "from-[var(--gold)]/10 to-[var(--gold)]/5",
                iconBg: "bg-[var(--gold)]/15",
                iconColor: "text-[var(--gold)]",
              },
              {
                icon: ShieldCheck,
                title: "Securise",
                desc: "Vos donnees sont protegees. Votre carte est generee dynamiquement a chaque consultation.",
                gradient: "from-primary/10 to-primary/5",
                iconBg: "bg-primary/15",
                iconColor: "text-primary",
              },
            ].map((f) => (
              <div
                key={f.title}
                className={`group relative bg-gradient-to-br ${f.gradient} rounded-2xl p-8 border border-border/50 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                <div
                  className={`w-14 h-14 rounded-xl ${f.iconBg} flex items-center justify-center mb-5`}
                >
                  <f.icon className={`w-7 h-7 ${f.iconColor}`} />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90" />
        <div className="absolute inset-0 geometric-pattern opacity-10" />
        <div className="relative z-10 max-w-xl mx-auto text-center text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[var(--font-heading)]">
            Pret a nous rejoindre ?
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            L&apos;inscription ne prend que 2 minutes. Rejoignez la communaute
            AEMUL des aujourd&apos;hui.
          </p>
          <Link href="/inscription">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-base rounded-xl shadow-lg gap-2"
            >
              Commencer l&apos;inscription
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-card">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">
                A
              </span>
            </div>
            <span className="font-semibold text-sm">AEMUL</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} AEMUL - Tous droits reserves
          </p>
          <Link
            href="/admin/login"
            className="text-xs text-muted-foreground/60 hover:text-primary transition-colors"
          >
            Administration
          </Link>
        </div>
      </footer>
    </main>
  );
}
