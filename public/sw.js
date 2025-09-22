// Nombre de la caché
const CACHE_NAME = 'stop-game-cache-v1.6';

// Archivos para cachear (core de la app)
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  // Rutas principales de la PWA
  '/play-solo',
  '/leaderboard',
  '/categories',
  // Es importante cachear los chunks de JS y CSS que Next.js genera.
  // Estos nombres pueden cambiar en cada build, así que esta es una limitación
  // de un sw.js estático. Una mejor solución usaría workbox-webpack-plugin.
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Abriendo caché y añadiendo archivos core');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Archivos core cacheados exitosamente');
        return self.skipWaiting();
      })
  );
});

// Activación del Service Worker y limpieza de cachés antiguas
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[Service Worker] Borrando caché antigua: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Reclamando clientes...');
      return self.clients.claim();
    })
  );
});

// Interceptación de peticiones (Estrategia: Stale-While-Revalidate)
self.addEventListener('fetch', (event) => {
    // No interceptar peticiones a Firebase
    if (event.request.url.includes('firestore.googleapis.com')) {
        return;
    }
    
    // Ignorar peticiones que no son GET
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    // Si la petición es exitosa, la guardamos en caché y la retornamos
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });

                // Devolvemos la respuesta cacheada inmediatamente si existe,
                // mientras la petición de red se ejecuta en segundo plano.
                // Si no hay respuesta cacheada, esperamos a la respuesta de red.
                return cachedResponse || fetchPromise;
            }).catch(() => {
                // Si todo falla (ni caché ni red), podemos devolver una página offline de fallback
                // return caches.match('/offline.html');
            })
        })
    );
});
