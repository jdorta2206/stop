import { Trophy } from 'lucide-react';
import { LeaderboardTable } from './leaderboard-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import type { PlayerScore } from '../../../lib/ranking';
import type { Language } from '../../../contexts/language-context';

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


export function GlobalLeaderboardCard({
  leaderboardData,
  language,
  currentUserId,
  onAddFriend,
  onChallenge,
  translateUi,
  className = '',
  isLoading,
}: GlobalLeaderboardCardProps) {
  return (
    <Card className={`shadow-lg rounded-xl overflow-hidden ${className}`}>
      <CardHeader className="bg-card text-white p-4">
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Trophy className="h-5 w-5" />
                {translateUi('leaderboards.global.title')}
            </CardTitle>
        </div>
        <CardDescription className="text-muted-foreground text-sm">
            {translateUi('leaderboards.global.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <LeaderboardTable 
            players={leaderboardData} 
            currentUserId={currentUserId}
            onAddFriend={onAddFriend}
            onChallenge={onChallenge}
            isLoading={isLoading}
            language={language}
            isFriendsLeaderboard={false}
        />
      </CardContent>
    </Card>
  );
}
