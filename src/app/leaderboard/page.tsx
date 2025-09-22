
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/components/ui/use-toast';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, UserPlus, Users } from 'lucide-react';
import { rankingManager } from '@/lib/ranking';
import type { PlayerScore, GameResult } from '@/components/game/types';
import { GlobalLeaderboardCard } from '@/components/game/components/global-leaderboard-card';
import { PersonalHighScoreCard } from '@/components/game/components/personal-high-score-card';
import { GameHistoryCard } from '@/components/game/components/game-history-card';
import { AchievementsCard } from '@/components/game/components/achievements-card';
import { addFriend, getFriends, sendChallengeNotification, type Friend } from '@/lib/friends-service';
import { FriendsLeaderboardCard } from '@/components/game/components/friends-leaderboard-card';
import FriendsInvite from '@/components/social/FriendsInvite';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createRoom } from '@/lib/room-service';

export default function LeaderboardPage() {
  const router = useRouter();
  const { language, translate } = useLanguage();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [globalLeaderboard, setGlobalLeaderboard] = useState<PlayerScore[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<PlayerScore[]>([]);
  const [personalStats, setPersonalStats] = useState<PlayerScore | null>(null);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async (userId?: string) => {
    setIsLoading(true);
    try {
      const globalData = await rankingManager.getTopRankings(10);
      setGlobalLeaderboard(globalData);

      if (userId) {
        const personalData = await rankingManager.getPlayerRanking(userId);
        setPersonalStats(personalData);
        
        const historyData = await rankingManager.getGameHistory(userId, 5);
        setGameHistory(historyData);
        
        const friendsList = await getFriends(userId);
        setFriends(friendsList);

        if (friendsList.length > 0) {
            const friendIds = friendsList.map(f => f.id);
            // Fetch rankings for all friends
            const friendRankingsPromises = friendIds.map(id => rankingManager.getPlayerRanking(id));
            const friendRankings = await Promise.all(friendRankingsPromises);

            // Combine friend data with their ranking data
            const enrichedFriendRankings = friendsList.map(friend => {
                const rankingData = friendRankings.find(r => r.id === friend.id);
                return {
                    ...rankingData, // this will be undefined if no ranking found, but that's ok
                    id: friend.id, // Make sure friend ID is always correct
                    playerName: friend.name,
                    photoURL: friend.avatar,
                    totalScore: rankingData?.totalScore ?? 0,
                    level: rankingData?.level ?? 'Principiante',
                    bestScore: rankingData?.bestScore ?? 0,
                    gamesPlayed: rankingData?.gamesPlayed ?? 0,
                    gamesWon: rankingData?.gamesWon ?? 0,
                    averageScore: rankingData?.averageScore ?? 0,
                    lastPlayed: rankingData?.lastPlayed ?? 'Nunca',
                    achievements: rankingData?.achievements ?? [],
                    coins: rankingData?.coins ?? 0,
                    dailyMissions: rankingData?.dailyMissions ?? [],
                    missionsLastReset: rankingData?.missionsLastReset ?? '',
                };
            }).filter(p => p !== null) as PlayerScore[];
            
            setFriendsLeaderboard(enrichedFriendRankings);
        } else {
            setFriendsLeaderboard([]);
        }
      }
    } catch (error) {
      toast.error((error as Error).message, {
        description: translate('common.error'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData(user.uid);
    } else {
      fetchData(); // Fetch global data even if not logged in
    }
  }, [user]);

  const handleAddFriend = async (player: PlayerScore) => {
    if (!user) {
      toast.warning(translate('leaderboards.loginRequired'), {
        description: translate('actionRequired'),
      });
      return;
    }
    try {
      await addFriend(user.uid, player.id, player.playerName, player.photoURL);
      toast.success(translate('leaderboards.friendAdded', { name: player.playerName }));
      fetchData(user.uid); // Refresh friends list
    } catch (error) {
      toast.error((error as Error).message);
    }
  };
  
  const onFriendAdded = () => {
      if(user) fetchData(user.uid);
  }

  const handleChallenge = async (playerToChallenge: PlayerScore) => {
    if (!user || !user.displayName) {
      toast.error("Debes iniciar sesión para desafiar a alguien.");
      return;
    }

    try {
        const newRoom = await createRoom({
            creatorId: user.uid,
            creatorName: user.displayName,
            creatorAvatar: user.photoURL
        });

        if (!newRoom || !newRoom.id) {
            throw new Error("La función `createRoom` no devolvió un ID de sala.");
        }

        // Send notification to the challenged player
        await sendChallengeNotification(user.uid, user.displayName, playerToChallenge.id, newRoom.id);

        toast.info(`Se ha enviado una invitación a ${playerToChallenge.playerName}. Serás redirigido a la sala.`, {
            title: '¡Desafío enviado!',
        });

        // Redirect current user to the room
        router.push(`/multiplayer?roomId=${newRoom.id}`);

    } catch (error) {
        toast.error((error as Error).message, {
          title: "Error al crear el desafío",
        });
    }
  };

  if (isAuthLoading && isLoading) {
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
          <Button onClick={() => fetchData(user?.uid)} disabled={isLoading} variant="outline">
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
            {user && (
              <FriendsLeaderboardCard 
                leaderboardData={friendsLeaderboard}
                currentUserId={user?.uid}
                onChallenge={handleChallenge}
                language={language}
                translateUi={translate}
                isLoading={isLoading}
              />
            )}
          </div>
          
          <div className="space-y-6">
            {user && personalStats ? (
              <>
                <PersonalHighScoreCard highScore={personalStats.bestScore} translateUi={translate} />
                <GameHistoryCard gameHistory={gameHistory} translateUi={translate} />
                <AchievementsCard achievements={personalStats.achievements || []} translateUi={translate} />
                 <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus />
                      Añadir Amigos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FriendsInvite onFriendAdded={onFriendAdded} />
                  </CardContent>
                </Card>
              </>
            ) : !user && !isLoading && (
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
