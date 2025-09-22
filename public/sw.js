// El nombre de la caché para nuestra aplicación
const CACHE_NAME = 'stop-game-cache-v1.3';

// Los archivos y rutas que queremos cachear
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  // Rutas de la aplicación (añadir las más importantes)
  '/play-solo',
  '/leaderboard',
  '/categories',
  // Recursos estáticos de Next.js (el nombre puede variar con cada build)
  // El service worker los cacheará dinámicamente en el evento 'fetch'
];

// Evento 'install': se dispara cuando el service worker se instala
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  // Esperamos a que la promesa de 'waitUntil' se resuelva
  event.waitUntil(
    // Abrimos la caché con el nombre definido
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache abierta.');
        // Añadimos todos los recursos definidos a la caché
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Falló el cacheo inicial', error);
      })
  );
});

// Evento 'activate': se dispara cuando el service worker se activa
self.addEventListener('activate', event => {
  console.log('Service Worker: Activando...');
  event.waitUntil(
    // Obtenemos todos los nombres de las cachés existentes
    caches.keys().then(cacheNames => {
      return Promise.all(
        // Iteramos sobre los nombres de las cachés
        cacheNames.map(cacheName => {
          // Si una caché no es la actual, la eliminamos
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Limpiando caché antigua', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Tomar control inmediato de las páginas
  );
});


// Estrategia: Network Falling Back to Cache
// Ideal para contenido que se actualiza frecuentemente (como rankings)
// pero que debe estar disponible sin conexión.
self.addEventListener('fetch', event => {
  // Ignoramos las peticiones que no son GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    // 1. Intentamos obtener el recurso de la red
    fetch(event.request)
      .then(networkResponse => {
        // Si la petición a la red fue exitosa
        // Abrimos nuestra caché
        return caches.open(CACHE_NAME).then(cache => {
          // Guardamos una copia de la respuesta de red en la caché para futuras peticiones sin conexión
          // Usamos .clone() porque la respuesta solo se puede consumir una vez
          cache.put(event.request, networkResponse.clone());
          // Devolvemos la respuesta de la red al navegador
          return networkResponse;
        });
      })
      .catch(() => {
        // 2. Si la petición de red falla (sin conexión), intentamos obtener el recurso de la caché
        console.log('Service Worker: Fallo de red, buscando en caché para:', event.request.url);
        return caches.match(event.request).then(cachedResponse => {
            // Si encontramos una respuesta en caché, la devolvemos
            if (cachedResponse) {
              console.log('Service Worker: Sirviendo desde caché:', event.request.url);
              return cachedResponse;
            }
            
            // Si no se encuentra ni en red ni en caché, podríamos devolver una página offline por defecto
            // Por ahora, simplemente dejamos que el error de red se propague
            return new Response('Contenido no disponible sin conexión.', {
              status: 404,
              statusText: 'Offline'
            });
        });
      })
  );
});