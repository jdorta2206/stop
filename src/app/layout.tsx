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
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      });
    }
  }, []);

  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <head>
          <link rel="manifest" href="/manifest.json" />
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
