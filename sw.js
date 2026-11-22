/* Self-updating service worker for Orchard GPS.

   No version number to bump: just push. The app opens instantly from the saved
   copy, then the page sends "check": every shell file is re-fetched past the
   HTTP cache, the saved copy is refreshed, and if index.html came back different
   every open window is sent "updated" so it can show its "new version" bar. */
"use strict";

var CACHE_PREFIX = "orchard-gps-";   /* this app's caches only — see activate */
var CACHE = "orchard-gps-shell";     /* fixed name; never changes between deploys */
var INDEX = "./index.html";

var SHELL = [
  INDEX,
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./qr.svg",
  "./qr.png"
];

function sameBytes(a, b){
  if (a.byteLength !== b.byteLength) return false;
  var x = new Uint8Array(a), y = new Uint8Array(b);
  for (var i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
  return true;
}

/* Fetch one file past the HTTP cache (GitHub Pages sends max-age=600) and store it.
   Resolves true only when a copy was already saved and the new one differs.
   Errors and non-200 answers leave the saved copy alone, so a 404/503 can never
   replace the app with an error page. */
function refresh(url){
  return fetch(url, { cache: "no-cache" }).then(function(res){
    if (!res || !res.ok) return false;
    return caches.open(CACHE).then(function(c){
      return c.match(url).then(function(old){
        return Promise.all([
          old ? old.arrayBuffer() : null,
          res.clone().arrayBuffer()
        ]).then(function(b){
          var changed = !!b[0] && !sameBytes(b[0], b[1]);
          return c.put(url, res).then(function(){ return changed; });
        });
      });
    });
  }).catch(function(){ return false; });
}

function refreshShell(){
  return Promise.all(SHELL.map(refresh)).then(function(changed){
    return changed[SHELL.indexOf(INDEX)];
  });
}

/* install: save the app, then take over at once. Safe because the cache name is
   stable — a new worker never strands an open page on a deleted cache. */
self.addEventListener("install", function(e){
  e.waitUntil(refreshShell().then(function(){ return self.skipWaiting(); }));
});

/* activate: delete only THIS app's other caches (the old orchard-gps-v1…v5).
   Cache Storage is shared by every project page on stanleywoosweeleong.github.io,
   so caches without our prefix are never touched. */
self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        return (k.indexOf(CACHE_PREFIX) === 0 && k !== CACHE) ? caches.delete(k) : null;
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* fetch:
   - page        → the saved app, instantly (weak orchard signal never delays opening);
                   network only if nothing is saved yet
   - same-origin → saved copy first, then network, and save what comes back
   - other sites → left alone (map tiles, elevation, Leaflet from the CDN)
   Freshness is handled by the "check" message, not here. */
self.addEventListener("fetch", function(e){
  var req = e.request;
  if (req.method !== "GET") return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate"){
    e.respondWith(
      caches.match(INDEX).then(function(hit){
        if (hit) return hit;
        return fetch(req).then(function(res){
          if (res.ok){
            var copy = res.clone();
            caches.open(CACHE).then(function(c){ c.put(INDEX, copy); });
          }
          return res;
        });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function(hit){
      if (hit) return hit;
      return fetch(req).then(function(res){
        if (res && res.status === 200 && res.type === "basic"){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(req, copy); });
        }
        return res;
      });
    })
  );
});

/* "check" from a page: refresh the saved app and, if index.html changed, tell
   every open window so each can offer a Refresh. */
self.addEventListener("message", function(e){
  if (e.data !== "check") return;
  e.waitUntil(
    refreshShell().then(function(changed){
      if (!changed) return;
      return self.clients.matchAll({ type: "window" }).then(function(list){
        list.forEach(function(c){ c.postMessage("updated"); });
      });
    })
  );
});
