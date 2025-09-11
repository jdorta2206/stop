
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
  const [displayLetter, setDisplayLetter] = useState<string>('?');
  const wheelRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSound();

  const translate = (textKey: keyof typeof ROULETTE_TEXTS) => {
    return ROULETTE_TEXTS[textKey][language] || ROULETTE_TEXTS[textKey]['en'];
  };
  
  useEffect(() => {
    if (alphabet.length > 0) {
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
        const targetAngle = 360 * 5 - (targetIndex * segmentAngle + segmentAngle / 2);

        wheel.style.transition = 'transform 4s cubic-bezier(0.2, 0.8, 0.2, 1)';
        wheel.style.transform = `rotate(${targetAngle}deg)`;

        // Animate letters in the center
        const letterAnimationInterval = setInterval(() => {
            const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
            setDisplayLetter(randomLetter);
        }, 80);


        setTimeout(() => {
            clearInterval(letterAnimationInterval);
            playSound('spin-end');
            setDisplayLetter(finalLetter);
            
            // Wait a moment on the final letter before completing
            setTimeout(() => {
              setIsAnimating(false);
              onSpinComplete(finalLetter);
            }, 1000);
            
        }, 4000); // Stop letter animation at the same time the wheel stops
    }
  }, [alphabet, onSpinComplete, playSound]);

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
          <div ref={wheelRef} className="roulette-wheel relative w-full h-full rounded-full border-8 border-[hsl(var(--card))] shadow-lg bg-white/10">
             {alphabet.map((letter, index) => {
                const angle = (360 / alphabet.length) * index;
                const segmentStyle: React.CSSProperties = {
                    transform: `rotate(${angle}deg) skewY(-${90 - (360 / alphabet.length)}deg)`,
                    position: 'absolute',
                    width: '50%',
                    height: '50%',
                    transformOrigin: '100% 100%',
                    top: 0,
                    left: 0,
                    backgroundColor: index % 2 === 0 ? 'hsla(var(--primary-foreground), 0.1)' : 'hsla(var(--primary-foreground), 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                };
                const letterStyle: React.CSSProperties = {
                    transform: `skewY(${90 - (360 / alphabet.length)}deg) rotate(${(360 / alphabet.length) / 2}deg)`,
                    position: 'absolute',
                    left: '-50%',
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'hsl(var(--foreground))',
                }
                return (
                    <div key={index} style={segmentStyle}>
                        <div style={letterStyle}>
                            {letter}
                        </div>
                    </div>
                )
             })}
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-background/50 backdrop-blur-sm w-24 h-24 rounded-full flex items-center justify-center">
                  <span className="text-white text-6xl font-bold transition-all duration-100" style={{
                    textShadow: '0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary))'
                  }}>{displayLetter}</span>
              </div>
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
