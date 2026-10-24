// public/admin-sw.js
const CACHE_NAME = '4su-admin-pwa-v1';
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

// Listen for messages from client (e.g. Logout to clear private cache)
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'LOGOUT') {
    event.waitUntil(caches.delete(CACHE_NAME));
  }
});

// Cache strategy: ONLY static public assets (icons & manifest) are cached.
// Authenticated /admin routes and data are NEVER stored in Cache Storage to prevent data leakage on shared devices.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests, API requests, and server actions
  if (event.request.method !== 'GET') {
    return;
  }

  // Static shell assets (icons, manifest) - Stale-While-Revalidate
  if (url.pathname.startsWith('/icons/') || url.pathname === '/admin-manifest.json') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Dynamic /admin pages: Network-only, NEVER cached in client-side storage
  if (url.pathname.startsWith('/admin')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          '<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Offline</title></head><body style="font-family:sans-serif;padding:2rem;text-align:center;"><h2>Koneksi Terputus</h2><p>Sesi CMS tidak dapat diakses saat offline demi keamanan data perusahaan.</p><button onclick="window.location.reload()" style="padding:0.5rem 1rem;cursor:pointer;">Muat Ulang</button></body></html>',
          {
            status: 503,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          }
        );
      })
    );
  }
});
