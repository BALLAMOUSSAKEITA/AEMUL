const CACHE_NAME = "aemul-v3";

const STATIC_ASSETS = [
  "/",
  "/evenements",
  "/connexion",
  "/inscription",
  "/espace-membre",
  "/manifest.json",
  "/logo-aemul.jpg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// API endpoints mis en cache pour une utilisation hors-ligne
const API_CACHE_URLS = [
  "/api/prayer-times",
  "/api/events",
];

// ── Install : pré-cache les assets statiques ──────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(STATIC_ASSETS).catch(() => {})
    )
  );
  self.skipWaiting();
});

// ── Activate : supprime les anciens caches ────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch : stratégies par type de ressource ──────────────────────────────────
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Stratégie API : Network-first → cache en fallback
  const isApiRequest = API_CACHE_URLS.some((path) =>
    url.pathname.startsWith(path)
  );

  if (isApiRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then(
            (cached) =>
              cached ||
              new Response(
                JSON.stringify({ error: "Hors-ligne, données non disponibles" }),
                { headers: { "Content-Type": "application/json" }, status: 503 }
              )
          )
        )
    );
    return;
  }

  // Stratégie pages & assets : Network-first → cache fallback
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});

// ── Notifications de prière ───────────────────────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "PRAYER_NOTIFICATION") {
    const { title, body, tag } = event.data;
    self.registration.showNotification(title, {
      body,
      tag,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: true,
      silent: false,
    });
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      if (clients.length > 0) return clients[0].focus();
      return self.clients.openWindow("/espace-membre");
    })
  );
});
