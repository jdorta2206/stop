
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  Settings, _marker
  Share2, 
  Lock, 
  Unlock,
  UserX,
  LogOut,
  Play,
  Loader2,
  Crown
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { onRoomUpdate, updatePlayerInRoom, updateRoomSettings, removePlayerFromRoom, type Player, type Room } from '@/lib/room-service';
import type { Language } from '@/contexts/language-context';
import ContactsManager from './ContactsManager';

interface EnhancedRoomManagerProps {
  roomId: string;
  currentUserId: string;
  onLeaveRoom: () => void;
  onStartGame: () => void;
}

export default function EnhancedRoomManager({ 
  roomId, 
  currentUserId, 
  onLeaveRoom, 
  onStartGame 
}: EnhancedRoomManagerProps) {
  const { toast } = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showContacts, setShowContacts] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    
    const unsubscribe = onRoomUpdate(roomId, (updatedRoom) => {
      if (updatedRoom) {
        setRoom(updatedRoom);
        setPlayers(Object.values(updatedRoom.players || {}));
      } else {
        toast({ title: 'Error', description: 'La sala ya no existe o fue eliminada.', variant: 'destructive' });
        onLeaveRoom();
      }
    });

    return () => unsubscribe();
  }, [roomId, onLeaveRoom, toast]);

  const currentPlayer = players.find(p => p.id === currentUserId);
  const isHost = room?.hostId === currentUserId;
  const readyPlayersCount = players.filter(p => p.isReady).length;
  // Game can start if host is ready and at least 2 players total are ready
  const canStartGame = isHost && readyPlayersCount >= 2;

  const handleToggleReady = async () => {
    if (!currentPlayer) return;
    try {
      await updatePlayerInRoom(roomId, currentUserId, { isReady: !currentPlayer.isReady });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar tu estado.', variant: 'destructive' });
    }
  };

  const handleKickPlayer = async (playerId: string) => {
    if (!isHost) {
      toast({ title: 'Acción no permitida', description: 'Solo el anfitrión puede expulsar jugadores.', variant: 'destructive' });
      return;
    }
    try {
      await removePlayerFromRoom(roomId, playerId);
      toast({ title: 'Éxito', description: 'Jugador expulsado de la sala' });
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<Room['settings']>) => {
    if (!isHost) {
      toast({ title: 'Acción no permitida', description: 'Solo el anfitrión puede cambiar la configuración.', variant: 'destructive' });
      return;
    }
    try {
        await updateRoomSettings(roomId, newSettings);
        toast({ title: 'Éxito', description: 'Configuración de sala actualizada' });
    } catch (error) {
        toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const getStatusIcon = (status: 'online' | 'away' | 'offline') => {
    switch (status) {
      case 'online':
        return <div className="w-2.5 h-2.5 bg-green-500 rounded-full" title="En línea" />;
      case 'away':
        return <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full" title="Ausente"/>;
      case 'offline':
        return <div className="w-2.5 h-2.5 bg-gray-400 rounded-full" title="Desconectado" />;
      default:
        return null;
    }
  };

  if (!room) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Room Header */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-card-foreground/5 p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                {room.settings.isPrivate ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
                Sala: {roomId}
              </CardTitle>
              <CardDescription className="mt-1">
                {players.length}/{room.settings.maxPlayers} jugadores • {readyPlayersCount} listos
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                 <Dialog open={showContacts} onOpenChange={setShowContacts}>
                    <DialogTrigger asChild>
                       <Button variant="outline">
                        <Share2 className="h-4 w-4 mr-2" />
                        Invitar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-transparent border-none shadow-none">
                        <ContactsManager language={room.settings.language} roomCode={roomId} onClose={() => setShowContacts(false)} />
                    </DialogContent>
                </Dialog>
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={!isHost}>
                      <Settings className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Configuración de Sala</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="max-players">Máximo de jugadores</Label>
                        <Select 
                          value={room.settings.maxPlayers.toString()} 
                          onValueChange={(value) => handleUpdateSettings({ maxPlayers: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[2, 4, 6, 8].map(num => <SelectItem key={num} value={num.toString()}>{num} jugadores</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="private-room">Sala privada</Label>
                        <Switch
                          id="private-room"
                          checked={room.settings.isPrivate}
                          onCheckedChange={(checked) => handleUpdateSettings({ isPrivate: checked })}
                        />
                      </div>
                    </div>
                  </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Players List */}
            <div className="md:col-span-2">
                <h4 className="font-semibold mb-3 flex items-center gap-2"><Users className="h-5 w-5" />Jugadores</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-background/50 dark:bg-card/30 rounded-lg animate-fade-in">
                        <div className="flex items-center gap-3">
                            {getStatusIcon(player.status)}
                            <img src={player.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${player.name}`} alt={player.name} className="h-8 w-8 rounded-full" data-ai-hint="avatar person" />
                            <span className="font-medium flex items-center gap-2">
                                {player.name} {player.id === currentUserId && "(Tú)"}
                                {player.isHost && <Crown className="h-4 w-4 text-yellow-500"/>}
                            </span>
                        </div>
                        <div className='flex items-center gap-2'>
                        <Badge variant={player.isReady ? "default" : "secondary"} className="text-xs w-20 justify-center">
                            {player.isReady ? "Listo" : "Esperando"}
                        </Badge>
                        {isHost && player.id !== currentUserId && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleKickPlayer(player.id)}
                                title="Expulsar jugador"
                                className="text-muted-foreground hover:text-destructive h-7 w-7"
                            >
                                <UserX className="h-4 w-4" />
                            </Button>
                        )}
                        </div>
                    </div>
                    ))}
                </div>
            </div>
            
            {/* Game Controls */}
            <div className="flex flex-col justify-between space-y-3">
                 <h4 className="font-semibold mb-3 flex items-center gap-2"><Play className="h-5 w-5" />Acciones</h4>
                 <Button
                    onClick={handleToggleReady}
                    variant={currentPlayer?.isReady ? "secondary" : "default"}
                    className="w-full text-lg py-6"
                    size="lg"
                >
                    {currentPlayer?.isReady ? "Cancelar" : "¡Estoy listo!"}
                </Button>
                
                <Button
                    onClick={onStartGame}
                    disabled={!canStartGame}
                    className="w-full text-lg py-6"
                    size="lg"
                >
                    Iniciar ({readyPlayersCount}/2)
                </Button>
                
                <Button
                    onClick={onLeaveRoom}
                    variant="outline"
                    className="w-full"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Salir
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
