
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import type { Language } from '@/contexts/language-context';
import { useLanguage } from '@/contexts/language-context';
import { Loader2 } from 'lucide-react';
import { createRoom, getRoom, addPlayerToRoom } from '@/lib/room-service';
import { useAuth } from '@/hooks/use-auth';

interface RoomManagerProps {
  language: Language;
}

export default function RoomManager({ language }: RoomManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { translate } = useLanguage() as { translate: (key: string, params?: { [key: string]: string | number }) => string };
  
  const [activeTab, setActiveTab] = useState('create');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!user || !user.displayName) {
        toast({ title: "Acción requerida", description: "Debes iniciar sesión y tener un nombre de usuario para crear una sala.", variant: "destructive"});
        return;
    }
    setIsActionLoading(true);
    try {
      const newRoom = await createRoom(user.uid, user.displayName);
      toast({
        title: translate('rooms.create.title'),
        description: `Sala creada con ID: ${newRoom.id}. Redirigiendo...`,
      });
      router.push(`/multiplayer?roomId=${newRoom.id}`);
    } catch (error) {
       toast({
        title: "Error al crear la sala",
        description: (error as Error).message,
        variant: "destructive"
       });
    } finally {
        setIsActionLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!user || !user.displayName) {
        toast({ title: "Acción requerida", description: "Debes iniciar sesión para unirte a una sala.", variant: "destructive"});
        return;
    }
    const roomId = joinRoomId.trim().toUpperCase();
    if (!roomId) {
      toast({
        title: translate('notifications.emptyRoomId.title'),
        description: translate('notifications.emptyRoomId.description'),
        variant: 'destructive',
      });
      return;
    }
    setIsActionLoading(true);
    try {
        const roomExists = await getRoom(roomId);
        if (roomExists) {
            await addPlayerToRoom(roomId, user.uid, user.displayName, user.photoURL || null);
            toast({
              title: "Sala encontrada",
              description: `Uniéndote a la sala ${roomId}...`,
            });
            router.push(`/multiplayer?roomId=${roomId}`);
        } else {
            toast({ title: "Error", description: "La sala no existe o el ID es incorrecto.", variant: "destructive" });
        }
    } catch (error) {
        toast({ title: "Error al unirse a la sala", description: (error as Error).message, variant: "destructive"});
    } finally {
        setIsActionLoading(false);
    }
  };
  
  const isLoading = isAuthLoading || isActionLoading;

  return (
    <div className="p-1">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">{translate('rooms.buttons.create')}</TabsTrigger>
          <TabsTrigger value="join">{translate('rooms.buttons.join')}</TabsTrigger>
        </TabsList>
        <TabsContent value="create" className="mt-4 space-y-4">
          <Button onClick={handleCreateRoom} disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {translate('rooms.buttons.create')}
          </Button>
          {!user && !isAuthLoading && (
              <p className="text-xs text-center text-muted-foreground">Debes iniciar sesión para crear una sala.</p>
          )}
        </TabsContent>
        <TabsContent value="join" className="mt-4 space-y-4">
          <div>
            <label htmlFor="roomId" className="sr-only">{translate('rooms.labels.roomId')}</label>
            <Input
              id="roomId"
              placeholder={translate('rooms.labels.roomIdPlaceholder')}
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              className="text-center text-lg uppercase"
              maxLength={6}
            />
          </div>
          <Button onClick={handleJoinRoom} disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {translate('rooms.buttons.join')}
          </Button>
           {!user && !isAuthLoading && (
              <p className="text-xs text-center text-muted-foreground">Debes iniciar sesión para unirte a una sala.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
