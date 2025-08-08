
"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth'; // Ruta actualizada
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, UserCircle, Loader2 } from 'lucide-react';
import { AuthModal } from './AuthModal';

export function AuthStatus() {
  const { user, isLoading, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled className="rounded-full">
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    );
  }

  if (user) {
    const displayName = user.name || "Usuario";
    const avatarUrl = user.photoURL;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={displayName} />
              ) : null}
              <AvatarFallback>
                {displayName ? displayName.charAt(0).toUpperCase() : <UserCircle className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {displayName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email || "Sin email"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button variant="outline" className="rounded-md" onClick={() => setIsAuthModalOpen(true)}>
        <LogIn className="mr-2 h-4 w-4" />
        Acceder
      </Button>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
