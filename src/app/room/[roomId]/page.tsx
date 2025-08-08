
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';
import type { ChatMessage } from '@/components/chat/chat-message-item';
import { ChatPanel } from '@/components/chat/chat-panel';
import Link from 'next/link';
import EnhancedRoomManager from '@/components/game/EnhancedRoomManager';
import { 
    addPlayerToRoom, 
    updatePlayerInRoom,
    onRoomUpdate, 
    type Room, 
    startGame, 
    setLetterForRound, 
    submitPlayerAnswers, 
    triggerGlobalStop,
    onChatUpdate,
    sendMessageToRoom
} from '@/lib/room-service';
import { GameArea } from '@/components/game/components/game-area';

const CATEGORIES_BY_LANG: Record<string, string[]> = {
};

interface AuthUser {
  uid: string;
  email: string | null;
  name?: string;
  photoURL?: string | null;
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


export default function RoomPage() {
  const params = useParams();

  // Ensure params is not null before accessing roomId
  if (!params || typeof params.roomId !== 'string') {
    // Handle the case where params or roomId is missing (e.g., redirect to home or show an error)
    return null; // Or a loading/error component
  }
  const roomId = params.roomId; // Now TypeScript knows roomId is a string
  const router = useRouter();
  const { language, translate: translateUi } = useLanguage();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth() as { user: AuthUser | null; isLoading: boolean };
  
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [localPlayerResponses, setLocalPlayerResponses] = useState<Record<string, string>>({});
  const [localPlayerSubmitted, setLocalPlayerSubmitted] = useState(false);

  // Room and player subscription
  useEffect(() => {
    if (isAuthLoading || !roomId) return;
    if (!user) {
      setIsLoading(false);
      return;
    }

    const handleBeforeUnload = () => {
      if(user) updatePlayerInRoom(roomId, user.uid, { status: 'offline' });
    };

    // Subscribe to room updates
    const unsubscribeRoom = onRoomUpdate(roomId, (updatedRoom) => {
        if (!updatedRoom) {
            toast({ title: "Error", description: "La sala no existe o ha sido eliminada.", variant: "destructive" });
            router.push('/');
            return;
        }
        setRoom(updatedRoom);
        
        // If user is not in the player list, add them. Otherwise, mark them as online.
 if (user) {
           const playerInfo = {
                name: user.name || 'Jugador',
                avatar: user.photoURL || null
            };
           if (!updatedRoom.players[user.uid]) {
              addPlayerToRoom(roomId, user.uid, playerInfo.name, playerInfo.avatar).catch(err => {
                   toast({ title: "Error al unirse", description: (err as Error).message, variant: "destructive" });
                   router.push('/');
              });
           } else if (updatedRoom.players[user.uid].status === 'offline') {
              updatePlayerInRoom(roomId, user.uid, { status: 'online', ...playerInfo });
           }
        }
        setIsLoading(false);
    });

    // Subscribe to chat updates
    const unsubscribeChat = onChatUpdate(roomId, setChatMessages);
    
    // Handle user leaving the page
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribeRoom();
      unsubscribeChat();
      if(user) updatePlayerInRoom(roomId, user.uid, { status: 'offline' });
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [roomId, user, isAuthLoading, router, toast]);

  const handleStartGame = useCallback(async () => {
    if (Object.keys(room?.players || {}).length >= 2) {
        await startGame(roomId);
    } else {
        toast({ title: "No se puede iniciar", description: "Se necesitan al menos 2 jugadores para empezar."})
    }
  }, [roomId, room?.players, toast]);

  const handleLeaveRoom = async () => {
    if(user) await updatePlayerInRoom(roomId, user.uid, { status: 'offline' });
    router.push('/');
  };

  const handleSpinComplete = useCallback(async (letter: string) => {
    await setLetterForRound(roomId, letter);
  }, [roomId]);
  
  const handleStop = useCallback(async () => {
    if (!user || !room) return;
    await submitPlayerAnswers(roomId, user.uid, localPlayerResponses);
    setLocalPlayerSubmitted(true);
    await triggerGlobalStop(roomId);
    
    toast({title: "¡STOP!", description: "Has detenido la ronda para todos. Esperando resultados..."})
  }, [roomId, user, room, localPlayerResponses, toast]);

  const handleSendMessage = useCallback(async (text: string) => {
     if (!user || !roomId) {
        toast({title: translateUi('chat.loginRequired.title'), description: translateUi('chat.loginRequired.message')});
        return;
     }
     const newMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
        text: text,
        sender: {
            uid: user.uid,
            name: user.name || 'Anonymous',
            avatar: user.photoURL || undefined
        },
     };
     await sendMessageToRoom(roomId, newMessage);
  }, [user, roomId, toast, translateUi]);


  if (isLoading || isAuthLoading || !room) { // Added !room check here
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-background via-card to-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-foreground">
          {translateUi('rooms.labels.loading', { roomId: roomId || ""})}
        </p>
      </div>
    );
  }

  if (!user) {
     return (
        <div className="flex flex-col min-h-screen bg-background">
            <AppHeader onToggleChat={() => {}} isChatOpen={false} />
            <main className="flex-grow container mx-auto p-4 flex flex-col items-center justify-center">
                 <Card className="w-full max-w-md mx-auto text-center p-8">
                     <CardHeader>
                        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
                        <CardTitle className="mt-4">Acceso denegado</CardTitle>
                        <CardDescription>Debes iniciar sesión para acceder a las salas.</CardDescription>
                     </CardHeader>
                     <CardContent>
                        <Link href="/" passHref>
                           <Button>Volver al inicio</Button>
                        </Link>
                     </CardContent>
                 </Card>
            </main>
            <AppFooter language={language} />
        </div>
     );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-card to-background">
      <AppHeader onToggleChat={() => setIsChatOpen(prev => !prev)} isChatOpen={isChatOpen} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {room?.status === 'waiting' ? (
            <EnhancedRoomManager
              roomId={roomId}
              currentUserId={user.uid}
              onLeaveRoom={handleLeaveRoom}
              onStartGame={handleStartGame}
            />
        ) : room?.gameState ? (
            <GameArea
              gameState={room.gameState}
              currentLetter={room.currentLetter || null}
              onSpinComplete={handleSpinComplete}
              categories={CATEGORIES_BY_LANG[room.settings.language]}
              alphabet={ALPHABET_BY_LANG[room.settings.language]}
              playerResponses={localPlayerResponses}
              onInputChange={(category, value) => setLocalPlayerResponses(prev => ({ ...prev, [category]: value }))}
              onStop={handleStop}
              isLoadingAi={room.gameState === 'EVALUATING'}
              roundResults={room.roundResults || undefined}
              startNextRound={() => { /* This should be democratized too */ }}
              totalPlayerScore={room.gameScores?.[user.uid] || 0}
              totalAiScore={0} // Not applicable in multiplayer
              timeLeft={60} // This needs to be synced
              countdownWarningText={""}
              translateUi={translateUi as (key: string, replacements?: Record<string, string>) => string}
              language={room.settings.language}
              gameMode={'multiplayer'}
              localPlayerSubmitted={localPlayerSubmitted}
              processingState={'idle'}
            />
        ) : (
             <div className="flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4">Cargando estado del juego...</p>
            </div>
        )}

        <ChatPanel
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          roomId={roomId}
          messages={chatMessages}
          currentUserUid={user.uid}
          onSendMessage={handleSendMessage}
          translateUi={translateUi as (key: string, replacements?: Record<string, string>) => string}
          language={language}
        />
      </main>
      
      <AppFooter language={language} />
    </div>
  );
}
