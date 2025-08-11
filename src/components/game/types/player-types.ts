
// src/components/game/types/player-types.ts
import type { MissionProgress } from "@/lib/missions";

export interface Player {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface PlayerScore {
  id: string;
  playerName: string;
  photoURL?: string | null;
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  averageScore: number;
  bestScore: number;
  lastPlayed: any; // Can be Firestore Timestamp on server, string on client
  level: string;
  achievements: string[];
  coins: number;
  dailyMissions: MissionProgress[];
  missionsLastReset: string; // YYYY-MM-DD
}

export interface GameResult {
    id: string;
    playerId: string;
    playerName: string;
    photoURL?: string | null;
    score: number;
    categories: Record<string, string>;
    letter: string;
    gameMode: 'solo' | 'multiplayer' | 'private';
    roomId?: string;
    timestamp: any; // Can be Firestore Timestamp on server, Date on client
    won?: boolean;
}
