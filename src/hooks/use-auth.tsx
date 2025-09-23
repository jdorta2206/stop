
"use client";

import { createContext, useContext, type ReactNode, useCallback, useMemo, useState, useEffect } from "react";
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth, signInWithPopup, getRedirectResult, signOut, type User as FirebaseUser, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { app } from "@/lib/firebase"; 
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
  const auth = getAuth(app);
  const [user, authLoading, authError] = useAuthState(auth);
  const [isProcessingLogin, setIsProcessingLogin] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      try {
        const result = await getRedirectResult(getAuth(app));
        if (result) {
           toast.success("Has iniciado sesión correctamente.");
        }
      } catch (error: any) {
        console.error("Redirect login failed:", error);
         toast.error(`Error al iniciar sesión`, {
            description: error.code === 'auth/popup-closed-by-user' 
                ? 'La ventana de inicio de sesión fue cerrada.' 
                : error.message || "Por favor, inténtalo de nuevo."
        });
      } finally {
        setIsProcessingLogin(false);
      }
    };
    checkUser();
  }, []);

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

  const handleLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider): Promise<void> => {
    setIsProcessingLogin(true);
    try {
      await signInWithPopup(getAuth(app), provider);
      toast.success("Has iniciado sesión correctamente.");
    } catch (error: any) {
      console.error("Popup login failed:", error);
      toast.error(`Error al iniciar sesión`, {
        description: error.code === 'auth/popup-closed-by-user' 
            ? 'La ventana de inicio de sesión fue cerrada.' 
            : error.message || "Por favor, inténtalo de nuevo."
      });
    } finally {
        setIsProcessingLogin(false);
    }
  };
  
  const loginWithGoogle = useCallback(async () => {
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    await handleLogin(googleProvider);
  }, []);
  
  const loginWithFacebook = useCallback(async () => {
     const facebookProvider = new FacebookAuthProvider();
     facebookProvider.addScope('email');
     facebookProvider.setCustomParameters({ 'display': 'popup' });
     await handleLogin(facebookProvider);
  }, []);
  
  const handleLogout = useCallback(async () => {
    try {
        await signOut(getAuth(app));
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
