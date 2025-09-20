// Define el nombre de la caché
const CACHE_NAME = 'stop-game-cache-v1.3';

// Lista de recursos para cachear durante la instalación
const CORE_ASSETS = [
    '/',
    '/manifest.json',
    '/images/icons/icon-192x192.png',
    '/images/icons/icon-512x512.png',
    '/sounds/button-click.mp3'
];

// Instalar el Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cacheando recursos principales');
        // Añadir todos los iconos generados a la lista de recursos a cachear
        const allIcons = [
          "images/icons/windows11/SmallTile.scale-100.png",
          "images/icons/windows11/SmallTile.scale-125.png",
          "images/icons/windows11/SmallTile.scale-150.png",
          "images/icons/windows11/SmallTile.scale-200.png",
          "images/icons/windows11/SmallTile.scale-400.png",
          "images/icons/windows11/Square150x150Logo.scale-100.png",
          "images/icons/windows11/Square150x150Logo.scale-125.png",
          "images/icons/windows11/Square150x150Logo.scale-150.png",
          "images/icons/windows11/Square150x150Logo.scale-200.png",
          "images/icons/windows11/Square150x150Logo.scale-400.png",
          "images/icons/windows11/Wide310x150Logo.scale-100.png",
          "images/icons/windows11/Wide310x150Logo.scale-125.png",
          "images/icons/windows11/Wide310x150Logo.scale-150.png",
          "images/icons/windows11/Wide310x150Logo.scale-200.png",
          "images/icons/windows11/Wide310x150Logo.scale-400.png",
          "images/icons/windows11/LargeTile.scale-100.png",
          "images/icons/windows11/LargeTile.scale-125.png",
          "images/icons/windows11/LargeTile.scale-150.png",
          "images/icons/windows11/LargeTile.scale-200.png",
          "images/icons/windows11/LargeTile.scale-400.png",
          "images/icons/windows11/Square44x44Logo.scale-100.png",
          "images/icons/windows11/Square44x44Logo.scale-125.png",
          "images/icons/windows11/Square44x44Logo.scale-150.png",
          "images/icons/windows11/Square44x44Logo.scale-200.png",
          "images/icons/windows11/Square44x44Logo.scale-400.png",
          "images/icons/windows11/StoreLogo.scale-100.png",
          "images/icons/windows11/StoreLogo.scale-125.png",
          "images/icons/windows11/StoreLogo.scale-150.png",
          "images/icons/windows11/StoreLogo.scale-200.png",
          "images/icons/windows11/StoreLogo.scale-400.png",
          "images/icons/windows11/SplashScreen.scale-100.png",
          "images/icons/windows11/SplashScreen.scale-125.png",
          "images/icons/windows11/SplashScreen.scale-150.png",
          "images/icons/windows11/SplashScreen.scale-200.png",
          "images/icons/windows11/SplashScreen.scale-400.png",
          "images/icons/windows11/Square44x44Logo.targetsize-16.png",
          "images/icons/windows11/Square44x44Logo.targetsize-20.png",
          "images/icons/windows11/Square44x44Logo.targetsize-24.png",
          "images/icons/windows11/Square44x44Logo.targetsize-30.png",
          "images/icons/windows11/Square44x44Logo.targetsize-32.png",
          "images/icons/windows11/Square44x44Logo.targetsize-36.png",
          "images/icons/windows11/Square44x44Logo.targetsize-40.png",
          "images/icons/windows11/Square44x44Logo.targetsize-44.png",
          "images/icons/windows11/Square44x44Logo.targetsize-48.png",
          "images/icons/windows11/Square44x44Logo.targetsize-60.png",
          "images/icons/windows11/Square44x44Logo.targetsize-64.png",
          "images/icons/windows11/Square44x44Logo.targetsize-72.png",
          "images/icons/windows11/Square44x44Logo.targetsize-80.png",
          "images/icons/windows11/Square44x44Logo.targetsize-96.png",
          "images/icons/windows11/Square44x44Logo.targetsize-256.png",
          "images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-16.png",
          "images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-20.png",
          "images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-24.png",
          "images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-30.png",
          "images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-32.png",
          "images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-36.png",
          "images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-40.png",
          "images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-44.png",
          "images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-48.png",
          "images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-60.png",
          "images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-64.png",
          "images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-72.png",
          "images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-80.png",
          "images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-96.png",
          "images/icons/windows11/Square44x44Logo.altform-unplated_targetsize-256.png",
          "images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-16.png",
          "images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-20.png",
          "images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-24.png",
          "images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-30.png",
          "images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-32.png",
          "images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-36.png",
          "images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-40.png",
          "images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-44.png",
          "images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-48.png",
          "images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-60.png",
          "images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-64.png",
          "images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-72.png",
          "images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-80.png",
          "images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-96.png",
          "images/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-256.png",
          "images/icons/android/android-launchericon-512-512.png",
          "images/icons/android/android-launchericon-192-192.png",
          "images/icons/android/android-launchericon-144-144.png",
          "images/icons/android/android-launchericon-96-96.png",
          "images/icons/android/android-launchericon-72-72.png",
          "images/icons/android/android-launchericon-48-48.png",
          "images/icons/ios/16.png",
          "images/icons/ios/20.png",
          "images/icons/ios/29.png",
          "images/icons/ios/32.png",
          "images/icons/ios/40.png",
          "images/icons/ios/50.png",
          "images/icons/ios/57.png",
          "images/icons/ios/58.png",
          "images/icons/ios/60.png",
          "images/icons/ios/64.png",
          "images/icons/ios/72.png",
          "images/icons/ios/76.png",
          "images/icons/ios/80.png",
          "images/icons/ios/87.png",
          "images/icons/ios/100.png",
          "images/icons/ios/114.png",
          "images/icons/ios/120.png",
          "images/icons/ios/128.png",
          "images/icons/ios/144.png",
          "images/icons/ios/152.png",
          "images/icons/ios/167.png",
          "images/icons/ios/180.png",
          "images/icons/ios/192.png",
          "images/icons/ios/256.png",
          "images/icons/ios/512.png",
          "images/icons/ios/1024.png"
        ];
        
        return cache.addAll([...CORE_ASSETS, ...allIcons]);
      })
      .catch(error => {
        console.error('Service Worker: Fallo al cachear durante la instalación:', error);
      })
  );
});

