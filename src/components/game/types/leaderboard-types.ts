
import type { Language } from "@/contexts/language-context";
import type { PlayerScore } from './player-types';

export interface EnrichedPlayerScore extends PlayerScore {
  isCurrentUser?: boolean;
}

export interface LeaderboardTableProps {
  players: EnrichedPlayerScore[];
  currentUserId?: string | null;
  onAddFriend?: (player: EnrichedPlayerScore) => void;
  onChallenge?: (player: EnrichedPlayerScore) => void;
  isFriendsLeaderboard?: boolean;
  isLoading?: boolean;
  language: Language;
}

export interface LeaderboardCardProps {
  leaderboardData: EnrichedPlayerScore[];
  currentUserId?: string | null;
  language: Language;
  onChallenge: (player: EnrichedPlayerScore) => void;
  translateUi: (key: string, replacements?: Record<string, string>) => string;
  className?: string;
}

export interface GlobalLeaderboardCardProps {
  leaderboardData: EnrichedPlayerScore[];
  language: Language;
  currentUserId?: string;
  onAddFriend: (player: EnrichedPlayerScore) => void;
  onChallenge: (player: EnrichedPlayerScore) => void;
  translateUi: any; 
  className?: string;
  isLoading?: boolean;
}
