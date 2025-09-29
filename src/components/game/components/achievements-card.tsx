"use client";

import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Award, BadgeCheck } from 'lucide-react';
import { getAchievementInfo, ACHIEVEMENTS } from '../../../lib/ranking';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";

interface AchievementsCardProps {
  achievements: string[];
  translateUi: (key: string, replacements?: Record<string, string>) => string;
}

export function AchievementsCard({ achievements, translateUi }: AchievementsCardProps) {
  
  const allAchievementKeys = Object.keys(ACHIEVEMENTS);

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          {translateUi('leaderboards.achievements')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allAchievementKeys.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {allAchievementKeys.map((key) => {
              const achievement = getAchievementInfo(key);
              const isUnlocked = achievements.includes(key);

              return (
                <TooltipProvider key={key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all duration-300 ${isUnlocked ? 'border-yellow-500 bg-yellow-500/10' : 'border-dashed border-muted-foreground/30 bg-card/20 opacity-50'}`}>
                        <span className={`text-3xl ${isUnlocked ? '' : 'grayscale'}`}>{achievement.icon}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-bold">{achievement.name}</p>
                      <p>{achievement.description}</p>
                      {!isUnlocked && <p className="text-xs text-muted-foreground">(Bloqueado)</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-center">
            {translateUi('leaderboards.noAchievements')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
