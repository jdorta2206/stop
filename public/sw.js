// public/sw.js

const CACHE_NAME = 'stop-game-v2'; // Incrementa la versión para forzar la actualización
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/android-chrome-192x192.png',
    '/apple-touch-icon.png',
    '/sounds/button-click.mp3',
    '/sounds/spin-start.mp3',
    '/sounds/spin-end.mp3',
    '/sounds/round-win.mp3',
    '/sounds/round-lose.mp3',
    '/sounds/timer-tick.mp3',
    '/sounds/background-music.mp3'
];

// 1. Instalación del Service Worker
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
                // Forzar la activación inmediata del nuevo SW
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('[SW] Fallo al cachear assets estáticos durante la instalación:', err);
            })
    );
});

// 2. Activación del Service Worker y limpieza de cachés antiguas
self.addEventListener('activate', (event) => {
    console.log('[SW] Activando Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log(`[SW] Eliminando caché antigua: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Service Worker activado y listo para tomar el control.');
            // Tomar control de los clientes abiertos inmediatamente
            return self.clients.claim();
        })
    );
});

// 3. Interceptación de peticiones (Fetch)
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Estrategia: Network First para el documento principal (HTML)
    // Esto asegura que el usuario siempre obtenga la última versión de la página.
    if (request.mode === 'navigate' && url.origin === self.location.origin && url.pathname === '/') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Si la red funciona, cachea la nueva versión y devuélvela
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, response.clone());
                        return response;
                    });
                })
                .catch(() => {
                    // Si la red falla, devuelve la versión de la caché
                    console.log(`[SW] Red falló para ${request.url}, sirviendo desde caché.`);
                    return caches.match(request);
                })
        );
        return;
    }

    // Estrategia: Cache First para todos los demás assets
    // Ideal para archivos estáticos como JS, CSS, imágenes, fuentes, etc.
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                // Si está en caché, devuélvelo
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Si no está en caché, ve a la red
                return fetch(request).then((networkResponse) => {
                    // Cachea la respuesta para futuras peticiones
                    return caches.open(CACHE_NAME).then((cache) => {
                        // Solo cachea respuestas válidas
                        if (networkResponse && networkResponse.status === 200) {
                           cache.put(request, networkResponse.clone());
                        }
                        return networkResponse;
                    });
                });
            })
            .catch(error => {
                console.error(`[SW] Error en fetch para ${request.url}:`, error);
                // Opcional: devolver una página de fallback si todo falla
            })
    );
});
