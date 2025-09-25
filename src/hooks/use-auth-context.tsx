"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase-config';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { rankingManager } from '@/lib/ranking';

// Define the shape of our user object, extending Firebase's User
export interface AppUser extends User {
  id: string; // Add a consistent id field
  totalScore?: number;
  level?: string;
  photoURL?: string | null;
}

// Define the context value shape
interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  error?: Error;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, loading, error] = useAuthState(auth);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processUser = async () => {
      if (user) {
        // Use the rankingManager to get or create the player profile
        const playerData = await rankingManager.getPlayerRanking(user.uid, user.displayName, user.photoURL);
        
        const enrichedUser: AppUser = {
          ...user,
          id: user.uid,
          totalScore: playerData.totalScore,
          level: playerData.level,
          photoURL: playerData.photoURL,
        };
        setAppUser(enrichedUser);
      } else {
        setAppUser(null);
      }
      setIsProcessing(false);
    };

    processUser();
  }, [user]);

  const value = {
    user: appUser,
    loading: loading || isProcessing,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Create a custom hook for easy access to the context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
