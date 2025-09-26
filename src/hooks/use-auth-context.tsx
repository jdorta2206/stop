"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { rankingManager } from '@/lib/ranking';

// Define the shape of our user object, extending Firebase's User
export interface AppUser extends User {
  id: string; 
  totalScore?: number;
  level?: string;
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

  useEffect(() => {
    if (user) {
      const enrichedUser: AppUser = {
        ...user,
        id: user.uid,
      };
      setAppUser(enrichedUser);
    } else {
      setAppUser(null);
    }
  }, [user]);

  const value = {
    user: appUser,
    loading: loading,
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
