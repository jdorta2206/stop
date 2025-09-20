// public/sw.js

const CACHE_NAME = 'stop-game-cache-v1.6';
const CORE_ASSETS = [
    '/manifest.json',
    '/images/icons/icon-192x192.png',
    '/images/icons/icon-512x512.png',
    '/'
];

// 1. Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache core assets during install:', error);
      })
  );
  self.skipWaiting();
});

// 2. Activación del Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log(`Service Worker: Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Interceptación de peticiones (Estrategia: Network First, fallback to Cache)
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no son GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Ignorar peticiones a Firebase
  if (event.request.url.includes('firestore.googleapis.com')) {
      return;
  }

  // Estrategia para peticiones de navegación y otros recursos
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si la petición a la red es exitosa, la cacheamos y la devolvemos
        if (networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              // No cachear respuestas parciales (status 206)
              if(responseToCache.status !== 206) {
                cache.put(event.request, responseToCache);
              }
            });
        }
        return networkResponse;
      })
      .catch(() => {
        // Si la red falla, intentamos servir desde la caché
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si no está en caché, y es una página, devuelve una página de offline genérica
          if (event.request.mode === 'navigate') {
            // Puedes crear una página /offline.html y cachearla en la instalación
            // Por ahora, devolvemos un error simple
            return new Response("<h1>You are offline</h1><p>This page could not be loaded.</p>", {
              headers: { 'Content-Type': 'text/html' }
            });
          }
          return new Response(null, { status: 404 });
        });
      })
  );
});
