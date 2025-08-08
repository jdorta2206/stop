
"use client";

import React from 'react';
import { LanguageProvider } from '@/contexts/language-context';
import { RoomGameProvider } from '@/contexts/room-game-context';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/hooks/use-auth';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SoundProvider } from '@/hooks/use-sound';

export function Providers({ children }: { children: React.ReactNode }) {

  return (
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
            <LanguageProvider>
              <SoundProvider>
                <RoomGameProvider>
                  <TooltipProvider>
                    {children}
                  </TooltipProvider>
                </RoomGameProvider>
              </SoundProvider>
            </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
  );
}
