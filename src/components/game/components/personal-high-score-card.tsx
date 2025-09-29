
// global-stop/src/components/game/personal-high-score-card.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Trophy } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useLanguage } from '../../../contexts/language-context';

interface PersonalHighScoreCardProps {
  highScore: number;
  className?: string;
  translateUi: (key: string, replacements?: Record<string, string>) => string;
}

export function PersonalHighScoreCard({ highScore, className, translateUi }: PersonalHighScoreCardProps) {
  const { language } = useLanguage();
  const localeForNumber = language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'pt' ? 'pt-PT' : 'en-US';

  return (
    <Card className={cn("shadow-lg rounded-xl", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-medium text-primary">
          {translateUi('leaderboards.personalHighScore.title')}
        </CardTitle>
        <Trophy className="h-6 w-6 text-yellow-500" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-foreground">
          {highScore.toLocaleString(localeForNumber)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {translateUi('leaderboards.personalHighScore.subtitle')}
        </p>
      </CardContent>
    </Card>
  );
}
