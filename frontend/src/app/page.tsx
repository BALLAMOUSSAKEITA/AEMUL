"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Star,
  Sunrise,
  LogIn,
  Lightbulb,
  Send,
  Loader2,
  CalendarDays,
  MapPin,
  Clock,
} from "lucide-react";
import { PrayerTimes } from "@/components/PrayerTimes";
import { Logo, LogoText } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Chatbot } from "@/components/Chatbot";
import { useI18n } from "@/lib/i18n";
import { api, Event } from "@/lib/api";

export default function Home() {
  const { t } = useI18n();
  const [ideaText, setIdeaText] = useState("");
  const [ideaLoading, setIdeaLoading] = useState(false);
  const [ideaSent, setIdeaSent] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  useEffect(() => {
    api.listEvents(true).then((events) => setUpcomingEvents(events.slice(0, 3))).catch(() => {});
  }, []);

  async function submitIdea() {
    if (!ideaText.trim()) return;
    setIdeaLoading(true);
    try {
      await api.submitIdea(ideaText.trim());
      setIdeaText("");
      setIdeaSent(true);
      setTimeout(() => setIdeaSent(false), 4000);
    } catch { /* ignore */ }
    setIdeaLoading(false);
  }

  return (
    <main className="flex flex-col min-h-screen">
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-20 md:py-28 text-center overflow-hidden">
        <div className="absolute inset-0 geometric-pattern" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background/80 to-background" />

        <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/5 animate-float hidden md:block" />
        <div className="absolute top-40 right-16 w-14 h-14 rounded-full bg-[var(--gold)]/10 animate-float-delay hidden md:block" />
        <div className="absolute bottom-32 left-1/4 w-10 h-10 rounded-full bg-primary/8 animate-float-delay hidden md:block" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="animate-fade-in-up">
            <div className="mx-auto mb-8 hover:scale-105 transition-transform duration-500">
              <Logo size={128} className="mx-auto shadow-lg shadow-primary/20 rounded-2xl" />
            </div>
          </div>

          <div className="animate-fade-in-up-delay">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3 font-[var(--font-heading)]">
              <LogoText className="text-4xl md:text-6xl" />
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-1">
              {t("home.subtitle1")}
            </p>
            <p className="text-lg md:text-xl text-muted-foreground mb-10">
              {t("home.subtitle2")}
            </p>
          </div>

          <div className="animate-fade-in-up-delay-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/inscription">
              <Button
                size="lg"
                className="text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 gap-2 w-full sm:w-auto"
              >
                {t("home.register_btn")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/connexion">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 py-6 rounded-xl transition-all duration-300 hover:-translate-y-0.5 gap-2 w-full sm:w-auto"
              >
                <LogIn className="w-4 h-4" />
                {t("nav.member_area")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Prayer Times */}
      <section className="py-12 px-4 bg-gradient-to-b from-background to-secondary/20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-[var(--gold)]/10 text-[var(--gold)] rounded-full px-4 py-1.5 text-sm font-medium mb-3">
              <Sunrise className="w-3.5 h-3.5" />
              {t("home.prayer_hours")}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)]">
              {t("home.daily_prayer")}
            </h2>
          </div>
          <PrayerTimes />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gradient-to-b from-secondary/20 to-secondary/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Star className="w-3.5 h-3.5" />
              {t("home.why_join")}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-heading)]">
              {t("home.all_you_need")}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: t("home.feature1_title"),
                desc: t("home.feature1_desc"),
                gradient: "from-primary/10 to-primary/5",
                iconBg: "bg-primary/15",
                iconColor: "text-primary",
              },
              {
                icon: CreditCard,
                title: t("home.feature2_title"),
                desc: t("home.feature2_desc"),
                gradient: "from-[var(--gold)]/10 to-[var(--gold)]/5",
                iconBg: "bg-[var(--gold)]/15",
                iconColor: "text-[var(--gold)]",
              },
              {
                icon: ShieldCheck,
                title: t("home.feature3_title"),
                desc: t("home.feature3_desc"),
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

      {/* Événements à venir */}
      {upcomingEvents.length > 0 && (
        <section className="py-16 px-4 bg-gradient-to-b from-secondary/30 to-secondary/10">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#14532d]/10 text-[#14532d] dark:text-emerald-400 rounded-full px-4 py-1.5 text-sm font-medium mb-3">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Prochainement
                </div>
                <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-heading)]">
                  Événements à venir
                </h2>
              </div>
              <Link href="/evenements">
                <Button variant="outline" className="gap-2 rounded-xl shrink-0">
                  Tous les événements
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {upcomingEvents.map((event) => {
                const d = new Date(event.date);
                return (
                  <div
                    key={event.id}
                    className="bg-card border rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="h-1.5 bg-gradient-to-r from-[#14532d] to-[#22c55e]" />
                    <div className="p-5 flex gap-4">
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-[#14532d] text-white flex flex-col items-center justify-center font-bold shadow-sm">
                        <span className="text-lg leading-none">{d.getDate()}</span>
                        <span className="text-[9px] uppercase tracking-wider opacity-75">
                          {d.toLocaleDateString("fr-CA", { month: "short" })}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm line-clamp-2 leading-snug">{event.title}</p>
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate max-w-[120px]">{event.location}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Idea Box */}
      <section className="py-12 px-4 bg-gradient-to-b from-secondary/30 to-background">
        <div className="max-w-xl mx-auto">
          <div className="bg-card rounded-2xl border p-6 md:p-8">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <div>
                <h3 className="font-bold text-base">{t("idea.title")}</h3>
                <p className="text-xs text-muted-foreground">{t("idea.subtitle")}</p>
              </div>
            </div>
            {ideaSent ? (
              <p className="text-sm text-emerald-600 font-medium mt-4">{t("idea.success")}</p>
            ) : (
              <div className="flex gap-2 mt-4">
                <Input
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  placeholder={t("idea.placeholder")}
                  className="flex-1 h-11 rounded-xl"
                />
                <Button onClick={submitIdea} disabled={ideaLoading || !ideaText.trim()} className="h-11 rounded-xl gap-2 px-5">
                  {ideaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {t("idea.submit")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90" />
        <div className="absolute inset-0 geometric-pattern opacity-10" />
        <div className="relative z-10 max-w-xl mx-auto text-center text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[var(--font-heading)]">
            {t("home.cta_title")}
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            {t("home.cta_desc")}
          </p>
          <Link href="/inscription">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-base rounded-xl shadow-lg gap-2"
            >
              {t("home.cta_btn")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-card">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size={32} className="rounded-lg" />
            <span className="font-semibold text-sm">AEMUL</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} AEMUL - {t("common.all_rights")}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/evenements"
              className="text-xs text-muted-foreground/60 hover:text-primary transition-colors"
            >
              Événements
            </Link>
            <Link
              href="/a-propos"
              className="text-xs text-muted-foreground/60 hover:text-primary transition-colors"
            >
              {t("nav.about")}
            </Link>
            <Link
              href="/faq"
              className="text-xs text-muted-foreground/60 hover:text-primary transition-colors"
            >
              {t("nav.faq")}
            </Link>
            <Link
              href="/connexion"
              className="text-xs text-muted-foreground/60 hover:text-primary transition-colors"
            >
              {t("nav.member_area")}
            </Link>
            <Link
              href="/admin/login"
              className="text-xs text-muted-foreground/60 hover:text-primary transition-colors"
            >
              {t("nav.admin")}
            </Link>
          </div>
        </div>
      </footer>

      {/* Chatbot flottant */}
      <Chatbot />
    </main>
  );
}
