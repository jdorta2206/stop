
"use client";

import React from 'react';
import { LanguageProvider } from '@/contexts/language-context';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/hooks/use-auth';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SoundProvider } from '@/hooks/use-sound';

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
          <SoundProvider>
              <TooltipProvider>
                {children}
              </TooltipProvider>
          </SoundProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
