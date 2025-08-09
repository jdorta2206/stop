
"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { PlayerInLobby } from '@/types/player';
import type { GameState, RoundResults, PlayerResponses } from '@/components/game/types/game-types';

export interface RoomGameContextValue {
  activeRoomId: string | null;
  setActiveRoomId: (id: string | null) => void;
  players: PlayerInLobby[];
  setPlayers: React.Dispatch<React.SetStateAction<PlayerInLobby[]>>;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  currentLetter: string | null;
  setCurrentLetter: React.Dispatch<React.SetStateAction<string | null>>;
  playerResponses: PlayerResponses;
  setPlayerResponses: React.Dispatch<React.SetStateAction<PlayerResponses>>;
  roundResults: RoundResults | null;
  setRoundResults: React.Dispatch<React.SetStateAction<RoundResults | null>>;
  gameScores: Record<string, number>; // Total scores for the current game
  setGameScores: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  
  // Acciones de Juego
  handlePlayerResponse: (playerId: string, category: string, value: string) => void;
  calculateScores: () => void;
  resetRound: () => void;
}

// El contexto ya no se exporta porque el provider se ha eliminado
const RoomGameContext = createContext<RoomGameContextValue | undefined>(undefined);

interface RoomGameProviderProps {
  children: ReactNode;
}

// El provider se deja aquí por si se reutiliza en el futuro, pero no se usará
export function RoomGameProvider({ children }: RoomGameProviderProps) {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerInLobby[]>([]);
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [playerResponses, setPlayerResponses] = useState<PlayerResponses>({});
  const [roundResults, setRoundResults] = useState<RoundResults | null>(null);
  const [gameScores, setGameScores] = useState<Record<string, number>>({});

  const handlePlayerResponse = useCallback((playerId: string, category: string, value: string) => {
    setPlayerResponses(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [category]: value
      }
    }));
  }, []);

  const calculateScores = useCallback(() => {
    // This logic needs to be adapted for multiplayer, likely by a server-side function.
    // The current implementation is more suited for solo play.
    console.log("Calculating scores for multiplayer is not fully implemented on the client.");
    setGameState('RESULTS');
  }, []);

  const resetRound = useCallback(() => {
    setGameState('IDLE');
    setCurrentLetter(null);
    setPlayerResponses({});
    setRoundResults(null);
  }, []);
  
  const contextValue = useMemo(() => ({
    activeRoomId,
    setActiveRoomId,
    players,
    setPlayers,
    gameState,
    setGameState,
    currentLetter,
    setCurrentLetter,
    playerResponses,
    setPlayerResponses,
    roundResults,
    setRoundResults,
    gameScores,
    setGameScores,
    handlePlayerResponse,
    calculateScores,
    resetRound,
  }), [
      activeRoomId, setActiveRoomId, players, gameState, currentLetter, playerResponses, roundResults, 
      gameScores, handlePlayerResponse, calculateScores, resetRound
  ]);

  return (
    <RoomGameContext.Provider value={contextValue}>
      {children}
    </RoomGameContext.Provider>
  );
}

export function useRoomGameContext() {
  const context = useContext(RoomGameContext);
  if (context === undefined) {
    throw new Error('useRoomGameContext must be used within a RoomGameProvider');
  }
  return context;
}
