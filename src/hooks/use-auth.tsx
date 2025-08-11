
"use client";

import { createContext, useContext, type ReactNode, useCallback, useMemo, useEffect, useState } from "react";
import { useSignInWithGoogle, useSignInWithFacebook, useSignOut, useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "@/lib/firebase"; 
import type { User as FirebaseUser } from "firebase/auth";
import { rankingManager } from "@/lib/ranking";
import { useToast } from "@/components/ui/use-toast";
import type { PlayerScore } from "@/components/game/types";
import type { Timestamp } from "firebase/firestore";

// The final, unified User object for the app.
export interface User extends Omit<PlayerScore, 'lastPlayed'> {
  uid: string;
  email: string | null;
  name: string; // Ensure name is always present
  lastPlayed: string; // Convert Timestamp to string for client-side safety
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

const toAppUser = (playerData: PlayerScore, fbUser: FirebaseUser): User => {
    const lastPlayedTimestamp = playerData.lastPlayed as unknown as Timestamp;
    return {
        ...playerData,
        uid: fbUser.uid,
        name: playerData.playerName, 
        email: fbUser.email,
        lastPlayed: lastPlayedTimestamp?.toDate().toISOString() || new Date().toISOString()
    };
};

export function AuthProvider({ children }: AuthProviderProps) {
  const { toast } = useToast();
  
  // Firebase hooks for auth state and providers
  const [firebaseUser, authLoading, authError] = useAuthState(auth);
  const [signInWithGoogle, , googleLoading, googleError] = useSignInWithGoogle(auth);
  const [signInWithFacebook, , facebookLoading, facebookError] = useSignInWithFacebook(auth);
  const [signOut, signOutLoading, signOutError] = useSignOut(auth);
  
  // App-specific state
  const [appUser, setAppUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // This effect runs when the Firebase user object changes.
  // It's responsible for fetching or creating the player profile.
  useEffect(() => {
    const syncUserProfile = async (fbUser: FirebaseUser) => {
      // Prevent running if another sync is in progress or if user is already loaded
      if (isSyncing || appUser?.uid === fbUser.uid) return;

      setIsSyncing(true);
      try {
        const playerData = await rankingManager.getPlayerRanking(
          fbUser.uid, 
          fbUser.displayName, 
          fbUser.photoURL
        );
        
        if (playerData) {
          setAppUser(toAppUser(playerData, fbUser));
        } else {
          throw new Error("Could not create or retrieve player profile.");
        }
      } catch (error) {
        console.error("Error syncing user profile:", error);
        toast({ title: "Error de perfil", description: "No se pudo cargar tu perfil de jugador.", variant: "destructive" });
        await signOut(); // Sign out if profile sync fails
        setAppUser(null);
      } finally {
        setIsSyncing(false);
      }
    };
    
    if (firebaseUser) {
      syncUserProfile(firebaseUser);
    } else {
      // Clear app user if firebase user is null
      setAppUser(null);
    }
  // We only want this to run when the firebaseUser object itself changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser]);

  const loginWithGoogle = useCallback(async () => {
    await signInWithGoogle();
  }, [signInWithGoogle]);
  
  const loginWithFacebook = useCallback(async () => {
    await signInWithFacebook();
  }, [signInWithFacebook]);
  
  const handleLogout = useCallback(async () => {
    await signOut();
    setAppUser(null); // Clear app user immediately on logout
    toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente." });
  }, [signOut, toast]);
  
  // Unified loading state
  const isLoading = authLoading || googleLoading || facebookLoading || signOutLoading || isSyncing;
  const error = authError || googleError || facebookError || signOutError;

  const value = useMemo(() => ({
    user: appUser,
    isLoading,
    error: error || null,
    loginWithGoogle,
    loginWithFacebook,
    logout: handleLogout,
  }), [appUser, isLoading, error, loginWithGoogle, loginWithFacebook, handleLogout]);

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
