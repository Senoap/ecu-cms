// public/sw.js - Auto-cleanup untuk PWA publik lama
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k.startsWith('4su-public-')).map((k) => caches.delete(k))
      );
    }).then(() => {
      return self.registration.unregister();
    })
  );
});
