
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
  
  // Hooks from react-firebase-hooks
  const [firebaseUser, authLoading, authError] = useAuthState(auth);
  const [signInWithGoogle, , googleLoading, googleError] = useSignInWithGoogle(auth);
  const [signInWithFacebook, , facebookLoading, facebookError] = useSignInWithFacebook(auth);
  const [signOut, signOutLoading, signOutError] = useSignOut(auth);
  
  // App-specific user state
  const [appUser, setAppUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);

  // This effect runs when the Firebase auth state changes.
  // It's responsible for fetching/creating the user's game profile in Firestore.
  useEffect(() => {
    const syncUserProfile = async (fbUser: FirebaseUser) => {
      setIsSyncing(true);
      try {
        // Fetch or create the player's profile from our database
        const playerData = await rankingManager.getPlayerRanking(
          fbUser.uid, 
          fbUser.displayName, 
          fbUser.photoURL
        );
        
        // Combine auth data and player data into a single, unified app user object
        const currentUser: User = {
          ...playerData,
          uid: fbUser.uid,
          name: playerData.playerName, // Ensure name is consistent
          email: fbUser.email,
        };
        setAppUser(currentUser);

      } catch (error) {
        console.error("Error syncing user profile:", error);
        toast({ title: "Error de perfil", description: "No se pudo cargar tu perfil de jugador.", variant: "destructive" });
        await signOut(); // Sign out on profile error to prevent inconsistent state
        setAppUser(null);
      } finally {
        // This is crucial: always stop the syncing indicator
        setIsSyncing(false);
      }
    };

    if (firebaseUser) {
      syncUserProfile(firebaseUser);
    } else {
      // No firebase user, so not syncing and no app user.
      setAppUser(null);
      setIsSyncing(false);
    }
  }, [firebaseUser, signOut, toast]);

  const loginWithGoogle = useCallback(async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
       toast({ title: "Error al iniciar sesión con Google", description: (e as Error).message, variant: "destructive" });
    }
  }, [signInWithGoogle, toast]);
  
  const loginWithFacebook = useCallback(async () => {
     try {
      await signInWithFacebook();
    } catch (e) {
       toast({ title: "Error al iniciar sesión con Facebook", description: (e as Error).message, variant: "destructive" });
    }
  }, [signInWithFacebook, toast]);
  
  const logout = useCallback(async () => {
    await signOut();
    setAppUser(null); // Clear local user state on logout
    toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente." });
  }, [signOut, toast]);

  // The overall loading state is a combination of Firebase auth state changes,
  // login provider loading, and our own profile syncing.
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
