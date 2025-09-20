"use client";

import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/sonner";
import { Providers } from '@/components/providers/Providers';


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
          <link rel="apple-touch-icon" href="/images/icons/apple-touch-icon.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Stop" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-TileColor" content="#ef4444" />
          <meta name="msapplication-TileImage" content="/images/icons/ms-touch-icon-144x144.png" />
      </head>
      <body className="flex flex-col h-full bg-background text-foreground">
        <Providers>
          {children}
          <Toaster />
        </Providers>
         <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', () => {
                    navigator.serviceWorker
                      .register('/sw.js')
                      .then((registration) => console.log('Service Worker registered with scope:', registration.scope))
                      .catch((error) => console.error('Service Worker registration failed:', error));
                  });
                }
              `,
            }}
          />
      </body>
    </html>
  );
}
