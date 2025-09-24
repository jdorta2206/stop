
"use client";

// Force re-build
import { createContext, useContext, type ReactNode, useCallback, useMemo, useState, useEffect } from "react";
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth, signInWithPopup, getRedirectResult, signOut, type User as FirebaseUser, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
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

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = getAuth(app);
  const [user, authLoading, authError] = useAuthState(auth);
  const [isProcessingLogin, setIsProcessingLogin] = useState(true);

  useEffect(() => {
    const checkRedirectResult = async () => {
      if (isProcessingLogin) {
        try {
          await getRedirectResult(auth);
        } catch (error: any) {
           let title = "Error al iniciar sesión";
           let description = error.message || "Por favor, inténtalo de nuevo.";

           if (error.code === 'auth/unauthorized-domain') {
              title = "Dominio no autorizado";
              description = "El dominio de esta aplicación no está autorizado para la autenticación. Revisa la configuración de Firebase.";
           }
           toast.error(title, { description });
        } finally {
          setIsProcessingLogin(false);
        }
      }
    };
    if (!authLoading) {
      checkRedirectResult();
    } else {
       setIsProcessingLogin(false);
    }
  }, [auth, authLoading]);

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
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    await handleLogin(googleProvider);
  }, [auth]);
  
  const loginWithFacebook = useCallback(async () => {
     const facebookProvider = new FacebookAuthProvider();
     facebookProvider.addScope('email');
     facebookProvider.setCustomParameters({ 'display': 'popup' });
     await handleLogin(facebookProvider);
  }, [auth]);
  
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
