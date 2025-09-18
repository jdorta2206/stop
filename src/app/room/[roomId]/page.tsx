"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { useLanguage } from '@/contexts/language-context';
import { useAuth, type AppUser } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';
import type { ChatMessage } from '@/components/chat/chat-message-item';
import { ChatPanel } from '@/components/chat/chat-panel';
import { onRoomUpdate, sendMessageToRoom, addPlayerToRoom } from '@/lib/room-service';
import EnhancedRoomManager from '@/components/game/EnhancedRoomManager';
import { Loader2 } from 'lucide-react';

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId;
  
  const { language, translate } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return; // Wait until user auth state is resolved

    if (!user) {
      toast({ title: "Acceso denegado", description: "Debes iniciar sesión para unirte a una sala.", variant: "destructive" });
      router.push('/');
      return;
    }
    
    if (!roomId) {
      setError("No se ha proporcionado un ID de sala.");
      setIsLoading(false);
      return;
    }

    addPlayerToRoom(roomId, user.uid, user.displayName || 'Anónimo', user.photoURL)
      .then(() => setIsLoading(false))
      .catch((e) => {
        setError((e as Error).message);
        toast({ title: "Error al unirse a la sala", description: (e as Error).message, variant: "destructive" });
        setIsLoading(false);
        router.push('/');
      });

  }, [roomId, user, authLoading, router, toast]);

  const handleLeaveRoom = () => {
    router.push('/');
  };

  const handleStartGame = () => {
    // TODO: Implementar la navegación a la pantalla de juego de la sala
    toast({ title: "Próximamente", description: "La partida multijugador comenzará aquí." });
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-lg">Cargando sala...</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex h-screen items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold text-destructive mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-red-500/20 text-foreground">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
        {roomId && user && (
          <EnhancedRoomManager
            roomId={roomId}
            currentUserId={user.uid}
            onLeaveRoom={handleLeaveRoom}
            onStartGame={handleStartGame}
          />
        )}
      </main>
      <AppFooter language={language} />
    </div>
  );
}
