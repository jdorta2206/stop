
"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import EnhancedRoomManager from '@/components/game/EnhancedRoomManager';
import { useLanguage } from '@/contexts/language-context';
import { onRoomUpdate, addPlayerToRoom, type Room } from '@/lib/room-service';
import { useToast } from '@/components/ui/use-toast';

function MultiplayerLobbyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isLoading: authLoading } = useAuth();
    const { language } = useLanguage();
    const { toast } = useToast();
    
    const [room, setRoom] = useState<Room | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const roomId = searchParams ? searchParams.get('roomId') : null;

    useEffect(() => {
        if (authLoading || !roomId) return;

        if (!user) {
            router.push('/');
            return;
        }

        let unsubscribe: () => void = () => {};

        const joinAndListen = async () => {
            try {
                await addPlayerToRoom(roomId, user.uid, user.displayName || 'Jugador', user.photoURL);

                unsubscribe = onRoomUpdate(roomId, (updatedRoom) => {
                    if (updatedRoom) {
                        setRoom(updatedRoom);
                        setError(null);
                    } else {
                        setError("La sala ya no existe o no se pudo cargar.");
                        toast({ title: 'Error', description: 'La sala ya no existe.', variant: 'destructive'});
                        handleLeaveRoom();
                    }
                    setIsLoading(false);
                });
            } catch (err) {
                console.error("Error joining or listening to room:", err);
                setError((err as Error).message);
                toast({ title: 'Error al unirse', description: (err as Error).message, variant: 'destructive' });
                setIsLoading(false);
                setTimeout(() => router.push('/'), 3000);
            }
        };

        joinAndListen();

        return () => {
            unsubscribe();
        };
    }, [authLoading, user, router, roomId, toast]);


    const handleLeaveRoom = () => {
        router.push('/');
    };

    const handleStartGame = () => {
        // This logic is now handled inside EnhancedRoomManager
        console.log(`Starting game in room ${roomId}`);
    };

    if (isLoading || authLoading || !room) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="ml-4 text-lg">{error || 'Entrando a la sala...'}</p>
            </div>
        );
    }
    
    // If we have a user, a room, and a roomId, show the manager
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

    // Fallback redirect
    router.push('/');
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="ml-4 text-lg">Redirigiendo...</p>
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
