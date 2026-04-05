"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ChevronDown, ArrowLeft } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Comment devenir membre de l'AEMUL ?",
    a: "Il suffit de remplir le formulaire d'inscription en ligne. Vous recevrez un mot de passe temporaire pour accéder à votre espace membre. Un administrateur validera ensuite votre inscription.",
  },
  {
    q: "Comment obtenir ma carte de membre ?",
    a: "Une fois votre inscription approuvée par un administrateur, rendez-vous dans l'onglet « Carte » de votre espace membre. Votre carte numérique s'affichera pendant 30 secondes pour des raisons de sécurité.",
  },
  {
    q: "J'ai oublié mon mot de passe, que faire ?",
    a: "Contactez un administrateur à admin@aemul.com pour réinitialiser votre mot de passe. Un nouveau mot de passe temporaire vous sera généré.",
  },
  {
    q: "Comment modifier mes informations personnelles ?",
    a: "Connectez-vous à votre espace membre et allez dans l'onglet « Profil ». Vous pouvez y modifier votre nom, téléphone, programme et niveau d'études.",
  },
  {
    q: "L'inscription est-elle gratuite ?",
    a: "Oui, l'inscription en tant que membre de l'AEMUL est entièrement gratuite.",
  },
  {
    q: "Comment sont protégées mes données personnelles ?",
    a: "Vos données sont stockées de manière sécurisée avec chiffrement des mots de passe. Nous respectons la Loi 25 du Québec sur la protection des renseignements personnels. Consultez notre politique de confidentialité lors de l'inscription.",
  },
  {
    q: "Comment recevoir les notifications de prière ?",
    a: "Lors de votre première visite dans l'espace membre, une demande d'autorisation de notifications apparaîtra. Acceptez-la pour recevoir les alertes Adhan aux heures de prière.",
  },
  {
    q: "Comment installer l'application sur mon téléphone ?",
    a: "Visitez le site depuis votre navigateur mobile. Un bandeau vous proposera d'installer l'application. Sur iOS, utilisez « Ajouter à l'écran d'accueil » depuis le menu de partage de Safari.",
  },
  {
    q: "Comment contacter l'AEMUL ?",
    a: "Vous pouvez nous écrire à admin@aemul.com ou nous retrouver sur nos réseaux sociaux. Nous sommes également présents sur le campus de l'Université Laval.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
          Questions fréquentes
        </h1>
        <p className="text-muted-foreground mb-10">
          Trouvez les réponses aux questions les plus courantes.
        </p>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="bg-card rounded-2xl border overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-sm pr-4">{item.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === i ? "max-h-96" : "max-h-0"
                }`}
              >
                <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
