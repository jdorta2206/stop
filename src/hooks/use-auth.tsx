
"use client";

import { createContext, useContext, type ReactNode, useCallback, useMemo, useEffect, useState } from "react";
import { useSignInWithGoogle, useSignInWithFacebook, useSignOut, useAuthState } from 'react-firebase-hooks/auth';
import { auth } from "@/lib/firebase"; 
import type { User as FirebaseUser } from "firebase/auth";
import { rankingManager, type PlayerScore } from "@/lib/ranking";
import { useToast } from "@/components/ui/use-toast";

// This will be our app's user object, combining Firebase Auth and our Firestore profile data.
export interface User extends FirebaseUser, PlayerScore {}

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

  const [appUser, setAppUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(true); // Start as true to handle initial load

  // This function syncs the Firebase user with our Firestore player profile.
  const syncUserProfile = useCallback(async (fbUser: FirebaseUser | null) => {
    setIsSyncing(true);
    if (!fbUser) {
        setAppUser(null);
        setIsSyncing(false);
        return;
    }
    try {
      // Get or create the player profile from our ranking manager.
      const playerProfile = await rankingManager.getPlayerRanking(
        fbUser.uid, 
        fbUser.displayName, 
        fbUser.photoURL
      );
      
      // Combine Firebase auth data and Firestore profile data into one user object.
      setAppUser({ ...fbUser, ...playerProfile });

    } catch (error) {
      console.error("Error syncing user profile:", error);
      toast({ title: "Error de perfil", description: "No se pudo cargar tu perfil de jugador.", variant: "destructive" });
      await signOut(); // Log out if profile sync fails
    } finally {
      setIsSyncing(false);
    }
  }, [toast, signOut]);
  
  // This effect triggers the profile sync when the firebase user changes.
  useEffect(() => {
      syncUserProfile(firebaseUser);
  }, [firebaseUser, syncUserProfile]);


  const handleLoginSuccess = useCallback(async (userCredential?: { user: FirebaseUser }) => {
    if (userCredential?.user) {
      toast({
        title: "¡Bienvenido/a!",
        description: `Has iniciado sesión como ${userCredential.user.displayName || 'Jugador'}.`,
      });
      // The useEffect will handle the profile sync automatically.
    }
  }, [toast]);

  const loginWithGoogle = useCallback(async () => {
    const cred = await signInWithGoogle();
    await handleLoginSuccess(cred);
  }, [signInWithGoogle, handleLoginSuccess]);
  
  const loginWithFacebook = useCallback(async () => {
    const cred = await signInWithFacebook();
    await handleLoginSuccess(cred);
  }, [signInWithFacebook, handleLoginSuccess]);
  
  const handleLogout = useCallback(async () => {
    await signOut();
    toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente." });
  }, [signOut, toast]);
  
  // Combine all loading states into one for a simpler loading indicator.
  const isLoading = authLoading || googleLoading || facebookLoading || signOutLoading || isSyncing;
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
