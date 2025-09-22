"use client";

import './globals.css';
import { Toaster } from "@/components/ui/sonner";
import { Providers } from '@/components/providers/Providers';
import { ServiceWorkerRegistrar } from '@/components/pwa/ServiceWorkerRegistrar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

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
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
