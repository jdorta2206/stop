
"use client";

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';

type SoundEffect = 'click' | 'spin-start' | 'spin-end' | 'round-win' | 'round-lose' | 'timer-tick';

// Aunque las rutas están aquí, no se usarán, pero se mantienen por si se añaden los archivos en el futuro.
const SOUND_PATHS: Record<SoundEffect, string> = {
  click: '/sounds/button-click.mp3',
  'spin-start': '/sounds/spin-start.mp3',
  'spin-end': '/sounds/spin-end.mp3',
  'round-win': '/sounds/round-win.mp3',
  'round-lose': '/sounds/round-lose.mp3',
  'timer-tick': '/sounds/timer-tick.mp3',
};

const BACKGROUND_MUSIC_PATH = '/sounds/background-music.mp3';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (sound: SoundEffect) => void;
  playMusic: () => void;
  stopMusic: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
  // El estado ahora es permanentemente silenciado para evitar errores.
  const [isMuted, setIsMuted] = useState(true);

  // Las funciones ahora no hacen nada para prevenir intentos de carga de archivos.
  const toggleMute = useCallback(() => {
    // Se podría añadir un toast para informar al usuario que el sonido no está disponible.
    console.warn("Sound functionality is disabled because audio files are missing.");
  }, []);

  const playSound = useCallback((sound: SoundEffect) => {
    // No hacer nada.
  }, []);

  const playMusic = useCallback(() => {
    // No hacer nada.
  }, []);

  const stopMusic = useCallback(() => {
    // No hacer nada.
  }, []);
  
  const value = useMemo(() => ({
    isMuted,
    toggleMute,
    playSound,
    playMusic,
    stopMusic,
  }), [isMuted, toggleMute, playSound, playMusic, stopMusic]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}
