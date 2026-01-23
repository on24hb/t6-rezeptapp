const CACHE_NAME = 'rezeptbuddy-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/manifest-icon-192.png',
  '/manifest-icon-512.png',
  '/apple-icon-180.png'
];

// Installation - Cache alle wichtigen Dateien
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📦 Caching app shell');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Aktivierung - Alte Caches löschen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - Network First, dann Cache Fallback
self.addEventListener('fetch', event => {
  // Ignoriere non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Nur erfolgreiche Responses cachen
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Response klonen (kann nur einmal gelesen werden)
        const responseClone = response.clone();

        // In Cache speichern
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });

        return response;
      })
      .catch(() => {
        // Falls Netzwerk fehlt, aus Cache laden
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            console.log('📦 Serving from cache:', event.request.url);
            return cachedResponse;
          }
          
          // Fallback: Offline-Seite anzeigen (optional)
          return new Response('Offline - Diese Seite ist nicht verfügbar', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});