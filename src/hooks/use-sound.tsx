
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
  const [isMuted, setIsMuted] = useState(true); // Default to muted
  const [audioPlayers, setAudioPlayers] = useState<Record<string, HTMLAudioElement>>({});
  const [musicPlayer, setMusicPlayer] = useState<HTMLAudioElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Client-side only
    if (typeof window !== 'undefined') {
      const storedMute = localStorage.getItem('globalStopMuted') === 'true';
      setIsMuted(storedMute);

      // Pre-load sound effects
      const players: Record<string, HTMLAudioElement> = {};
      (Object.keys(SOUND_PATHS) as SoundEffect[]).forEach(sound => {
        if (!players[sound]) {
          const audio = new Audio(SOUND_PATHS[sound]);
          audio.volume = 0.5;
          players[sound] = audio;
        }
      });
      setAudioPlayers(players);
      
      // Pre-load background music
      if (!musicPlayer) {
        const music = new Audio(BACKGROUND_MUSIC_PATH);
        music.loop = true;
        music.volume = 0.3;
        setMusicPlayer(music);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Apply mute state to all players when it changes
    Object.values(audioPlayers).forEach(player => player.muted = isMuted);
    if (musicPlayer) {
      musicPlayer.muted = isMuted;
    }
  }, [isMuted, audioPlayers, musicPlayer]);


  const toggleMute = useCallback(() => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    localStorage.setItem('globalStopMuted', String(newMuteState));
      
    if (newMuteState && musicPlayer && !musicPlayer.paused) {
      musicPlayer.pause();
    }
  }, [isMuted, musicPlayer]);

  const playSound = useCallback((sound: SoundEffect) => {
    if (isMuted) return;
    const player = audioPlayers[sound];
    if (player) {
      player.currentTime = 0;
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
    // Render nothing or a loader on the server
    return null;
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
