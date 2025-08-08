
"use client";

import { createContext, useContext, type ReactNode, useCallback, useMemo, useEffect, useState } from "react";
import { useSignInWithGoogle, useSignInWithFacebook, useSignOut, useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "@/lib/firebase"; 
import type { User as FirebaseUser } from "firebase/auth";
import { rankingManager } from "@/lib/ranking";
import { useToast } from "@/components/ui/use-toast";
import type { PlayerScore } from "@/components/game/types";

// The final, unified User object for the app
export interface User extends PlayerScore {
  uid: string; // From Firebase Auth
  name?: string | null; // From Firebase Auth (displayName)
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
  
  // The single source of truth for Firebase Auth state
  const [firebaseUser, authLoading, authError] = useAuthState(auth);
  
  // States for the sign-in processes
  const [signInWithGoogle, , googleLoading, googleError] = useSignInWithGoogle(auth);
  const [signInWithFacebook, , facebookLoading, facebookError] = useSignInWithFacebook(auth);
  const [signOut, signOutLoading, signOutError] = useSignOut(auth);
  
  // The final user object for the application
  const [user, setUser] = useState<User | null>(null);
  // State to manage our internal loading (e.g., Firestore sync)
  const [isSyncing, setIsSyncing] = useState(true);

  // This useEffect is the core of the new logic.
  // It reacts to changes in `firebaseUser` from `useAuthState`.
  useEffect(() => {
    const syncUser = async () => {
      // If firebaseUser exists, we sync or create their profile in Firestore.
      if (firebaseUser) {
        setIsSyncing(true);
        try {
          // getPlayerRanking now handles both getting AND creating the user profile robustly.
          const playerData = await rankingManager.getPlayerRanking(firebaseUser.uid, firebaseUser.displayName, firebaseUser.photoURL);
          setUser({ ...playerData, uid: firebaseUser.uid, name: firebaseUser.displayName });
        } catch (error) {
          console.error("Error syncing user profile:", error);
          toast({ title: "Error de sincronización", description: (error as Error).message, variant: "destructive" });
          // If sync fails, log the user out to prevent an inconsistent state.
          await signOut();
          setUser(null);
        } finally {
          setIsSyncing(false);
        }
      } else {
        // If there's no firebaseUser, there's no app user.
        setUser(null);
        setIsSyncing(false);
      }
    };

    syncUser();
  }, [firebaseUser, signOut, toast]);

  const loginWithGoogle = useCallback(async () => {
    try {
      await signInWithGoogle();
      // The useEffect above will handle the rest.
    } catch (e) {
      toast({ title: "Error de inicio de sesión", description: (e as Error).message, variant: 'destructive' });
    }
  }, [signInWithGoogle, toast]);
  
  const loginWithFacebook = useCallback(async () => {
    try {
      await signInWithFacebook();
      // The useEffect above will handle the rest.
    } catch (e) {
      toast({ title: "Error de inicio de sesión", description: (e as Error).message, variant: 'destructive' });
    }
  }, [signInWithFacebook, toast]);
  
  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, [signOut]);

  // Combine all loading states into one.
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
