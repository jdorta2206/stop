// Define el nombre y la versión de la caché
const CACHE_NAME = 'stop-game-cache-v1.3';

// Lista de assets estáticos para cachear
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png',
  '/images/screenshots/screenshot-desktop.png',
  '/images/screenshots/screenshot-mobile.png',
  '/sounds/button-click.mp3',
  '/play-solo',
  '/leaderboard',
  '/categories'
];

self.addEventListener('install', event => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cache abierta, añadiendo assets estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Assets estáticos cacheados. Activación en espera.');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Fallo al cachear assets estáticos:', error);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activando Service Worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Eliminando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
        console.log('[SW] Service Worker activado y listo para tomar el control.');
        return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  // Solo interceptar peticiones de navegación
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          // 1. Intenta obtener la respuesta desde la red
          const networkResponse = await fetch(event.request);
          // Si la respuesta es válida, la guardamos en caché y la retornamos
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          // 2. Si la red falla, busca en la caché
          console.log('[SW] Red falló, buscando en caché:', event.request.url);
          const cachedResponse = await cache.match(event.request);
          // Si se encuentra en caché, la retornamos. Si no, dejamos que el navegador falle (mostrando su página de offline)
          return cachedResponse || fetch(event.request);
        }
      })
    );
  } else {
    // Para otros tipos de peticiones (CSS, JS, imágenes), usar la estrategia "cache-first"
     event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then(networkResponse => {
                // Opcional: Cachear nuevos recursos dinámicamente
                if(networkResponse.ok) {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            });
        })
    );
  }
});
