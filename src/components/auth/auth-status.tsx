
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LogIn, Loader2 } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { UserAccount } from './UserAccount';


export function AuthStatus() {
  const { user, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return (
      <Button variant="secondary" className="rounded-md" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Cargando...
      </Button>
    );
  }

  if (isLoading) {
    return (
      <Button variant="secondary" className="rounded-md" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Cargando...
      </Button>
    );
  }

  if (user) {
    return <UserAccount />;
  }

  return (
    <>
      <Button variant="secondary" className="rounded-md" onClick={() => setIsAuthModalOpen(true)}>
        <LogIn className="mr-2 h-4 w-4" />
        Acceder
      </Button>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
