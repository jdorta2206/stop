"use client";

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
          <link rel="apple-touch-icon" href="/android-chrome-192x192.png" />
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
