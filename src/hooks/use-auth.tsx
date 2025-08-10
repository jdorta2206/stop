
"use client";

import { createContext, useContext, type ReactNode, useCallback, useMemo, useEffect, useState } from "react";
import { useSignInWithGoogle, useSignInWithFacebook, useSignOut, useAuthState } from 'react-firebase-hooks/auth';
import { auth, googleProvider, facebookProvider } from "@/lib/firebase"; 
import type { User as FirebaseUser } from "firebase/auth";
import { rankingManager } from "@/lib/ranking";
import { useToast } from "@/components/ui/use-toast";
import type { PlayerScore } from "@/components/game/types";

// The final, unified User object for the app.
// It combines Firebase Auth info with our game-specific PlayerScore.
export interface User extends Omit<PlayerScore, 'id' | 'playerName' | 'photoURL'> {
  uid: string;
  name: string | null;
  email: string | null; 
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
  
  // Hooks from react-firebase-hooks
  const [firebaseUser, authLoading, authError] = useAuthState(auth);
  const [signInWithGoogle, , googleLoading, googleError] = useSignInWithGoogle(auth);
  const [signInWithFacebook, , facebookLoading, facebookError] = useSignInWithFacebook(auth);
  const [signOut, signOutLoading, signOutError] = useSignOut(auth);
  
  // App-specific user state
  const [appUser, setAppUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(true); // Always start syncing

  // This effect runs when the Firebase auth state changes.
  useEffect(() => {
    const syncUserProfile = async (fbUser: FirebaseUser) => {
      setIsSyncing(true);
      try {
        const playerData = await rankingManager.getPlayerRanking(
          fbUser.uid, 
          fbUser.displayName, 
          fbUser.photoURL
        );
        
        const currentUser: User = {
          ...playerData,
          uid: fbUser.uid,
          name: playerData.playerName,
          email: fbUser.email,
          photoURL: playerData.photoURL,
          coins: playerData.coins || 0
        };
        setAppUser(currentUser);
      } catch (error) {
        console.error("Error syncing user profile:", error);
        toast({ title: "Error de perfil", description: "No se pudo cargar tu perfil de jugador.", variant: "destructive" });
        await signOut();
        setAppUser(null);
      } finally {
        setIsSyncing(false);
      }
    };

    if (firebaseUser) {
      syncUserProfile(firebaseUser);
    } else {
      // If there's no Firebase user, clear the app user and stop syncing.
      setAppUser(null);
      setIsSyncing(false);
    }
  }, [firebaseUser, signOut, toast]);

  const handleLogin = async (loginFunction: () => Promise<any>, providerName: string) => {
    try {
      const userCredential = await loginFunction();
      // The useEffect above will handle the rest once `firebaseUser` is updated by the hook
      if (!userCredential) {
          // This can happen if the user closes the popup
          console.log(`Login with ${providerName} was cancelled by the user.`);
      }
    } catch (error: any) {
      let description = "No se pudo completar el inicio de sesión. Por favor, inténtalo de nuevo.";
      if (error.code === 'auth/popup-blocked') {
        description = "El navegador bloqueó la ventana emergente. Por favor, permite los popups para este sitio e inténtalo de nuevo.";
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        description = "Ya existe una cuenta con este email pero con un método de inicio de sesión diferente. Intenta acceder con el otro proveedor.";
      }
      toast({
        title: `Error de inicio de sesión con ${providerName}`,
        description: description,
        variant: 'destructive'
      });
    }
  };

  const loginWithGoogle = useCallback(() => handleLogin(() => signInWithGoogle(), 'Google'), [signInWithGoogle]);
  const loginWithFacebook = useCallback(() => handleLogin(() => signInWithFacebook(), 'Facebook'), [signInWithFacebook]);
  
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
