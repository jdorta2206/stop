
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
        // This effect handles the initial loading state and redirection logic.
        if (!authLoading) {
            setIsInitialLoading(false); // Authentication check is complete.
            if (!user) {
                // If auth is done and there's no user, redirect to home.
                router.push('/');
            } else if (!roomId) {
                // If user is logged in but there's no roomId, redirect to home.
                router.push('/');
            }
        }
    }, [authLoading, user, roomId, router]);


    const handleLeaveRoom = () => {
        router.push('/');
    };

    const handleStartGame = () => {
        // This logic will be implemented in the future.
        console.log(`Starting game in room ${roomId}`);
    };

    // Show a loading spinner during the initial authentication check.
    if (isInitialLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="ml-4 text-lg">Autenticando...</p>
            </div>
        );
    }
    
    // After loading, if we have a user and a room, show the manager.
    // The redirection useEffect above will handle cases where user or roomId are null.
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

    // Fallback for edge cases, though the useEffect should handle redirection.
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="ml-4 text-lg">Redirigiendo...</p>
        </div>
    );
}

function MultiplayerLobby() {
    // Suspense is necessary because useSearchParams is used in the child component.
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
