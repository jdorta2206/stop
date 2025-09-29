"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../hooks/use-auth-context';
import type { RoundResults } from './types';
import { useRouter } from 'next/navigation';

interface SoloResultsAreaProps {
  roundResults: RoundResults | null;
  playerRoundScore: number;
  aiRoundScore: number;
  roundWinner: string;
  totalPlayerScore: number;
  totalAiScore: number;
  startNextRound: () => void;
  translateUi: (key: string, replacements?: Record<string, string>) => string;
  currentLetter: string | null;
}

export function SoloResultsArea({ roundResults, playerRoundScore, aiRoundScore, roundWinner, totalPlayerScore, totalAiScore, startNextRound, translateUi, currentLetter }: SoloResultsAreaProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  if (!roundResults) {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 text-white h-96">
          <Loader2 className="h-16 w-16 animate-spin mb-4" />
          <h2 className="text-2xl font-bold">Cargando resultados...</h2>
        </div>
    );
  }

  const playerName = user?.displayName || translateUi('game.results.labels.you');
  
  const renderResultRow = (category: string) => {
    const playerResult = roundResults[category]?.player;
    const aiResult = roundResults[category]?.ai;
    
    const getScoreClass = (score: number) => {
        if (score === 10) return 'text-green-400';
        if (score === 5) return 'text-yellow-400';
        return 'text-red-400';
    }

    return (
      <tr key={category} className="border-b border-primary-foreground/10 last:border-b-0 hover:bg-white/5">
        <td className="p-3 font-semibold">{category}</td>
        <td className={`p-3 flex items-center gap-2 ${!playerResult?.isValid && playerResult?.response ? 'line-through text-white/60' : ''}`}>
           {playerResult?.isValid ? <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" /> : playerResult?.response ? <XCircle className="h-5 w-5 text-red-400 shrink-0"/> : null}
           <span>{playerResult?.response || '-'}</span>
        </td>
        <td className={`p-3 font-bold ${getScoreClass(playerResult?.score ?? 0)}`}>{playerResult?.score ?? 0} pts</td>
        <td className={`p-3 flex items-center gap-2 ${!aiResult?.isValid && aiResult?.response ? 'line-through text-white/60' : ''}`}>
           {aiResult?.isValid ? <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" /> : aiResult?.response ? <XCircle className="h-5 w-5 text-red-400 shrink-0"/> : null}
           <span>{aiResult?.response || '-'}</span>
        </td>
        <td className={`p-3 font-bold ${getScoreClass(aiResult?.score ?? 0)}`}>{aiResult?.score ?? 0} pts</td>
      </tr>
    )
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl rounded-2xl bg-white/10 backdrop-blur-md p-6 animate-fade-in text-white">
        <CardHeader className="text-center mb-4">
            <CardTitle className="text-3xl font-bold">{translateUi('game.results.title')}</CardTitle>
            <CardDescription className="text-white/80 mt-1">
              {translateUi('game.results.winner.label', { winner: roundWinner })} con la letra <span className="font-bold text-secondary">{currentLetter}</span>
            </CardDescription>
        </CardHeader>
        
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-black/20 p-4 rounded-lg text-center border border-white/10">
                    <h3 className="text-lg font-semibold">{playerName}</h3>
                    <p className="text-4xl font-bold text-green-400">{playerRoundScore} pts</p>
                    <p className="text-xs text-white/60">Total: {totalPlayerScore} pts</p>
                </div>
                 <div className="bg-black/20 p-4 rounded-lg text-center border border-white/10">
                    <h3 className="text-lg font-semibold">{translateUi('game.results.labels.ai')}</h3>
                    <p className="text-4xl font-bold text-red-400">{aiRoundScore} pts</p>
                    <p className="text-xs text-white/60">Total: {totalAiScore} pts</p>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-white/10 bg-black/10">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b-2 border-white/20">
                            <th className="p-3 text-sm font-semibold tracking-wider">Categoría</th>
                            <th className="p-3 text-sm font-semibold tracking-wider">{playerName}</th>
                            <th className="p-3 text-sm font-semibold tracking-wider">Puntos</th>
                            <th className="p-3 text-sm font-semibold tracking-wider">IA</th>
                            <th className="p-3 text-sm font-semibold tracking-wider">Puntos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(roundResults).map((category) => 
                            renderResultRow(category)
                        )}
                    </tbody>
                </table>
            </div>
        </CardContent>
        
        <div className="mt-8 flex justify-center gap-4">
             <Button onClick={startNextRound} size="lg">{translateUi?.('game.buttons.nextRound')}</Button>
             <Button onClick={() => router.push('/')} variant="outline" size="lg" className="bg-transparent hover:bg-white/10">
                 {translateUi?.('home')}
            </Button>
        </div>
    </Card>
  );
}
