const CACHE_NAME = 'stop-game-cache-v1';
const urlsToCache = [
  '/',
  '/play-solo',
  '/leaderboard',
  '/categories',
  '/manifest.json',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/favicon.ico',
  // Es importante cachear los chunks de JS y CSS que Next.js genera.
  // Estos nombres pueden cambiar en cada build.
  // El service worker los irá añadiendo dinámicamente.
];

// Evento de instalación: se abre la caché y se añaden los recursos básicos.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierta');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento fetch: decide cómo responder a las peticiones.
self.addEventListener('fetch', (event) => {
  // Estrategia: Network First, falling back to Cache
  // Ideal para recursos que pueden actualizarse (como datos de API) pero que queremos que funcionen offline.
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si la petición a la red tiene éxito, la usamos y la guardamos en caché para el futuro.
        return caches.open(CACHE_NAME).then((cache) => {
          // No cacheamos peticiones de chrome-extension, solo http/https.
          if (event.request.url.startsWith('http')) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      })
      .catch(() => {
        // Si la petición a la red falla (estamos offline), intentamos servir desde la caché.
        return caches.match(event.request).then((cachedResponse) => {
          // Si encontramos una respuesta en caché, la devolvemos.
          // Si no, la petición falla (lo cual es esperado para recursos no cacheados).
          return cachedResponse || Response.error();
        });
      })
  );
});


// Evento de activación: limpia cachés antiguas.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
