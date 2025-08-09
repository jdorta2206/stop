
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { rankingManager } from '@/lib/ranking';
import type { PlayerScore, GameResult } from '@/components/game/types';
import { GlobalLeaderboardCard } from '@/components/game/components/global-leaderboard-card';
import { PersonalHighScoreCard } from '@/components/game/components/personal-high-score-card';
import { GameHistoryCard } from '@/components/game/components/game-history-card';
import { AchievementsCard } from '@/components/game/components/achievements-card';
import { addFriend } from '@/lib/friends-service';

export default function LeaderboardPage() {
  const router = useRouter();
  const { language, translate } = useLanguage();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  const [globalLeaderboard, setGlobalLeaderboard] = useState<PlayerScore[]>([]);
  const [personalStats, setPersonalStats] = useState<PlayerScore | null>(null);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const globalData = await rankingManager.getTopRankings(10);
      setGlobalLeaderboard(globalData);

      if (user) {
        const personalData = await rankingManager.getPlayerRanking(user.uid);
        setPersonalStats(personalData);
        
        const historyData = await rankingManager.getGameHistory(user.uid, 5);
        setGameHistory(historyData);
      }
    } catch (error) {
      toast({ 
        title: translate('error'), 
        description: translate('leaderboards.loadError'), 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAddFriend = async (player: PlayerScore) => {
    if (!user) {
      toast({ 
        title: translate('actionRequired'), 
        description: translate('leaderboards.loginRequired') 
      });
      return;
    }
    try {
      await addFriend(user.uid, player.id, player.playerName, player.photoURL);
      toast({ 
        title: translate('success'), 
        description: translate('leaderboards.friendAdded', { name: player.playerName }) 
      });
      fetchData(); // Refresh friends list
    } catch (error) {
      toast({ 
        title: translate('error'), 
        description: (error as Error).message, 
        variant: "destructive" 
      });
    }
  };

  const handleChallenge = (player: PlayerScore) => {
    toast({
      title: translate('social.challenge.comingSoon.title'),
      description: translate('social.challenge.comingSoon.description', { name: player.playerName }),
    });
  };

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-card to-background text-foreground">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-primary">{translate('leaderboards.title')}</h1>
          <Button onClick={fetchData} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? translate('loading') : translate('refresh')}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <GlobalLeaderboardCard 
              leaderboardData={globalLeaderboard}
              currentUserId={user?.uid}
              onAddFriend={handleAddFriend}
              onChallenge={handleChallenge}
              language={language}
              translateUi={translate}
              isLoading={isLoading}
            />
          </div>
          
          <div className="space-y-6">
            {user && personalStats && (
              <>
                <PersonalHighScoreCard highScore={personalStats.bestScore} translateUi={translate} />
                <GameHistoryCard gameHistory={gameHistory} translateUi={translate} />
                <AchievementsCard achievements={personalStats.achievements} translateUi={translate} />
              </>
            )}
            {!user && !isLoading && (
              <div className="p-6 bg-card rounded-lg text-center">
                <p className="mb-4">{translate('leaderboards.mustLogin')}</p>
                <Button onClick={() => router.push('/')}>
                  {translate('leaderboards.loginButton')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <AppFooter language={language} />
    </div>
  );
}
