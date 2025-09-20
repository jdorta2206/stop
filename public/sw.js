// public/sw.js

// Define el nombre de la caché
const CACHE_NAME = 'stop-game-cache-v2';

// Lista de recursos para cachear durante la instalación
const resourcesToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  // Rutas a las páginas principales
  '/play-solo',
  '/leaderboard',
  // Fuentes (si las usas localmente) y otros assets importantes
  // '/fonts/my-font.woff2',
  // Iconos
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

// Evento de instalación
self.addEventListener('install', (event) => {
  console.log('SW: Instalando...');
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(resourcesToCache);
        console.log('SW: Cache de recursos completada.');
      } catch (error) {
        console.error('SW: Fallo al cachear durante la instalación:', error);
      }
    })()
  );
});

// Evento de activación
self.addEventListener('activate', (event) => {
  console.log('SW: Activando...');
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      console.log('SW: Caches antiguas limpiadas.');
      await self.clients.claim();
    })()
  );
});

// Evento de fetch (estrategia Network First)
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // No cachear peticiones que no sean GET
  if (request.method !== 'GET') {
    return;
  }
  
  // No cachear peticiones de Firebase
  if (request.url.includes('firestore.googleapis.com')) {
      return;
  }

  // Para peticiones de navegación, usar Network First
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          // Si la respuesta de red es válida, la usamos y la cacheamos
          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          // Si la red falla, intentamos servir desde la caché
          console.log('SW: Red no disponible, sirviendo desde caché para:', request.url);
          const cachedResponse = await caches.match(request);
          return cachedResponse || caches.match('/'); // Fallback a la página principal
        }
      })()
    );
  } else {
    // Para otros recursos (CSS, JS, imágenes), usar Cache First
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        try {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
                await cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        } catch (error) {
            console.error('SW: Fallo al obtener desde la red:', error);
            // Opcionalmente, devolver una respuesta de fallback para imágenes/assets
            return new Response('', {status: 503, statusText: 'Service Unavailable'});
        }
      })()
    );
  }
});
