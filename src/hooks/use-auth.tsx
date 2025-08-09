
"use client";

import { createContext, useContext, type ReactNode, useCallback, useMemo, useEffect, useState } from "react";
import { useSignInWithGoogle, useSignInWithFacebook, useSignOut, useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "@/lib/firebase"; 
import type { User as FirebaseUser } from "firebase/auth";
import { rankingManager } from "@/lib/ranking";
import { useToast } from "@/components/ui/use-toast";
import type { PlayerScore } from "@/components/game/types";

// The final, unified User object for the app.
// It combines Firebase Auth info with our game-specific PlayerScore.
export interface User extends Omit<PlayerScore, 'id' | 'playerName' | 'photoURL'> {
  uid: string;
  name: string | null;
  photoURL?: string | null;
  coins: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error?: Error | null;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { toast } = useToast();
  
  const [firebaseUser, authLoading, authError] = useAuthState(auth);
  
  const [signInWithGoogle, , googleLoading, googleError] = useSignInWithGoogle(auth);
  const [signInWithFacebook, , facebookLoading, facebookError] = useSignInWithFacebook(auth);
  const [signOut, signOutLoading, signOutError] = useSignOut(auth);
  
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      if (firebaseUser) {
        setIsSyncing(true);
        try {
          const playerData = await rankingManager.getPlayerRanking(
            firebaseUser.uid, 
            firebaseUser.displayName, 
            firebaseUser.photoURL
          );
          
          const appUser: User = {
            ...playerData,
            uid: firebaseUser.uid,
            name: playerData.playerName,
            photoURL: playerData.photoURL,
            coins: playerData.coins || 0
          };

          setUser(appUser);
        } catch (error) {
          console.error("Error syncing user profile:", error);
          toast({ title: "Error de sincronización", description: (error as Error).message, variant: "destructive" });
          await signOut();
          setUser(null);
        } finally {
          setIsSyncing(false);
        }
      } else {
        setUser(null);
      }
    };

    if (!authLoading) {
      syncUser();
    }
  }, [firebaseUser, authLoading, signOut, toast]);

  const handleAuthError = (error: any, provider: string) => {
    console.error(`Error crítico de autenticación con ${provider}:`, error);
    let description = "No se pudo completar el inicio de sesión. Por favor, inténtalo de nuevo.";
    if (error.code === 'auth/popup-blocked') {
        description = "El navegador bloqueó la ventana emergente. Por favor, permite los popups para este sitio e inténtalo de nuevo.";
    } else if (error.code === 'auth/cancelled-popup-request') {
        description = "Se ha cancelado la solicitud de inicio de sesión.";
    }
    toast({
        title: `Error de inicio de sesión con ${provider}`,
        description: description,
        variant: 'destructive'
    });
  };

  const loginWithGoogle = useCallback(async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      handleAuthError(e, 'Google');
    }
  }, [signInWithGoogle, toast]);
  
  const loginWithFacebook = useCallback(async () => {
    try {
      await signInWithFacebook();
    } catch (e) {
      handleAuthError(e, 'Facebook');
    }
  }, [signInWithFacebook, toast]);
  
  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, [signOut]);

  const isLoading = authLoading || googleLoading || facebookLoading || signOutLoading || isSyncing;

  const value = useMemo(() => ({
    user,
    isLoading,
    error: authError || googleError || facebookError || signOutError,
    loginWithGoogle,
    loginWithFacebook,
    logout,
  }), [
    user, 
    isLoading,
    authError, googleError, facebookError, signOutError, 
    loginWithGoogle, loginWithFacebook, logout
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
