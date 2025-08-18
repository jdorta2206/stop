
"use client";

import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Language } from '@/contexts/language-context';
import { StopButton } from './stop-button';
import { Progress } from '@/components/ui/progress';
import { GameState, LanguageCode } from '../types';
import React, { useMemo } from 'react';

interface GameAreaProps {
  currentLetter: string | null;
  categories: string[];
  playerResponses: Record<string, string>;
  onInputChange: (category: string, value: string) => void;
  onStop: () => void;
  timeLeft: number;
  translateUi: (key: string, replacements?: Record<string, string>) => string;
  language: LanguageCode;
}

export function GameArea({
  currentLetter,
  categories,
  playerResponses,
  onInputChange,
  onStop,
  timeLeft,
  translateUi,
  language,
}: GameAreaProps) {
    
  if (!currentLetter) {
    return null; // Should be handled by parent component state
  }

  const countdownWarningText = useMemo(() => {
    if (timeLeft <= 3) return translateUi('game.time.finalCountdown');
    if (timeLeft <= 5) return translateUi('game.time.almostUp');
    if (timeLeft <= 10) return translateUi('game.time.endingSoon');
    return '';
  }, [timeLeft, translateUi]);


  return (
    <div className="space-y-6">
      <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-5xl font-extrabold">
            <span className="text-muted-foreground">{translateUi('game.letterLabel')} </span>
            <span className="text-primary tracking-wider">{currentLetter}</span>
          </CardTitle>
          <CardDescription className="mt-2 text-md">{translateUi('game.instructions')}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-4 md:p-6">
          {categories.map((category, index) => (
            <React.Fragment key={`${category}-${currentLetter}`}>
              <div className="space-y-2">
                <label htmlFor={`${category}-solo`} className="text-xl font-semibold text-primary">
                  {category}
                </label>
                <Input
                  id={`${category}-solo`}
                  value={playerResponses[category] || ''}
                  onChange={(e) => onInputChange(category, e.target.value)}
                  placeholder={`${translateUi('game.inputPlaceholder')} ${category.toLowerCase()} ${language === 'es' ? 'con' : 'with'} ${currentLetter}...`}
                  className="text-lg py-3 px-4 border-2 focus:border-primary focus:ring-primary"
                  aria-label={`${language === 'es' ? 'Entrada para la categoría' : 'Input for category'} ${category}`}
                  autoComplete="off"
                />
              </div>
              {index < categories.length - 1 && <Separator className="my-6" />}
            </React.Fragment>
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
            language={language} 
        />
      </div>
    </div>
  );
}
