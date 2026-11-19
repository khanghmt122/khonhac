// KhoNhac Service Worker for Full Offline PWA Playback
const SHELL_CACHE = 'khonhac-shell-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== SHELL_CACHE && key !== 'khonhac-audio-cache-v1')
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Audio / API calls: Network first with Cache fallback
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/downloads/')) {
    event.respondWith(
      fetch(event.request).catch(async () => {
        // If offline and requesting audio, try finding it in audio cache
        const audioCache = await caches.open('khonhac-audio-cache-v1');
        const match = await audioCache.match(event.request);
        if (match) return match;
        return new Response(JSON.stringify({ error: 'Offline - Media not in local cache' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    return;
  }

  // Static Assets / Shell: Cache first, fallback to network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((networkRes) => {
        if (networkRes.ok && event.request.method === 'GET' && !url.pathname.startsWith('/@')) {
          caches.open(SHELL_CACHE).then((cache) => {
            cache.put(event.request, networkRes.clone()).catch(() => {});
          });
        }
        return networkRes;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
