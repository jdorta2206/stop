
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
import { useAuth, type User } from '@/hooks/use-auth';
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

  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [categories, setCategories] = useState<string[]>([]);
  const [playerResponses, setPlayerResponses] = useState<{ [key: string]: string }>({});
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [totalPlayerScore, setTotalPlayerScore] = useState<number>(0);
  const [totalAiScore, setTotalAiScore] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState>('PLAYING');
 const [roundResults, setRoundResults] = useState<EvaluateRoundOutput['results'] | null>(null);
 // ... (resto de estados)

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
                playerId: user.id, // Corregido: user.id en lugar de user.uid
                playerName: user.playerName || 'Jugador',
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
        toast({ title: translate('notifications.aiError.title'), description: (error as Error).message, variant: 'destructive'});
        setGameState('PLAYING'); // Revert to playing to allow retry
    } finally {
        setIsLoadingAi(false);
        setProcessingState('idle');
    }
  }, [currentLetter, playerResponses, categories, language, toast, translate, user, timerId, playSound]);

  // ... (resto del componente)
}
