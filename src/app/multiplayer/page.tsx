
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
                await removePlayerFromRoom(roomId, user.uid);
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

        if (!user || !user.uid) {
            toast.error("Debes iniciar sesión para unirte a una sala.");
            router.push('/');
            return;
        }

        setIsLoading(true);
        let unsubscribe: () => void = () => {};

        const joinAndListen = async () => {
            try {
                // Primero intenta unirte a la sala. Esto fallará si las reglas de seguridad te lo impiden
                await addPlayerToRoom(roomId, user.uid, user.displayName || 'Jugador Anónimo', user.photoURL || null);

                // Si unirse fue exitoso, suscríbete a las actualizaciones en tiempo real
                unsubscribe = onRoomUpdate(roomId, (updatedRoom) => {
                    if (updatedRoom) {
                        setRoom(updatedRoom);
                        // Ensure current user is in the player list, if not, handle error (e.g., kicked)
                        if (!updatedRoom.players[user.uid]) {
                           setError("Fuiste expulsado de la sala o la sala se reinició.");
                           toast.error('Ya no estás en esta sala.');
                           handleLeaveRoom();
                           return;
                        }
                        setError(null);
                    } else {
                        // La sala ya no existe, el host la eliminó, etc.
                        setError("La sala ya no existe o fue eliminada.");
                        toast.error('La sala ya no existe.');
                        handleLeaveRoom();
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
                } else {
                    userMessage = err.message;
                }
                
                setError(userMessage);
                toast.error(userMessage);
                setIsLoading(false);
            }
        };

        joinAndListen();

        // Limpieza: Cuando el componente se desmonta (usuario navega fuera, cierra la pestaña)
        return () => {
            unsubscribe();
            // The handleLeaveRoom function is called explicitly by the user via a button.
            // Automatically removing the player on component unmount can be problematic
            // with page reloads. A better presence system would use Firestore's presence features.
        };
    }, [authLoading, user?.uid, roomId, router, handleLeaveRoom]);


    if (isLoading || authLoading) {
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

    // Fallback si la sala o el usuario no están disponibles después de la carga
    return (
        <div className="flex flex-col h-screen items-center justify-center bg-background text-center p-4">
             <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
             <p className="text-lg mb-2">Finalizando conexión...</p>
             <p className="text-sm text-muted-foreground">Si el problema persiste, por favor vuelve a la página de inicio.</p>
             <Button onClick={() => router.push('/')} variant="link" className="mt-4">Volver al Inicio</Button>
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
