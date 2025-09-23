
"use client";

import { createContext, useContext, type ReactNode, useCallback, useMemo, useState } from "react";
import { useAuthState, useSignOut } from 'react-firebase-hooks/auth';
import { auth, googleProvider, facebookProvider } from "@/lib/firebase"; 
import { signInWithPopup, type User as FirebaseUser, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
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
  const [signOut, signOutLoading, signOutError] = useSignOut(auth);
  const [isProcessingLogin, setIsProcessingLogin] = useState(false);
  
  const handleLogin = async (providerType: 'google' | 'facebook'): Promise<FirebaseUser | undefined> => {
    setIsProcessingLogin(true);
    let provider;
    if (providerType === 'google') {
      provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
    } else {
      provider = new FacebookAuthProvider();
      provider.addScope('email');
      provider.setCustomParameters({ 'display': 'popup' });
    }

    try {
        const userCredential = await signInWithPopup(auth, provider);
        if (userCredential?.user) {
           await rankingManager.getPlayerRanking(
               userCredential.user.uid,
               userCredential.user.displayName,
               userCredential.user.photoURL
            );
           return userCredential.user;
        }
        return undefined;
    } catch (e: any) {
       toast.error(`Error al iniciar sesión con ${providerType}`, {
         description: e.message || "Por favor, inténtalo de nuevo."
       });
       console.error(`Login failed with ${providerType}:`, e);
    } finally {
      setIsProcessingLogin(false);
    }
    return undefined;
  };

  const loginWithGoogle = useCallback(async () => {
    return await handleLogin('google');
  }, []);
  
  const loginWithFacebook = useCallback(async () => {
     return await handleLogin('facebook');
  }, []);
  
  const handleLogout = useCallback(async () => {
    try {
        await signOut();
        toast.success("Has cerrado sesión correctamente.");
    } catch (e: any) {
        toast.error("Error al cerrar sesión", { description: e.message });
    }
  }, [signOut]);
  
  const isLoading = authLoading || signOutLoading;
  const error = authError || signOutError;

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
