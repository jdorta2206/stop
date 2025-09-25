"use client";

import { useEffect } from 'react';
import { toast } from "sonner";

export function ServiceWorkerRegistrar() {

  useEffect(() => {
    // Se comenta completamente el registro del Service Worker para evitar conflictos
    // con el flujo de autenticación del lado del servidor de NextAuth y las
    // redirecciones internas del entorno de desarrollo.
    /*
    if ('serviceWorker' in navigator) {
      const handleServiceWorker = () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registrado con éxito:', registration);
            
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      // Hay contenido nuevo disponible, notificar al usuario.
                       toast("Actualización Disponible", {
                        description: "Hay una nueva versión de la aplicación. Cierra y vuelve a abrir la app para ver los cambios.",
                        duration: 10000,
                      });
                    }
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.error('Error al registrar el Service Worker:', error);
          });
      };

      window.addEventListener('load', handleServiceWorker);

      return () => {
        window.removeEventListener('load', handleServiceWorker);
      };
    }
    */
  }, []);

  return null;
}
