/* TESOURA - SW AUTO-LIMPEZA (SEM CACHE) */
const SW_REV = "SW_CLEAN_20260104_01";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // apaga QUALQUER cache antigo (de qualquer revisão)
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));

    // assume controle imediatamente
    await self.clients.claim();

    // se desinstala para acabar com “versão velha presa”
    try { await self.registration.unregister(); } catch (e) {}

    // força recarregar as abas para pegar o site direto da rede
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    clients.forEach((c) => { try { c.navigate(c.url); } catch (e) {} });
  })());
});

// enquanto estiver ativo, não faz cache de nada
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request, { cache: "no-store" }));
});
