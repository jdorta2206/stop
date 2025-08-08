
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
  const [isMuted, setIsMuted] = useState(true); // Muted by default
  const [audioInstances, setAudioInstances] = useState<Record<string, HTMLAudioElement>>({});
  const [musicInstance, setMusicInstance] = useState<HTMLAudioElement | null>(null);

  // Preload sounds
  useEffect(() => {
    const instances: Record<string, HTMLAudioElement> = {};
    Object.entries(SOUND_PATHS).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.volume = 0.5; // Lower volume for effects
      audio.load();
      audio.addEventListener('error', () => {
        console.warn(`Could not load sound: ${path}`);
      });
      instances[key] = audio;
    });
    setAudioInstances(instances);
    
    const music = new Audio(BACKGROUND_MUSIC_PATH);
    music.loop = true;
    music.volume = 0.2;
    music.load();
    music.addEventListener('error', () => {
        console.warn(`Could not load background music: ${BACKGROUND_MUSIC_PATH}`);
    });
    setMusicInstance(music);
    
    // Check saved preference
    const savedMuteState = localStorage.getItem('stop-game-muted');
    if (savedMuteState) {
        setIsMuted(JSON.parse(savedMuteState));
    }

  }, []);

  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    localStorage.setItem('stop-game-muted', JSON.stringify(newMutedState));
    
    if (newMutedState) {
        musicInstance?.pause();
    } else {
        musicInstance?.play().catch(e => console.error("Error playing music:", e));
    }
  }, [isMuted, musicInstance]);

  const playSound = useCallback((sound: SoundEffect) => {
    if (isMuted) return;
    const audio = audioInstances[sound];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.warn(`Error playing sound ${sound}:`, e));
    }
  }, [isMuted, audioInstances]);

  const playMusic = useCallback(() => {
    if (isMuted || !musicInstance) return;
    musicInstance.play().catch(e => console.warn("Error playing music:", e));
  }, [isMuted, musicInstance]);

  const stopMusic = useCallback(() => {
    musicInstance?.pause();
  }, [musicInstance]);
  
  // Autoplay music when unmuted for the first time
  useEffect(() => {
      if(!isMuted && musicInstance && musicInstance.paused) {
          playMusic();
      }
  }, [isMuted, musicInstance, playMusic]);


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
