
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { toast } from '@/components/ui/use-toast';
import { GameArea } from '@/components/game/components/game-area';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { evaluateRound, type EvaluateRoundOutput } from '@/ai/flows/validate-player-word-flow';
import type { GameState, LanguageCode, RoundResults } from '@/components/game/types';
import { useAuth } from '@/hooks/use-auth';
import { rankingManager } from '@/lib/ranking';
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
  const { language, translate } = useLanguage();
  const { user } = useAuth();

  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [alphabet, setAlphabet] = useState<string[]>([]);
  const [playerResponses, setPlayerResponses] = useState<{ [key: string]: string }>({});
  const [roundResults, setRoundResults] = useState<RoundResults | null>(null);
  const [playerRoundScore, setPlayerRoundScore] = useState(0);
  const [aiRoundScore, setAiRoundScore] = useState(0);
  const [totalPlayerScore, setTotalPlayerScore] = useState(0);
  const [totalAiScore, setTotalAiScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isEvaluatingRef = useRef(false);

  const stateRef = useRef({
    playerResponses,
    currentLetter,
    language,
    categories,
    user
  });

  useEffect(() => {
    stateRef.current = { playerResponses, currentLetter, language, categories, user };
  }, [playerResponses, currentLetter, language, categories, user]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleStop = useCallback(async () => {
    if (isEvaluatingRef.current) return;
    
    stopTimer();
    setGameState('EVALUATING');
    isEvaluatingRef.current = true;

    try {
      const { currentLetter: letter, playerResponses: responses, categories: currentCategories, language: currentLanguage, user: currentUser } = stateRef.current;
      
      if (!letter) {
        throw new Error("No se seleccionó ninguna letra para la ronda.");
      }

      const playerPayload = currentCategories.map(cat => ({
        category: cat,
        word: responses[cat] || ""
      }));
      
      const evaluationOutput: EvaluateRoundOutput = await evaluateRound({
        letter: letter,
        language: currentLanguage as LanguageCode,
        playerResponses: playerPayload,
      });
      
      if (!evaluationOutput || !evaluationOutput.results) {
        throw new Error("La IA devolvió un formato de respuesta inválido.");
      }
      
      const { results, playerTotalScore, aiTotalScore: calculatedAiScore } = evaluationOutput;
      
      setPlayerRoundScore(playerTotalScore);
      setTotalPlayerScore(prev => prev + playerTotalScore);
      setAiRoundScore(calculatedAiScore);
      setTotalAiScore(prev => prev + calculatedAiScore);
      setRoundResults(results);
      
      setGameState('RESULTS');

      // Save result in background, AFTER UI has updated
      if (currentUser) {
        rankingManager.saveGameResult({
          playerId: currentUser.uid,
          playerName: currentUser.displayName || 'Jugador',
          photoURL: currentUser.photoURL || null,
          score: playerTotalScore,
          categories: responses,
          letter: letter,
          gameMode: 'solo',
          won: playerTotalScore > calculatedAiScore,
        }).catch(dbError => {
          console.error("Error saving game result:", dbError);
          toast.error("No se pudo guardar tu puntuación, pero tus resultados están aquí.", {
            title: "Error de Guardado"
          });
        });
      }

    } catch (error) {
      console.error("Error en handleStop:", error);
      toast.error(`Error al procesar la ronda: ${(error as Error).message}. Por favor, intenta de nuevo.`, {
        title: translate('notifications.aiError.title'),
      });
      setGameState('PLAYING');
    } finally {
      isEvaluatingRef.current = false;
    }
  }, [stopTimer, translate]);


  const startNewRound = useCallback(() => {
    setGameState('SPINNING');
    setPlayerResponses({});
    setRoundResults(null);
    setCurrentLetter(null);
    setTimeLeft(ROUND_DURATION);
    isEvaluatingRef.current = false;
  }, []);


  useEffect(() => {
    if (gameState === 'PLAYING') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            stopTimer();
            handleStop();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      stopTimer();
    }
    
    return () => stopTimer();
  }, [gameState, handleStop, stopTimer]);


  useEffect(() => {
    setCategories(CATEGORIES_BY_LANG[language] || CATEGORIES_BY_LANG.es);
    setAlphabet(ALPHABET_BY_LANG[language] || ALPHABET_BY_LANG.es);
  }, [language]);
  
  useEffect(() => {
    startNewRound();
  }, [startNewRound]);
  
  const handleSpinComplete = (letter: string) => {
    setCurrentLetter(letter);
    setGameState('PLAYING');
    setTimeLeft(ROUND_DURATION);
  };
  
  const handleInputChange = (category: string, value: string) => {
    setPlayerResponses(prev => ({ ...prev, [category]: value }));
  };

  const getRoundWinner = () => {
    if (playerRoundScore > aiRoundScore) {
      return user?.displayName || 'Jugador';
    }
    if (aiRoundScore > playerRoundScore) {
      return 'IA';
    }
    if (playerRoundScore > 0 && playerRoundScore === aiRoundScore) {
        return translate('game.results.winner.tie');
    }
    return translate('game.results.winner.none');
  }

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
            roundWinner={getRoundWinner()}
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
