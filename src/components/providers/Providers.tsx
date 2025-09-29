
"use client";

import React from 'react';
import { LanguageProvider } from '../../contexts/language-context';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '../ui/tooltip';
import { Toaster } from "../ui/sonner";
import { AuthProvider } from '../../hooks/use-auth-context';

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
