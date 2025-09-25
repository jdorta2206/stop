
"use client";

import React from 'react';
import { LanguageProvider } from '@/contexts/language-context';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/hooks/use-auth';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegistrar } from '@/components/pwa/ServiceWorkerRegistrar';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <TooltipProvider>
              {children}
              <Toaster />
              <ServiceWorkerRegistrar />
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
