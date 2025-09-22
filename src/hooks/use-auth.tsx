
"use client";

import { createContext, useContext, type ReactNode, useCallback, useMemo, useEffect } from "react";
import { useSignInWithGoogle, useSignInWithFacebook, useSignOut, useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from "@/lib/firebase"; 
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import type { User as FirebaseUser } from "firebase/auth";
import { toast } from 'sonner';

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
  
  const updateUserProfile = async (user: FirebaseUser) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
    } else {
      await setDoc(userDocRef, {
        lastLogin: serverTimestamp(),
        displayName: user.displayName,
        photoURL: user.photoURL,
      }, { merge: true });
    }
  };

  useEffect(() => {
    if (firebaseUser) {
      updateUserProfile(firebaseUser);
    }
  }, [firebaseUser]);


  const handleLogin = async (loginFunction: () => Promise<any>): Promise<FirebaseUser | undefined> => {
    try {
        const userCredential = await loginFunction();
        if (userCredential?.user) {
           await updateUserProfile(userCredential.user);
           return userCredential.user;
        }
    } catch (e: any) {
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
    toast.success("Has cerrado sesión correctamente.");
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
