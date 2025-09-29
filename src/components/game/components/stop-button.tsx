
"use client";

import * as React from 'react';
import type { Language } from '../../../contexts/language-context';
import { Button } from '../../../components/ui/button';

const internalStopButtonTexts: Record<Language, { ariaDefaultLabel: string }> = {
  es: { ariaDefaultLabel: "Detener la ronda" },
  en: { ariaDefaultLabel: "Stop the round" },
  fr: { ariaDefaultLabel: "Arrêter la manche" },
  pt: { ariaDefaultLabel: "Parar a rodada" },
};

interface StopButtonProps {
  onClick: () => void;
  disabled?: boolean;
  language: Language;
}

export const StopButton: React.FC<StopButtonProps> = ({
  onClick,
  disabled,
  language
}) => {
  
  const translateText = (key: keyof typeof internalStopButtonTexts[Language]) => {
    const langTexts = internalStopButtonTexts[language] || internalStopButtonTexts['en'];
    return langTexts?.[key] || String(key);
  };

  const accessibleLabel = translateText('ariaDefaultLabel');

  return (
    <div
      className="
        p-1 bg-border
        w-32 h-32 md:w-36 md:h-36
        flex items-center justify-center
        transform transition-all duration-150 ease-in-out
        hover:scale-105
      "
      style={{
        clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
      }}
    >
      <Button
        onClick={onClick}
        disabled={disabled}
        variant="destructive"
        size="lg"
        className="
          w-full h-full
          p-0
          font-bold text-2xl md:text-3xl
          shadow-xl
          active:scale-95
          focus-visible:ring-4 focus-visible:ring-red-300 focus-visible:ring-offset-2
          flex items-center justify-center
          relative
          rounded-none
        "
        style={{
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
        }}
        aria-label={accessibleLabel}
      >
        <img 
            src="/android-chrome-192x192.png" 
            alt="Logo Stop" 
            className="w-20 h-20 md:w-24 md:h-24 p-1 rounded-full"
        />
      </Button>
    </div>
  );
};
