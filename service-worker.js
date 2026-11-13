const OB_CACHE = "ornialleva-clienti-v34-18-9";
const OB_STATIC = [
  "./",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./favicon-32.png",
  "./favicon-16.png",
  "./ob_asset_051_3aefa10cbb.jpg",
  "./ornibreed_home_banner_v2.png"
];

self.addEventListener("install", event => {
  // Do not activate a new worker without an explicit user action.
  event.waitUntil(caches.open(OB_CACHE).then(cache => cache.addAll(OB_STATIC)));
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    event.waitUntil(self.skipWaiting());
  }
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k =>
      (k.startsWith("ornibreed-") || k.startsWith("ornialleva-")) && k !== OB_CACHE
    ).map(k => caches.delete(k)));
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

  if (req.mode === "navigate") {
    event.respondWith((async () => {
      const cached = await caches.match("./");
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        if (!fresh.ok) throw new Error("HTTP " + fresh.status);
        const cache = await caches.open(OB_CACHE);
        await cache.put("./", fresh.clone());
        return fresh;
      } catch (_) {
        return Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      if (fresh && (fresh.ok || fresh.type === "opaque")) {
        const cache = await caches.open(OB_CACHE);
        cache.put(req, fresh.clone()).catch(() => {});
      }
      return fresh;
    } catch (_) {
      return Response.error();
    }
  })());
});
