// public/admin-sw.js
const CACHE_NAME = 'esu-admin-pwa-v1';
const PRECACHE_ASSETS = [
  '/admin-manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first strategy for admin navigation and dynamic assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests or server actions / API mutations
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle static assets or scoped admin routes
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/icons/') || url.pathname === '/admin-manifest.json') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If valid response, clone and update cache
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return new Response('Offline: Mohon periksa koneksi internet Anda.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
          });
        })
    );
  }
});
