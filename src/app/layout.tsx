
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
    // Eliminar CUALQUIER Service Worker activo para evitar conflictos de red con Firebase.
    // Este es un paso crítico para asegurar que las peticiones a Firestore no sean interceptadas.
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        if (registrations.length > 0) {
            console.log('Desregistrando Service Workers existentes...');
            for(let registration of registrations) {
              registration.unregister();
              console.log('Service Worker desregistrado:', registration);
            }
            // Recargar la página una vez para asegurar que el SW se ha ido.
            // window.location.reload(); // Comentado para evitar bucles de recarga
        }
      });
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
