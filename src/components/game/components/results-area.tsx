
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { RoundResults } from '../types';
import { useRouter } from 'next/navigation';

interface ResultsAreaProps {
  roundResults?: RoundResults | null;
  playerRoundScore: number;
  aiRoundScore: number;
  roundWinner: string;
  totalPlayerScore: number;
  totalAiScore: number;
  startNextRound: () => void;
  translateUi: (key: string, replacements?: Record<string, string>) => string;
  currentLetter: string | null;
}

export function ResultsArea({ roundResults, playerRoundScore, aiRoundScore, roundWinner, totalPlayerScore, totalAiScore, startNextRound, translateUi, currentLetter }: ResultsAreaProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const playerName = user?.displayName || translateUi('game.results.labels.you');
  
  if (!roundResults || !currentLetter) {
    return (
        <Card className="w-full max-w-lg mx-auto text-center p-8 shadow-xl">
            <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
            <h2 className="text-2xl font-bold mt-6">{translateUi('game.loadingAI.title')}</h2>
            <p className="text-muted-foreground mt-2">{translateUi('game.loadingAI.description')}</p>
        </Card>
    );
  }

  const renderCategoryResult = (category: string, resultDetail?: { response: string; isValid: boolean; score: number }) => {
    const isValid = resultDetail?.isValid ?? false;
    const score = resultDetail?.score ?? 0;
    const response = resultDetail?.response || '-';

    return (
      <div key={category} className="flex justify-between items-center text-sm py-2 px-3 rounded-md bg-background/50">
        <div className="flex items-center gap-2 flex-1 min-w-0">
            {isValid ? <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" /> : <XCircle className="h-4 w-4 text-destructive shrink-0" />}
            <div className='flex flex-col min-w-0'>
                <span className={`capitalize font-medium`}>
                    {category}
                </span>
                 <span className={`truncate text-muted-foreground text-xs ${!isValid && response !== '-' ? 'text-destructive line-through' : ''}`}>
                    {response}
                </span>
            </div>
        </div>
        <Badge variant={score > 5 ? 'secondary' : score > 0 ? 'default' : 'destructive'}>{score} pts</Badge>
      </div>
    );
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl rounded-xl bg-card/80 p-6" key={`results-area-${currentLetter}`}>
        <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-primary">{translateUi('game.results.title')}</h2>
            <p className="text-muted-foreground mt-1">
              {translateUi('game.results.winner.label', { winner: roundWinner })}
            </p>
            <p className="text-muted-foreground text-sm">
                {translateUi('game.letterLabel')} <span className="font-bold text-secondary">{currentLetter}</span>
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-background/40">
            <CardHeader>
              <CardTitle className="text-xl">{playerName}</CardTitle>
              <p className="text-3xl font-bold text-primary">{playerRoundScore} pts</p>
            </CardHeader>
            <CardContent className="space-y-2">
               {Object.entries(roundResults).map(([category, result]) => renderCategoryResult(category, result.player))}
            </CardContent>
          </Card>
          
          <Card className="bg-background/40">
            <CardHeader>
              <CardTitle className="text-xl">{translateUi('game.results.labels.ai')}</CardTitle>
               <p className="text-3xl font-bold text-primary">{aiRoundScore} pts</p>
            </CardHeader>
            <CardContent className="space-y-2">
               {Object.entries(roundResults).map(([category, result]) => renderCategoryResult(category, result.ai))}
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8 flex justify-center gap-4">
             <Button onClick={startNextRound} size="lg">{translateUi?.('game.buttons.nextRound')}</Button>
             <Button onClick={() => router.push('/')} variant="outline" size="lg">
                 {translateUi?.('home')}
            </Button>
        </div>
    </Card>
  );
};
