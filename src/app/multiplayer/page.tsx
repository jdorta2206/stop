
"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/use-auth-context';
import { Loader2 } from 'lucide-react';
import { AppHeader } from '../../components/layout/header';
import { AppFooter } from '../../components/layout/footer';
import EnhancedRoomManager from '../../components/game/EnhancedRoomManager';
import { useLanguage } from '../../contexts/language-context';
import { onRoomUpdate, addPlayerToRoom, type Room } from '../../lib/room-service';
import { toast } from 'sonner';

function MultiplayerLobbyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const { language } = useLanguage();
    
    const [room, setRoom] = useState<Room | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const roomId = searchParams ? searchParams.get('roomId') : null;

    const handleLeaveRoom = () => {
        router.push('/');
    };

    useEffect(() => {
        if (authLoading) return;
        if (!roomId) {
            handleLeaveRoom();
            return;
        }

        if (!user || !user.uid) {
            // User not logged in, redirect or show message
            toast.error("Debes iniciar sesión para unirte a una sala.");
            router.push('/');
            return;
        }

        let unsubscribe: () => void = () => {};

        const joinAndListen = async () => {
            try {
                await addPlayerToRoom(roomId, user.uid, user.displayName || 'Jugador Anónimo', user.photoURL || null);

                unsubscribe = onRoomUpdate(roomId, (updatedRoom) => {
                    if (updatedRoom) {
                        setRoom(updatedRoom);
                        setError(null);
                    } else {
                        setError("La sala ya no existe o no se pudo cargar.");
                        toast.error('La sala ya no existe.');
                        handleLeaveRoom();
                    }
                    setIsLoading(false);
                });
            } catch (err) {
                console.error("Error joining or listening to room:", err);
                setError((err as Error).message);
                toast.error((err as Error).message, { description: 'Error al unirse' });
                setIsLoading(false);
                setTimeout(() => router.push('/'), 3000);
            }
        };

        joinAndListen();

        return () => {
            unsubscribe();
        };
    }, [authLoading, user, router, roomId]);

    const handleStartGame = () => {
        // This logic is now handled inside EnhancedRoomManager
        console.log(`Starting game in room ${roomId}`);
    };

    if (isLoading || authLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="ml-4 text-lg">{error || 'Entrando a la sala...'}</p>
            </div>
        );
    }
    
    if (user && room && roomId) {
        return (
            <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-red-500/20 text-foreground">
                <AppHeader />
                <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
                    <EnhancedRoomManager 
                        roomId={roomId}
                        currentUser={user}
                        roomData={room}
                        onLeaveRoom={handleLeaveRoom}
                        onStartGame={handleStartGame}
                    />
                </main>
                <AppFooter language={language} />
            </div>
        );
    }

    // Fallback if room or user is missing after loading
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="ml-4 text-lg">{error || 'Redirigiendo...'}</p>
        </div>
    );
}

function MultiplayerLobby() {
    // Suspense is necessary because useSearchParams is used in the component child.
    return (
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center bg-background">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="ml-4 text-lg">Cargando...</p>
        </div>
      }>
        <MultiplayerLobbyContent />
      </Suspense>
    );
}

export default function MultiplayerPage() {
    return <MultiplayerLobby />;
}
