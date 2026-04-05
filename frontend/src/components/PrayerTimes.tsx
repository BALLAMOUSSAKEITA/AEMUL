"use client";

import { useEffect, useState } from "react";
import { api, PrayerTimeEntry } from "@/lib/api";
import { Clock, Sun, Sunrise, Sunset, Moon, CloudSun } from "lucide-react";

const PRAYERS = [
  { key: "fajr", label: "Fajr", arabicLabel: "الفجر", startKey: "fajr_start", iqamaKey: "fajr_iqama", icon: Sunrise, gradient: "from-indigo-500 to-blue-600" },
  { key: "shurooq", label: "Shurooq", arabicLabel: "الشروق", startKey: "shurooq", iqamaKey: null, icon: Sun, gradient: "from-amber-400 to-orange-500" },
  { key: "zuhr", label: "Dhuhr", arabicLabel: "الظهر", startKey: "zuhr_start", iqamaKey: "zuhr_iqama", icon: CloudSun, gradient: "from-yellow-400 to-amber-500" },
  { key: "asr", label: "Asr", arabicLabel: "العصر", startKey: "asr_start", iqamaKey: "asr_iqama", icon: Sun, gradient: "from-orange-400 to-orange-600" },
  { key: "maghrib", label: "Maghreb", arabicLabel: "المغرب", startKey: "maghrib_start", iqamaKey: "maghrib_iqama", icon: Sunset, gradient: "from-rose-400 to-pink-600" },
  { key: "isha", label: "Isha", arabicLabel: "العشاء", startKey: "isha_start", iqamaKey: "isha_iqama", icon: Moon, gradient: "from-violet-500 to-indigo-700" },
] as const;

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatTime24(t: string): string {
  if (!t) return "-";
  const [h, m] = t.split(":").map(Number);
  return `${h}h${String(m).padStart(2, "0")}`;
}

