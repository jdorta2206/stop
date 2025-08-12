
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/components/ui/use-toast';
import { GameArea } from '@/components/game/components/game-area';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { evaluateRound, type EvaluateRoundInput, type EvaluateRoundOutput } from '@/ai/flows/validate-player-word-flow';
import type { GameState, LanguageCode } from '@/components/game/types';
import { useAuth } from '@/hooks/use-auth';
import { rankingManager } from '@/lib/ranking';
import { useSound } from '@/hooks/use-sound';

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
  const [roundResults, setRoundResults] = useState<EvaluateRoundOutput['results'] | null>(null);
  const [playerRoundScore, setPlayerRoundScore] = useState(0);
  const [aiRoundScore, setAiRoundScore] = useState(0);
  const [roundWinner, setRoundWinner] = useState('');
  const [totalPlayerScore, setTotalPlayerScore] = useState(0);
  const [totalAiScore, setTotalAiScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');

  useEffect(() => {
    setCategories(CATEGORIES_BY_LANG[language] || CATEGORIES_BY_LANG.es);
    setAlphabet(ALPHABET_BY_LANG[language] || ALPHABET_BY_LANG.es);
    resetGame();
  }, [language]);

  const resetGame = () => {
    setGameState('IDLE');
    setTotalPlayerScore(0);
    setTotalAiScore(0);
    startNewRound();
  };

  const handleStop = useCallback(async () => {
    if (gameState !== 'PLAYING') return;

    setGameState('EVALUATING');
    setIsLoadingAi(true);
    setProcessingState('thinking');
    stopMusic();

    if (!currentLetter) {
      toast({ title: "Error", description: "No letter selected.", variant: "destructive" });
      setIsLoadingAi(false);
      setGameState('IDLE');
      return;
    }

    const playerPayload: EvaluateRoundInput['playerResponses'] = categories.map(cat => ({
      category: cat,
      word: playerResponses[cat] || ""
    }));

    try {
      const results = await evaluateRound({
        letter: currentLetter,
        language: language as LanguageCode,
        playerResponses: playerPayload,
      });
      setProcessingState('validating');
      setRoundResults(results.results);
      
      setProcessingState('scoring');
      const { playerRoundScore, aiRoundScore } = Object.values(results.results).reduce((acc, res) => {
        acc.playerRoundScore += res.player.score;
        acc.aiRoundScore += res.ai.score;
        return acc;
      }, { playerRoundScore: 0, aiRoundScore: 0 });

      setPlayerRoundScore(playerRoundScore);
      setAiRoundScore(aiRoundScore);

      setTotalPlayerScore(prev => prev + playerRoundScore);
      setTotalAiScore(prev => prev + aiRoundScore);
      
      const winner = playerRoundScore > aiRoundScore ? user?.displayName || 'Player' : playerRoundScore < aiRoundScore ? 'IA' : 'Tie';
      setRoundWinner(winner || 'Player');

      if(winner === (user?.displayName || 'Player')) playSound('round-win');
      else playSound('round-lose');

      if (user) {
        await rankingManager.saveGameResult({
          playerId: user.uid,
          playerName: user.displayName || 'Jugador',
          photoURL: user.photoURL || null,
          score: playerRoundScore,
          categories: playerResponses,
          letter: currentLetter,
          gameMode: 'solo',
          won: playerRoundScore > aiRoundScore,
        });
      }

      setGameState('RESULTS');
    } catch (error) {
      toast({ title: translate('notifications.aiError.title'), description: (error as Error).message, variant: 'destructive' });
      setGameState('PLAYING'); // Revert to playing on error
    } finally {
      setIsLoadingAi(false);
      setProcessingState('idle');
    }
  }, [gameState, currentLetter, playerResponses, categories, language, toast, translate, user, playSound, stopMusic]);

  // Timer logic: Countdown
  useEffect(() => {
    if (gameState !== 'PLAYING' || timeLeft <= 0) {
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
      if (timeLeft <= 11 && timeLeft > 1) {
         playSound('timer-tick');
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [gameState, timeLeft, playSound]);

  // Timer logic: Stop when time is up
  useEffect(() => {
    if (timeLeft <= 0 && gameState === 'PLAYING') {
      handleStop();
    }
  }, [timeLeft, gameState, handleStop]);


  const startNewRound = () => {
    setPlayerResponses({});
    setRoundResults(null);
    setCurrentLetter(null);
    setGameState('SPINNING');
    playMusic();
  };

  const handleSpinComplete = (letter: string) => {
    setCurrentLetter(letter);
    setGameState('PLAYING');
    setTimeLeft(ROUND_DURATION);
  };
  
  const countdownWarningText = useMemo(() => {
    if (timeLeft <= 3) return translate('game.time.finalCountdown');
    if (timeLeft <= 5) return translate('game.time.almostUp');
    if (timeLeft <= 10) return translate('game.time.endingSoon');
    return '';
  }, [timeLeft, translate]);

  const handleInputChange = (category: string, value: string) => {
    setPlayerResponses(prev => ({ ...prev, [category]: value }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-red-500/20 text-foreground">
      <AppHeader />
      <main className="flex-grow flex items-center justify-center p-4">
        <GameArea
          gameState={gameState}
          currentLetter={currentLetter}
          onSpinComplete={handleSpinComplete}
          categories={categories}
          alphabet={alphabet}
          playerResponses={playerResponses}
          onInputChange={handleInputChange}
          onStop={handleStop}
          isLoadingAi={isLoadingAi}
          roundResults={roundResults || undefined}
          playerRoundScore={playerRoundScore}
          aiRoundScore={aiRoundScore}
          roundWinner={roundWinner}
          startNextRound={startNewRound}
          totalPlayerScore={totalPlayerScore}
          totalAiScore={totalAiScore}
          timeLeft={timeLeft}
          countdownWarningText={countdownWarningText}
          translateUi={translate}
          language={language as LanguageCode}
          gameMode="solo"
          processingState={processingState}
        />
      </main>
      <AppFooter language={language} />
    </div>
  );
}
