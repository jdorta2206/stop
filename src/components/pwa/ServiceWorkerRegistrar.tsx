"use client";

import { useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

export function ServiceWorkerRegistrar() {
  const { toast } = useToast();

  useEffect(() => {
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
                       toast({
                        title: "Actualización Disponible",
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

      // Esperar a que la página se cargue completamente
      window.addEventListener('load', handleServiceWorker);

      // Limpieza al desmontar el componente
      return () => {
        window.removeEventListener('load', handleServiceWorker);
      };
    }
  }, [toast]);

  return null; // Este componente no renderiza nada
}
