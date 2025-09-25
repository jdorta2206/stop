
"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogIn, Loader2 } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { UserAccount } from './UserAccount';

export function AuthStatus() {
  const { data: session, status } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted || status === 'loading') {
    return (
      <Button variant="secondary" className="rounded-md" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Cargando...
      </Button>
    );
  }

  if (session) {
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
