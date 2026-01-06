// Service Worker "seguro": não cacheia HTML/JS/CSS para evitar painel/versão errada.
// Mantém só o básico e sempre busca do servidor.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Network-first, sem cache persistente
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
