
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LeaderboardTable } from './leaderboard-table';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlayerScore } from '../types';
import type { Language } from '@/contexts/language-context';

interface FriendsLeaderboardCardProps {
  leaderboardData: PlayerScore[];
  className?: string;
  language: Language;
  currentUserId?: string;
  onChallenge: (player: PlayerScore) => void;
  translateUi: (key: string, replacements?: Record<string, string>) => string;
  isLoading?: boolean;
}


export function FriendsLeaderboardCard({ 
  leaderboardData, 
  className, 
  language,
  currentUserId,
  onChallenge,
  translateUi,
  isLoading,
}: FriendsLeaderboardCardProps) {
  
  return (
    <Card className={cn("shadow-lg rounded-xl", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl font-semibold text-primary">{translateUi('leaderboards.friends.title')}</CardTitle>
          </div>
        </div>
        <CardDescription className="mt-2">
          {translateUi('leaderboards.friends.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LeaderboardTable 
          players={leaderboardData} 
          currentUserId={currentUserId || ''}
          onChallenge={onChallenge}
          isFriendsLeaderboard={true}
 language={language}
          isLoading={isLoading}
        />
        {!isLoading && leaderboardData.length === 0 && (
          <div className="text-center text-muted-foreground p-4">
            Aún no tienes amigos en tu lista. ¡Añade algunos para competir!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
