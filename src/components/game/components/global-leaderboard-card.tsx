import { Trophy } from 'lucide-react';
import { LeaderboardTable } from './leaderboard-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { GlobalLeaderboardCardProps } from '../types/leaderboard-types';

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
      <CardHeader className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Trophy className="h-5 w-5" />
                {translateUi('leaderboards.global.title')}
            </CardTitle>
        </div>
        <CardDescription className="text-blue-100 text-sm">
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
