

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  Settings,
  Share2, 
  Lock, 
  Unlock,
  UserX,
  LogOut,
  Play,
  Loader2,
  Crown
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { 
    onRoomUpdate, 
    updatePlayerInRoom, 
    updateRoomSettings, 
    removePlayerFromRoom, 
    addPlayerToRoom, 
    startGame, 
    submitPlayerAnswers,
    triggerGlobalStop,
    startNextRound,
    type Player, 
    type Room 
} from '@/lib/room-service';
import type { Language } from '@/contexts/language-context';
import ContactsManager from './ContactsManager';
import type { User } from 'firebase/auth';
import { GameArea } from './components/game-area';
import { MultiplayerResultsArea } from './components/multiplayer-results-area';
import { useLanguage } from '@/contexts/language-context';
import { RouletteWheel } from './components/roulette-wheel';

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

interface EnhancedRoomManagerProps {
  roomId: string;
  currentUser: User;
  onLeaveRoom: () => void;
  onStartGame: () => void;
}

export default function EnhancedRoomManager({ 
  roomId, 
  currentUser, 
  onLeaveRoom, 
  onStartGame: initialOnStartGame 
}: EnhancedRoomManagerProps) {
  const { toast } = useToast();
  const { translate, language } = useLanguage();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const roomSettings = useMemo(() => room?.settings || { roundDuration: 60, language: 'es' }, [room]);
  const categories = useMemo(() => CATEGORIES_BY_LANG[roomSettings.language] || CATEGORIES_BY_LANG.es, [roomSettings.language]);
  const alphabet = useMemo(() => ALPHABET_BY_LANG[roomSettings.language] || ALPHABET_BY_LANG.es, [roomSettings.language]);

  useEffect(() => {
    if (!roomId || !currentUser) return;

    let unsubscribe: () => void = () => {};

    const joinAndListen = async () => {
      try {
        setIsLoading(true);
        
        await addPlayerToRoom(roomId, currentUser.uid, currentUser.displayName || 'Jugador', currentUser.photoURL);

        unsubscribe = onRoomUpdate(roomId, (updatedRoom) => {
          if (updatedRoom) {
            setRoom(updatedRoom);
            setPlayers(Object.values(updatedRoom.players || {}));
            
            if (updatedRoom.gameState === 'PLAYING' && updatedRoom.roundStartedAt) {
              const startTime = updatedRoom.roundStartedAt.toMillis();
              const now = Date.now();
              const elapsed = Math.floor((now - startTime) / 1000);
              const remaining = Math.max(0, updatedRoom.settings.roundDuration - elapsed);
              setTimeLeft(remaining);
            }
            
            setError(null);
          } else {
            setError("La sala ya no existe o no se pudo cargar.");
            toast({ title: 'Error', description: 'La sala ya no existe.', variant: 'destructive'});
            onLeaveRoom();
          }
          setIsLoading(false);
        });

      } catch (err) {
        console.error("Error joining or listening to room:", err);
        setError((err as Error).message);
        toast({ title: 'Error al unirse', description: (err as Error).message, variant: 'destructive' });
        setIsLoading(false);
        setTimeout(onLeaveRoom, 3000);
      }
    };

    joinAndListen();

    return () => {
      unsubscribe();
      if (roomId && currentUser?.uid) {
        updatePlayerInRoom(roomId, currentUser.uid, { status: 'offline' }).catch(e => console.error("Failed to update player status on leave:", e));
      }
    };
  }, [roomId, currentUser, toast, onLeaveRoom]);
  
  const currentPlayer = players.find(p => p.id === currentUser.uid);
  const isHost = room?.hostId === currentUser.uid;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (room?.gameState === 'PLAYING' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
            const newTime = prev - 1;
            if (newTime <= 0) {
                // Let only the host trigger the stop to avoid multiple triggers
                if(isHost) triggerGlobalStop(roomId);
                return 0;
            }
            return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [room?.gameState, timeLeft, isHost, roomId]);

  const readyPlayersCount = players.filter(p => p.isReady).length;
  const canStartGame = isHost && players.length >= 1 && readyPlayersCount === players.length;

  const handleToggleReady = async () => {
    if (!currentPlayer) return;
    try {
      await updatePlayerInRoom(roomId, currentUser.uid, { isReady: !currentPlayer.isReady });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar tu estado.', variant: 'destructive' });
    }
  };

  const handleStartGame = async () => {
    if (!canStartGame) return;
    try {
        await startGame(roomId);
    } catch (error) {
        toast({ title: 'Error', description: `No se pudo iniciar el juego: ${(error as Error).message}`, variant: 'destructive' });
    }
  };

  const handleNextRound = async () => {
      if (!isHost) return;
      try {
        await startNextRound(roomId);
      } catch (error) {
         toast({ title: 'Error', description: `No se pudo iniciar la siguiente ronda: ${(error as Error).message}`, variant: 'destructive' });
      }
  }

  const handleStop = async () => {
    try {
      await triggerGlobalStop(roomId);
    } catch (error) {
       toast({ title: 'Error', description: `No se pudo detener la ronda: ${(error as Error).message}`, variant: 'destructive' });
    }
  };

  const handleMultiplayerInputChange = async (category: string, value: string) => {
     try {
       await submitPlayerAnswers(roomId, currentUser.uid, { [category]: value });
     } catch(error) {
        toast({ title: 'Error', description: 'No se pudo guardar tu respuesta.', variant: 'destructive' });
     }
  };

  const handleKickPlayer = async (playerId: string) => {
    if (!isHost) {
      toast({ title: 'Acción no permitida', description: 'Solo el anfitrión puede expulsar jugadores.', variant: 'destructive' });
      return;
    }
    try {
      await removePlayerFromRoom(roomId, playerId);
      toast({ title: 'Éxito', description: 'Jugador expulsado de la sala' });
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<Room['settings']>) => {
    if (!isHost) {
      toast({ title: 'Acción no permitida', description: 'Solo el anfitrión puede cambiar la configuración.', variant: 'destructive' });
      return;
    }
    try {
        await updateRoomSettings(roomId, newSettings);
        toast({ title: 'Éxito', description: 'Configuración de sala actualizada' });
    } catch (error) {
        toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const getStatusIcon = (status: 'online' | 'away' | 'offline') => {
    switch (status) {
      case 'online':
        return <div className="w-2.5 h-2.5 bg-green-500 rounded-full" title="En línea" />;
      case 'away':
        return <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full" title="Ausente"/>;
      case 'offline':
        return <div className="w-2.5 h-2.5 bg-gray-400 rounded-full" title="Desconectado" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="ml-4 text-lg">Entrando a la sala...</p>
      </div>
    );
  }

  if (error) {
    return (
        <Card className="w-full max-w-md bg-destructive text-destructive-foreground">
            <CardHeader>
                <CardTitle>Error</CardTitle>
                 <CardDescription className="text-destructive-foreground/90">{error}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={onLeaveRoom} variant="outline" className="w-full bg-white text-destructive hover:bg-white/90">Volver al inicio</Button>
            </CardContent>
        </Card>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <p className="text-lg">Cargando datos de la sala...</p>
      </div>
    );
  }

  // --- RENDERIZADO CONDICIONAL POR ESTADO DE JUEGO ---
  
  if (room.status === 'playing') {
      switch (room.gameState) {
          case 'SPINNING':
              return <RouletteWheel alphabet={alphabet} language={room.settings.language} onSpinComplete={() => {}} />;
          case 'PLAYING':
              return (
                  <GameArea
                    currentLetter={room.currentLetter || null}
                    categories={categories}
                    playerResponses={room.playerResponses?.[currentUser.uid] || {}}
                    onInputChange={handleMultiplayerInputChange}
                    translateUi={translate}
                    onStop={handleStop}
                    timeLeft={timeLeft}
                    roundDuration={room.settings.roundDuration}
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
                    <MultiplayerResultsArea 
                        room={room}
                        currentUserId={currentUser.uid}
                        onNextRound={handleNextRound}
                        isHost={isHost}
                        onLeaveRoom={onLeaveRoom}
                    />
                );
          default:
              // Fallback para estado de juego inesperado
              return <p>Estado de juego desconocido...</p>
      }
  }

  // --- VISTA DEL LOBBY (SI NO SE ESTÁ JUGANDO) ---
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <Card className="overflow-hidden">
        <CardHeader className="bg-card-foreground/5 p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                {room.settings.isPrivate ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
                Sala: {roomId}
              </CardTitle>
              <CardDescription className="mt-1">
                {players.length}/{room.settings.maxPlayers} jugadores • {readyPlayersCount} listos
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                 <Dialog open={showContacts} onOpenChange={setShowContacts}>
                    <DialogTrigger asChild>
                       <Button variant="outline">
                        <Share2 className="h-4 w-4 mr-2" />
                        Invitar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-transparent border-none shadow-none">
                        <ContactsManager language={room.settings.language} roomCode={roomId} onClose={() => setShowContacts(false)} />
                    </DialogContent>
                </Dialog>
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={!isHost}>
                      <Settings className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Configuración de Sala</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="max-players">Máximo de jugadores</Label>
                        <Select 
                          value={room.settings.maxPlayers.toString()} 
                          onValueChange={(value) => handleUpdateSettings({ maxPlayers: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[2, 4, 6, 8, 10].map(num => <SelectItem key={num} value={num.toString()}>{num} jugadores</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="private-room">Sala privada</Label>
                        <Switch
                          id="private-room"
                          checked={room.settings.isPrivate}
                          onCheckedChange={(checked) => handleUpdateSettings({ isPrivate: checked })}
                        />
                      </div>
                    </div>
                  </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <h4 className="font-semibold mb-3 flex items-center gap-2"><Users className="h-5 w-5" />Jugadores</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-background/50 dark:bg-card/30 rounded-lg animate-fade-in">
                        <div className="flex items-center gap-3">
                            {getStatusIcon(player.status)}
                            <img src={player.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${player.name}`} alt={player.name} className="h-8 w-8 rounded-full" data-ai-hint="avatar person" />
                            <span className="font-medium flex items-center gap-2">
                                {player.name} {player.id === currentUser.uid && "(Tú)"}
                                {player.isHost && <Crown className="h-4 w-4 text-yellow-500"/>}
                            </span>
                        </div>
                        <div className='flex items-center gap-2'>
                        <Badge variant={player.isReady ? "default" : "secondary"} className="text-xs w-20 justify-center">
                            {player.isReady ? "Listo" : "Esperando"}
                        </Badge>
                        {isHost && player.id !== currentUser.uid && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleKickPlayer(player.id)}
                                title="Expulsar jugador"
                                className="text-muted-foreground hover:text-destructive h-7 w-7"
                            >
                                <UserX className="h-4 w-4" />
                            </Button>
                        )}
                        </div>
                    </div>
                    ))}
                </div>
            </div>
            
            <div className="flex flex-col justify-between space-y-3">
                 <h4 className="font-semibold mb-3 flex items-center gap-2"><Play className="h-5 w-5" />Acciones</h4>
                 <Button
                    onClick={handleToggleReady}
                    variant={currentPlayer?.isReady ? "secondary" : "default"}
                    className="w-full text-lg py-6"
                    size="lg"
                >
                    {currentPlayer?.isReady ? "Cancelar" : "¡Estoy listo!"}
                </Button>
                
                <Button
                    onClick={handleStartGame}
                    disabled={!canStartGame}
                    className="w-full text-lg py-6"
                    size="lg"
                >
                    Iniciar ({readyPlayersCount}/{players.length})
                </Button>
                
                <Button
                    onClick={onLeaveRoom}
                    variant="outline"
                    className="w-full"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Salir
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    