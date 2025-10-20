
import React, { useState, useEffect, useMemo } from 'react';
import type { User } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { 
  Users, 
  Share2, 
  Play,
  Crown,
  Check,
  X,
  DoorOpen,
  Send,
  Gamepad2,
  ClipboardCopy,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { 
    updatePlayerInRoom, 
    startGame, 
    submitPlayerAnswers,
    triggerGlobalStop,
    startNextRound,
    spinWheelAndStartRound,
    type Player, 
    type Room 
} from '../../lib/room-service';
import { GameArea } from './components/game-area';
import { MultiplayerResultsArea } from './components/multiplayer-results-area';
import { useLanguage } from '../../contexts/language-context';
import { RouletteWheel } from './components/roulette-wheel';
import { getFriends, sendChallengeNotification, type Friend } from '../../lib/friends-service';
import { Timestamp } from 'firebase/firestore';

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
  roomData: Room;
  onLeaveRoom: () => void;
}

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M22.25 12.01C22.25 17.65 17.65 22.25 12.01 22.25C10.03 22.25 8.16998 21.68 6.56998 20.68L2.75 21.75L3.85 18.01C2.8 16.34 2.25 14.28 2.25 12.01C2.25 6.37 6.85 1.77 12.49 1.77C15.11 1.77 17.51 2.78 19.31 4.57C21.11 6.37 22.25 8.78 22.25 12.01Z" fill="#25D366" />
        <path d="M17.08 13.8C17.01 13.68 16.88 13.62 16.63 13.5C16.38 13.38 15.17 12.79 14.95 12.7C14.73 12.61 14.56 12.66 14.41 12.91C14.27 13.16 13.78 13.71 13.65 13.88C13.53 14.03 13.4 14.05 13.13 13.93C12.86 13.81 11.76 13.43 10.63 12.41C9.74001 11.61 9.12 10.74 8.99 10.48C8.86 10.23 8.98 10.11 9.09 10.01C9.19 9.91001 9.33 9.73001 9.46 9.59001C9.59 9.45001 9.64 9.33001 9.71 9.17001C9.78 9.01001 9.73 8.86001 9.68 8.74001C9.63 8.62001 9.03 7.31001 8.83 6.87001C8.63 6.43001 8.43 6.49001 8.31 6.49001L7.82 6.50001C7.67 6.50001 7.43 6.57001 7.24 6.78001C7.05 6.99001 6.43 7.56001 6.43 8.76001C6.43 9.96001 7.29 11.09 7.41 11.25C7.54 11.4 9.17 13.87 11.58 14.87C13.99 15.87 13.99 15.35 14.42 15.3C14.85 15.25 15.96 14.67 16.18 14.07C16.4 13.47 16.4 12.97 16.33 12.85C16.26 12.73 16.13 12.67 15.88 12.55" fill="white"/>
    </svg>
);

const TelegramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
       <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#0088CC"/>
       <path d="M9.41211 15.424L16.2841 8.55198C16.6341 8.20198 16.1551 8.01698 15.7161 8.19698L6.28711 12.215C5.74811 12.433 5.75311 12.771 6.33611 12.955L8.51311 13.593L13.8181 10.355C14.1831 10.117 14.5421 10.258 14.2671 10.493L10.3441 14.072L10.2071 16.591C10.5051 16.591 10.6691 16.427 10.8651 16.233L12.4431 14.68L14.7791 16.353C15.2811 16.657 15.6881 16.505 15.8231 15.918L17.4431 9.25598C17.6531 8.44198 17.0711 8.06198 16.4861 8.28798" fill="white"/>
    </svg>
);


