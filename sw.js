// Offline support for the app shell.
// Network first so updates arrive, but never wait more than NET_TIMEOUT_MS on a weak orchard
// connection: after that the cached copy is used and the network answer only refreshes the cache.
const CACHE = 'orchard-gps-v4';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './qr.svg', './qr.png'];
const NET_TIMEOUT_MS = 3000;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;   // map, elevation, CDN: not cached here
  const isPage = req.mode === 'navigate';
  const cacheKey = isPage ? './index.html' : req;                       // ignore ?fbclid=… etc. on the page

  // Fetch, bypassing the browser's HTTP cache for the page so updates show at once.
  // Only good, same-origin answers are stored, so an error page never replaces the cached app.
  const network = fetch(req, isPage ? { cache: 'no-cache' } : {});
  e.waitUntil(network.then(res => {          // registered now, so the worker stays alive until the cache is written
    if (res.ok && res.type === 'basic') {
      const copy = res.clone();
      return caches.open(CACHE).then(c => c.put(cacheKey, copy));
    }
  }).catch(() => {}));

  e.respondWith((async () => {
    const cached = await caches.match(cacheKey, { ignoreSearch: isPage });
    if (!cached) {
      try { return await network; }
      catch { return isPage ? (await caches.match('./index.html')) || Response.error() : Response.error(); }
    }
    // Race the network against a short timer; fall back to the cache on timeout or failure.
    const timeout = new Promise(res => setTimeout(() => res(null), NET_TIMEOUT_MS));
    try {
      const res = await Promise.race([network, timeout]);
      if (res && res.ok) return res;
    } catch {}
    return cached;                           // a late network answer still refreshes the cache (waitUntil above)
  })());
});
