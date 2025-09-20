// Nombre de la caché
const CACHE_NAME = 'stop-game-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/images/icons/android-chrome-192x192.png',
  '/images/icons/android-chrome-512x512.png',
  '/sounds/button-click.mp3'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto durante la instalación');
        return cache.addAll(urlsToCache).catch(error => {
          console.error('Fallo al cachear durante la instalación:', error);
          // Este catch evita que el SW falle si un recurso no está disponible
        });
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Estrategia: Network First, then Cache for navigation
self.addEventListener('fetch', event => {
  const { request } = event;

  // Ignorar peticiones que no son GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Para peticiones de navegación (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Si la respuesta es válida, la cacheamos y la devolvemos
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Si la red falla, buscamos en la caché
          return caches.match(request).then(response => {
            // Si está en caché, la devolvemos. Si no, una página offline de fallback (opcional)
            return response || caches.match('/');
          });
        })
    );
    return;
  }

  // Para otros recursos (CSS, JS, imágenes), Cache First
  event.respondWith(
    caches.match(request)
      .then(response => {
        // Si el recurso está en caché, lo devolvemos
        if (response) {
          return response;
        }
        
        // Si no, lo buscamos en la red, lo cacheamos y lo devolvemos
        return fetch(request).then(
          networkResponse => {
             // Ignorar respuestas parciales (status 206) o de extensiones
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
  );
});
