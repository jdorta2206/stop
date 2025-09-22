'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, PartyPopper, Users } from 'lucide-react';
import type { CreateRoomOutput } from '@/app/api/create-room/route';


interface MultiplayerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MultiplayerDialog({ isOpen, onClose }: MultiplayerDialogProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { translate } = useLanguage();
  const { toast } = useToast();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');

  const handleCreateRoom = async () => {
    if (!user) {
      toast({ title: "Error", description: "Debes iniciar sesión para crear una sala.", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      const response = await fetch('/api/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creatorId: user.uid,
          creatorName: user.displayName ?? 'Jugador',
          creatorAvatar: user.photoURL ?? null
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            // If the response is not JSON, use the status text.
            throw new Error(response.statusText);
        }
        throw new Error(errorData.error || 'Failed to create room');
      }

      const newRoom = (await response.json()) as CreateRoomOutput;

      if (!newRoom || !newRoom.id) {
        throw new Error("API did not return a room ID.");
      }

      toast({
        title: translate('rooms.create.title'),
        description: `¡Sala creada con éxito! Código: ${newRoom.id}`,
      });
      router.push(`/multiplayer?roomId=${newRoom.id}`);
      onClose();
    } catch (error) {
      console.error("Error creating room via API route:", error);
      toast({
        title: translate('common.error'),
        description: `No se pudo crear la sala: ${(error as Error).message}`,
        variant: 'destructive',
      });
    } finally {
        setIsCreating(false);
    }
  };

  const handleJoinRoom = () => {
    if (!joinRoomId.trim()) {
      toast({
        title: "Código de Sala Vacío",
        description: "Por favor, introduce un código de sala para unirte.",
        variant: 'destructive',
      });
      return;
    }
    setIsJoining(true);
    router.push(`/multiplayer?roomId=${joinRoomId.trim().toUpperCase()}`);
    onClose();
    // No need to set isJoining to false, as the component will unmount on navigation
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <PartyPopper />
            {translate('landing.privateRoom')}
          </DialogTitle>
          <DialogDescription>
            Crea una sala para jugar con tus amigos o únete a una existente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Crear una nueva sala</h3>
            <Button onClick={handleCreateRoom} disabled={isCreating} className="w-full">
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear y unirme
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                O
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Unirse a una sala existente</h3>
            <div className="flex w-full items-center space-x-2">
              <Input
                placeholder="Introducir código de sala..."
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                className="uppercase"
              />
              <Button type="button" onClick={handleJoinRoom} disabled={isJoining} variant="secondary">
                {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
