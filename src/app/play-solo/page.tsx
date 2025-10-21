
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../contexts/language-context';
import { toast } from 'sonner';
import { GameArea } from '../../components/game/components/game-area';
import { AppHeader } from '../../components/layout/header';
import { AppFooter } from '../../components/layout/footer';
import { evaluateRound, type EvaluateRoundOutput } from '../../ai/flows/validate-player-word-flow';
import type { GameState, LanguageCode, RoundResults } from '../../components/game/types/game-types';
import { useUser } from '../../firebase';
import { rankingManager } from '../../lib/ranking';
import { Loader2 } from 'lucide-react';
import { RouletteWheel } from '../../components/game/components/roulette-wheel';
import { SoloResultsArea } from '../../components/game/SoloResultsArea';

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
  const { user } = useUser();

  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isEvaluatingRef = useRef(false);

  // Centralized state management using useRef to hold all game-related data
  const gameDataRef = useRef({
    currentLetter: null as string | null,
    categories: [] as string[],
    alphabet: [] as string[],
    playerResponses: {} as { [key: string]: string },
    roundResults: null as RoundResults | null,
    playerRoundScore: 0,
    aiRoundScore: 0,
    totalPlayerScore: 0,
    totalAiScore: 0,
  });

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
      const { currentLetter: letter, playerResponses: responses, categories: currentCategories } = gameDataRef.current;
      
      if (!letter) {
        throw new Error("No se seleccionó ninguna letra para la ronda.");
      }

      const playerPayload = currentCategories.map(cat => ({
        category: cat,
        word: responses[cat] || ""
      }));
      
      const evaluationOutput: EvaluateRoundOutput = await evaluateRound({
        letter: letter,
        language: language as LanguageCode,
        playerResponses: playerPayload,
      });
      
      if (!evaluationOutput || !evaluationOutput.results) {
        throw new Error("La IA devolvió un formato de respuesta inválido.");
      }
      
      const { results, playerTotalScore, aiTotalScore: calculatedAiScore } = evaluationOutput;
      
      gameDataRef.current.playerRoundScore = playerTotalScore;
      gameDataRef.current.totalPlayerScore += playerTotalScore;
      gameDataRef.current.aiRoundScore = calculatedAiScore;
      gameDataRef.current.totalAiScore += calculatedAiScore;
      gameDataRef.current.roundResults = results as RoundResults;
      
      setGameState('RESULTS');

      // Save result in background, AFTER UI has updated
      if (user && user.uid) {
        rankingManager.saveGameResult({
          playerId: user.uid,
          playerName: user.displayName || 'Jugador',
          photoURL: user.photoURL || null,
          score: playerTotalScore,
          categories: responses,
          letter: letter,
          gameMode: 'solo',
          won: playerTotalScore > calculatedAiScore,
        }).catch(dbError => {
          console.error("Error saving game result:", dbError);
          toast.error("No se pudo guardar tu puntuación, pero tus resultados están aquí.");
        });
      }

    } catch (error) {
      console.error("Error en handleStop:", error);
      toast.error(`Error al procesar la ronda: ${(error as Error).message}. Por favor, intenta de nuevo.`);
      setGameState('PLAYING');
    } finally {
      isEvaluatingRef.current = false;
    }
  }, [stopTimer, language, user, translate]);


  const startNewRound = useCallback(() => {
    setGameState('SPINNING');
    gameDataRef.current.playerResponses = {};
    gameDataRef.current.roundResults = null;
    gameDataRef.current.currentLetter = null;
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
    gameDataRef.current.categories = CATEGORIES_BY_LANG[language] || CATEGORIES_BY_LANG.es;
    gameDataRef.current.alphabet = ALPHABET_BY_LANG[language] || ALPHABET_BY_LANG.es;
  }, [language]);
  
  useEffect(() => {
    startNewRound();
  }, [startNewRound]);
  
  const handleSpinComplete = (letter: string) => {
    gameDataRef.current.currentLetter = letter;
    setGameState('PLAYING');
    setTimeLeft(ROUND_DURATION);
  };
  
  const handleInputChange = (category: string, value: string) => {
    gameDataRef.current.playerResponses[category] = value;
  };

  const getRoundWinner = () => {
    const { playerRoundScore, aiRoundScore } = gameDataRef.current;
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
    const { currentLetter, categories, playerResponses, alphabet, roundResults, playerRoundScore, aiRoundScore, totalPlayerScore, totalAiScore } = gameDataRef.current;

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
          <SoloResultsArea
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
