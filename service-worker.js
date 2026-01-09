/* TESOURA SW - cache fix (no-store) */
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const path = url.pathname || "";

  const isHtml =
    req.mode === "navigate" ||
    req.destination === "document" ||
    path.endsWith(".html") ||
    path.endsWith("/");

  const isCore = path.includes("/app/core/");
  const isJs = req.destination === "script" || path.endsWith(".js");

  if (isHtml || isCore || isJs) {
    event.respondWith(
      fetch(req, { cache: "no-store" }).catch(() => fetch(req))
    );
  }
});
