
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/components/ui/use-toast';
import { GameArea } from '@/components/game/components/game-area';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { evaluateRound, type EvaluateRoundOutput } from '@/ai/flows/validate-player-word-flow';
import type { GameState, LanguageCode, RoundResults } from '@/components/game/types';
import { useAuth } from '@/hooks/use-auth';
import { rankingManager } from '@/lib/ranking';
import { useSound } from '@/hooks/use-sound';
import { Loader2 } from 'lucide-react';
import { RouletteWheel } from '@/components/game/components/roulette-wheel';
import { ResultsArea } from '@/components/game/components/results-area';

// Constants
const CATEGORIES_BY_LANG: Record<string, string[]> = {
  es: ["Nombre", "Lugar", "Animal", "Objeto", "Color", "Fruta", "Marca"],
  en: ["Name", "Place", "Animal", "Thing", "Color", "Fruit", "Brand"],
  fr: ["Nom", "Lieu", "Animal", "Chose", "Couleur", "Fruit", "Marque"],
  pt: ["Nome", "Lugar", "Animal", "Coisa", "Cor", "Fruta", "Marca"],
};

const ALPHABET_BY_LANG: Record<string, string[]> = {
  es: "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split(""),
  en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  fr: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  pt: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
};

const ROUND_DURATION = 60; // seconds

export default function PlaySoloPage() {
  const router = useRouter();
  const { language, translate } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const { playSound, stopMusic, playMusic } = useSound();

  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [alphabet, setAlphabet] = useState<string[]>([]);
  const [playerResponses, setPlayerResponses] = useState<{ [key: string]: string }>({});
  const [roundResults, setRoundResults] = useState<RoundResults | null>(null);
  const [playerRoundScore, setPlayerRoundScore] = useState(0);
  const [aiRoundScore, setAiRoundScore] = useState(0); 
  const [roundWinner, setRoundWinner] = useState('');
  const [totalPlayerScore, setTotalPlayerScore] = useState(0);
  const [totalAiScore, setTotalAiScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isEvaluatingRef = useRef<boolean>(false);

  useEffect(() => {
    setCategories(CATEGORIES_BY_LANG[language] || CATEGORIES_BY_LANG.es);
    setAlphabet(ALPHABET_BY_LANG[language] || ALPHABET_BY_LANG.es);
  }, [language]);
  
  useEffect(() => {
    startNewRound();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      stopMusic();
    };
  }, []);
  
  // Timer logic
  useEffect(() => {
    if (gameState === 'PLAYING') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime > 1) {
            if (prevTime > 1 && prevTime <= 11) playSound('timer-tick');
            return prevTime - 1;
          }
          // Time is up, stop the round
          handleStop();
          return 0;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);


  const handleStop = async () => {
    if (isEvaluatingRef.current) return;
    
    isEvaluatingRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    setGameState('EVALUATING');
    stopMusic();

    try {
        if (!currentLetter) {
            throw new Error("No letter was selected for the round.");
        }

        const playerPayload = categories.map(cat => ({
            category: cat,
            word: playerResponses[cat] || ""
        }));

        const aiOutput: EvaluateRoundOutput = await evaluateRound({
            letter: currentLetter,
            language: language as LanguageCode,
            playerResponses: playerPayload,
        });
        
        if (!aiOutput || !aiOutput.results) {
             throw new Error("Invalid AI response format.");
        }

        const pScore = aiOutput.totalScore;
        const aScore = 0; // IA no juega en modo solo

        const winner = pScore > aScore ? (user?.displayName || 'Jugador') : (pScore === 0 && aScore === 0) ? 'Nadie' : 'Empate';

        const adaptedResults: RoundResults = {};
        for (const category in aiOutput.results) {
            adaptedResults[category] = {
                player: aiOutput.results[category],
                ai: { response: '-', isValid: false, score: 0 }
            };
        }
        
        setPlayerRoundScore(pScore);
        setAiRoundScore(aScore);
        setRoundWinner(winner);
        setTotalPlayerScore(prev => prev + pScore);
        setTotalAiScore(prev => prev + aScore);
        setRoundResults(adaptedResults);
        
        if (pScore > 0) playSound('round-win');
        else playSound('round-lose');

        if (user) {
            await rankingManager.saveGameResult({
                playerId: user.uid,
                playerName: user.displayName || 'Jugador',
                photoURL: user.photoURL || null,
                score: pScore,
                categories: playerResponses,
                letter: currentLetter,
                gameMode: 'solo',
                won: pScore > aScore,
            });
        }
        
        setGameState('RESULTS');

    } catch (error) {
        console.error("Error detallado en handleStop:", error);
        toast({ 
            title: translate('notifications.aiError.title'), 
            description: `Error al procesar la ronda: ${(error as Error).message}. Por favor, inténtalo de nuevo.`, 
            variant: 'destructive' 
        });
        setGameState('PLAYING'); // Vuelve al juego para que el usuario pueda reintentar
    } finally {
        isEvaluatingRef.current = false;
    }
  };
  
  const startNewRound = () => {
    stopMusic();
    setPlayerResponses({});
    setRoundResults(null);
    setCurrentLetter(null);
    setGameState('SPINNING');
    setTimeLeft(ROUND_DURATION);
    isEvaluatingRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
  };
  
  const handleSpinComplete = (letter: string) => {
    setCurrentLetter(letter);
    setGameState('PLAYING');
    setTimeLeft(ROUND_DURATION);
    playMusic();
  };
  
  const handleInputChange = (category: string, value: string) => {
    setPlayerResponses(prev => ({ ...prev, [category]: value }));
  };

  const renderContent = () => {
    switch (gameState) {
      case 'SPINNING':
        return (
          <RouletteWheel 
            alphabet={alphabet}
            language={language as LanguageCode}
            onSpinComplete={handleSpinComplete}
            className="my-8"
          />
        );
      case 'PLAYING':
        return (
          <GameArea
            key={currentLetter}
            currentLetter={currentLetter}
            categories={categories}
            playerResponses={playerResponses}
            onInputChange={handleInputChange}
            translateUi={translate}
            onStop={handleStop}
            timeLeft={timeLeft}
            roundDuration={ROUND_DURATION}
          />
        );
      case 'EVALUATING':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8 text-white h-96">
            <Loader2 className="h-16 w-16 animate-spin mb-4" />
            <h2 className="text-2xl font-bold">{translate('game.loadingAI.title')}</h2>
            <p className="text-white/80 mt-2">{translate('game.loadingAI.description')}</p>
          </div>
        );
      case 'RESULTS':
        return (
          <ResultsArea
            key={`results-${currentLetter}`}
            roundResults={roundResults}
            playerRoundScore={playerRoundScore}
            aiRoundScore={aiRoundScore}
            roundWinner={roundWinner}
            totalPlayerScore={totalPlayerScore}
            totalAiScore={totalAiScore}
            startNextRound={startNewRound}
            translateUi={translate}
            currentLetter={currentLetter}
          />
        );
      case 'IDLE':
      default:
         return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-foreground">
      <AppHeader />
      <main className="flex-grow flex items-center justify-center p-4">
        {renderContent()}
      </main>
      <AppFooter language={language as LanguageCode} />
    </div>
  );
}
