"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ArrowLeft, Heart, BookOpen, Users, Globe, MapPin, Mail } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b">
        <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={30} className="rounded-lg" />
            <span className="font-bold text-sm">AEMUL</span>
          </Link>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour à l&apos;accueil
        </Link>

        <h1 className="text-3xl font-bold font-[var(--font-heading)] mb-2">
          À propos de l&apos;AEMUL
        </h1>
        <p className="text-muted-foreground mb-10">
          Association des Étudiants Musulmans de l&apos;Université Laval
        </p>

        <div className="space-y-8">
          <section className="bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-8 text-primary-foreground">
            <h2 className="text-2xl font-bold font-[var(--font-heading)] mb-4">
              Notre mission
            </h2>
            <p className="text-primary-foreground/80 leading-relaxed">
              L&apos;AEMUL a pour mission de rassembler les étudiants musulmans de l&apos;Université Laval
              dans un esprit de fraternité, d&apos;entraide et de partage. Nous offrons un espace
              d&apos;épanouissement spirituel, social et académique à nos membres.
            </p>
          </section>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: Heart,
                title: "Fraternité",
                desc: "Créer des liens solides entre les étudiants musulmans du campus à travers des activités sociales et spirituelles.",
                color: "text-rose-500",
                bg: "bg-rose-500/10",
              },
              {
                icon: BookOpen,
                title: "Éducation",
                desc: "Organiser des conférences, cercles de science et ateliers pour approfondir la compréhension de l'Islam.",
                color: "text-blue-500",
                bg: "bg-blue-500/10",
              },
              {
                icon: Users,
                title: "Communauté",
                desc: "Faciliter l'intégration des nouveaux étudiants et créer un réseau d'entraide au sein du campus.",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
              },
              {
                icon: Globe,
                title: "Ouverture",
                desc: "Promouvoir le dialogue interculturel et faire connaître les valeurs de paix et de tolérance de l'Islam.",
                color: "text-amber-500",
                bg: "bg-amber-500/10",
              },
            ].map((v) => (
              <div key={v.title} className="bg-card rounded-2xl border p-6">
                <div className={`w-12 h-12 rounded-xl ${v.bg} flex items-center justify-center mb-4`}>
                  <v.icon className={`w-6 h-6 ${v.color}`} />
                </div>
                <h3 className="font-bold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>

          <section className="bg-card rounded-2xl border p-8">
            <h2 className="text-xl font-bold font-[var(--font-heading)] mb-6">
              Nos activités
            </h2>
            <ul className="space-y-3">
              {[
                "Prières collectives et gestion de la salle de prière",
                "Conférences et cercles de science islamique",
                "Iftars communautaires pendant le Ramadan",
                "Sorties et activités sociales",
                "Accueil et intégration des nouveaux étudiants",
                "Événements interassociatifs et interculturels",
              ].map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-card rounded-2xl border p-8">
            <h2 className="text-xl font-bold font-[var(--font-heading)] mb-6">
              Nous contacter
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <a href="mailto:admin@aemul.com" className="text-sm font-medium hover:text-primary transition-colors">
                    admin@aemul.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Adresse</p>
                  <p className="text-sm font-medium">Université Laval, Québec, QC, Canada</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
