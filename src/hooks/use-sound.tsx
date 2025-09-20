
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

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const [audioPlayers, setAudioPlayers] = useState<Record<string, HTMLAudioElement>>({});
  const [musicPlayer, setMusicPlayer] = useState<HTMLAudioElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Solo ejecutar en el cliente
    if (typeof window !== 'undefined') {
      const storedMute = localStorage.getItem('globalStopMuted') === 'true';
      setIsMuted(storedMute);

      // Pre-cargar efectos de sonido
      const players: Record<string, HTMLAudioElement> = {};
      (Object.keys(SOUND_PATHS) as SoundEffect[]).forEach(sound => {
        const audio = new Audio(SOUND_PATHS[sound]);
        audio.volume = 0.5;
        audio.muted = storedMute;
        players[sound] = audio;
      });
      setAudioPlayers(players);
      
      // Pre-cargar música de fondo
      const music = new Audio(BACKGROUND_MUSIC_PATH);
      music.loop = true;
      music.volume = 0.3;
      music.muted = storedMute;
      setMusicPlayer(music);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prevMuted => {
      const newMuteState = !prevMuted;
      localStorage.setItem('globalStopMuted', String(newMuteState));
      
      // Actualizar estado de silencio de todos los audios
      Object.values(audioPlayers).forEach(player => player.muted = newMuteState);
      if (musicPlayer) {
        musicPlayer.muted = newMuteState;
        // Si se silencia, pausar música
        if (newMuteState && !musicPlayer.paused) {
          musicPlayer.pause();
        }
      }
      
      return newMuteState;
    });
  }, [audioPlayers, musicPlayer]);

  const playSound = useCallback((sound: SoundEffect) => {
    if (isMuted) return;
    const player = audioPlayers[sound];
    if (player) {
      player.currentTime = 0; // Reiniciar para poder repetir el sonido rápidamente
      player.play().catch(e => console.error(`Error playing sound ${sound}:`, e));
    }
  }, [isMuted, audioPlayers]);

  const playMusic = useCallback(() => {
    if (isMuted || !musicPlayer) return;
    if (musicPlayer.paused) {
      musicPlayer.play().catch(e => console.error("Error playing music:", e));
    }
  }, [isMuted, musicPlayer]);

  const stopMusic = useCallback(() => {
    if (musicPlayer && !musicPlayer.paused) {
      musicPlayer.pause();
      musicPlayer.currentTime = 0;
    }
  }, [musicPlayer]);

  const value = useMemo(() => ({
    isMuted,
    toggleMute,
    playSound,
    playMusic,
    stopMusic,
  }), [isMuted, toggleMute, playSound, playMusic, stopMusic]);
  
  if (!isMounted) {
    return null; // O un fallback de carga si es necesario
  }

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}
