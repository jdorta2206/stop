
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
  const [totalPlayerScore, setTotalPlayerScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isEvaluatingRef = useRef(false);

  // Use refs to hold the latest state for callbacks to avoid stale closures
  const playerResponsesRef = useRef(playerResponses);
  playerResponsesRef.current = playerResponses;
  
  const currentLetterRef = useRef(currentLetter);
  currentLetterRef.current = currentLetter;
  
  const languageRef = useRef(language);
  languageRef.current = language;

  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;

  useEffect(() => {
    setCategories(CATEGORIES_BY_LANG[language] || CATEGORIES_BY_LANG.es);
    setAlphabet(ALPHABET_BY_LANG[language] || ALPHABET_BY_LANG.es);
  }, [language]);
  
  useEffect(() => {
    // Start the first round on component mount
    startNewRound();
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleStop = useCallback(async () => {
    if (isEvaluatingRef.current) return;
    isEvaluatingRef.current = true;
    
    stopTimer();
    stopMusic();
    setGameState('EVALUATING');

    try {
      const letter = currentLetterRef.current;
      if (!letter) {
        throw new Error("No se seleccionó ninguna letra para la ronda.");
      }

      const responses = playerResponsesRef.current;
      const currentCategories = categoriesRef.current;
      const currentLanguage = languageRef.current;

      const playerPayload = currentCategories.map(cat => ({
        category: cat,
        word: responses[cat] || ""
      }));
      
      const aiOutput: EvaluateRoundOutput = await evaluateRound({
        letter: letter,
        language: currentLanguage as LanguageCode,
        playerResponses: playerPayload,
      });

      if (!aiOutput || !aiOutput.results) {
        throw new Error("La IA devolvió un formato de respuesta inválido.");
      }
      
      const adaptedResults: RoundResults = {};
      let calculatedPlayerScore = 0;
      
      for (const category of currentCategories) {
        const result = aiOutput.results[category];
        if (result) {
          adaptedResults[category] = { player: result, ai: { response: '-', isValid: false, score: 0 } };
          calculatedPlayerScore += result.score;
        } else {
          adaptedResults[category] = {
            player: { response: responses[category] || '', isValid: false, score: 0 },
            ai: { response: '-', isValid: false, score: 0 }
          };
        }
      }

      setPlayerRoundScore(calculatedPlayerScore);
      setTotalPlayerScore(prev => prev + calculatedPlayerScore);
      setRoundResults(adaptedResults);
      setGameState('RESULTS');
      
      if (calculatedPlayerScore > 0) playSound('round-win');
      else playSound('round-lose');

      // Save result to DB in the background, don't let it block the UI update
      if (user) {
        rankingManager.saveGameResult({
          playerId: user.uid,
          playerName: user.displayName || 'Jugador',
          photoURL: user.photoURL || null,
          score: calculatedPlayerScore,
          categories: responses,
          letter: letter,
          gameMode: 'solo',
          won: calculatedPlayerScore > 0,
        }).catch(dbError => {
          console.error("Error saving game result:", dbError);
          toast({
            title: "Error de Guardado",
            description: "No se pudo guardar tu puntuación, pero tus resultados están aquí.",
            variant: 'destructive'
          });
        });
      }

    } catch (error) {
      console.error("Error en handleStop:", error);
      toast({
        title: translate('notifications.aiError.title'),
        description: `Error al procesar la ronda: ${(error as Error).message}. Por favor, intenta jugar una nueva ronda.`,
        variant: 'destructive'
      });
      // Do NOT restart the round automatically. Let the user decide.
      // Set back to playing so user can see their answers.
      setGameState('PLAYING'); 
    } finally {
      isEvaluatingRef.current = false;
    }
  }, [stopTimer, stopMusic, user, playSound, toast, translate]);

  // Timer effect
  useEffect(() => {
    if (gameState === 'PLAYING') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            handleStop();
            return 0;
          }
          if (prevTime <= 11 && prevTime > 1) playSound('timer-tick');
          return prevTime - 1;
        });
      }, 1000);
    }
    
    // Cleanup timer on unmount or when gameState changes
    return () => {
      stopTimer();
    };
  }, [gameState, handleStop, playSound, stopTimer]);

  const startNewRound = () => {
    setGameState('SPINNING');
    setPlayerResponses({});
    setRoundResults(null);
    setCurrentLetter(null);
    setTimeLeft(ROUND_DURATION);
    stopTimer();
    stopMusic();
    isEvaluatingRef.current = false;
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
            aiRoundScore={0} // AI Score is always 0 in solo
            roundWinner={playerRoundScore > 0 ? (user?.displayName || 'Jugador') : 'Nadie'}
            totalPlayerScore={totalPlayerScore}
            totalAiScore={0} // AI Score is always 0 in solo
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
