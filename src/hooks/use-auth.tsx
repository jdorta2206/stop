
"use client";

import { createContext, useContext, type ReactNode, useCallback, useMemo } from "react";
import { useSignInWithGoogle, useSignInWithFacebook, useSignOut, useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "@/lib/firebase"; 
import type { User as FirebaseUser } from "firebase/auth";
import { toast } from 'sonner';

// AppUser se usará en otras partes de la app, pero el hook solo expone FirebaseUser
export interface AppUser extends FirebaseUser {
  // Campos del perfil de la base de datos que se pueden añadir
  totalScore?: number;
  level?: string;
}

interface AuthContextType {
  user: FirebaseUser | null | undefined;
  isLoading: boolean;
  error?: Error | null;
  loginWithGoogle: () => Promise<FirebaseUser | undefined>;
  loginWithFacebook: () => Promise<FirebaseUser | undefined>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  
  const [firebaseUser, authLoading, authError] = useAuthState(auth);
  
  const [signInWithGoogle, , googleLoading, googleError] = useSignInWithGoogle(auth);
  const [signInWithFacebook, , facebookLoading, facebookError] = useSignInWithFacebook(auth);
  const [signOut, signOutLoading, signOutError] = useSignOut(auth);
  
  const handleLogin = async (loginFunction: () => Promise<any>, providerName: string): Promise<FirebaseUser | undefined> => {
    try {
        const userCredential = await loginFunction();
        if (userCredential?.user) {
           return userCredential.user;
        }
        // Si no hay userCredential, puede que el usuario haya cerrado la ventana emergente
        return undefined;
    } catch (e: any) {
       toast.error(`Error al iniciar sesión con ${providerName}`, {
         description: e.message || "Por favor, inténtalo de nuevo."
       });
       console.error(`Login failed with ${providerName}:`, e);
    }
    return undefined;
  };

  const loginWithGoogle = useCallback(async () => {
    return await handleLogin(signInWithGoogle, "Google");
  }, [signInWithGoogle]);
  
  const loginWithFacebook = useCallback(async () => {
     return await handleLogin(signInWithFacebook, "Facebook");
  }, [signInWithFacebook]);
  
  const handleLogout = useCallback(async () => {
    try {
        await signOut();
        toast.success("Has cerrado sesión correctamente.");
    } catch (e: any) {
        toast.error("Error al cerrar sesión", { description: e.message });
    }
  }, [signOut]);
  
  // Simplificamos el estado de carga y error. Solo nos importa el estado general
  const isLoading = authLoading || googleLoading || facebookLoading || signOutLoading;
  const error = authError || signOutError; // Los errores de login se manejan con toasts

  const value = useMemo(() => ({
    user: firebaseUser,
    isLoading,
    error: error || null,
    loginWithGoogle,
    loginWithFacebook,
    logout: handleLogout,
  }), [firebaseUser, isLoading, error, loginWithGoogle, loginWithFacebook, handleLogout]);

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
