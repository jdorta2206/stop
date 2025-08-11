
"use client";

import { createContext, useContext, type ReactNode, useCallback, useMemo, useEffect, useState } from "react";
import { useSignInWithGoogle, useSignInWithFacebook, useSignOut, useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "@/lib/firebase"; 
import type { User as FirebaseUser } from "firebase/auth";
import { rankingManager, type PlayerScore } from "@/lib/ranking";
import { useToast } from "@/components/ui/use-toast";

// Renombramos la interfaz para evitar colisiones con el tipo User de Firebase
export interface AppUser extends FirebaseUser, Partial<PlayerScore> {}

interface AuthContextType {
  user: AppUser | null;
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

  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const syncUserProfile = async () => {
      if (!firebaseUser) {
        setAppUser(null);
        return;
      }
      
      // Evitar resincronización innecesaria
      if (appUser && appUser.uid === firebaseUser.uid) {
        return;
      }

      setIsSyncing(true);
      try {
        const playerProfile = await rankingManager.getPlayerRanking(
          firebaseUser.uid, 
          firebaseUser.displayName, 
          firebaseUser.photoURL
        );
        // Combinamos la información de Firebase Auth con el perfil de la base de datos
        setAppUser({ ...firebaseUser, ...playerProfile });
      } catch (error) {
        console.error("Error syncing user profile:", error);
        toast({ title: "Error de perfil", description: "No se pudo cargar tu perfil de jugador.", variant: "destructive" });
        await signOut();
        setAppUser(null);
      } finally {
        setIsSyncing(false);
      }
    };
    
    // Solo sincronizar si hay un usuario de Firebase
    if (!authLoading) {
      syncUserProfile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser, authLoading]);


  const handleLogin = async (loginFunction: () => Promise<any>) => {
    try {
        await loginFunction();
        // El useEffect se encargará de la sincronización al detectar el cambio en firebaseUser
    } catch (e) {
      // Los errores ya son manejados por los hooks
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
