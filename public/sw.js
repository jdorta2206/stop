// Define el nombre y la versión de la caché
const CACHE_NAME = 'stop-game-cache-v1.3';

// Lista de assets estáticos para cachear
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/sounds/button-click.mp3',
  '/sounds/game-win.mp3',
  '/sounds/game-lose.mp3',
  '/sounds/spin-start.mp3',
  '/sounds/spin-end.mp3',
  '/sounds/timer-tick.mp3',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png',
  '/images/icons/shortcut-play.png',
  '/images/icons/shortcut-ranking.png',
  '/images/screenshots/screenshot-desktop.png',
  '/images/screenshots/screenshot-mobile.png'
];

// Evento 'install': se dispara cuando el Service Worker se instala
self.addEventListener('install', event => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cache abierta, añadiendo assets estáticos');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
        console.log('[SW] Assets estáticos cacheados. Activación en espera.');
        return self.skipWaiting(); // Forzar la activación inmediata del nuevo SW
    })
  );
});

// Evento 'activate': se dispara cuando el Service Worker se activa
self.addEventListener('activate', event => {
  console.log('[SW] Activando Service Worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[SW] Eliminando caché antigua: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        console.log('[SW] Service Worker activado y listo para tomar el control.');
        return self.clients.claim(); // Tomar control de las páginas abiertas
    })
  );
});


// Evento 'fetch': intercepta todas las solicitudes de red
self.addEventListener('fetch', event => {
  const { request } = event;

  // No interceptar peticiones a Firebase
  if (request.url.includes('firestore.googleapis.com') || request.url.includes('firebaseapp.com')) {
    return;
  }
  
  // Estrategia: Network First para la página principal
  if (request.mode === 'navigate' && request.url === self.location.origin + '/') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Si la respuesta de red es válida, la cacheamos y la devolvemos
          if (response.ok) {
            const cacheCopy = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, cacheCopy);
            });
          }
          return response;
        })
        .catch(() => {
          // Si la red falla, intentamos servir desde la caché
          return caches.match(request);
        })
    );
    return;
  }

  // Estrategia: Cache First para todos los demás recursos
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // Si el recurso está en caché, lo devolvemos
        if (cachedResponse) {
          return cachedResponse;
        }

        // Si no está en caché, lo buscamos en la red
        return fetch(request)
          .then(networkResponse => {
            // Si la respuesta de la red es válida, la cacheamos para futuras peticiones
            if (networkResponse && networkResponse.status === 200) {
              const cacheCopy = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, cacheCopy);
              });
            }
            return networkResponse;
          });
      })
      .catch(error => {
        console.error('[SW] Error en fetch:', error);
        // Podrías devolver una página de fallback aquí si lo deseas
      })
  );
});
