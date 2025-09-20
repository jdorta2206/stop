// public/sw.js
const CACHE_NAME = 'stop-game-cache-v1.3'; // Incrementa la versión para forzar la actualización
const STATIC_ASSETS = [
    '/',
    '/play-solo',
    '/leaderboard',
    '/categories',
    '/offline.html',
    '/images/icons/android-chrome-192x192.png',
    '/images/icons/android-chrome-512x512.png',
    '/images/screenshots/screenshot-desktop.png',
    '/images/screenshots/screenshot-mobile.png',
    '/sounds/button-click.mp3',
    '/sounds/game-win.mp3',
    '/sounds/game-lose.mp3',
    '/sounds/timer.mp3',
    '/sounds/roulette-spin.mp3',
    '/sounds/background-music.mp3'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
    console.log('[SW] Instalando Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('[SW] Cache abierta, añadiendo assets estáticos');
            // Precaching de assets estáticos y páginas principales
            return cache.addAll(STATIC_ASSETS);
        })
        .then(() => {
            console.log('[SW] Assets estáticos cacheados. Activación en espera.');
            // Forzar al nuevo Service Worker a activarse inmediatamente
            return self.skipWaiting();
        })
    );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
    console.log('[SW] Activando Service Worker...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Eliminando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Service Worker activado y listo para tomar el control.');
            // Tomar control inmediato de todas las pestañas abiertas
            return self.clients.claim();
        })
    );
});

// Interceptación de peticiones de red
self.addEventListener('fetch', event => {
    const { request } = event;

    // Estrategia Network First para navegación y HTML
    if (request.mode === 'navigate' || request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Si la respuesta es válida, la guardamos en caché para futuras visitas offline
                    if (response.ok) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Si la red falla, intentamos servir desde la caché
                    return caches.match(request)
                        .then(cachedResponse => {
                            // Si está en caché, la devolvemos. Si no, la página de fallback.
                            return cachedResponse || caches.match('/offline.html');
                        });
                })
        );
        return;
    }

    // Estrategia Cache First para assets estáticos (CSS, JS, imágenes, etc.)
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                // Si el recurso está en la caché, lo devolvemos
                if (cachedResponse) {
                    return cachedResponse;
                }
                // Si no, lo buscamos en la red, lo cacheamos y lo devolvemos
                return fetch(request).then(networkResponse => {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                    return networkResponse;
                });
            })
            .catch(() => {
                // Si todo falla (raro para assets estáticos), podríamos devolver un placeholder si fuera necesario
                // Por ejemplo, una imagen de fallback.
                if (request.destination === 'image') {
                    // return caches.match('/images/placeholder.png');
                }
                return new Response("Recurso no disponible offline.", { status: 404, statusText: "Not Found" });
            })
    );
});