
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
import { FriendsLeaderboardCard } from '@/components/game/components/friends-leaderboard-card';
import { PersonalHighScoreCard } from '@/components/game/components/personal-high-score-card';
import { GameHistoryCard } from '@/components/game/components/game-history-card';
import { AchievementsCard } from '@/components/game/components/achievements-card';
import { addFriend, getFriends, type Friend } from '@/lib/friends-service';

export default function LeaderboardPage() {
  const router = useRouter();
  const { language, translate } = useLanguage();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  const [globalLeaderboard, setGlobalLeaderboard] = useState<PlayerScore[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<PlayerScore[]>([]);
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

        const friendIds = (await getFriends(user.uid)).map(f => f.id);
        const friendScores = await Promise.all(
          friendIds.map(id => rankingManager.getPlayerRanking(id))
        );
        const validFriendScores = friendScores.filter((s): s is PlayerScore => s !== null);
        setFriendsLeaderboard(validFriendScores);
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron cargar los datos del ranking.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAddFriend = async (player: PlayerScore) => {
    if (!user) {
      toast({ title: "Acción requerida", description: "Debes iniciar sesión para añadir amigos." });
      return;
    }
    try {
      await addFriend(user.uid, player.id, player.playerName, player.photoURL);
      toast({ title: "¡Éxito!", description: `${player.playerName} ha sido añadido a tus amigos.` });
      fetchData(); // Refresh friends list
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleChallenge = (player: PlayerScore) => {
    router.push(`/challenge-setup/${player.id}?name=${encodeURIComponent(player.playerName)}`);
  };

  if (isAuthLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-card to-background text-foreground">
      <AppHeader onToggleChat={() => {}} isChatOpen={false} />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-primary">{translate('leaderboards.title')}</h1>
            <Button onClick={fetchData} disabled={isLoading} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Cargando...' : 'Actualizar'}
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
            {user && (
              <FriendsLeaderboardCard 
                leaderboardData={friendsLeaderboard}
                currentUserId={user.uid}
                onChallenge={handleChallenge}
                language={language}
                translateUi={translate}
                isLoading={isLoading}
              />
            )}
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
                <Button onClick={() => router.push('/')}>{translate('leaderboards.loginButton')}</Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <AppFooter language={language} />
    </div>
  );
}
