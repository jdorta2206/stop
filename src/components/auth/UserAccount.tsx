
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";

export function UserAccount() {
  const { user, logout } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !user) {
    // Retorna un placeholder o null para evitar el renderizado en servidor que cause mismatch
    return (
        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
    );
  }
  
  const fallbackContent = user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon />;
  const finalAvatarUrl = user.photoURL || '';

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={finalAvatarUrl} alt={user.displayName || 'User'} />
                    <AvatarFallback>
                      {fallbackContent}
                    </AvatarFallback>
                </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'Usuario sin nombre'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email || 'Sin email'}</p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );
}
