const CACHE_NAME = "otterbau-v1";
const APP_SHELL = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/favicon.ico"
];

// Install – App-Shell cachen
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(APP_SHELL)));
  self.skipWaiting();
});

// Activate – alte Caches löschen
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Fetch – Strategien
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // 1) Navigations-Requests → Network-First, Fallback /offline
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match("/offline"))
        )
    );
    return;
  }

  // 2) Statische Assets (js/css/fonts/img) → Stale-While-Revalidate
  if (/\.(?:js|css|woff2?|png|jpg|jpeg|webp|svg)$/.test(new URL(req.url).pathname)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const networkFetch = fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        });
        return cached || networkFetch;
      })
    );
    return;
  }

  // 3) Default → Netzwerk, Fallback Cache
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
