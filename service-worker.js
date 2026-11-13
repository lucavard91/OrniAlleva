const OB_CACHE = "ornialleva-clienti-update-gate-v1";
const OB_STATIC = ["./", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png", "./favicon-32.png", "./favicon-16.png", "./ob_asset_051_3aefa10cbb.jpg", "./ornibreed_home_banner_v2.png"];
self.addEventListener("install", event => {
  // Migration from the previous network-first worker: cache the currently published app.
  event.waitUntil(caches.open(OB_CACHE).then(cache => cache.addAll(OB_STATIC)).then(() => self.skipWaiting()));
});
self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") event.waitUntil(self.skipWaiting());
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
  if (url.origin !== self.location.origin && !["cdn.jsdelivr.net","cdnjs.cloudflare.com"].includes(url.hostname)) return;
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      const target = url.searchParams.get("ob_release");
      const approved = /^\d+\.\d+\.\d+$/.test(target || "") && /^\d{10,}$/.test(url.searchParams.get("ob_refresh") || "");
      const cache = await caches.open(OB_CACHE);
      if (approved) {
        try {
          const fresh = await fetch(req, {cache:"no-store"});
          if (!fresh.ok) throw new Error("HTTP " + fresh.status);
          const html = await fresh.clone().text();
          const escaped = target.replace(/\./g, "\\.");
          if (!new RegExp('name="ornibreed-version"\\s+content="V?' + escaped + '"').test(html)) throw new Error("Version mismatch");
          await cache.put("./", fresh.clone());
          return fresh;
        } catch (e) {
          return (await cache.match("./")) || Response.error();
        }
      }
      return (await cache.match("./")) || fetch(req);
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
    } catch (_) { return Response.error(); }
  })());
});
