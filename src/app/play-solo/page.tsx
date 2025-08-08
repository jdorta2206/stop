
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/components/ui/use-toast';
import { GameArea } from '@/components/game/components/game-area';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { evaluateRound, type EvaluateRoundInput, type EvaluateRoundOutput } from '@/ai/flows/validate-player-word-flow';
import type { GameState, LanguageCode, RoundResults } from '@/components/game/types';
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

  const [gameState, setGameState] = useState<GameState>('SPINNING');
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [playerResponses, setPlayerResponses] = useState<Record<string, string>>({});
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [roundResults, setRoundResults] = useState<RoundResults | undefined>(undefined);
  
  const [totalPlayerScore, setTotalPlayerScore] = useState(0);
  const [totalAiScore, setTotalAiScore] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [countdownWarningText, setCountdownWarningText] = useState("");

  const categories = useMemo(() => CATEGORIES_BY_LANG[language] || CATEGORIES_BY_LANG.es, [language]);
  const alphabet = useMemo(() => ALPHABET_BY_LANG[language] || ALPHABET_BY_LANG.es, [language]);

  useEffect(() => {
    playMusic();
    return () => stopMusic();
  }, [playMusic, stopMusic]);

  const startTimer = useCallback(() => {
    if (timerId) clearInterval(timerId);
    setTimeLeft(ROUND_DURATION);
    const newTimerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(newTimerId);
          handleStop();
          return 0;
        }
        if (prev <= 11) playSound('timer-tick');
        return prev - 1;
      });
    }, 1000);
    setTimerId(newTimerId);
  }, [timerId, playSound]);

  useEffect(() => {
    if (timeLeft <= 10 && timeLeft > 5) setCountdownWarningText(translate('game.time.endingSoon'));
    else if (timeLeft <= 5 && timeLeft > 3) setCountdownWarningText(translate('game.time.almostUp'));
    else if (timeLeft <= 3 && timeLeft > 0) setCountdownWarningText(translate('game.time.finalCountdown'));
    else setCountdownWarningText("");
  }, [timeLeft, translate]);

  const handleSpinComplete = useCallback((letter: string) => {
    setCurrentLetter(letter);
    setGameState('PLAYING');
    startTimer();
  }, [startTimer]);

  const handleInputChange = useCallback((category: string, value: string) => {
    setPlayerResponses(prev => ({ ...prev, [category]: value }));
  }, []);

  const handleStop = useCallback(async () => {
    if (timerId) clearInterval(timerId);
    setTimerId(null);
    setIsLoadingAi(true);
    setProcessingState('thinking');

    if (!currentLetter) {
        toast({ title: "Error", description: "No letter selected.", variant: "destructive"});
        setIsLoadingAi(false);
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

        setTotalPlayerScore(prev => prev + playerRoundScore);
        setTotalAiScore(prev => prev + aiRoundScore);
        
        if(playerRoundScore > aiRoundScore) playSound('round-win');
        else playSound('round-lose');

        if(user){
            await rankingManager.saveGameResult({
                playerId: user.uid,
                playerName: user.name || 'Jugador',
                photoURL: user.photoURL,
                score: playerRoundScore,
                categories: playerResponses,
                letter: currentLetter,
                gameMode: 'solo',
                won: playerRoundScore > aiRoundScore,
            });
        }

        setGameState('RESULTS');
    } catch (error) {
        toast({ title: translate('notifications.aiError.title'), description: (error as Error).message, variant: 'destructive'});
        setGameState('PLAYING'); // Revert to playing to allow retry
    } finally {
        setIsLoadingAi(false);
        setProcessingState('idle');
    }
  }, [currentLetter, playerResponses, categories, language, toast, translate, user, timerId, playSound]);

  const startNextRound = useCallback(() => {
    setPlayerResponses({});
    setRoundResults(undefined);
    setCurrentLetter(null);
    setGameState('SPINNING');
    setCountdownWarningText("");
  }, []);
  
  const playerRoundScore = useMemo(() => {
    if (!roundResults) return 0;
    return Object.values(roundResults).reduce((sum, res) => sum + res.player.score, 0);
  }, [roundResults]);
  
  const aiRoundScore = useMemo(() => {
      if (!roundResults) return 0;
      return Object.values(roundResults).reduce((sum, res) => sum + res.ai.score, 0);
  }, [roundResults]);

  const roundWinner = useMemo(() => {
      if(playerRoundScore > aiRoundScore) return user?.name || translate('game.results.labels.you');
      if(aiRoundScore > playerRoundScore) return translate('game.results.labels.ai');
      return translate('game.results.winner.tie');
  }, [playerRoundScore, aiRoundScore, user, translate]);


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader onToggleChat={() => {}} isChatOpen={false} />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center">
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
          roundResults={roundResults}
          playerRoundScore={playerRoundScore}
          aiRoundScore={aiRoundScore}
          roundWinner={roundWinner}
          startNextRound={startNextRound}
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
