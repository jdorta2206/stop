
import type { Language } from "../../contexts/language-context";
import type { PlayerScore } from '../../../lib/ranking';

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
  leaderboardData: PlayerScore[];
  language: Language;
  currentUserId?: string;
  onAddFriend: (player: PlayerScore) => void;
  onChallenge: (player: PlayerScore) => void;
  translateUi: any;
  className?: string;
  isLoading?: boolean;
}
