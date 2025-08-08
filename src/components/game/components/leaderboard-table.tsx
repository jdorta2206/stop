
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCircle, UserPlus, Sword, Crown, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import type { PlayerScore } from '../types';
import { type Language } from '@/contexts/language-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LeaderboardTableProps {
  players: PlayerScore[];
  currentUserId?: string | null;
  onAddFriend?: (player: PlayerScore) => void;
  onChallenge?: (player: PlayerScore) => void;
  isLoading?: boolean;
  isFriendsLeaderboard?: boolean;
  language: Language;
}

export function LeaderboardTable({
  players = [],
  currentUserId,
  onAddFriend,
  onChallenge,
  isLoading = false,
  isFriendsLeaderboard = false,
  language,
}: LeaderboardTableProps) {
    
  const localeForNumber = typeof window !== "undefined" ? window.navigator.language : 'en-US';

  const renderLoadingRows = () => (
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={`loading-${i}`}>
        <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
        <TableCell className="hidden sm:table-cell">
          <Skeleton className="h-9 w-9 rounded-full" />
        </TableCell>
        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-4 w-[60px] ml-auto" /></TableCell>
        {(onAddFriend || onChallenge) && <TableCell><Skeleton className="h-8 w-[100px] mx-auto" /></TableCell>}
      </TableRow>
    ))
  );

  return (
    <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">#</TableHead>
              <TableHead className="w-[80px] hidden sm:table-cell">Avatar</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Puntuación</TableHead>
              {(onAddFriend || onChallenge) && <TableHead className="text-center px-4">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? renderLoadingRows() : (
              players.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                    No hay puntuaciones para mostrar.
                  </TableCell>
                </TableRow>
              ) : (
                players.map((player, index) => {
                  const isCurrentUser = player.id === currentUserId;
                  const RankIcon = index === 0 ? Crown : 
                                  index === 1 ? Trophy : 
                                  index === 2 ? Trophy : null;

                  return (
                    <TableRow 
                      key={player.id} 
                      className={isCurrentUser ? 'bg-primary/10' : ''}
                      data-highlight={isCurrentUser ? 'true' : undefined}
                    >
                      <TableCell className="font-medium text-center">
                        <div className="flex items-center justify-center">
                          {index + 1}
                          {RankIcon && (
                            <RankIcon 
                              className={`ml-1 h-4 w-4 ${
                                index === 0 ? 'text-yellow-500' : 
                                index === 1 ? 'text-gray-400' : 
                                'text-amber-600'
                              }`} 
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={player.photoURL || undefined} alt={player.playerName} data-ai-hint="avatar person" />
                          <AvatarFallback>
                            {player.playerName ? player.playerName.charAt(0).toUpperCase() : <UserCircle size={20}/>}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {player.playerName}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (Tú)
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {player.totalScore.toLocaleString(localeForNumber)}
                      </TableCell>
                      {(onAddFriend || onChallenge) && (
                        <TableCell className="text-center px-4">
                          <div className="flex justify-center space-x-2">
                            {onAddFriend && !isFriendsLeaderboard && !isCurrentUser && (
                              <div className="relative group">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => onAddFriend(player)}
                                >
                                  <UserPlus className="h-4 w-4 text-primary" />
                                </Button>
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  Añadir Amigo
                                </div>
                              </div>
                            )}
                            {onChallenge && !isCurrentUser && (
                              <div className="relative group">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => onChallenge(player)}
                                >
                                  <Sword className="h-4 w-4 text-destructive" />
                                </Button>
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  Desafiar
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )
            )}
          </TableBody>
        </Table>
      </div>
  );
}
