// public/sw.js

const CACHE_NAME = 'stop-game-cache-v1.3';
const CORE_ASSETS = [
    '/',
    '/manifest.json',
    '/images/icons/android-chrome-192x192.png',
    '/images/icons/android-chrome-512x512.png',
    '/play-solo',
    '/leaderboard',
    '/categories'
];

// 1. Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cacheando assets principales');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[Service Worker] Fallo al cachear durante la instalación:', error);
      })
  );
});

// 2. Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Interceptación de Peticiones (Estrategia: Network First, then Cache)
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // No cachear peticiones que no son GET (ej. POST a Firebase)
  if (request.method !== 'GET') {
    return;
  }

  // No cachear peticiones a Firebase Firestore
  if (request.url.includes('firestore.googleapis.com')) {
    return;
  }

  // Para las rutas de navegación, usar Network First
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Si la respuesta de la red es válida, la cacheamos y la devolvemos
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Si la red falla, intentamos servir desde la caché
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/'); // Fallback a la página de inicio
          });
        })
    );
    return;
  }

  // Para otros assets (CSS, JS, imágenes), usar Cache First
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request).then((response) => {
        // Cachear la nueva respuesta para futuras peticiones
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return response;
      });
    })
  );
});
