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
  const [isAnimating, setIsAnimating] = useState(true);
  const wheelRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSound();

  const translate = (textKey: keyof typeof ROULETTE_TEXTS) => {
    return ROULETTE_TEXTS[textKey][language] || ROULETTE_TEXTS[textKey]['en'];
  };
  
  useEffect(() => {
    if (alphabet.length > 0 && isAnimating) {
        playSound('spin-start');

        const wheel = wheelRef.current;
        if (!wheel) return;

        // Reset transform for re-spins
        wheel.style.transition = 'none';
        wheel.style.transform = 'rotate(0deg)';

        // Force reflow
        void wheel.offsetWidth;

        const targetIndex = Math.floor(Math.random() * alphabet.length);
        const finalLetter = alphabet[targetIndex];

        const segmentAngle = 360 / alphabet.length;
        // Calculate the angle to point the pointer at the middle of the segment
        const targetAngle = 360 * 5 - (targetIndex * segmentAngle + segmentAngle / 2);

        wheel.style.transition = 'transform 4s cubic-bezier(0.2, 0.8, 0.2, 1)';
        wheel.style.transform = `rotate(${targetAngle}deg)`;

        setTimeout(() => {
            playSound('spin-end');
            setIsAnimating(false);
            onSpinComplete(finalLetter);
        }, 4500); // Wait for animation + a small buffer
    }
  }, [alphabet, onSpinComplete, playSound, isAnimating]);

  return (
    <Card className={cn("w-full max-w-md mx-auto text-center shadow-xl bg-card/50 backdrop-blur-sm border-white/20 text-white rounded-2xl", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-3xl font-bold">
          {translate('title')}
        </CardTitle>
        <CardDescription className="text-white/80">
          {translate('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-8">
        <div 
          className="relative my-4 w-56 h-56 md:w-64 md:h-64 flex items-center justify-center mx-auto"
          aria-label={translate('ariaLabel')}
          aria-busy={isAnimating}
        >
          <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-10" style={{
              width: 0,
              height: 0,
              borderLeft: '15px solid transparent',
              borderRight: '15px solid transparent',
              borderTop: '30px solid hsl(var(--destructive))'
          }}></div>
          <div ref={wheelRef} className="roulette-wheel relative w-full h-full rounded-full border-8 border-[hsl(var(--card))] shadow-lg">
             {alphabet.map((letter, index) => {
                const angle = (360 / alphabet.length) * index;
                const segmentStyle = {
                  transform: `rotate(${angle}deg)`,
                  backgroundColor: index % 2 === 0 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
                };
                return (
                    <div key={index} className="absolute w-1/2 h-full origin-right top-0 left-0" style={segmentStyle}>
                        <span className="absolute left-[70%] top-1/2 -translate-y-1/2 text-2xl font-bold text-white">
                            {letter}
                        </span>
                    </div>
                )
             })}
          </div>
        </div>

        {isAnimating && (
          <p className="text-white/90 mt-4 font-semibold">
            {translate('spinningStatus')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
