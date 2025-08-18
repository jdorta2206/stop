
"use client";

import { useState, useEffect, useCallback } from 'react';
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
  es: ["Nombre", "Lugar", "Animal", "Objeto", "Color", "Fruta o Verdura", "Marca"],
  en: ["Name", "Place", "Animal", "Thing", "Color", "Fruit or Vegetable", "Brand"],
  fr: ["Nom", "Lieu", "Animal", "Chose", "Couleur", "Fruit ou Légume", "Marque"],
  pt: ["Nome", "Lugar", "Animal", "Coisa", "Cor", "Fruta ou Legume", "Marca"],
};

const ALPHABET_BY_LANG: Record<string, string[]> = {
  es: "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split(""),
  en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  fr: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  pt: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
};

const ROUND_DURATION = 60; // seconds

export type ProcessingState = 'idle' | 'thinking' | 'validating' | 'scoring';

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
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');

  useEffect(() => {
    setCategories(CATEGORIES_BY_LANG[language] || CATEGORIES_BY_LANG.es);
    setAlphabet(ALPHABET_BY_LANG[language] || ALPHABET_BY_LANG.es);
    resetGame();
  }, [language]);

  const handleStop = useCallback(async () => {
    if (gameState !== 'PLAYING' || !currentLetter) return;

    setGameState('EVALUATING'); 
    setProcessingState('thinking');
    stopMusic();

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
      
      setProcessingState('validating');
      
      if (!results || !results.results) {
        throw new Error("Respuesta inválida de la IA");
      }
      
      setProcessingState('scoring');
      
      const { playerRoundScore: pScore, aiRoundScore: aScore } = Object.values(results.results).reduce((acc, res) => {
          acc.playerRoundScore += res.player?.score || 0;
          acc.aiRoundScore += res.ai?.score || 0;
          return acc;
      }, { playerRoundScore: 0, aiRoundScore: 0 });

      const winner = pScore > aScore ? user?.displayName || 'Jugador' : pScore < aScore ? 'IA' : 'Empate';

      setRoundResults(results.results);
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
      console.error("Error en handleStop:", error);
      toast({ title: translate('notifications.aiError.title'), description: (error as Error).message, variant: 'destructive' });
      setGameState('PLAYING');
    } finally {
      setProcessingState('idle');
    }
  }, [gameState, currentLetter, categories, playerResponses, language, stopMusic, user, playSound, toast, translate]);


  // Timer countdown logic
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    if (timeLeft <= 0) {
      handleStop();
      return;
    }
    
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [gameState, timeLeft, handleStop]);
  
  // Sound effect for timer
  useEffect(() => {
      if (timeLeft > 0 && timeLeft <= 11 && gameState === 'PLAYING') {
         playSound('timer-tick');
      }
  }, [timeLeft, gameState, playSound]);

  const startNewRound = () => {
    setPlayerResponses({});
    setRoundResults(null);
    setCurrentLetter(null);
    setTimeLeft(ROUND_DURATION);
    setGameState('SPINNING');
    playMusic();
  };
  
  const resetGame = () => {
    setGameState('IDLE');
    setTotalPlayerScore(0);
    setTotalAiScore(0);
    startNewRound();
  };

  const handleSpinComplete = (letter: string) => {
    setCurrentLetter(letter);
    setGameState('PLAYING');
    setTimeLeft(ROUND_DURATION);
  };
  
  const handleInputChange = (category: string, value: string) => {
    setPlayerResponses(prev => ({ ...prev, [category]: value }));
  };

  const renderContent = () => {
    switch (gameState) {
      case 'IDLE':
      case 'SPINNING':
        return (
          <RouletteWheel 
            isSpinning={true}
            alphabet={alphabet}
            language={language}
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
          <div className="flex flex-col items-center justify-center text-center p-8 text-white">
            <Loader2 className="h-16 w-16 animate-spin mb-4" />
            <h2 className="text-2xl font-bold">{translate(`game.loadingAI.${processingState}`)}</h2>
            <p className="text-muted-foreground mt-2">{translate('game.loadingAI.description')}</p>
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
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-red-500/20 text-foreground">
      <AppHeader />
      <main className="flex-grow flex items-center justify-center p-4">
        {renderContent()}
      </main>
      <AppFooter language={language} />
    </div>
  );
}
