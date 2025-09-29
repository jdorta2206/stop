
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { ScrollArea } from '../../ui/scroll-area';
import { Badge } from '../../ui/badge';
import { History, Loader2 } from 'lucide-react';
import type { GameResult } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS, fr, ptBR } from 'date-fns/locale';
import { useLanguage } from '../../../contexts/language-context';
import { useEffect, useState } from 'react';

interface GameHistoryCardProps {
  gameHistory: GameResult[];
  translateUi: (key: string, replacements?: Record<string, string>) => string;
}

const localeMap = {
  es,
  en: enUS,
  fr,
  pt: ptBR,
};

export function GameHistoryCard({ gameHistory, translateUi }: GameHistoryCardProps) {
  const { language } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const getGameModeText = (mode: string) => {
    switch (mode) {
      case 'solo': return 'Contra IA';
      case 'private': return 'Sala Privada';
      case 'multiplayer': return 'Multijugador';
      default: return 'Partida';
    }
  };

  const getTimeAgo = (timestamp: any) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') return 'Fecha desconocida';
    try {
        const date = timestamp.toDate();
        const locale = localeMap[language] || enUS;
        return formatDistanceToNow(date, { addSuffix: true, locale });
    } catch(e) {
        return 'Fecha inválida';
    }
  };

  if (!isMounted) {
    return (
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            {translateUi('leaderboards.recentGames')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          {translateUi('leaderboards.recentGames')}
        </CardTitle>
        <CardDescription>
          Tus últimas partidas jugadas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {gameHistory && gameHistory.length > 0 ? (
          <ScrollArea className="h-48">
            <div className="space-y-4">
              {gameHistory.map((game, index) => (
                <div key={game.id || index} className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">
                      {game.score} {translateUi('leaderboards.points')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Letra: <span className="font-bold text-secondary">{game.letter}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{getGameModeText(game.gameMode)}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isMounted ? getTimeAgo(game.timestamp) : '...'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            <p>{translateUi('leaderboards.noGames')}</p>
            <p className="text-sm mt-1">{translateUi('leaderboards.playToSeeStats')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
