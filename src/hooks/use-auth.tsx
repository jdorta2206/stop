"use client";

import { createContext, useContext, type ReactNode, useCallback, useMemo, useState } from "react";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "@/lib/firebase"; 
import { signInWithPopup, signOut, type User as FirebaseUser, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { toast } from 'sonner';
import { rankingManager } from "@/lib/ranking";

export interface AppUser extends FirebaseUser {
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
  isProcessingLogin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  
  const [user, authLoading, authError] = useAuthState(auth);
  const [isProcessingLogin, setIsProcessingLogin] = useState(false);
  
  const handleLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider, providerName: string): Promise<FirebaseUser | undefined> => {
    setIsProcessingLogin(true);
    try {
        const userCredential = await signInWithPopup(auth, provider);
        if (userCredential?.user) {
           await rankingManager.getPlayerRanking(
               userCredential.user.uid,
               userCredential.user.displayName,
               userCredential.user.photoURL
            );
           toast.success("Has iniciado sesión correctamente.");
           return userCredential.user;
        }
        return undefined;
    } catch (e: any) {
       toast.error(`Error al iniciar sesión con ${providerName}`, {
         description: e.message || "Por favor, inténtalo de nuevo."
       });
       console.error(`Login failed with ${providerName}:`, e);
    } finally {
      setIsProcessingLogin(false);
    }
    return undefined;
  };

  const loginWithGoogle = useCallback(async () => {
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    return await handleLogin(googleProvider, 'Google');
  }, []);
  
  const loginWithFacebook = useCallback(async () => {
     const facebookProvider = new FacebookAuthProvider();
     facebookProvider.addScope('email');
     facebookProvider.setCustomParameters({ 'display': 'popup' });
     return await handleLogin(facebookProvider, 'Facebook');
  }, []);
  
  const handleLogout = useCallback(async () => {
    try {
        await signOut(auth);
        toast.success("Has cerrado sesión correctamente.");
    } catch (e: any) {
        toast.error("Error al cerrar sesión", { description: e.message });
    }
  }, []);
  
  const isLoading = authLoading;
  const error = authError;

  const value = useMemo(() => ({
    user: user,
    isLoading,
    error: error || null,
    loginWithGoogle,
    loginWithFacebook,
    logout: handleLogout,
    isProcessingLogin,
  }), [user, isLoading, error, loginWithGoogle, loginWithFacebook, handleLogout, isProcessingLogin]);

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
