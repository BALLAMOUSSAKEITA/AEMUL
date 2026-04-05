import { PrayerTimeEntry } from "./api";

const PRAYER_NAMES: Record<string, string> = {
  fajr_start: "Fajr",
  shurooq: "Shurooq",
  zuhr_start: "Zuhr",
  asr_start: "Asr",
  maghrib_start: "Maghreb",
  isha_start: "Isha",
};

const NOTIFIABLE_KEYS = ["fajr_start", "zuhr_start", "asr_start", "maghrib_start", "isha_start"];

let scheduledTimers: ReturnType<typeof setTimeout>[] = [];

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function toMinutes(t: string): number {
  if (!t) return -1;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function playAdhan() {
  try {
    const audio = new Audio("/adhan.wav");
    audio.volume = 0.8;
    audio.play().catch(() => {});
  } catch {
    // Audio not available
  }
}

function showPrayerNotification(prayerName: string) {
  if (Notification.permission !== "granted") return;

  // Try service worker notification first (works in background)
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "PRAYER_NOTIFICATION",
      title: `Adhan - ${prayerName}`,
      body: `C'est l'heure de la prière de ${prayerName}`,
      tag: `prayer-${prayerName}`,
    });
  } else {
    new Notification(`Adhan - ${prayerName}`, {
      body: `C'est l'heure de la prière de ${prayerName}`,
      icon: "/icons/icon-192.png",
      tag: `prayer-${prayerName}`,
      requireInteraction: true,
    });
  }

  playAdhan();
}

export function schedulePrayerNotifications(entry: PrayerTimeEntry) {
  // Clear previous timers
  scheduledTimers.forEach(clearTimeout);
  scheduledTimers = [];

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowSeconds = now.getSeconds();

  for (const key of NOTIFIABLE_KEYS) {
    const time = entry[key as keyof PrayerTimeEntry] as string;
    const prayerMin = toMinutes(time);
    if (prayerMin < 0) continue;

    const diffMinutes = prayerMin - nowMinutes;
    if (diffMinutes <= 0) continue;

    const delayMs = (diffMinutes * 60 - nowSeconds) * 1000;
    const name = PRAYER_NAMES[key] || key;

    const timer = setTimeout(() => {
      showPrayerNotification(name);
    }, delayMs);

    scheduledTimers.push(timer);
  }

  // Schedule recalculation at midnight
  const msUntilMidnight =
    ((24 - now.getHours()) * 3600 - now.getMinutes() * 60 - now.getSeconds()) * 1000;

  const midnightTimer = setTimeout(() => {
    // Refetch and reschedule (will be handled by the layout re-mount or page visibility)
    scheduledTimers = [];
  }, msUntilMidnight);

  scheduledTimers.push(midnightTimer);
}
