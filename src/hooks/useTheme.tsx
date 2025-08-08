
"use client";
import { useTheme as useNextTheme } from 'next-themes';

export const useTheme = () => {
    const { theme, setTheme, systemTheme, resolvedTheme } = useNextTheme();

    // Determinar el tema actual de forma segura
    const currentTheme = theme === 'system' ? systemTheme : theme;

    return {
        theme: theme || 'system',
        setTheme,
        currentTheme,
        resolvedTheme, // 'light' o 'dark'
    };
};
