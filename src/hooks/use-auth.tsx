
"use client";

import { createContext, useContext, type ReactNode, useCallback, useMemo, useEffect, useState } from "react";
import { useSignInWithGoogle, useSignInWithFacebook, useSignOut, useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "@/lib/firebase"; 
import type { User as FirebaseUser } from "firebase/auth";
import { rankingManager, type PlayerScore } from "@/lib/ranking";
import { useToast } from "@/components/ui/use-toast";

// App's user object, combining Firebase Auth data and Firestore profile data.
export interface User extends FirebaseUser, Partial<PlayerScore> {}

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
  
  // Base Firebase auth state
  const [firebaseUser, authLoading, authError] = useAuthState(auth);
  
  // Sign-in method hooks
  const [signInWithGoogle, , googleLoading, googleError] = useSignInWithGoogle(auth);
  const [signInWithFacebook, , facebookLoading, facebookError] = useSignInWithFacebook(auth);
  const [signOut, signOutLoading, signOutError] = useSignOut(auth);

  // App-level state
  const [appUser, setAppUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);

  // Sync Firebase user with Firestore profile
  useEffect(() => {
    const syncUserProfile = async () => {
      if (authLoading) {
        // Still waiting for firebase auth to initialize
        return;
      }
      
      setIsSyncing(true);
      if (!firebaseUser) {
        setAppUser(null);
        setIsSyncing(false);
        return;
      }

      // User is authenticated with Firebase, now get/create our app profile
      try {
        const playerProfile = await rankingManager.getPlayerRanking(
          firebaseUser.uid, 
          firebaseUser.displayName, 
          firebaseUser.photoURL
        );
        setAppUser({ ...firebaseUser, ...playerProfile });
      } catch (error) {
        console.error("Error syncing user profile:", error);
        toast({ title: "Error de perfil", description: "No se pudo cargar tu perfil de jugador.", variant: "destructive" });
        await signOut(); // Log out if profile sync fails
      } finally {
        setIsSyncing(false);
      }
    };

    syncUserProfile();
  }, [firebaseUser, authLoading, signOut, toast]);


  const handleLogin = async (loginFunction: () => Promise<any>) => {
    try {
        const userCredential = await loginFunction();
        if (userCredential?.user) {
            toast({
                title: "¡Bienvenido/a!",
                description: `Has iniciado sesión como ${userCredential.user.displayName || 'Jugador'}.`,
            });
            // The useEffect above will handle profile syncing
        } else if (!googleError && !facebookError) {
             // Handle cases where the user closes the popup
            toast({ title: "Inicio de sesión cancelado", description: "No has completado el inicio de sesión.", variant: 'default' });
        }
    } catch (e) {
      // Errors are already handled by the hook's error state
    }
  };

  const loginWithGoogle = useCallback(async () => {
    await handleLogin(signInWithGoogle);
  }, [signInWithGoogle]);
  
  const loginWithFacebook = useCallback(async () => {
    await handleLogin(signInWithFacebook);
  }, [signInWithFacebook]);
  
  const handleLogout = useCallback(async () => {
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
