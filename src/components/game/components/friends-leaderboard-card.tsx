"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../ui/card';
import { LeaderboardTable } from './leaderboard-table';
import { Users } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { PlayerScore } from '../types';
import type { Language } from '../../../contexts/language-context';
import type { Friend } from '../../../lib/friends-service';

interface FriendsLeaderboardCardProps {
  leaderboardData: PlayerScore[];
  friendsList: Friend[];
  className?: string;
  language: Language;
  currentUserId?: string;
  onChallenge: (player: PlayerScore) => void;
  translateUi: (key: string, replacements?: Record<string, string>) => string;
  isLoading?: boolean;
}


export function FriendsLeaderboardCard({ 
  leaderboardData,
  friendsList,
  className, 
  language,
  currentUserId,
  onChallenge,
  translateUi,
  isLoading,
}: FriendsLeaderboardCardProps) {
  
  const hasFriends = friendsList.length > 0;
  const hasScores = leaderboardData.length > 0;

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
          currentUserId={currentUserId}
          onChallenge={onChallenge}
          isFriendsLeaderboard={true}
          language={language}
          isLoading={isLoading}
        />
        {!isLoading && !hasFriends && (
          <div className="text-center text-muted-foreground p-4">
            Aún no tienes amigos en tu lista. ¡Añade algunos desde el ranking global para competir!
          </div>
        )}
        {!isLoading && hasFriends && !hasScores && (
           <div className="text-center text-muted-foreground p-4">
            Tus amigos aún no han jugado. ¡Anímales a unirse a una partida!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
