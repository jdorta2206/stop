
"use client";

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import EnhancedRoomManager from '@/components/game/EnhancedRoomManager';
import { useLanguage } from '@/contexts/language-context';

function MultiplayerLobby() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isLoading: authLoading } = useAuth();
    const { language } = useLanguage();
    
    const roomId = searchParams.get('roomId');

    if (authLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!user) {
        // Podríamos abrir el modal de login o redirigir
        router.push('/');
        return null;
    }

    if (!roomId) {
        // Si no hay roomId, redirigir a la página principal para crear/unirse a una sala
        router.push('/');
        return null;
    }

    const handleLeaveRoom = () => {
        router.push('/');
    };

    const handleStartGame = () => {
        // Lógica para iniciar el juego en esta sala
        console.log(`Starting game in room ${roomId}`);
        // router.push(`/game/${roomId}`); // Futura implementación
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-red-500/20 text-foreground">
            <AppHeader />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <EnhancedRoomManager 
                    roomId={roomId}
                    currentUserId={user.uid}
                    onLeaveRoom={handleLeaveRoom}
                    onStartGame={handleStartGame}
                />
            </main>
            <AppFooter language={language} />
        </div>
    );
}

export default function MultiplayerPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <MultiplayerLobby />
        </Suspense>
    );
}
