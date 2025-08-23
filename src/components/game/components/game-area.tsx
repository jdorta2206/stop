
"use client";

import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface GameAreaProps {
  currentLetter: string | null;
  categories: string[];
  playerResponses: Record<string, string>;
  onInputChange: (category: string, value: string) => void;
  translateUi: (key: string, replacements?: Record<string, string>) => string;
  onStop: () => void;
  timeLeft: number;
  roundDuration: number;
}

export function GameArea({
  currentLetter,
  categories,
  playerResponses,
  onInputChange,
  translateUi,
  onStop,
  timeLeft,
  roundDuration,
}: GameAreaProps) {
    
  if (!currentLetter) {
    return null;
  }

  const progressValue = roundDuration > 0 ? (timeLeft / roundDuration) * 100 : 0;

  return (
    <div className="w-full max-w-3xl mx-auto">
        <Card className="w-full mx-auto shadow-xl rounded-2xl bg-white text-gray-800">
            <CardHeader className="text-center bg-primary-foreground/10 rounded-t-2xl py-4">
                <CardDescription className="text-2xl">{translateUi('game.letterLabel')} </CardDescription>
                <CardTitle className="text-7xl font-extrabold text-primary-foreground tracking-wider">
                {currentLetter}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 p-4 md:p-6">
                {categories.map((category) => (
                <div key={`${category}-${currentLetter}`} className="bg-primary-foreground/5 p-4 rounded-lg">
                    <label htmlFor={`${category}-solo`} className="text-lg font-bold text-primary-foreground mb-2 block">
                        {category}
                    </label>
                    <Input
                        id={`${category}-solo`}
                        key={`${category}-${currentLetter}-input`}
                        value={playerResponses[category] || ''}
                        onChange={(e) => onInputChange(category, e.target.value)}
                        placeholder={`${translateUi('game.inputPlaceholder')} ${category.toLowerCase()}...`}
                        className="text-lg py-3 px-4 border-2 border-primary-foreground/20 focus:border-primary-foreground focus:ring-primary-foreground bg-white"
                        aria-label={`Entrada para la categoría ${category}`}
                        autoComplete="off"
                    />
                </div>
                ))}
            </CardContent>
        </Card>
        <div className="flex flex-col items-center gap-4 mt-6">
            <div className="w-full max-w-2xl space-y-2 text-white">
                <div className="flex justify-between items-center text-sm font-medium px-1">
                    <span>{translateUi('game.time.left')}</span>
                    <span className={timeLeft <= 10 ? "text-destructive font-bold" : ""}>
                        {timeLeft}s
                    </span>
                </div>
                <Progress value={Math.max(0, progressValue)} className="h-2" />
            </div>
            <Button onClick={onStop} variant="secondary" size="lg" className="mt-4 w-full max-w-xs text-xl py-6 rounded-lg shadow-lg">
                STOP
            </Button>
        </div>
    </div>
  );
}

    