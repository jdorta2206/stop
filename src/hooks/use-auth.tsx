
"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import type { Session } from "next-auth";

// This is the user object you'll get from `useSession`.
// You can add your own properties to it if you need to.
type AppUser = Session["user"] & {
  id?: string;
  totalScore?: number;
  level?: string;
};

interface CustomSession extends Session {
  user?: AppUser;
}

interface AuthContextType {
  user: AppUser | null;
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
  const { data: session, status } = useSession();
  
  const isLoading = status === 'loading';
  const user = session?.user || null;

  const loginWithGoogle = async () => {
    await signIn('google');
  };

  const loginWithFacebook = async () => {
    await signIn('facebook');
  };

  const logout = async () => {
    await signOut();
  };

  const contextValue: AuthContextType = {
    user: user as AppUser | null,
    isLoading,
    error: undefined, // Error handling can be improved if needed
    loginWithGoogle,
    loginWithFacebook,
    logout,
    isProcessingLogin: isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This allows components to work even without the full AuthProvider context,
    // useful for components that might be used outside the main app layout.
    // They will just report no user and loading=false.
    // A more strict approach would be to throw an error.
    return { 
        user: null, 
        isLoading: false, 
        error: null,
        loginWithGoogle: async () => console.error("AuthProvider not found"),
        loginWithFacebook: async () => console.error("AuthProvider not found"),
        logout: async () => console.error("AuthProvider not found"),
        isProcessingLogin: false,
    };
  }
  return context;
}
