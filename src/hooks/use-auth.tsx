
"use client";

import { createContext, useContext, type ReactNode, useCallback, useMemo } from "react";
import { useSignInWithGoogle, useSignInWithFacebook, useSignOut, useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "@/lib/firebase"; 
import type { User as FirebaseUser } from "firebase/auth";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  
  const [firebaseUser, authLoading, authError] = useAuthState(auth);
  
  const [signInWithGoogle, , googleLoading, googleError] = useSignInWithGoogle(auth);
  const [signInWithFacebook, , facebookLoading, facebookError] = useSignInWithFacebook(auth);
  const [signOut, signOutLoading, signOutError] = useSignOut(auth);
  
  const handleLogin = async (loginFunction: () => Promise<any>): Promise<FirebaseUser | undefined> => {
    try {
        const userCredential = await loginFunction();
        if (userCredential?.user) {
           toast({ title: "¡Bienvenido!", description: "Has iniciado sesión correctamente." });
           return userCredential.user;
        }
    } catch (e: any) {
       toast({ title: "Error de inicio de sesión", description: e.message, variant: 'destructive' });
    }
    return undefined;
  };

  const loginWithGoogle = useCallback(async () => {
    return await handleLogin(signInWithGoogle);
  }, [signInWithGoogle]);
  
  const loginWithFacebook = useCallback(async () => {
     return await handleLogin(signInWithFacebook);
  }, [signInWithFacebook]);
  
  const handleLogout = useCallback(async () => {
    await signOut();
    toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente." });
  }, [signOut, toast]);
  
  const isLoading = authLoading || googleLoading || facebookLoading || signOutLoading;
  const error = authError || googleError || facebookError || signOutError;

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
