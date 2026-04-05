"use client";

import { useEffect, useState } from "react";
import { api, PrayerTimeEntry } from "@/lib/api";
import { Clock, Sun, Sunrise, Sunset, Moon, CloudSun } from "lucide-react";

const PRAYERS = [
  { key: "fajr", label: "Fajr", startKey: "fajr_start", iqamaKey: "fajr_iqama", icon: Sunrise },
  { key: "shurooq", label: "Shurooq", startKey: "shurooq", iqamaKey: null, icon: Sun },
  { key: "zuhr", label: "Zuhr", startKey: "zuhr_start", iqamaKey: "zuhr_iqama", icon: CloudSun },
  { key: "asr", label: "Asr", startKey: "asr_start", iqamaKey: "asr_iqama", icon: Sun },
  { key: "maghrib", label: "Maghreb", startKey: "maghrib_start", iqamaKey: "maghrib_iqama", icon: Sunset },
  { key: "isha", label: "Isha", startKey: "isha_start", iqamaKey: "isha_iqama", icon: Moon },
] as const;

function getTodayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatTime(t: string): string {
  if (!t) return "-";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function getCurrentPrayerIndex(entry: PrayerTimeEntry): number {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  function toMin(t: string): number {
    if (!t) return -1;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  const times = [
    toMin(entry.fajr_start),
    toMin(entry.shurooq),
    toMin(entry.zuhr_start),
    toMin(entry.asr_start),
    toMin(entry.maghrib_start),
    toMin(entry.isha_start),
  ];

  let current = -1;
  for (let i = 0; i < times.length; i++) {
    if (times[i] >= 0 && nowMinutes >= times[i]) {
      current = i;
    }
  }
  return current;
}

function getNextPrayer(entry: PrayerTimeEntry, currentIdx: number): { label: string; time: string; minutesLeft: number } | null {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  function toMin(t: string): number {
    if (!t) return -1;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  const allTimes = PRAYERS.map((p) => ({
    label: p.label,
    minutes: toMin(entry[p.startKey as keyof PrayerTimeEntry] as string),
    time: entry[p.startKey as keyof PrayerTimeEntry] as string,
  }));

  for (const t of allTimes) {
    if (t.minutes > nowMinutes) {
      return { label: t.label, time: t.time, minutesLeft: t.minutes - nowMinutes };
    }
  }

  if (allTimes[0].minutes >= 0) {
    return { label: allTimes[0].label, time: allTimes[0].time, minutesLeft: (24 * 60 - nowMinutes) + allTimes[0].minutes };
  }

  return null;
}

interface PrayerTimesProps {
  compact?: boolean;
}

export function PrayerTimes({ compact = false }: PrayerTimesProps) {
  const [entry, setEntry] = useState<PrayerTimeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(-1);

  useEffect(() => {
    api
      .getPrayerTimes()
      .then((res) => {
        const todayKey = getTodayKey();
        const todayEntry = res.times[todayKey];
        if (todayEntry) {
          setEntry(todayEntry);
          setCurrentIdx(getCurrentPrayerIndex(todayEntry));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!entry) return;
    const interval = setInterval(() => {
      setCurrentIdx(getCurrentPrayerIndex(entry));
    }, 60000);
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

  const nextPrayer = getNextPrayer(entry, currentIdx);

  if (compact) {
    return (
      <div className="space-y-2">
        {nextPrayer && (
          <div className="flex items-center justify-between bg-primary/10 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">
                Prochaine : {nextPrayer.label}
              </span>
            </div>
            <span className="text-sm font-bold font-mono text-primary">
              {formatTime(nextPrayer.time)}
            </span>
          </div>
        )}
        <div className="grid grid-cols-3 gap-1.5">
          {PRAYERS.map((p, i) => {
            const startTime = entry[p.startKey as keyof PrayerTimeEntry] as string;
            const isCurrent = i === currentIdx;
            return (
              <div
                key={p.key}
                className={`rounded-lg px-2 py-1.5 text-center transition-all ${
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50"
                }`}
              >
                <p className={`text-[9px] font-semibold uppercase tracking-wider ${isCurrent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {p.label}
                </p>
                <p className="text-xs font-bold font-mono">{formatTime(startTime)}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-medium uppercase tracking-wider">
            Aujourd&apos;hui
          </span>
        </div>
        <div className="flex items-center gap-3">
          {nextPrayer && (
            <span className="text-[11px] font-medium text-primary bg-primary/10 rounded-full px-3 py-0.5">
              Prochaine : {nextPrayer.label} dans {nextPrayer.minutesLeft < 60 ? `${nextPrayer.minutesLeft}min` : `${Math.floor(nextPrayer.minutesLeft / 60)}h${String(nextPrayer.minutesLeft % 60).padStart(2, "0")}`}
            </span>
          )}
          <a
            href="https://mosqueprayertimes.com/aemul"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted-foreground/50 hover:text-primary transition-colors"
          >
            mosqueprayertimes.com
          </a>
        </div>
      </div>

      {/* Hijri date */}
      {entry.hijri && (
        <p className="text-center text-[11px] text-muted-foreground/60">
          {entry.hijri}
        </p>
      )}

      {/* Prayer grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {PRAYERS.map((p, i) => {
          const startTime = entry[p.startKey as keyof PrayerTimeEntry] as string;
          const iqamaTime = p.iqamaKey
            ? (entry[p.iqamaKey as keyof PrayerTimeEntry] as string)
            : null;
          const isCurrent = i === currentIdx;

          return (
            <div
              key={p.key}
              className={`relative rounded-xl p-3 text-center transition-all ${
                isCurrent
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.03]"
                  : "bg-card border hover:bg-muted/30"
              }`}
            >
              <p.icon
                className={`w-4 h-4 mx-auto mb-1.5 ${
                  isCurrent ? "text-[#e6b94d]" : "text-muted-foreground"
                }`}
              />
              <p
                className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${
                  isCurrent ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {p.label}
              </p>
              <p className="text-sm font-bold font-mono">
                {formatTime(startTime)}
              </p>
              {iqamaTime && (
                <p
                  className={`text-[10px] mt-0.5 ${
                    isCurrent ? "text-primary-foreground/60" : "text-muted-foreground/60"
                  }`}
                >
                  Iqama {formatTime(iqamaTime)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Jumah times */}
      {(entry.jumah || entry.jumah2) && (
        <div className="flex items-center justify-center gap-4 pt-1">
          {entry.jumah && (
            <span className="text-[11px] text-muted-foreground">
              Jumu&apos;ah : <span className="font-mono font-bold text-foreground">{formatTime(entry.jumah)}</span>
            </span>
          )}
          {entry.jumah2 && (
            <span className="text-[11px] text-muted-foreground">
              Jumu&apos;ah 2 : <span className="font-mono font-bold text-foreground">{formatTime(entry.jumah2)}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
