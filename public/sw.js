// El service worker se deja intencionalmente en blanco.
// Su propósito principal es activar el ciclo de vida de PWA para permitir
// la instalación y la detección de actualizaciones.
// El cacheo se manejará mediante estrategias de red primero o cache primero
// en futuras implementaciones si es necesario.

self.addEventListener('install', (event) => {
  // Opcional: precachear recursos estáticos aquí
  // event.waitUntil(
  //   caches.open('stop-game-static-v1').then((cache) => {
  //     return cache.addAll([
  //       '/',
  //       '/styles/globals.css',
  //       // ... otros archivos estáticos
  //     ]);
  //   })
  // );
});

self.addEventListener('fetch', (event) => {
  // Estrategia de solo red por defecto
  event.respondWith(fetch(event.request));
});
