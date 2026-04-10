"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ArrowLeft, Heart, BookOpen, Users, Globe, MapPin, Mail } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function AboutPage() {
  const { t } = useI18n();

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
          {t("common.back_home")}
        </Link>

        <h1 className="text-3xl font-bold font-[var(--font-heading)] mb-2">
          {t("about.title")}
        </h1>
        <p className="text-muted-foreground mb-10">
          {t("about.subtitle")}
        </p>

        <div className="space-y-8">
          <section className="bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-8 text-primary-foreground">
            <h2 className="text-2xl font-bold font-[var(--font-heading)] mb-4">
              {t("about.mission_title")}
            </h2>
            <p className="text-primary-foreground/80 leading-relaxed">
              {t("about.mission_desc")}
            </p>
          </section>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: Heart,
                titleKey: "about.fraternity_title",
                descKey: "about.fraternity_desc",
                color: "text-rose-500",
                bg: "bg-rose-500/10",
              },
              {
                icon: BookOpen,
                titleKey: "about.education_title",
                descKey: "about.education_desc",
                color: "text-blue-500",
                bg: "bg-blue-500/10",
              },
              {
                icon: Users,
                titleKey: "about.community_title",
                descKey: "about.community_desc",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
              },
              {
                icon: Globe,
                titleKey: "about.openness_title",
                descKey: "about.openness_desc",
                color: "text-amber-500",
                bg: "bg-amber-500/10",
              },
            ].map((v) => (
              <div key={v.titleKey} className="bg-card rounded-2xl border p-6">
                <div className={`w-12 h-12 rounded-xl ${v.bg} flex items-center justify-center mb-4`}>
                  <v.icon className={`w-6 h-6 ${v.color}`} />
                </div>
                <h3 className="font-bold mb-2">{t(v.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(v.descKey)}</p>
              </div>
            ))}
          </div>

          <section className="bg-card rounded-2xl border p-8">
            <h2 className="text-xl font-bold font-[var(--font-heading)] mb-6">
              {t("about.activities_title")}
            </h2>
            <ul className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>{t(`about.activity${i}`)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-card rounded-2xl border p-8">
            <h2 className="text-xl font-bold font-[var(--font-heading)] mb-6">
              {t("about.contact_title")}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("common.email")}</p>
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
                  <p className="text-xs text-muted-foreground">{t("about.address")}</p>
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
