
"use client";

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '../../firebase';
import { Loader2 } from 'lucide-react';
import { AppHeader } from '../../components/layout/header';
import { AppFooter } from '../../components/layout/footer';
import EnhancedRoomManager from '../../components/game/EnhancedRoomManager';
import { useLanguage } from '../../contexts/language-context';
import { onRoomUpdate, addPlayerToRoom, removePlayerFromRoom, type Room } from '../../lib/room-service';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import type { User } from 'firebase/auth';

function MultiplayerLobbyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isUserLoading: authLoading } = useUser();
    const { language } = useLanguage();
    
    const [room, setRoom] = useState<Room | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const roomId = searchParams ? searchParams.get('roomId') : null;

    const handleLeaveRoom = useCallback(async () => {
        if (user && roomId) {
            try {
                // No need to wait for this to finish before navigating away
                removePlayerFromRoom(roomId, user.uid);
            } catch(err) {
                console.error("Error al intentar salir de la sala:", err);
            }
        }
        router.push('/');
    }, [user, roomId, router]);
    

    useEffect(() => {
        if (authLoading) return;

        if (!roomId) {
            router.push('/');
            return;
        }

        if (!user) {
            toast.error("Debes iniciar sesión para unirte a una sala.");
            router.push('/');
            return;
        }
        
        let unsubscribe: (() => void) | null = null;
        
        const joinAndListen = async (currentUser: User) => {
            try {
                // First, try to join the room. This will throw if the room is full or doesn't exist.
                await addPlayerToRoom(roomId, currentUser.uid, currentUser.displayName || 'Jugador Anónimo', currentUser.photoURL || null);
                
                // If join is successful, set up the real-time listener.
                unsubscribe = onRoomUpdate(roomId, (updatedRoom) => {
                    setIsLoading(true);
                    if (updatedRoom) {
                        setRoom(updatedRoom);
                        // Check if the current user is still in the room's player list
                        if (updatedRoom.players && !updatedRoom.players[currentUser.uid]) {
                           setError("Has sido expulsado o has abandonado la sala.");
                           toast.error('Ya no estás en esta sala.');
                           if (unsubscribe) unsubscribe();
                           router.push('/');
                           return;
                        }
                        setError(null);
                    } else {
                        // This case handles when the room document is deleted.
                        setError("La sala ha sido eliminada por el anfitrión.");
                        toast.error('La sala ya no existe.');
                        if (unsubscribe) unsubscribe();
                        router.push('/');
                    }
                    setIsLoading(false);
                });

            } catch (err: any) {
                console.error("Error al unirse o suscribirse a la sala:", err);
                let userMessage = "No se pudo entrar a la sala.";
                if (err.message.includes('permission-denied') || err.message.includes('Missing or insufficient permissions')) {
                    userMessage = "No tienes permiso para unirte a esta sala o la sala no existe.";
                } else if (err.message.includes("La sala está llena")) {
                    userMessage = "La sala está llena. No puedes unirte.";
                } else if (err.message.includes("La sala no existe")){
                    userMessage = "La sala no existe o el código es incorrecto."
                }
                
                setError(userMessage);
                toast.error(userMessage);
                setIsLoading(false);
                setTimeout(() => router.push('/'), 3000);
            }
        };
        
        joinAndListen(user);

        // This is the cleanup function for the useEffect hook.
        return () => {
            if (unsubscribe) {
              unsubscribe();
            }
            // When the component unmounts (e.g., user navigates away, closes tab),
            // remove the player from the room.
            if (roomId && user) {
                removePlayerFromRoom(roomId, user.uid);
            }
        };
    }, [user, roomId, router, authLoading]); // Dependencies


    if (isLoading || authLoading || !room) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-background text-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                <p className="text-lg">Entrando a la sala...</p>
                <p className="text-sm text-muted-foreground mt-2">Asegúrate de que el código sea correcto.</p>
            </div>
        );
    }
    
    if (error) {
        return (
             <div className="flex flex-col h-screen items-center justify-center bg-background text-center p-4">
                <h2 className="text-2xl font-bold text-destructive mb-4">Error al unirse a la sala</h2>
                <p className="text-lg mb-6 text-muted-foreground">{error}</p>
                <Button onClick={() => router.push('/')} variant="outline">Volver al Inicio</Button>
            </div>
        )
    }
    
    // We can be sure user, room, and roomId are defined here.
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-red-500/20 text-foreground">
            <AppHeader />
            <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
                <EnhancedRoomManager 
                    roomId={roomId!}
                    currentUser={user!}
                    roomData={room}
                    onLeaveRoom={handleLeaveRoom}
                />
            </main>
            <AppFooter language={language} />
        </div>
    );
}

function MultiplayerPage() {
    return (
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center bg-background">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="ml-4 text-lg">Cargando sala...</p>
        </div>
      }>
        <MultiplayerLobbyContent />
      </Suspense>
    );
}

export default MultiplayerPage;

    