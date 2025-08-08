
// src/types/player.ts

export interface PlayerInLobby {
  id: string;
  name: string;
  avatar?: string | null;
  isCurrentUser?: boolean;
  isOnline?: boolean;
  score?: number;
  isHost?: boolean;
}
