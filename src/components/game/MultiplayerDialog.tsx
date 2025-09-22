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
import { createRoom, getRoom } from '@/lib/room-service';


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
      const newRoom = await createRoom({
        creatorId: user.uid,
        creatorName: user.displayName,
        creatorAvatar: user.photoURL
      });

      if (!newRoom || !newRoom.id) {
        throw new Error("La función no devolvió un ID de sala.");
      }

      toast({
        title: translate('rooms.create.title'),
        description: `¡Sala creada con éxito! Código: ${newRoom.id}`,
      });
      router.push(`/multiplayer?roomId=${newRoom.id}`);
      onClose();
    } catch (error) {
      console.error("Error creating room:", error);
      toast({
        title: translate('common.error'),
        description: `No se pudo crear la sala: ${(error as Error).message}`,
        variant: 'destructive',
      });
    } finally {
        setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    const roomIdToJoin = joinRoomId.trim().toUpperCase();
    if (!roomIdToJoin) {
      toast({
        title: "Código de Sala Vacío",
        description: "Por favor, introduce un código de sala para unirte.",
        variant: 'destructive',
      });
      return;
    }
    setIsJoining(true);
    try {
        const roomExists = await getRoom(roomIdToJoin);
        if (roomExists) {
            router.push(`/multiplayer?roomId=${roomIdToJoin}`);
            onClose();
        } else {
            toast({
                title: "Sala no encontrada",
                description: "No se encontró ninguna sala con ese código. Verifica que sea correcto.",
                variant: "destructive"
            });
        }
    } catch (error) {
         toast({
            title: "Error al unirse a la sala",
            description: (error as Error).message,
            variant: "destructive"
        });
    } finally {
        setIsJoining(false);
    }
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
              />
              <Button type="button" onClick={handleJoinRoom} disabled={isJoining || !joinRoomId.trim()} variant="secondary">
                {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
