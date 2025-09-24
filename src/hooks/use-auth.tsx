"use client";

import { createContext, useContext, type ReactNode, useCallback, useMemo, useState, useEffect } from "react";
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth, signInWithPopup, signOut, type User as FirebaseUser, GoogleAuthProvider, FacebookAuthProvider, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase-config"; 
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

// Initialize Firebase Auth once
const auth = getAuth(app);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, authLoading, authError] = useAuthState(auth);
  const [isProcessingLogin, setIsProcessingLogin] = useState(false);

  useEffect(() => {
    // This listener handles user state changes and profile creation/check
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await rankingManager.getPlayerRanking(
            user.uid,
            user.displayName,
            user.photoURL
          );
        } catch (error) {
           console.error("Error ensuring player profile exists:", error);
           toast.error("Hubo un problema al cargar tu perfil de jugador.");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider): Promise<void> => {
    setIsProcessingLogin(true);
    try {
        await signInWithPopup(auth, provider);
        toast.success("Has iniciado sesión correctamente.");
    } catch (error: any) {
        console.error("Popup login failed:", error);
        
        let title = "Error al iniciar sesión";
        let description = error.message || "Por favor, inténtalo de nuevo.";

        if(error.code === 'auth/unauthorized-domain') {
            title = "Dominio no autorizado";
            description = "El dominio de esta aplicación no está autorizado para la autenticación. Revisa la configuración de Firebase.";
        } else if (error.code === 'auth/popup-closed-by-user') {
            title = "Inicio de sesión cancelado";
            description = "Has cerrado la ventana de inicio de sesión.";
        }
        
        toast.error(title, { description });
    } finally {
        setIsProcessingLogin(false);
    }
  };
  
  const loginWithGoogle = useCallback(async () => {
    const googleProvider = new GoogleAuthProvider();
    await handleLogin(googleProvider);
  }, []);
  
  const loginWithFacebook = useCallback(async () => {
     const facebookProvider = new FacebookAuthProvider();
     await handleLogin(facebookProvider);
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

  const value = useMemo(() => ({
    user: user,
    isLoading,
    error: authError || null,
    loginWithGoogle,
    loginWithFacebook,
    logout: handleLogout,
    isProcessingLogin,
  }), [user, isLoading, authError, loginWithGoogle, loginWithFacebook, handleLogout, isProcessingLogin]);

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
