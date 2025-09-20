// public/sw.js
const CACHE_NAME = 'stop-game-cache-v1.3'; // Incrementa la versión para forzar actualización
const urlsToCache = [
  '/',
  '/play-solo',
  '/leaderboard',
  '/categories',
  '/manifest.json',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/sounds/button-click.mp3',
  '/sounds/game-win.mp3',
  '/sounds/game-lose.mp3',
  '/sounds/roulette-spin.mp3',
  '/sounds/timer-tick.mp3',
  '/screenshots/screenshot1.png',
  '/screenshots/screenshot2.png',
  '/icons/play-icon.png',
  '/icons/ranking-icon.png'
  // Los archivos de JS y CSS de Next.js se cachearán dinámicamente
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache abierta, añadiendo assets estáticos');
        return cache.addAll(urlsToCache).catch(err => {
          console.error('[SW] Error al añadir assets estáticos a la caché:', err);
          // Este error puede pasar si uno de los archivos no existe.
          // Es importante verificar que todas las rutas en urlsToCache son correctas.
        });
      })
      .then(() => {
        console.log('[SW] Assets estáticos cacheados. Activación en espera.');
        return self.skipWaiting(); // Forzar la activación del nuevo SW
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[SW] Eliminando caché antigua: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service Worker activado y listo para tomar el control.');
      return self.clients.claim(); // Tomar control inmediato
    })
  );
});

// Intercepta las peticiones de red
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // No cachear peticiones a Firebase
  if (request.url.includes('firestore.googleapis.com')) {
    return;
  }

  // Estrategia: Network First para las páginas principales (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Si la petición a la red tiene éxito, la cacheamos y la devolvemos
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Si falla la red, buscamos en la caché
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/') || new Response("Estás offline.", { status: 503, statusText: "Service Unavailable" });
          });
        })
    );
    return;
  }

  // Estrategia: Cache First para assets estáticos (CSS, JS, imágenes, etc.)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        // Cachear la nueva respuesta para futuras peticiones
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