// Activar el Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          // Eliminar cachés antiguas si es necesario
          return cacheName.startsWith('stop-game-cache-') && cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  console.log('Service Worker: Activado y listo.');
  return self.clients.claim();
});


// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
    // Ignorar las peticiones que no son GET
    if (event.request.method !== 'GET') {
        return;
    }
  
    // Estrategia: Network First (Red primero), luego Cache
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Si la petición a la red tiene éxito, la cacheamos y la devolvemos
                if (networkResponse.ok) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        // Usamos add para peticiones simples, pero put para un control más fino si fuera necesario
                        cache.put(event.request, responseToCache).catch(err => {
                           // Ignorar errores de 'put' como respuestas parciales (206)
                           if (err.name !== 'TypeError') {
                               console.error('SW: Fallo al cachear:', event.request.url, err);
                           }
                        });
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // Si la red falla, intentamos servir desde la caché
                console.log('Service Worker: Red falló, intentando servir desde caché para:', event.request.url);
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Si no está en caché, devuelve una respuesta de error (o una página offline genérica)
                    // Para las páginas, podemos devolver el index.html
                    if (event.request.mode === 'navigate') {
                        return caches.match('/');
                    }
                    // Para otros recursos, simplemente fallará
                    return new Response(`Contenido no disponible sin conexión: ${event.request.url}`, {
                      status: 404,
                      statusText: 'Not Found',
                      headers: {'Content-Type': 'text/plain'}
                    });
                });
            })
    );
});
