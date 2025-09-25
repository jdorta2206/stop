
"use client";

import React from 'react';
import { LanguageProvider } from '@/contexts/language-context';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from '@/hooks/use-auth-context'; // Volver a AuthProvider

export function Providers({ children }: { children: React.ReactNode }) {
  return (
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
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
