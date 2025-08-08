import React from 'react';
import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/sonner";
import { Providers } from '@/components/providers/Providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://juego-stop.netlify.app'),
  title: 'Juego Stop - Multijugador Online | Contra IA y Amigos',
  description: '¡Juega al clásico juego Stop, multilenguaje, contra la IA o amigos! Demuestra tu vocabulario en categorías como países, animales, nombres y más.',
  keywords: 'stop, juego de palabras, multijugador, online, IA, categorías, vocabulario, competir, multilenguaje',
  authors: [{ name: 'Stop Game Team' }],
  creator: 'Stop Game',
  publisher: 'Stop Game',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://juego-stop.netlify.app',
    title: 'Juego Stop - Multijugador Online',
    description: '¡Juega al clásico juego Stop, multilenguaje, contra la IA o amigos!',
    siteName: 'Stop Game',
    images: [
      {
        url: '/android-chrome-192x192.png',
        width: 192,
        height: 192,
        alt: 'Stop - Juego de Palabras',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Juego Stop - Multijugador Online',
    description: '¡Juega al clásico juego Stop, multilenguaje, contra la IA o amigos!',
    images: ['/android-chrome-192x192.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#ef4444', // Rojo Principal
  initialScale: 1,
  width: 'device-width'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <head>
          <link rel="icon" href="/android-chrome-192x192.png" type="image/png" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" type="image/png" sizes="180x180" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Juego Stop" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-TileColor" content="#ef4444" />
          <meta name="msapplication-TileImage" content="/ms-touch-icon-144x144.png" />
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
