
"use client";

import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { Language } from '@/contexts/language-context';
import { StopButton } from './stop-button';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RouletteWheel } from './roulette-wheel';
import { useAuth } from '@/hooks/use-auth';
import { GameState, LanguageCode, RoundResults, ResultDetail } from '../types';
import type { ProcessingState } from '@/app/play-solo/page';
import { useRouter } from 'next/navigation';
import React from 'react';

const LoadingOverlay: React.FC<{ processingState: ProcessingState, translateUi: (key: string) => string }> = ({ processingState, translateUi }) => (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 text-white rounded-lg">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <h3 className="text-2xl font-bold">{translateUi(`game.loadingAI.${processingState}`)}</h3>
        <p className="mt-2 text-muted-foreground">{translateUi('game.loadingAI.description')}</p>
    </div>
);

interface ResultsAreaProps {
  roundResults?: RoundResults;
  playerRoundScore?: number;
  aiRoundScore?: number;
  roundWinner?: string;
  totalPlayerScore: number;
  totalAiScore: number;
  startNextRound: () => void;
  translateUi: (key: string, replacements?: Record<string, string>) => string;
  currentLetter: string | null;
}

const ResultsArea: React.FC<ResultsAreaProps> = ({ roundResults, playerRoundScore, aiRoundScore, roundWinner, totalPlayerScore, totalAiScore, startNextRound, translateUi, currentLetter }) => {
  const router = useRouter();
  const { user } = useAuth();
  
  if (!roundResults || typeof playerRoundScore === 'undefined' || typeof aiRoundScore === 'undefined' || !roundWinner || !currentLetter) {
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
  
  const playerName = user?.displayName || translateUi('game.results.labels.you');

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
            </Header>
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


interface GameAreaProps {
  gameState: GameState;
  currentLetter: string | null;
  onSpinComplete: (letter: string) => void;
  categories: string[];
  alphabet: string[];
  playerResponses: Record<string, string>;
  onInputChange: (category: string, value: string) => void;
  onStop: () => void;
  isLoadingAi: boolean;
  roundResults?: RoundResults;
  playerRoundScore?: number;
  aiRoundScore?: number;
  roundWinner?: string;
  startNextRound: () => void;
  totalPlayerScore: number;
  totalAiScore: number;
  timeLeft: number;
  countdownWarningText: string;
  translateUi: (key: string, replacements?: Record<string, string>) => string;
  language: LanguageCode;
  gameMode: 'solo' | 'multiplayer';
  localPlayerSubmitted?: boolean;
  processingState: ProcessingState;
}

export function GameArea({
  gameState,
  currentLetter,
  onSpinComplete,
  categories,
  alphabet,
  playerResponses,
  onInputChange,
  onStop,
  isLoadingAi,
  roundResults,
  playerRoundScore,
  aiRoundScore,
  roundWinner,
  startNextRound,
  totalPlayerScore,
  totalAiScore,
  timeLeft,
  countdownWarningText,
  translateUi,
  language,
  gameMode,
  localPlayerSubmitted,
  processingState,
}: GameAreaProps) {
    
  const { user } = useAuth();
  
  if (gameState === "SPINNING") {
    return (
      <RouletteWheel 
        isSpinning={true}
        alphabet={alphabet}
        language={language}
        onSpinComplete={onSpinComplete}
        className="my-8"
      />
    )
  }

  if (gameState === "EVALUATING") {
    return (
        <div className="w-full max-w-2xl mx-auto relative">
            <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-xl blur-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-5xl font-extrabold">
                        <span className="text-muted-foreground">{translateUi('game.letterLabel')} </span>
                        <span className="text-primary tracking-wider">{currentLetter}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-4 md:p-6" />
            </Card>
            <LoadingOverlay processingState={processingState} translateUi={translateUi as (key: string) => string} />
        </div>
    );
  }
  
  if (gameState === "RESULTS") {
     return <ResultsArea 
        roundResults={roundResults}
        playerRoundScore={playerRoundScore}
        aiRoundScore={aiRoundScore}
        roundWinner={roundWinner}
        totalPlayerScore={totalPlayerScore}
        totalAiScore={totalAiScore}
        startNextRound={startNextRound}
        translateUi={translateUi}
        currentLetter={currentLetter}
     />;
  }

  if (gameState !== "PLAYING" || !currentLetter) {
    return (
        <div className="flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4">Esperando el inicio del juego...</p>
        </div>
    );
  }

  const getCardDescription = () => {
    if (gameMode === "multiplayer") {
      if (localPlayerSubmitted) return translateUi('host.messages.onlyHost.evaluate');
      return translateUi('game.instructionsRoom');
    }
    return translateUi('game.instructions');
  };

  const allowInput = !localPlayerSubmitted && gameState === 'PLAYING';

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-5xl font-extrabold">
            <span className="text-muted-foreground">{translateUi('game.letterLabel')} </span>
            <span className="text-primary tracking-wider">{currentLetter}</span>
          </CardTitle>
          <CardDescription className="mt-2 text-md">{getCardDescription()}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-4 md:p-6">
          {categories.map((category, index) => (
            <div key={`${category}-${currentLetter}`}>
              <div className="space-y-2">
                <label htmlFor={`${category}-${gameMode}`} className="text-xl font-semibold text-primary">
                  {category}
                </label>
                <Input
                  id={`${category}-${gameMode}`}
                  value={playerResponses[category] || ''}
                  onChange={(e) => onInputChange(category, e.target.value)}
                  placeholder={`${translateUi('game.inputPlaceholder')} ${category.toLowerCase()} ${language === 'es' ? 'con' : 'with'} ${currentLetter}...`}
                  disabled={!allowInput}
                  className="text-lg py-3 px-4 border-2 focus:border-primary focus:ring-primary"
                  aria-label={`${language === 'es' ? 'Entrada para la categoría' : 'Input for category'} ${category}`}
                  autoComplete="off"
                />
              </div>
              {index < categories.length - 1 && <Separator className="my-6" />}
            </div>
          ))}
        </CardContent>
      </Card>
      
      <div className="flex flex-col items-center gap-4">
        <div className="w-full max-w-2xl space-y-2">
            <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-muted-foreground">{translateUi('game.time.left')}</span>
                <span className={countdownWarningText ? "text-destructive font-bold" : ""}>
                    {countdownWarningText || `${timeLeft}s`}
                </span>
            </div>
            <Progress value={(timeLeft / 60) * 100} className="h-2" />
        </div>
        <StopButton 
            onClick={onStop} 
            disabled={isLoadingAi || !allowInput} 
            language={language} 
        />
      </div>
    </div>
  );
}
