const OB_CACHE = "ornialleva-clienti-v30-99-1-refresh-20261101";
const OB_STATIC = [
  "./",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./favicon-32.png",
  "./favicon-16.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(OB_CACHE).then(cache => cache.addAll(OB_STATIC)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => (k.startsWith("ornibreed-") || k.startsWith("ornialleva-")) && k !== OB_CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname.includes("supabase.co")) return;
  const sameOrigin = url.origin === self.location.origin;
  const supportedCDN = url.hostname === "cdn.jsdelivr.net" || url.hostname === "cdnjs.cloudflare.com";
  if (!sameOrigin && !supportedCDN) return;
  event.respondWith((async () => {
    try {
      const fresh = await fetch(req, { cache: "no-store" });
      if (!fresh.ok && fresh.type !== "opaque") throw new Error("HTTP " + fresh.status);
      if (sameOrigin && fresh.ok) {
        const cache = await caches.open(OB_CACHE);
        cache.put(req.mode === "navigate" ? "./" : req, fresh.clone()).catch(() => {});
      }
      return fresh;
    } catch (error) {
      if (sameOrigin) {
        const cache = await caches.open(OB_CACHE);
        const saved = await cache.match(req.mode === "navigate" ? "./" : req);
        if (saved) return saved;
      }
      return Response.error();
    }
  })());
});
