
"use client";

import { useEffect, useReducer, useRef } from 'react';
import { useLanguage } from '../../contexts/language-context';
import { toast } from 'sonner';
import { GameArea } from '../../components/game/components/game-area';
import { AppHeader } from '../../components/layout/header';
import { AppFooter } from '../../components/layout/footer';
import { evaluateRound, type EvaluateRoundOutput } from '../../ai/flows/validate-player-word-flow';
import type { LanguageCode, RoundResults } from '../../components/game/types/game-types';
import { useUser } from '../../firebase';
import { rankingManager } from '../../lib/ranking';
import { Loader2 } from 'lucide-react';
import { RouletteWheel } from '../../components/game/components/roulette-wheel';
import { SoloResultsArea } from '../../components/game/SoloResultsArea';

// --- Constants ---
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

// --- State Management with useReducer ---

type GameState = 'IDLE' | 'SPINNING' | 'PLAYING' | 'EVALUATING' | 'RESULTS';

interface GameComponentState {
  gameState: GameState;
  timeLeft: number;
  currentLetter: string | null;
  categories: string[];
  alphabet: string[];
  playerResponses: Record<string, string>;
  roundResults: RoundResults | null;
  playerRoundScore: number;
  aiRoundScore: number;
  totalPlayerScore: number;
  totalAiScore: number;
}

type GameAction =
  | { type: 'START_NEW_ROUND'; payload: { categories: string[]; alphabet: string[] } }
  | { type: 'SPIN_COMPLETE'; payload: { letter: string } }
  | { type: 'TICK' }
  | { type: 'STOP_ROUND' }
  | { type: 'UPDATE_RESPONSE'; payload: { category: string; value: string } }
  | { type: 'EVALUATION_COMPLETE'; payload: EvaluateRoundOutput }
  | { type: 'EVALUATION_ERROR' };

const initialState: GameComponentState = {
  gameState: 'IDLE',
  timeLeft: ROUND_DURATION,
  currentLetter: null,
  categories: CATEGORIES_BY_LANG.es,
  alphabet: ALPHABET_BY_LANG.es,
  playerResponses: {},
  roundResults: null,
  playerRoundScore: 0,
  aiRoundScore: 0,
  totalPlayerScore: 0,
  totalAiScore: 0,
};

function gameReducer(state: GameComponentState, action: GameAction): GameComponentState {
  switch (action.type) {
    case 'START_NEW_ROUND':
      return {
        ...state,
        gameState: 'SPINNING',
        playerResponses: {},
        roundResults: null,
        currentLetter: null,
        timeLeft: ROUND_DURATION,
        categories: action.payload.categories,
        alphabet: action.payload.alphabet,
      };
    case 'SPIN_COMPLETE':
      return {
        ...state,
        gameState: 'PLAYING',
        currentLetter: action.payload.letter,
        timeLeft: ROUND_DURATION,
      };
    case 'TICK':
      return {
        ...state,
        timeLeft: state.timeLeft - 1,
      };
    case 'STOP_ROUND':
      return {
        ...state,
        gameState: 'EVALUATING',
      };
    case 'UPDATE_RESPONSE':
      return {
        ...state,
        playerResponses: {
          ...state.playerResponses,
          [action.payload.category]: action.payload.value,
        },
      };
    case 'EVALUATION_COMPLETE':
      const { results, playerTotalScore, aiTotalScore } = action.payload;
      return {
        ...state,
        gameState: 'RESULTS',
        roundResults: results as RoundResults,
        playerRoundScore: playerTotalScore,
        aiRoundScore: aiTotalScore,
        totalPlayerScore: state.totalPlayerScore + playerTotalScore,
        totalAiScore: state.totalAiScore + aiTotalScore,
      };
    case 'EVALUATION_ERROR':
        return {
            ...state,
            gameState: 'PLAYING', // Regresa al estado de juego para que el usuario pueda intentar de nuevo
        };
    default:
      return state;
  }
}

