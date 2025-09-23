
"use client";

import { createContext, useContext, type ReactNode, useCallback, useMemo, useState, useEffect } from "react";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "@/lib/firebase"; 
import { signInWithRedirect, getRedirectResult, signOut, type User as FirebaseUser, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
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
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
  isProcessingLogin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  
  const [user, authLoading, authError] = useAuthState(auth);
  const [isProcessingLogin, setIsProcessingLogin] = useState(true); // Start as true

  // This effect runs when the user state changes (e.g., after login).
  // It ensures the player's profile exists in the database.
  useEffect(() => {
    if (user?.uid) {
      rankingManager.getPlayerRanking(
        user.uid,
        user.displayName,
        user.photoURL
      ).catch(error => {
        console.error("Error ensuring player profile exists:", error);
        toast.error("Hubo un problema al cargar tu perfil de jugador.");
      });
    }
  }, [user]);

  // This effect handles the result of the redirect.
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          toast.success("Has iniciado sesión correctamente.");
        }
      })
      .catch((error) => {
        toast.error(`Error al iniciar sesión`, {
          description: error.message || "Por favor, inténtalo de nuevo."
        });
        console.error("Login redirect failed:", error);
      })
      .finally(() => {
        setIsProcessingLogin(false);
      });
  }, []);
  
  const handleLoginWithRedirect = async (provider: GoogleAuthProvider | FacebookAuthProvider): Promise<void> => {
    setIsProcessingLogin(true);
    await signInWithRedirect(auth, provider);
  };

  const loginWithGoogle = useCallback(async () => {
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    await handleLoginWithRedirect(googleProvider);
  }, []);
  
  const loginWithFacebook = useCallback(async () => {
     const facebookProvider = new FacebookAuthProvider();
     facebookProvider.addScope('email');
     facebookProvider.setCustomParameters({ 'display': 'popup' });
     await handleLoginWithRedirect(facebookProvider);
  }, []);
  
  const handleLogout = useCallback(async () => {
    try {
        await signOut(auth);
        toast.success("Has cerrado sesión correctamente.");
    } catch (e: any) {
        toast.error("Error al cerrar sesión", { description: e.message });
    }
  }, []);
  
  const isLoading = authLoading || isProcessingLogin;
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
