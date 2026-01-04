/* TESOURA SW - ANTI-CACHE (HTML network-first) */
const VERSION = "2026-01-04-anti-cache-01";
const CACHE_PREFIX = "tesoura-cache-";
const STATIC_CACHE = `${CACHE_PREFIX}${VERSION}`;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k.startsWith(CACHE_PREFIX) && k !== STATIC_CACHE)
        .map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Só controla o próprio site (mesma origem)
  if (url.origin !== self.location.origin) return;

  const accept = req.headers.get("accept") || "";
  const isHTML =
    req.mode === "navigate" ||
    accept.includes("text/html") ||
    url.pathname === "/" ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith("/index.html");

  // 1) HTML: sempre INTERNET primeiro (acabou “página velha”)
  if (isHTML) {
    event.respondWith((async () => {
      try {
        return await fetch(new Request(req, { cache: "no-store" }));
      } catch (e) {
        const cached = await caches.match(req);
        return cached || new Response("Offline", {
          status: 503,
          headers: { "content-type": "text/plain; charset=utf-8" }
        });
      }
    })());
    return;
  }

  // 2) Assets: cache rápido (stale-while-revalidate)
  event.respondWith((async () => {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(req);

    const fetchPromise = fetch(req)
      .then((res) => {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      })
      .catch(() => null);

    return cached || (await fetchPromise) || new Response("", { status: 504 });
  })());
});
