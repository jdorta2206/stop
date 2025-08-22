
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isMounted, setIsMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stopPromiseRef = useRef<Promise<void> | null>(null);


  useEffect(() => {
    setIsMounted(true);
    // Carga inicial de categorías y alfabeto según el idioma.
    setCategories(CATEGORIES_BY_LANG[language] || CATEGORIES_BY_LANG.es);
    setAlphabet(ALPHABET_BY_LANG[language] || ALPHABET_BY_LANG.es);
  }, [language]);
  
  useEffect(() => {
      // Inicia el juego una vez que el componente se ha montado.
      if (isMounted) {
          startNewRound();
      }
  }, [isMounted]);

  useEffect(() => {
    // Limpia el temporizador si el componente se desmonta.
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const handleStop = useCallback(async () => {
    if (gameState !== 'PLAYING' || !currentLetter || stopPromiseRef.current) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    setGameState('EVALUATING');
    stopMusic();

    const promise = (async () => {
        const playerPayload = categories.map(cat => ({
          category: cat,
          word: playerResponses[cat] || ""
        }));

        try {
          const results: EvaluateRoundOutput = await evaluateRound({
            letter: currentLetter,
            language: language as LanguageCode,
            playerResponses: playerPayload,
          });
          
          if (!results || !results.results) {
            throw new Error("La IA no devolvió un formato de resultados válido.");
          }
          
          const pScore = Object.values(results.results).reduce((acc, res) => acc + (res.score || 0), 0);
          const aScore = 0; // AI no juega en modo solo

          const winner = pScore > aScore ? (user?.displayName || 'Jugador') : (pScore < aScore ? 'IA' : 'Empate');

          const adaptedResults: RoundResults = {};
          for (const category in results.results) {
              adaptedResults[category] = {
                  player: results.results[category],
                  ai: { response: '', isValid: false, score: 0 } // AI no juega
              };
          }

          setRoundResults(adaptedResults);
          setPlayerRoundScore(pScore);
          setAiRoundScore(aScore);
          setTotalPlayerScore(prev => prev + pScore);
          setTotalAiScore(prev => prev + aScore);
          setRoundWinner(winner);

          if(pScore > aScore) playSound('round-win');
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
              description: `Error al procesar la ronda: ${(error as Error).message}. Por favor, intentalo de nuevo.`, 
              variant: 'destructive' 
          });
          setGameState('PLAYING'); 
        } finally {
            stopPromiseRef.current = null;
        }
    })();
    stopPromiseRef.current = promise;

  }, [gameState, currentLetter, categories, playerResponses, language, toast, translate, user, playSound, stopMusic]);


  const startTimer = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      playMusic();
      timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
              if (prev <= 1) {
                  if (timerRef.current) clearInterval(timerRef.current);
                  handleStop();
                  return 0;
              }
              if (prev <= 11) playSound('timer-tick');
              return prev - 1;
          });
      }, 1000);
  };

  const startNewRound = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    stopMusic();
    setPlayerResponses({});
    setRoundResults(null);
    setCurrentLetter(null);
    setGameState('SPINNING');
    setTimeLeft(ROUND_DURATION);
  };
  
  const handleSpinComplete = (letter: string) => {
    setCurrentLetter(letter);
    setGameState('PLAYING');
    setTimeLeft(ROUND_DURATION);
    startTimer();
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
            currentLetter={currentLetter}
            categories={categories}
            playerResponses={playerResponses}
            onInputChange={handleInputChange}
            onStop={handleStop}
            timeLeft={timeLeft}
            translateUi={translate}
            language={language as LanguageCode}
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

    