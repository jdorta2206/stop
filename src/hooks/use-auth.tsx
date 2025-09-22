
"use client";

import { createContext, useContext, type ReactNode, useCallback, useMemo } from "react";
import { useSignInWithGoogle, useSignInWithFacebook, useSignOut, useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "@/lib/firebase"; 
import type { User as FirebaseUser } from "firebase/auth";
import { toast } from "@/components/ui/use-toast";

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
  
  const handleLogin = async (loginFunction: () => Promise<any>): Promise<FirebaseUser | undefined> => {
    try {
        const userCredential = await loginFunction();
        if (userCredential?.user) {
           return userCredential.user;
        }
    } catch (e: any) {
       // El error ya se muestra en el modal, no es necesario un toast aquí.
       console.error("Login failed:", e);
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
    toast.success("Has cerrado sesión correctamente.", { title: "Sesión cerrada" });
  }, [signOut]);
  
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
