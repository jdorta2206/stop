
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { Language } from '@/contexts/language-context';
import { useLanguage } from '@/contexts/language-context';
import { Loader2 } from 'lucide-react';
import { createRoom, getRoom } from '@/lib/room-service';
import { useAuth } from '@/hooks/use-auth';

interface RoomManagerProps {
  language: Language;
}

export default function RoomManager({ language }: RoomManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth(); // Usamos el estado de carga de la autenticación
  const { translate } = useLanguage(); 
  
  const [activeTab, setActiveTab] = useState('create');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false); // Estado de carga para las acciones
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (createdRoomId) {
      router.push(`/room/${createdRoomId}`);
    }
  }, [createdRoomId, router]);
  
  const handleCreateRoom = async () => {
    if (!user) {
        toast({ title: "Acción requerida", description: "Debes iniciar sesión para crear una sala.", variant: "destructive"});
        return;
    }
    setIsActionLoading(true);
    try {
      const newRoom = await createRoom(user.uid, user.name || 'Anfitrión');
      toast({
        title: translate('rooms.create.title'),
        description: translate('rooms.create.description', { roomId: newRoom.id }),
      });
      setCreatedRoomId(newRoom.id);
    } catch (error) {
       toast({
        title: "Error al crear la sala",
        description: (error as Error).message,
        variant: "destructive"
       });
       setIsActionLoading(false); // Restablecer en caso de error
    }
    // No establecemos setIsActionLoading a false aquí porque la redirección se encargará
  };

  const handleJoinRoom = async () => {
    if (!user) {
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
            router.push(`/room/${roomId}`);
        } else {
            toast({ title: "Error", description: "La sala no existe o el ID es incorrecto.", variant: "destructive" });
            setIsActionLoading(false);
        }
    } catch (error) {
        toast({ title: "Error al unirse a la sala", description: (error as Error).message, variant: "destructive"});
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
