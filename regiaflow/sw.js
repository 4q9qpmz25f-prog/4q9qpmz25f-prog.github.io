// Service worker minimo, solo per lo spike PWA -- serve unicamente a
// soddisfare il criterio di installabilità dei browser (Chrome/Edge
// richiedono un fetch handler registrato, Safari no ma non fa male averlo)
// e a far funzionare l'app offline dopo la prima visita. Strategia
// volutamente semplice: network-first con fallback alla cache, così una
// release nuova arriva sempre appena la rete è disponibile (nessun rischio
// di restare bloccati su una versione vecchia in cache) e l'offline resta
// comunque coperto.
const CACHE = "regiaflow-shell-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});