function toMin(t: string): number {
  if (!t) return -1;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function getNextPrayerIndex(entry: PrayerTimeEntry): number {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const times = PRAYERS.map((p) =>
    toMin(entry[p.startKey as keyof PrayerTimeEntry] as string)
  );
  for (let i = 0; i < times.length; i++) {
    if (times[i] >= 0 && times[i] > nowMinutes) return i;
  }
  return 0;
}

function formatCountdown(minutesLeft: number): string {
  if (minutesLeft < 1) return "Maintenant";
  const h = Math.floor(minutesLeft / 60);
  const m = minutesLeft % 60;
  if (h === 0) return `${m} min`;
  return `${h}h ${String(m).padStart(2, "0")}min`;
}

interface PrayerTimesProps {
  compact?: boolean;
}

export function PrayerTimes({ compact = false }: PrayerTimesProps) {
  const [entry, setEntry] = useState<PrayerTimeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextIdx, setNextIdx] = useState(0);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    api
      .getPrayerTimes()
      .then((res) => {
        const todayEntry = res.times[getTodayKey()];
        if (todayEntry) {
          setEntry(todayEntry);
          setNextIdx(getNextPrayerIndex(todayEntry));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!entry) return;
    const interval = setInterval(() => {
      setNow(new Date());
      setNextIdx(getNextPrayerIndex(entry));
    }, 30000);
    return () => clearInterval(interval);
  }, [entry]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!entry) {
    return (
      <p className="text-center text-sm text-muted-foreground py-4">
        Heures de prières indisponibles pour le moment.
      </p>
    );
  }

  const nextPrayer = PRAYERS[nextIdx];
  const nextTime = entry[nextPrayer.startKey as keyof PrayerTimeEntry] as string;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  let minutesLeft = toMin(nextTime) - nowMinutes;
  if (minutesLeft < 0) minutesLeft += 24 * 60;

  if (compact) {
    return (
      <div className="bg-card rounded-2xl border overflow-hidden">
        <div className={`bg-gradient-to-r ${nextPrayer.gradient} p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <nextPrayer.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">
                Prochaine prière
              </p>
              <p className="text-white font-bold text-base leading-tight">
                {nextPrayer.label}
                <span className="text-white/50 text-xs font-normal ml-1.5">{nextPrayer.arabicLabel}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-xl font-mono tabular-nums">
              {formatTime24(nextTime)}
            </p>
            <p className="text-white/60 text-[10px] font-medium">
              dans {formatCountdown(minutesLeft)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-6 divide-x divide-border">
          {PRAYERS.map((p, i) => {
            const startTime = entry[p.startKey as keyof PrayerTimeEntry] as string;
            const isNext = i === nextIdx;
            const isPast = toMin(startTime) <= nowMinutes && !isNext;
            return (
              <div
                key={p.key}
                className={`py-3 px-1 text-center transition-all ${
                  isNext ? "bg-primary/5" : ""
                }`}
              >
                <p className={`text-[8px] font-bold uppercase tracking-wider mb-1 ${
                  isNext ? "text-primary" : isPast ? "text-muted-foreground/40" : "text-muted-foreground"
                }`}>
                  {p.label}
                </p>
                <p className={`text-[11px] font-bold font-mono tabular-nums ${
                  isNext ? "text-primary" : isPast ? "text-muted-foreground/40" : "text-foreground"
                }`}>
                  {formatTime24(startTime)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`relative bg-gradient-to-br ${nextPrayer.gradient} rounded-2xl p-5 overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-white/60 text-[10px] font-semibold uppercase tracking-[0.2em]">
              Prochaine prière
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-white font-bold text-2xl">{nextPrayer.label}</h3>
              <span className="text-white/40 text-sm">{nextPrayer.arabicLabel}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Clock className="w-3.5 h-3.5 text-white/50" />
              <p className="text-white/70 text-sm font-medium">
                dans {formatCountdown(minutesLeft)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-2">
              <nextPrayer.icon className="w-7 h-7 text-white" />
            </div>
            <p className="text-white font-bold text-2xl font-mono tabular-nums">
              {formatTime24(nextTime)}
            </p>
          </div>
        </div>

        {entry.hijri && (
          <div className="relative mt-4 pt-3 border-t border-white/10">
            <p className="text-white/40 text-xs">{entry.hijri}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {PRAYERS.map((p, i) => {
          const startTime = entry[p.startKey as keyof PrayerTimeEntry] as string;
          const iqamaTime = p.iqamaKey
            ? (entry[p.iqamaKey as keyof PrayerTimeEntry] as string)
            : null;
          const isNext = i === nextIdx;
          const isPast = toMin(startTime) <= nowMinutes && !isNext;
          const IconEl = p.icon;

          return (
            <div
              key={p.key}
              className={`relative rounded-2xl p-4 transition-all ${
                isNext
                  ? `bg-gradient-to-br ${p.gradient} text-white shadow-lg`
                  : "bg-card border hover:border-primary/20 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isNext ? "bg-white/20" : "bg-muted"
                }`}>
                  <IconEl className={`w-4.5 h-4.5 ${isNext ? "text-white" : "text-muted-foreground"}`} />
                </div>
                {isNext && (
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-white/20 rounded-full px-2 py-0.5">
                    Suivante
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <p className={`text-xs font-bold ${isNext ? "text-white" : isPast ? "text-muted-foreground/50" : "text-foreground"}`}>
                    {p.label}
                  </p>
                  <p className={`text-[10px] mt-0.5 ${isNext ? "text-white/50" : "text-muted-foreground/40"}`}>
                    {p.arabicLabel}
                  </p>
                </div>
                <p className={`text-lg font-bold font-mono tabular-nums ${
                  isNext ? "text-white" : isPast ? "text-muted-foreground/40" : "text-foreground"
                }`}>
                  {formatTime24(startTime)}
                </p>
              </div>

              {iqamaTime && (
                <div className={`mt-2.5 pt-2 border-t flex items-center justify-between ${
                  isNext ? "border-white/15" : "border-border"
                }`}>
                  <span className={`text-[10px] font-medium ${
                    isNext ? "text-white/50" : "text-muted-foreground/50"
                  }`}>
                    Iqama
                  </span>
                  <span className={`text-xs font-bold font-mono tabular-nums ${
                    isNext ? "text-white/80" : isPast ? "text-muted-foreground/30" : "text-muted-foreground"
                  }`}>
                    {formatTime24(iqamaTime)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {(entry.jumah || entry.jumah2) && (
        <div className="bg-card rounded-2xl border p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" />
                <path d="M5 21V7l7-4 7 4v14" />
                <path d="M9 21v-6h6v6" />
                <circle cx="12" cy="11" r="2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold">Jumu&apos;ah</p>
              <p className="text-[10px] text-muted-foreground">Prière du vendredi</p>
            </div>
          </div>
          <div className="flex gap-3">
            {entry.jumah && (
              <div className="flex-1 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-center">
                <p className="text-[10px] text-muted-foreground font-medium mb-1">1ère prière</p>
                <p className="text-lg font-bold font-mono tabular-nums text-emerald-700">
                  {formatTime24(entry.jumah)}
                </p>
              </div>
            )}
            {entry.jumah2 && (
              <div className="flex-1 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-center">
                <p className="text-[10px] text-muted-foreground font-medium mb-1">2ème prière</p>
                <p className="text-lg font-bold font-mono tabular-nums text-emerald-700">
                  {formatTime24(entry.jumah2)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="text-center">
        <a
          href="https://mosqueprayertimes.com/aemul"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-muted-foreground/40 hover:text-primary transition-colors"
        >
          Source : mosqueprayertimes.com
        </a>
      </div>
    </div>
  );
}
