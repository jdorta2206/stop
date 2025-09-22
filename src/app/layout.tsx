"use client";

import './globals.css';
import { Toaster } from "@/components/ui/sonner";
import { Providers } from '@/components/providers/Providers';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    // Script agresivo para eliminar Service Workers y sus cachés.
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then((registrations) => {
          if (registrations.length > 0) {
            console.log('Desregistrando Service Workers existentes...');
            for (const registration of registrations) {
              registration.unregister().then(success => {
                if (success) {
                  console.log(`Service Worker ${registration.scope} desregistrado.`);
                } else {
                  console.log(`Fallo al desregistrar Service Worker ${registration.scope}.`);
                }
              });
            }
          }
        })
        .catch(error => {
          console.error('Error al obtener registros de Service Worker:', error);
        });

      // Limpiar cachés de Service Worker
      if (window.caches) {
        window.caches.keys().then(keys => {
          keys.forEach(key => {
            // Se puede ser más específico si se conoce el nombre de la caché
             console.log(`Eliminando caché: ${key}`);
             window.caches.delete(key);
          });
        });
      }
      
      // Forzar recarga si hay un SW controlando la página para asegurar que se libera
      if (navigator.serviceWorker.controller) {
          console.log("Hay un Service Worker activo, recargando la página para asegurar su eliminación.");
          window.location.reload();
      }
    }
  }, []);

  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <head>
          <meta name="theme-color" content="#ef4444" />
      </head>
      <body className="flex flex-col h-full bg-background text-foreground">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}