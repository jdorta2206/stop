
// src/components/game/types/player-types.ts
import type { MissionProgress } from "@/lib/missions";
import type { PlayerScore } from "@/lib/ranking";


export interface Player {
  id: string;
  name: string;
  avatar?: string | null;
}

export type { PlayerScore };

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
