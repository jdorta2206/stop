const CACHE_NAME = 'stop-game-cache-v1.3';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/styles/globals.css',
  '/images/icons/android-chrome-192x192.png',
  '/images/icons/android-chrome-512x512.png',
  '/images/screenshots/screenshot-desktop.png',
  '/images/screenshots/screenshot-mobile.png',
  '/sounds/button-click.mp3',
  '/sounds/countdown.mp3',
  '/sounds/round-start.mp3',
  '/sounds/spin-start.mp3',
  '/sounds/stop-pressed.mp3',
  '/sounds/tie.mp3',
  '/sounds/win.mp3'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache abierta, añadiendo assets estáticos');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Assets estáticos cacheados. Activación en espera.');
      })
      .catch(error => {
        console.error('[SW] Falló el precaching de assets estáticos:', error);
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
        return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Estrategia: Network First para el documento principal, Cache First para todo lo demás.
  if (request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then(response => {
              return response || caches.match('/');
            });
        })
    );
  } else {
    // Para todos los demás assets (CSS, JS, imágenes, sonidos), usar Cache First.
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request).then(fetchRes => {
            const resToCache = fetchRes.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, resToCache);
            });
            return fetchRes;
          });
        })
    );
  }
});
