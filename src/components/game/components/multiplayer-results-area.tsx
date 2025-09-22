
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Crown, Loader2, Trophy, RotateCcw, LogOut } from 'lucide-react';
import type { Room, Player } from '@/lib/room-service';
import { useLanguage } from '@/contexts/language-context';

interface MultiplayerResultsAreaProps {
  room: Room;
  currentUserId: string;
  isHost: boolean;
  onNextRound: () => void;
  onLeaveRoom: () => void;
}

export function MultiplayerResultsArea({ room, currentUserId, isHost, onNextRound, onLeaveRoom }: MultiplayerResultsAreaProps) {
  const { translate } = useLanguage();

  if (room.gameState !== 'RESULTS' || !room.roundResults) {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 text-white h-96">
          <Loader2 className="h-16 w-16 animate-spin mb-4" />
          <h2 className="text-2xl font-bold">Cargando resultados de la sala...</h2>
        </div>
    );
  }

  const players = Object.values(room.players);
  const roundResults = room.roundResults;
  const categories = Object.keys(roundResults[players[0].id] || {});
  
  // Calculate round scores
  const roundScores: Record<string, number> = {};
  players.forEach(p => {
    roundScores[p.id] = Object.values(roundResults[p.id] || {}).reduce((sum, catResult) => sum + catResult.score, 0);
  });
  
  const sortedPlayers = [...players].sort((a, b) => (room.gameScores?.[b.id] || 0) - (room.gameScores?.[a.id] || 0));

  const getWinner = () => {
    if (Object.keys(roundScores).length === 0) return null;
    const winnerId = Object.entries(roundScores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    return room.players[winnerId]?.name || null;
  };

  const winnerName = getWinner();

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-xl rounded-2xl bg-white/10 backdrop-blur-md p-6 animate-fade-in text-white">
        <CardHeader className="text-center mb-4">
            <CardTitle className="text-3xl font-bold">Resultados de la Ronda</CardTitle>
            <CardDescription className="text-white/80 mt-1">
              {winnerName ? `Ganador de la ronda: ${winnerName}` : 'Nadie puntuó en esta ronda.'} con la letra <span className="font-bold text-secondary">{room.currentLetter}</span>
            </CardDescription>
        </CardHeader>
        
        <CardContent>
            {/* --- TOTAL SCORES --- */}
            <div className="mb-8">
                <h3 className="text-2xl font-bold text-center mb-4 flex items-center justify-center gap-2"><Trophy /> Puntuación Total</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sortedPlayers.map((player, index) => (
                        <div key={player.id} className="bg-black/20 p-4 rounded-lg text-center border border-white/10 relative">
                             {index === 0 && <Crown className="absolute -top-3 -right-3 h-7 w-7 text-yellow-400 transform rotate-12" />}
                             <img src={player.avatar} alt={player.name} className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-primary" data-ai-hint="avatar person" />
                             <p className="font-semibold truncate">{player.name}</p>
                             <p className="text-2xl font-bold text-green-400">
                                {room.gameScores?.[player.id]?.toLocaleString() || 0}
                             </p>
                             <p className="text-xs text-yellow-400">
                                +{roundScores[player.id]?.toLocaleString() || 0} pts esta ronda
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- DETAILED RESULTS TABLE --- */}
            <div className="overflow-x-auto rounded-lg border border-white/10 bg-black/10">
                <Table className="w-full text-left">
                    <TableHeader>
                        <TableRow className="border-b-2 border-white/20">
                            <TableHead className="p-3 text-sm font-semibold tracking-wider">Categoría</TableHead>
                            {players.map(player => (
                                <TableHead key={player.id} className="p-3 text-sm font-semibold tracking-wider text-center">{player.name}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map(category => (
                            <TableRow key={category} className="border-b border-primary-foreground/10 last:border-b-0 hover:bg-white/5">
                                <TableCell className="p-3 font-semibold">{category}</TableCell>
                                {players.map(player => {
                                    const result = roundResults[player.id]?.[category];
                                    const scoreClass = result?.score === 10 ? 'text-green-400' : result?.score === 5 ? 'text-yellow-400' : 'text-red-400';
                                    return (
                                        <TableCell key={player.id} className="p-3 text-center">
                                            <p className={!result?.isValid && result?.response ? 'line-through text-white/60' : ''}>
                                                {result?.response || '-'}
                                            </p>
                                            <p className={`font-bold text-sm ${scoreClass}`}>{result?.score || 0} pts</p>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
        
        <div className="mt-8 flex justify-center gap-4">
             {isHost && <Button onClick={onNextRound} size="lg"><RotateCcw className="mr-2 h-4 w-4"/>Siguiente Ronda</Button>}
             {!isHost && <p className="text-center text-muted-foreground">Esperando a que el anfitrión inicie la siguiente ronda...</p>}
             <Button onClick={onLeaveRoom} variant="outline" size="lg" className="bg-transparent hover:bg-white/10">
                 <LogOut className="mr-2 h-4 w-4"/> Salir de la Sala
            </Button>
        </div>
    </Card>
  );
};
