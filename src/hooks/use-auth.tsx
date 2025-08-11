
"use client";

import { createContext, useContext, type ReactNode, useCallback, useMemo, useEffect, useState } from "react";
import { useSignInWithGoogle, useSignInWithFacebook, useSignOut, useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "@/lib/firebase"; 
import type { User as FirebaseUser } from "firebase/auth";
import { rankingManager } from "@/lib/ranking";
import { useToast } from "@/components/ui/use-toast";

// Simplified User object, directly from Firebase Auth
export interface User {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
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
  
  // Firebase hooks for auth state and providers
  const [firebaseUser, authLoading, authError] = useAuthState(auth);
  const [signInWithGoogle, , googleLoading, googleError] = useSignInWithGoogle(auth);
  const [signInWithFacebook, , facebookLoading, facebookError] = useSignInWithFacebook(auth);
  const [signOut, signOutLoading, signOutError] = useSignOut(auth);

  const handleSuccessfulLogin = useCallback(async (fbUser: FirebaseUser) => {
    try {
      // Ensure user profile exists in Firestore
      await rankingManager.getPlayerRanking(
        fbUser.uid, 
        fbUser.displayName, 
        fbUser.photoURL
      );
      toast({
        title: "¡Bienvenido/a!",
        description: `Has iniciado sesión como ${fbUser.displayName || 'Jugador'}.`,
      });
    } catch (error) {
      console.error("Error creating/syncing user profile:", error);
      toast({ title: "Error de perfil", description: "No se pudo cargar tu perfil de jugador.", variant: "destructive" });
      await signOut(); // Log out if profile sync fails
    }
  }, [toast, signOut]);

  const loginWithGoogle = useCallback(async () => {
    try {
      const userCredential = await signInWithGoogle();
      if (userCredential) {
        await handleSuccessfulLogin(userCredential.user);
      }
    } catch (e) {
      // Error is already captured by the hook
    }
  }, [signInWithGoogle, handleSuccessfulLogin]);
  
  const loginWithFacebook = useCallback(async () => {
     try {
      const userCredential = await signInWithFacebook();
      if (userCredential) {
        await handleSuccessfulLogin(userCredential.user);
      }
    } catch (e) {
       // Error is already captured by the hook
    }
  }, [signInWithFacebook, handleSuccessfulLogin]);
  
  const handleLogout = useCallback(async () => {
    await signOut();
    toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente." });
  }, [signOut, toast]);
  
  // The user object for the app is now a simplified version of the Firebase user
  const appUser = firebaseUser ? {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
  } : null;

  // Combine all loading states into one
  const isLoading = authLoading || googleLoading || facebookLoading || signOutLoading;
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
