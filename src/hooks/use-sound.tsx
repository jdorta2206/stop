
"use client";

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';

type SoundEffect = 'click' | 'spin-start' | 'spin-end' | 'round-win' | 'round-lose' | 'timer-tick';

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

// Define a placeholder for the Audio object on the server
let musicPlayer: HTMLAudioElement | null = null;

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false); // Sounds are ON by default now
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedMute = localStorage.getItem('globalStopMuted');
    if (storedMute !== null) {
      setIsMuted(JSON.parse(storedMute));
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('globalStopMuted', JSON.stringify(isMuted));
      if (isMuted) {
        stopMusic();
      }
    }
  }, [isMuted, isMounted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const playSound = useCallback((sound: SoundEffect) => {
    if (isMuted || typeof window === 'undefined') return;
    try {
      const audio = new Audio(SOUND_PATHS[sound]);
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Error playing sound:", e));
    } catch (e) {
      console.error(`Could not play sound ${sound}:`, e);
    }
  }, [isMuted]);

  const playMusic = useCallback(() => {
    if (isMuted || typeof window === 'undefined') return;
    if (!musicPlayer) {
      try {
        musicPlayer = new Audio(BACKGROUND_MUSIC_PATH);
        musicPlayer.loop = true;
        musicPlayer.volume = 0.3;
      } catch(e) {
        console.error("Could not create music player:", e);
        return;
      }
    }
    musicPlayer.play().catch(e => console.error("Error playing music:", e));
  }, [isMuted]);

  const stopMusic = useCallback(() => {
    if (musicPlayer) {
      musicPlayer.pause();
      musicPlayer.currentTime = 0;
    }
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