export default function PlaySoloPage() {
  const { language, translate } = useLanguage();
  const { user } = useUser();
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Efecto para inicializar el juego y manejar cambios de idioma
  useEffect(() => {
    const categories = CATEGORIES_BY_LANG[language] || CATEGORIES_BY_LANG.es;
    const alphabet = ALPHABET_BY_LANG[language] || ALPHABET_BY_LANG.es;
    dispatch({ type: 'START_NEW_ROUND', payload: { categories, alphabet } });
  }, [language]);

  // Efecto para manejar el temporizador
  useEffect(() => {
    if (state.gameState === 'PLAYING') {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.gameState]);

  // Efecto para manejar el fin del tiempo
  useEffect(() => {
    if (state.timeLeft <= 0 && state.gameState === 'PLAYING') {
      if (timerRef.current) clearInterval(timerRef.current);
      handleStop();
    }
  }, [state.timeLeft, state.gameState]);

  const handleStop = async () => {
    if (state.gameState !== 'PLAYING') return;

    dispatch({ type: 'STOP_ROUND' });

    try {
      const { currentLetter: letter, playerResponses: responses, categories: currentCategories } = state;
      
      if (!letter) throw new Error("No se seleccionó ninguna letra para la ronda.");

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
      
      dispatch({ type: 'EVALUATION_COMPLETE', payload: evaluationOutput });

      // Guardar resultado en segundo plano
      if (user && user.uid) {
        rankingManager.saveGameResult({
          playerId: user.uid,
          playerName: user.displayName || 'Jugador',
          photoURL: user.photoURL || null,
          score: evaluationOutput.playerTotalScore,
          categories: responses,
          letter: letter,
          gameMode: 'solo',
          won: evaluationOutput.playerTotalScore > evaluationOutput.aiTotalScore,
        }).catch(dbError => {
          console.error("Error saving game result:", dbError);
          toast.error("No se pudo guardar tu puntuación.");
        });
      }

    } catch (error) {
      console.error("Error en handleStop:", error);
      toast.error(`Error al procesar la ronda: ${(error as Error).message}. Por favor, intenta de nuevo.`);
      dispatch({ type: 'EVALUATION_ERROR' });
    }
  };
  
  const startNewRound = () => {
     const categories = CATEGORIES_BY_LANG[language] || CATEGORIES_BY_LANG.es;
     const alphabet = ALPHABET_BY_LANG[language] || ALPHABET_BY_LANG.es;
     dispatch({ type: 'START_NEW_ROUND', payload: { categories, alphabet } });
  };
  
  const handleSpinComplete = (letter: string) => {
    dispatch({ type: 'SPIN_COMPLETE', payload: { letter } });
  };
  
  const handleInputChange = (category: string, value: string) => {
    dispatch({ type: 'UPDATE_RESPONSE', payload: { category, value } });
  };

  const getRoundWinner = () => {
    if (state.playerRoundScore > state.aiRoundScore) return user?.displayName || 'Jugador';
    if (state.aiRoundScore > state.playerRoundScore) return 'IA';
    if (state.playerRoundScore > 0 && state.playerRoundScore === state.aiRoundScore) return translate('game.results.winner.tie');
    return translate('game.results.winner.none');
  }

  const renderContent = () => {
    switch (state.gameState) {
      case 'SPINNING':
        return (
          <RouletteWheel 
            alphabet={state.alphabet}
            language={language as LanguageCode}
            onSpinComplete={handleSpinComplete}
            className="my-8"
          />
        );
      case 'PLAYING':
        return (
          <GameArea
            key={state.currentLetter}
            currentLetter={state.currentLetter}
            categories={state.categories}
            playerResponses={state.playerResponses}
            onInputChange={handleInputChange}
            translateUi={translate}
            onStop={handleStop}
            timeLeft={state.timeLeft}
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
            key={`results-${state.currentLetter}`}
            roundResults={state.roundResults}
            playerRoundScore={state.playerRoundScore}
            aiRoundScore={state.aiRoundScore}
            roundWinner={getRoundWinner()}
            totalPlayerScore={state.totalPlayerScore}
            totalAiScore={state.totalAiScore}
            startNextRound={startNewRound}
            translateUi={translate}
            currentLetter={state.currentLetter}
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

