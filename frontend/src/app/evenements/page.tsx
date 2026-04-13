"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Event } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  MapPin,
  ArrowRight,
  Clock,
  ChevronLeft,
  CalendarX,
  Loader2,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-CA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-CA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isUpcoming(iso: string) {
  return new Date(iso) >= new Date();
}

// ── Carte événement ───────────────────────────────────────────────────────────

function EventCard({ event, upcoming }: { event: Event; upcoming: boolean }) {
  const dateObj = new Date(event.date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString("fr-CA", { month: "short" });

  return (
    <div
      className={`group relative bg-card border rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col ${
        !upcoming ? "opacity-75" : ""
      }`}
    >
      {/* Bande colorée top */}
      <div
        className={`h-1.5 w-full ${
          upcoming
            ? "bg-gradient-to-r from-[#14532d] to-[#22c55e]"
            : "bg-gradient-to-r from-zinc-300 to-zinc-400 dark:from-zinc-600 dark:to-zinc-700"
        }`}
      />

      <div className="p-5 flex gap-4 flex-1">
        {/* Badge date */}
        <div
          className={`shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold shadow-sm ${
            upcoming
              ? "bg-[#14532d] text-white"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
          }`}
        >
          <span className="text-xl leading-none">{day}</span>
          <span className="text-[10px] uppercase tracking-wider opacity-80 mt-0.5">
            {month}
          </span>
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base leading-snug line-clamp-2">
              {event.title}
            </h3>
            {upcoming && (
              <span className="shrink-0 text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                À venir
              </span>
            )}
          </div>

          {event.description && (
            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{formatTime(event.date)}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[200px]">{event.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer carte */}
      <div className="px-5 pb-4">
        <div className="text-xs text-muted-foreground/60 capitalize">
          {formatDate(event.date)}
        </div>
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

function Section({
  title,
  badge,
  events,
  upcoming,
  emptyText,
}: {
  title: string;
  badge: string;
  events: Event[];
  upcoming: boolean;
  emptyText: string;
}) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${
            upcoming
              ? "bg-[#14532d]/10 text-[#14532d] dark:text-emerald-400"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          {badge}
        </div>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed text-center gap-3">
          <CalendarX className="w-10 h-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((e) => (
            <EventCard key={e.id} event={e} upcoming={upcoming} />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EvenementsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listEvents()
      .then(setEvents)
      .catch(() => setError("Impossible de charger les événements."))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = events
    .filter((e) => isUpcoming(e.date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const past = events
    .filter((e) => !isUpcoming(e.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <main className="min-h-screen bg-background">
      {/* Barre supérieure */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      {/* Hero */}
      <section className="relative py-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 geometric-pattern opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
            <Logo size={44} className="rounded-xl shadow-md" />
          </Link>

          <div className="inline-flex items-center gap-2 bg-[#14532d]/10 text-[#14532d] dark:text-emerald-400 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <CalendarDays className="w-3.5 h-3.5" />
            Vie associative
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Nos événements
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Retrouvez tous les événements organisés par l&apos;AEMUL — iftars, conférences, activités sportives et bien plus.
          </p>

          <div className="flex items-center justify-center gap-3 mt-8">
            <Link href="/">
              <Button variant="outline" className="gap-2 rounded-xl">
                <ChevronLeft className="w-4 h-4" />
                Accueil
              </Button>
            </Link>
            <Link href="/inscription">
              <Button className="gap-2 rounded-xl">
                S&apos;inscrire comme membre
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contenu */}
      <div className="max-w-5xl mx-auto px-4 pb-20 space-y-16">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-[#14532d]" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : (
          <>
            <Section
              title="Événements à venir"
              badge={`${upcoming.length} prévu${upcoming.length !== 1 ? "s" : ""}`}
              events={upcoming}
              upcoming={true}
              emptyText="Aucun événement à venir pour l'instant. Revenez bientôt !"
            />
            {past.length > 0 && (
              <Section
                title="Événements passés"
                badge={`${past.length} passé${past.length !== 1 ? "s" : ""}`}
                events={past}
                upcoming={false}
                emptyText="Aucun événement passé."
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}
