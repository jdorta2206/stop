
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

// State for audio players
let audioPlayers: { [key in SoundEffect]?: HTMLAudioElement } = {};
let musicPlayer: HTMLAudioElement | null = null;

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedMute = localStorage.getItem('globalStopMuted');
    if (storedMute !== null) {
      setIsMuted(JSON.parse(storedMute));
    }

    // Preload sounds on client
    if (typeof window !== 'undefined') {
        // Preload effects
        (Object.keys(SOUND_PATHS) as SoundEffect[]).forEach(sound => {
            if (!audioPlayers[sound]) {
                audioPlayers[sound] = new Audio(SOUND_PATHS[sound]);
                audioPlayers[sound]!.volume = 0.5;
            }
        });

        // Preload music
        if (!musicPlayer) {
            musicPlayer = new Audio(BACKGROUND_MUSIC_PATH);
            musicPlayer.loop = true;
            musicPlayer.volume = 0.3;
        }
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
        const newMuteState = !prev;
        localStorage.setItem('globalStopMuted', JSON.stringify(newMuteState));
        if (musicPlayer) {
            musicPlayer.muted = newMuteState;
            if(newMuteState) {
                musicPlayer.pause();
                musicPlayer.currentTime = 0;
            }
        }
        Object.values(audioPlayers).forEach(player => {
            if (player) player.muted = newMuteState;
        });
        return newMuteState;
    });
  }, []);
  
  useEffect(() => {
    if (isMounted) {
      const currentMute = JSON.parse(localStorage.getItem('globalStopMuted') || 'false');
      if (musicPlayer) musicPlayer.muted = currentMute;
      Object.values(audioPlayers).forEach(player => {
        if(player) player.muted = currentMute;
      });
    }
  }, [isMounted]);

  const playSound = useCallback((sound: SoundEffect) => {
    if (isMuted || typeof window === 'undefined') return;
    const player = audioPlayers[sound];
    if (player) {
      player.currentTime = 0;
      player.play().catch(e => console.error(`Error playing sound ${sound}:`, e));
    }
  }, [isMuted]);

  const playMusic = useCallback(() => {
    if (isMuted || typeof window === 'undefined' || !musicPlayer) return;
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
