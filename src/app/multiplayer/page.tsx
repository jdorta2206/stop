
"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import EnhancedRoomManager from '@/components/game/EnhancedRoomManager';
import { useLanguage } from '@/contexts/language-context';

function MultiplayerLobbyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isLoading: authLoading } = useAuth();
    const { language } = useLanguage();
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const roomId = searchParams ? searchParams.get('roomId') : null;

    useEffect(() => {
        // Este efecto maneja el estado de carga inicial y la lógica de redirección.
        if (!authLoading) {
            setIsInitialLoading(false); // La comprobación de autenticación ha finalizado.
            if (!user) {
                // Si la autenticación ha finalizado y no hay usuario, redirige al inicio.
                router.push('/');
            }
        }
    }, [authLoading, user, router]);

    const handleLeaveRoom = () => {
        router.push('/');
    };

    const handleStartGame = () => {
        // Esta lógica se implementará en el futuro.
        console.log(`Starting game in room ${roomId}`);
    };

    // Muestra un spinner de carga durante la comprobación inicial de autenticación.
    if (isInitialLoading || authLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="ml-4 text-lg">Autenticando...</p>
            </div>
        );
    }
    
    // Si no hay roomId, redirige también.
    if (!roomId) {
        router.push('/');
        return (
             <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="ml-4 text-lg">Redirigiendo...</p>
            </div>
        );
    }
    
    // Después de la carga, si tenemos un usuario y una sala, muestra el gestor.
    if (user && roomId) {
        return (
            <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-red-500/20 text-foreground">
                <AppHeader />
                <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
                    <EnhancedRoomManager 
                        roomId={roomId}
                        currentUser={user}
                        onLeaveRoom={handleLeaveRoom}
                        onStartGame={handleStartGame}
                    />
                </main>
                <AppFooter language={language} />
            </div>
        );
    }

    // Fallback para casos extremos, aunque el useEffect debería manejar la redirección.
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="ml-4 text-lg">Redirigiendo...</p>
        </div>
    );
}

function MultiplayerLobby() {
    // Suspense es necesario porque useSearchParams se utiliza en el componente hijo.
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
