// Define el nombre de la caché
const CACHE_NAME = 'stop-game-cache-v1.6';

// Lista de recursos estáticos para cachear durante la instalación
const STATIC_RESOURCES = [
  '/',
  '/manifest.json',
  '/images/icons/android-chrome-192x192.png',
  '/images/icons/android-chrome-512x512.png',
  '/sounds/button-click.mp3',
  // --- Añadimos todos los iconos nuevos a la caché estática ---
  "/images/icons/windows11/SmallTile.scale-100.png",
  "/images/icons/windows11/SmallTile.scale-125.png",
  "/images/icons/windows11/SmallTile.scale-150.png",
  "/images/icons/windows11/SmallTile.scale-200.png",
  "/images/icons/windows11/SmallTile.scale-400.png",
  "/images/icons/windows11/Square150x150Logo.scale-100.png",
  "/images/icons/windows11/Square150x150Logo.scale-125.png",
  "/images/icons/windows11/Square150x150Logo.scale-150.png",
  "/images/icons/windows11/Square150x150Logo.scale-200.png",
  "/images/icons/windows11/Square150x150Logo.scale-400.png",
  "/images/icons/windows11/Wide310x150Logo.scale-100.png",
  "/images/icons/windows11/Wide310x150Logo.scale-125.png",
  "/images/icons/windows11/Wide310x150Logo.scale-150.png",
  "/images/icons/windows11/Wide310x150Logo.scale-200.png",
  "/images/icons/windows11/Wide310x150Logo.scale-400.png",
  "/images/icons/windows11/LargeTile.scale-100.png",
  "/images/icons/windows11/LargeTile.scale-125.png",
  "/images/icons/windows11/LargeTile.scale-150.png",
  "/images/icons/windows11/LargeTile.scale-200.png",
  "/images/icons/windows11/LargeTile.scale-400.png",
  "/images/icons/windows11/Square44x44Logo.scale-100.png",
  "/images/icons/windows11/Square44x44Logo.scale-125.png",
  "/images/icons/windows11/Square44x44Logo.scale-150.png",
  "/images/icons/windows11/Square44x44Logo.scale-200.png",
  "/images/icons/windows11/Square44x44Logo.scale-400.png",
  "/images/icons/windows11/StoreLogo.scale-100.png",
  "/images/icons/windows11/StoreLogo.scale-125.png",
  "/images/icons/windows11/StoreLogo.scale-150.png",
  "/images/icons/windows11/StoreLogo.scale-200.png",
  "/images/icons/windows11/StoreLogo.scale-400.png",
  "/images/icons/windows11/SplashScreen.scale-100.png",
  "/images/icons/windows11/SplashScreen.scale-125.png",
  "/images/icons/windows11/SplashScreen.scale-150.png",
  "/images/icons/windows11/SplashScreen.scale-200.png",
  "/images/icons/windows11/SplashScreen.scale-400.png",
  "/images/icons/windows11/Square44x44Logo.targetsize-16.png",
  "/images/icons/windows11/Square44x44Logo.targetsize-20.png",
  "/images/icons/windows11/Square44x44Logo.targetsize-24.png",
  "/images/icons/windows11/Square44x44Logo.targetsize-30.png",
  "/images/icons/windows11/Square44x44Logo.targetsize-32.png",
  "/images/icons/windows11/Square44x44Logo.targetsize-36.png",
  "/images/icons/windows11/Square44x44Logo.targetsize-40.png",
  "/images/icons/windows11/Square44x44Logo.targetsize-44.png",
  "/images/icons/windows11/Square44x44Logo.targetsize-48.png",
  "/images/icons/windows11/Square44x44Logo.targetsize-60.png",
  "/images/icons/windows11/Square44x44Logo.targetsize-64.png",
  "/images/icons/windows11/Square44x44Logo.targetsize-72.png",
  "/images/icons/windows11/Square44x44Logo.targetsize-80.png",
  "/images/icons/windows11/Square44x44Logo.targetsize-96.png",
  "/images/icons/windows11/Square44x44Logo.targetsize-256.png",
  "/images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-16.png",
  "/images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-20.png",
  "/images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-24.png",
  "/images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-30.png",
  "/images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-32.png",
  "/images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-36.png",
  "/images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-40.png",
  "/images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-44.png",
  "/images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-48.png",
  "/images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-60.png",
  "/images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-64.png",
  "/images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-72.png",
  "/images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-80.png",
  "/images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-96.png",
  "/images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-256.png",
  "/images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-16.png",
  "/images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-20.png",
  "/images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-24.png",
  "/images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-30.png",
  "/images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-32.png",
  "/images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-36.png",
  "/images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-40.png",
  "/images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-44.png",
  "/images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-48.png",
  "/images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-60.png",
  "/images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-64.png",
  "/images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-72.png",
  "/images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-80.png",
  "/images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-96.png",
  "/images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-256.png",
  "/images/icons/android/android-launchericon-512-512.png",
  "/images/icons/android/android-launchericon-192-192.png",
  "/images/icons/android/android-launchericon-144-144.png",
  "/images/icons/android/android-launchericon-96-96.png",
  "/images/icons/android/android-launchericon-72-72.png",
  "/images/icons/android/android-launchericon-48-48.png",
  "/images/icons/ios/16.png",
  "/images/icons/ios/20.png",
  "/images/icons/ios/29.png",
  "/images/icons/ios/32.png",
  "/images/icons/ios/40.png",
  "/images/icons/ios/50.png",
  "/images/icons/ios/57.png",
  "/images/icons/ios/58.png",
  "/images/icons/ios/60.png",
  "/images/icons/ios/64.png",
  "/images/icons/ios/72.png",
  "/images/icons/ios/76.png",
  "/images/icons/ios/80.png",
  "/images/icons/ios/87.png",
ci.tsx:69 ~ AppHeader ~ isMounted", "color: #007acc;", false);
  "/images/icons/ios/100.png",
  "/images/icons/ios/114.png",
  "/images/icons/ios/120.png",
  "/images/icons/ios/128.png",
  "/images/icons/ios/144.png",
  "/images/icons/ios/152.png",
  "/images/icons/ios/167.png",
  "/images/icons/ios/180.png",
  "/images/icons/ios/192.png",
  "/images/icons/ios/256.png",
  "/images/icons/ios/512.png",
  "/images/icons/ios/1024.png"
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cacheando recursos estáticos...');
        // Usamos addAll, pero con un catch para evitar que un solo error falle toda la instalación
        return cache.addAll(STATIC_RESOURCES).catch(error => {
          console.error('[Service Worker] Fallo al cachear durante la instalación:', error);
        });
      })
      .then(() => {
        console.log('[Service Worker] Instalación completada y recursos cacheados.');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log(`[Service Worker] Eliminando caché antigua: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no son GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Estrategia: Network First, then Cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si la respuesta es válida, la cacheamos y la devolvemos
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return networkResponse;
      })
      .catch(() => {
        // Si la red falla, intentamos obtener la respuesta desde la caché
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Si no está en caché, devuelve una respuesta de fallback (opcional)
            // Por ahora, simplemente dejamos que el navegador maneje el error
            return new Response("Contenido no disponible offline.", {
              status: 404,
              statusText: "Offline",
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});
