// public/sw.js

const CACHE_NAME = 'stop-game-cache-v1.2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/android-chrome-192x192.png',
  '/apple-touch-icon.png',
  '/sounds/background-music.mp3',
  '/sounds/button-click.mp3',
  '/sounds/round-lose.mp3',
  '/sounds/round-win.mp3',
  '/sounds/spin-end.mp3',
  '/sounds/spin-start.mp3',
  '/sounds/timer-tick.mp3'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache abierta, añadiendo assets estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Assets estáticos cacheados. Activación en espera.');
        return self.skipWaiting(); // Forzar la activación del nuevo SW
      })
      .catch(error => {
        console.error('[SW] Falló el precaching de assets:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        console.log('[SW] Service Worker activado y listo para tomar el control.');
        return self.clients.claim(); // Tomar control inmediato de los clientes
    })
  );
});


self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // No cachear peticiones que no son GET
  if (request.method !== 'GET') {
    return;
  }
  
  const url = new URL(request.url);

  // Estrategia Network First para el HTML principal para asegurar que siempre esté actualizado.
  if (request.mode === 'navigate' && url.pathname === '/') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Si la red responde, cachea y devuelve la respuesta
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // Si la red falla, busca en la caché
          return caches.match(request);
        })
    );
    return;
  }

  // Estrategia Cache First para assets estáticos
  if (STATIC_ASSETS.some(asset => url.pathname.endsWith(asset))) {
     event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request).then(response => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, response.clone());
                        return response;
                    });
                });
            })
    );
    return;
  }

  // Para otros assets (como los chunks de Next.js), Cache First también es una buena estrategia.
  // Si no está en caché, lo busca en la red y lo añade a la caché para futuras peticiones.
   event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request).then(response => {
                     // Solo cachear respuestas válidas (status 200)
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                    return response;
                });
            })
    );
});