export default function EnhancedRoomManager({ 
  roomId, 
  currentUser, 
  roomData: room,
  onLeaveRoom, 
}: EnhancedRoomManagerProps) {
  const { translate, language } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(room.settings.roundDuration);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [invitedFriends, setInvitedFriends] = useState<Set<string>>(new Set());
  const [errorFriends, setErrorFriends] = useState<Set<string>>(new Set());
  const [loadingFriends, setLoadingFriends] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      setLoadingFriends(true);
      try {
        const userFriends = await getFriends(currentUser.uid);
        setFriends(userFriends);
        setFilteredFriends(userFriends);
      } catch (error) {
        toast.error("No se pudieron cargar tus amigos.");
      } finally {
        setLoadingFriends(false);
      }
    };
    fetchFriends();
  }, [currentUser.uid]);
  
  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = friends.filter(friend => friend.name.toLowerCase().includes(lowerCaseQuery));
    setFilteredFriends(filtered);
  }, [searchQuery, friends]);

  const players = useMemo(() => Object.values(room.players || {}), [room.players]);
  const roomSettings = useMemo(() => room.settings, [room.settings]);
  const categories = useMemo(() => CATEGORIES_BY_LANG[roomSettings.language] || CATEGORIES_BY_LANG.es, [roomSettings.language]);
  const alphabet = useMemo(() => ALPHABET_BY_LANG[roomSettings.language] || ALPHABET_BY_LANG.es, [roomSettings.language]);

  const currentPlayer = players.find(p => p.id === currentUser.uid);
  const isHost = room.hostId === currentUser.uid;

  const inviteUrl = useMemo(() => {
    return typeof window !== 'undefined' ? `${window.location.origin}/multiplayer?roomId=${roomId}` : '';
  }, [roomId]);


  useEffect(() => {
    if (room.gameState === 'PLAYING' && room.roundStartedAt) {
        // Asegurarse que roundStartedAt es un objeto Timestamp de Firebase
        const startTime = room.roundStartedAt instanceof Timestamp
            ? room.roundStartedAt.toMillis()
            : new Date(room.roundStartedAt).getTime();

        const serverNow = Timestamp.now().toMillis();
        const elapsed = Math.floor((serverNow - startTime) / 1000);
        
        const remaining = Math.max(0, room.settings.roundDuration - elapsed);
        setTimeLeft(remaining);
    }
  }, [room.gameState, room.roundStartedAt, room.settings.roundDuration]);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (room.gameState === 'PLAYING' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
            const newTime = prev - 1;
            if (newTime <= 0) {
                if(isHost) triggerGlobalStop(roomId).catch(console.error);
                return 0;
            }
            return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [room.gameState, timeLeft, isHost, roomId]);

  const readyPlayersCount = players.filter(p => p.isReady).length;
  const canStartGame = isHost && players.length > 0 && readyPlayersCount === players.length;

  const handleToggleReady = async () => {
    if (!currentPlayer) return;
    try {
      await updatePlayerInRoom(roomId, currentUser.uid, { isReady: !currentPlayer.isReady });
    } catch (error) {
      toast.error('No se pudo actualizar tu estado.');
    }
  };

  const handleStartGame = async () => {
    if (!canStartGame) {
        toast.warning("Todos los jugadores deben estar listos para empezar.");
        return;
    };
    try {
        await startGame(roomId);
    } catch (error) {
        toast.error(`No se pudo iniciar el juego: ${(error as Error).message}`);
    }
  };

  const handleNextRound = async () => {
      if (!isHost) return;
      try {
        await startNextRound(roomId);
      } catch (error) {
         toast.error(`No se pudo iniciar la siguiente ronda: ${(error as Error).message}`);
      }
  }

  const handleStop = async () => {
    try {
      await triggerGlobalStop(roomId);
    } catch (error) {
       toast.error(`No se pudo detener la ronda: ${(error as Error).message}`);
    }
  };
  
  const handleSpinComplete = async (letter: string) => {
    // La ruleta es solo visual para los no-hosts. El host es el único que realmente inicia la ronda.
    if (isHost) {
      try {
        await spinWheelAndStartRound(roomId, letter);
      } catch (error) {
        toast.error("No se pudo iniciar la ronda.");
        console.error(error);
      }
    }
  }

  const handleMultiplayerInputChange = async (category: string, value: string) => {
     try {
       await submitPlayerAnswers(roomId, currentUser.uid, { [category]: value });
     } catch(error) {
        toast.error('No se pudo guardar tu respuesta.');
     }
  };
  
  const handleInviteFriend = async (friend: Friend) => {
    setErrorFriends(prev => {
      const newSet = new Set(prev);
      newSet.delete(friend.id);
      return newSet;
    });
    
    try {
      await sendChallengeNotification(currentUser.uid, currentUser.displayName || 'un amigo', friend.id, roomId);
      toast.success(`Invitación enviada a ${friend.name}`);
      setInvitedFriends(prev => new Set(prev).add(friend.id));
    } catch(error: any) {
      toast.error(`No se pudo invitar a ${friend.name}`, {
          description: error.message
      });
      setErrorFriends(prev => new Set(prev).add(friend.id));
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      toast.success("Enlace copiado al portapapeles");
    }).catch(err => {
      console.error('Error al copiar enlace: ', err);
      toast.error("No se pudo copiar el enlace.");
    });
  };

  const handleShare = (platform: 'whatsapp' | 'telegram') => {
    const message = `¡Únete a mi sala en el juego Stop! Código: ${roomId}\n${inviteUrl}`;
    let url = '';

    if (platform === 'whatsapp') {
      url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    } else if (platform === 'telegram') {
      url = `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(`¡Únete a mi sala en el juego Stop! Código: ${roomId}`)}`;
    }
    
    if (url) {
        window.open(url, '_blank');
    }
  };


  // --- RENDERIZADO CONDICIONAL POR ESTADO DE JUEGO ---
  
  if (room.status === 'playing' && room.gameState) {
      switch (room.gameState) {
          case 'SPINNING':
              return <RouletteWheel alphabet={alphabet} language={room.settings.language} onSpinComplete={handleSpinComplete} />;
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
              return (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                    <p className="text-lg">Cargando estado del juego...</p>
                </div>
              );
      }
  }

  // --- VISTA DEL LOBBY (SI NO SE ESTÁ JUGANDO o ESTÁ EN 'waiting') ---
  return (
    <div className="w-full max-w-2xl mx-auto bg-card/80 text-white rounded-2xl shadow-2xl p-6 backdrop-blur-lg border border-red-400/30">
      <div className="text-center mb-6 pb-4 border-b border-white/20">
          <h1 className="text-2xl font-bold mb-2 text-yellow-400">Sala Privada</h1>
          <h2 className="text-4xl font-bold tracking-widest bg-white/10 px-4 py-2 rounded-lg inline-block font-mono text-green-400">
              {roomId}
          </h2>
          <div className="flex justify-center gap-4 mt-3 text-sm opacity-80">
              <span>{players.length}/{room.settings.maxPlayers} jugadores</span>
              <span>•</span>
              <span>{readyPlayersCount} listos</span>
          </div>
      </div>
      
      <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-yellow-400">
              <Users size={20} /> Jugadores en la Sala
          </h3>
          <div className="bg-white/5 rounded-lg p-2 space-y-2">
              {players.map(player => (
                  <div key={player.id} className="flex justify-between items-center p-2 rounded-md">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                              <AvatarImage src={player.avatar || undefined} alt={player.name} />
                              <AvatarFallback>{player.name?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                              <span className={`font-medium ${player.id === currentUser.uid ? 'text-yellow-400' : ''}`}>
                                  {player.name} {player.id === currentUser.uid && '(Tú)'}
                                  {player.isHost && <Crown className="inline h-4 w-4 ml-1 text-yellow-500"/>}
                              </span>
                              <p className="text-xs text-white/60">Nivel 15</p>
                          </div>
                      </div>
                      {player.isReady ? (
                          <div className="text-green-400 text-xs font-bold bg-green-500/20 px-2 py-1 rounded-full">LISTO</div>
                      ) : (
                          <div className="text-white/60 text-xs">Esperando...</div>
                      )}
                  </div>
              ))}
          </div>
      </div>

      <div className="bg-white/5 rounded-lg p-5 mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-yellow-400">
              <UserPlus size={20}/> Invitar Amigos del Juego
          </h3>

          <div className="relative mb-3">
              <Input 
                  placeholder="Buscar amigos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/10 border-white/20 pl-4"
              />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
              {loadingFriends ? <Loader2 className="mx-auto my-4 h-6 w-6 animate-spin"/> : (
                  filteredFriends.length > 0 ? filteredFriends.map(friend => (
                      <div key={friend.id} className="flex items-center justify-between p-2 rounded hover:bg-white/10">
                          <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                  <AvatarImage src={friend.avatar || undefined} alt={friend.name} />
                                  <AvatarFallback>{friend.name?.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <p className="font-medium text-sm">{friend.name}</p>
                          </div>
                          <Button 
                              size="sm"
                              variant={invitedFriends.has(friend.id) ? "secondary" : (errorFriends.has(friend.id) ? "destructive" : "default")}
                              onClick={() => handleInviteFriend(friend)}
                              disabled={invitedFriends.has(friend.id)}
                              className={`w-28 transition-colors duration-300 ${invitedFriends.has(friend.id) ? "bg-yellow-500 text-black hover:bg-yellow-600" : errorFriends.has(friend.id) ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                          >
                              {invitedFriends.has(friend.id) ? 'Invitado' : errorFriends.has(friend.id) ? 'Reintentar' : 'Invitar'}
                          </Button>
                      </div>
                  )) : <p className="text-center text-sm text-white/60 py-4">No se encontraron amigos.</p>
              )}
          </div>
      </div>

      <div className="bg-white/5 rounded-lg p-5 mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-yellow-400">
              <Send size={20}/> Compartir Enlace de Invitación
          </h3>
          <p className="text-sm opacity-90 mb-4">
              Usa este enlace para invitar a amigos que no estén en tu lista.
          </p>
          <div className="flex mb-4 bg-white/10 rounded-lg overflow-hidden border border-white/20">
              <input readOnly value={inviteUrl} className="flex-grow p-3 text-sm bg-transparent outline-none truncate"/>
              <button onClick={handleCopyLink} className="bg-green-600 hover:bg-green-700 text-white px-4 flex items-center gap-2 transition-colors">
                  <ClipboardCopy size={16}/> Copiar
              </button>
          </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <button onClick={() => handleShare('whatsapp')} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <WhatsappIcon /> WhatsApp
              </button>
                <button onClick={() => handleShare('telegram')} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <TelegramIcon /> Telegram
              </button>
                <button onClick={handleCopyLink} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Share2 /> Copiar Enlace
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
              onClick={handleToggleReady}
              variant={currentPlayer?.isReady ? "destructive" : "default"}
              className={`w-full py-6 text-base font-bold transition-colors ${!currentPlayer?.isReady ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
              {currentPlayer?.isReady ? <><X className="mr-2"/> No Estoy Listo</> : <><Check className="mr-2"/> Estoy Listo</>}
          </Button>
          
          <Button
              onClick={handleStartGame}
              disabled={!canStartGame}
              className="w-full py-6 text-base font-bold text-black bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 disabled:text-white/70 disabled:cursor-not-allowed md:col-span-1"
          >
              <Gamepad2 className="mr-2"/> Iniciar ({readyPlayersCount}/{players.length})
          </Button>

          <Button
              onClick={onLeaveRoom}
              variant="outline"
              className="w-full py-6 text-base bg-white/10 border-white/30 hover:bg-white/20 md:col-span-1"
          >
              <DoorOpen className="mr-2 h-5 w-5" />
              Salir
          </Button>
      </div>
    </div>
  );
}
