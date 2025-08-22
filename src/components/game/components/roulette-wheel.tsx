
'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Language } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { useSound } from '@/hooks/use-sound';

interface RouletteWheelProps {
  onSpinComplete: (letter: string) => void;
  alphabet: string[];
  language: Language;
  className?: string;
}

const ROULETTE_TEXTS = {
  title: { 
    es: "¡Girando por una Letra!", 
    en: "Spinning for a Letter!", 
    fr: "Tournoiement pour une Lettre !", 
    pt: "Rodando por uma Letra!" 
  },
  description: { 
    es: "Prepárate...", 
    en: "Get ready...", 
    fr: "Préparez-vous...", 
    pt: "Prepare-se..." 
  },
  spinningStatus: { 
    es: "Girando...", 
    en: "Spinning...", 
    fr: "Tournoiement...", 
    pt: "Rodando..." 
  },
  ariaLabel: {
    es: "Ruleta de letras girando",
    en: "Spinning letter wheel",
    fr: "Roulette à lettres tournante",
    pt: "Roda de letras girando"
  }
};

export function RouletteWheel({ onSpinComplete, alphabet, language, className }: RouletteWheelProps) {
  const [displayLetter, setDisplayLetter] = useState<string>(alphabet[0] || 'A');
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { playSound } = useSound();

  const translate = (textKey: keyof typeof ROULETTE_TEXTS) => {
    return ROULETTE_TEXTS[textKey][language] || ROULETTE_TEXTS[textKey]['en'];
  };
  
  useEffect(() => {
    if (alphabet.length > 0 && !isAnimating) {
      setIsAnimating(true);
      playSound('spin-start');
      const maxSpins = 25 + Math.floor(Math.random() * 15);
      let spinCount = 0;

      intervalRef.current = setInterval(() => {
        setDisplayLetter(alphabet[Math.floor(Math.random() * alphabet.length)]);
        spinCount++;
        
        if (spinCount >= maxSpins) {
           const finalLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
           if (intervalRef.current) {
             clearInterval(intervalRef.current);
             intervalRef.current = null;
           }
           playSound('spin-end');
           setDisplayLetter(finalLetter);
           setTimeout(() => {
             onSpinComplete(finalLetter);
           }, 1000);
        }
      }, 80);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [alphabet, onSpinComplete, playSound]);

  return (
    <Card className={cn("w-full max-w-md mx-auto text-center shadow-xl bg-card rounded-lg", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-3xl font-bold text-primary">
          {translate('title')}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {translate('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-8">
        <div 
          className="relative my-4 w-48 h-48 md:w-56 md:h-56 flex items-center justify-center mx-auto"
          aria-label={translate('ariaLabel')}
          aria-busy={isAnimating}
        >
          {/* Static Outer Circle */}
          <div className="absolute inset-0 rounded-full bg-primary/10 border-4 border-primary/20"></div>

          {/* Spinning Dashed Border */}
          {isAnimating && (
            <div className="absolute inset-2 rounded-full border-4 border-dashed border-secondary animate-spin-slow"></div>
          )}
          
          {/* Letter Display */}
          <div className="relative z-10 w-36 h-36 md:w-44 md:h-44 rounded-full bg-background flex items-center justify-center shadow-inner">
             <span className="text-6xl md:text-8xl font-extrabold text-primary tracking-wider animate-pulse">
                {displayLetter}
              </span>
          </div>
        </div>

        {isAnimating && (
          <p className="text-primary mt-4 font-semibold">
            {translate('spinningStatus')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
