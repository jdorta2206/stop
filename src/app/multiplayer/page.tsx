
"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '../../firebase';
import { Loader2 } from 'lucide-react';
import { AppHeader } from '../../components/layout/header';
import { AppFooter } from '../../components/layout/footer';
import EnhancedRoomManager from '../../components/game/EnhancedRoomManager';
import { useLanguage } from '../../contexts/language-context';
import { onRoomUpdate, addPlayerToRoom, type Room, removePlayerFromRoom } from '../../lib/room-service';
import { toast } from 'sonner';

function MultiplayerLobbyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isUserLoading: authLoading } = useUser();
    const { language } = useLanguage();
    
    const [room, setRoom] = useState<Room | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const roomId = searchParams ? searchParams.get('roomId') : null;

    const handleLeaveRoom = () => {
        if(user && roomId) {
            removePlayerFromRoom(roomId, user.uid);
        }
        router.push('/');
    };

    useEffect(() => {
        if (authLoading) return;

        if (!roomId) {
            router.push('/');
            return;
        }

        if (!user || !user.uid) {
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
                const errorMessage = (err as Error).message;
                setError(errorMessage);
                toast.error(errorMessage, { description: 'Error al unirse' });
                setIsLoading(false);
                setTimeout(() => router.push('/'), 3000);
            }
        };

        joinAndListen();

        return () => {
            unsubscribe();
        };
    }, [authLoading, user?.uid, roomId, router]); // Dependency array simplified

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
                    />
                </main>
                <AppFooter language={language} />
            </div>
        );
    }

    // Fallback if room or user is missing after loading
    return (
        <div className="flex flex-col h-screen items-center justify-center bg-background text-center">
             <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
             <p className="text-lg mb-2">{error || 'Redirigiendo...'}</p>
             <p className="text-sm text-muted-foreground">Si el problema persiste, por favor vuelve a la página de inicio.</p>
             <Button onClick={() => router.push('/')} variant="link" className="mt-4">Volver al Inicio</Button>
        </div>
    );
}

function MultiplayerLobby() {
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
