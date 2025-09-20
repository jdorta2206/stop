// Define el nombre de la caché
const CACHE_NAME = 'stop-game-cache-v1.3';

// Lista de archivos para cachear (recursos estáticos de la app)
const urlsToCache = [
  '/',
  '/manifest.json',
  '/styles/globals.css', // Asegúrate de que esta ruta sea correcta
  '/app/layout.tsx',
  '/app/page.tsx',
  // Rutas de las páginas principales para acceso offline
  '/play-solo',
  '/leaderboard',
  '/categories',
  // Iconos y screenshots
  '/images/icons/favicon.ico',
  '/images/icons/icon.svg',
  '/images/icons/apple-touch-icon.png',
  '/images/icons/android-chrome-192x192.png',
  '/images/icons/android-chrome-512x512.png',
  '/images/screenshots/screenshot-desktop.png',
  '/images/screenshots/screenshot-mobile.png',
  // Sonidos
  '/sounds/button-click.mp3'
];

// Evento de instalación: se abre la caché y se añaden los recursos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierta');
        // Usar addAll para asegurar que todos los recursos se cacheen.
        // Si uno falla, la promesa se rechaza.
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Fallo al cachear durante la instalación:', error);
      })
  );
});

// Evento de activación: se eliminan las cachés antiguas
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Evento de fetch: responde desde la caché si es posible (estrategia "Cache First")
self.addEventListener('fetch', event => {
  // Solo manejar peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si el recurso está en la caché, lo devolvemos
        if (response) {
          return response;
        }

        // Si no está en caché, lo buscamos en la red
        return fetch(event.request).then(
          networkResponse => {
            // Si la respuesta de red es válida, la clonamos y la guardamos en caché
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
      .catch(() => {
        // Si todo falla (sin caché y sin red), se podría devolver una página offline de fallback
        // Por ahora, simplemente dejamos que el navegador maneje el error.
      })
  );
});