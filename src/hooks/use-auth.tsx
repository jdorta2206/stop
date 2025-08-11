
"use client";

import { createContext, useContext, type ReactNode, useCallback, useMemo, useEffect, useState } from "react";
import { useSignInWithGoogle, useSignInWithFacebook, useSignOut, useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "@/lib/firebase"; 
import type { User as FirebaseUser } from "firebase/auth";
import { rankingManager } from "@/lib/ranking";
import { useToast } from "@/components/ui/use-toast";
import type { PlayerScore } from "@/components/game/types";

// The final, unified User object for the app.
export interface User extends PlayerScore {
  uid: string;
  email: string | null;
  name: string; // Ensure name is always present
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
  
  const [appUser, setAppUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncUserProfile = useCallback(async (fbUser: FirebaseUser) => {
      if (isSyncing) return;
      setIsSyncing(true);
      try {
        const playerData = await rankingManager.getPlayerRanking(
          fbUser.uid, 
          fbUser.displayName, 
          fbUser.photoURL
        );
        
        if (playerData) {
            const currentUser: User = {
              ...playerData,
              uid: fbUser.uid,
              name: playerData.playerName, 
              email: fbUser.email,
            };
            setAppUser(currentUser);
        } else {
            throw new Error("Could not create or retrieve player profile.");
        }
      } catch (error) {
        console.error("Error syncing user profile:", error);
        toast({ title: "Error de perfil", description: "No se pudo cargar tu perfil de jugador.", variant: "destructive" });
        await signOut();
        setAppUser(null);
      } finally {
        setIsSyncing(false);
      }
    }, [isSyncing, signOut, toast]);

  useEffect(() => {
    if (firebaseUser && !appUser && !isSyncing) {
        syncUserProfile(firebaseUser);
    } else if (!firebaseUser && !authLoading) {
      if (appUser) {
        setAppUser(null);
      }
    }
  }, [firebaseUser, appUser, authLoading, isSyncing, syncUserProfile]);

  const loginWithGoogle = useCallback(async () => {
    await signInWithGoogle();
  }, [signInWithGoogle]);
  
  const loginWithFacebook = useCallback(async () => {
    await signInWithFacebook();
  }, [signInWithFacebook]);
  
  const logout = useCallback(async () => {
    await signOut();
    setAppUser(null);
    toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente." });
  }, [signOut, toast]);
  
  const isLoading = authLoading || googleLoading || facebookLoading || signOutLoading || isSyncing;
  const error = authError || googleError || facebookError || signOutError;

  const value = useMemo(() => ({
    user: appUser,
    isLoading,
    error: error || null,
    loginWithGoogle,
    loginWithFacebook,
    logout,
  }), [appUser, isLoading, error, loginWithGoogle, loginWithFacebook, logout]);

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
