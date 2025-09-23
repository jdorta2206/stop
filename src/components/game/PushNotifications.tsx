
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bell, BellRing, Users, Gamepad2, Trophy, MessageSquare, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { updateNotificationStatus, onNotificationsUpdate, type GameInvitation } from '@/lib/friends-service';
import { useAuth } from '@/hooks/use-auth';

interface PushNotificationsProps {
  userId: string;
  username: string;
  onJoinRoom: (roomId: string) => void;
  onOpenChat: () => void;
}

export default function PushNotifications({ 
  userId, 
  username, 
  onJoinRoom, 
  onOpenChat 
}: PushNotificationsProps) {
  const [notifications, setNotifications] = useState<GameInvitation[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const { user } = useAuth();

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    if (user) {
      // The onNotificationsUpdate function now correctly queries the root 'notifications' collection.
      const unsubscribe = onNotificationsUpdate(user.uid, (newNotifications) => {
        const currentPendingIds = new Set(notifications.filter(n => n.status === 'pending').map(n => n.id));
        const newPendingNotification = newNotifications.find(n => n.status === 'pending' && !currentPendingIds.has(n.id));

        if (newPendingNotification) {
            showPushNotification(newPendingNotification);
            toast.info(`Nueva invitación de ${newPendingNotification.fromUser}`);
        }

        setNotifications(newNotifications);
      });

      return () => unsubscribe();
    }
  }, [user]);


  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notificaciones activadas');
      } else {
        toast.error('Notificaciones denegadas');
      }
    }
  };

  const showPushNotification = (notification: GameInvitation) => {
    if (notificationPermission === 'granted' && 'Notification' in window) {
      const notif = new Notification(`STOP Game - ${notification.fromUser}`, {
        body: notification.message,
        icon: '/android-chrome-192x192.png',
        badge: '/android-chrome-192x192.png',
        tag: notification.id
      });

      notif.onclick = () => {
        window.focus();
        if (notification.type === 'room_invite') {
          handleAcceptInvitation(notification);
        } else if (notification.type === 'chat_mention') {
          onOpenChat();
        }
        notif.close();
      };

      setTimeout(() => notif.close(), 10000);
    }
  };

  const handleAcceptInvitation = async (notification: GameInvitation) => {
    if (!user) return;
    if (notification.type === 'room_invite') {
      await updateNotificationStatus(notification.id, 'accepted');
      onJoinRoom(notification.roomId);
      toast.success(`Te uniste a la sala ${notification.roomId}`);
      setShowNotifications(false);
    }
  };

  const handleDeclineInvitation = async (notificationId: string) => {
     if (!user) return;
     await updateNotificationStatus(notificationId, 'declined');
     toast.info('Invitación rechazada');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'room_invite':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'game_start':
        return <Gamepad2 className="h-4 w-4 text-green-500" />;
      case 'game_finish':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'chat_mention':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'room_invite':
        return 'Invitación a jugar';
      case 'game_start':
        return 'Juego iniciado';
      case 'game_finish':
        return 'Juego terminado';
      case 'chat_mention':
        return 'Mención en chat';
      default:
        return 'Notificación';
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') return '...';
    const now = new Date();
    const date = timestamp.toDate();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
  };

  const pendingNotifications = notifications.filter(n => n.status === 'pending');
  const unreadCount = pendingNotifications.length;

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowNotifications(true)}
          className="relative rounded-full h-10 w-10"
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificaciones
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount}</Badge>
                )}
              </DialogTitle>
              
              {notificationPermission !== 'granted' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestNotificationPermission}
                >
                  Activar
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 p-1">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hay notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition-all ${
                    notification.status === 'pending' 
                      ? 'border-primary/30 bg-card' 
                      : 'border-border/30 bg-card/50 opacity-60'
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">
                              {getNotificationTitle(notification.type)}
                            </h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            <span className="font-medium text-foreground">{notification.fromUser}:</span>{' '}
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground/80">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {notification.type === 'room_invite' && (
                              <Badge variant="secondary" className="text-xs">
                                {notification.roomId}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {notification.status === 'pending' && (
                        <div className="flex flex-col gap-1">
                          {notification.type === 'room_invite' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAcceptInvitation(notification)}
                                className="h-7 px-2"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Unirse
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeclineInvitation(notification.id)}
                                className="h-7 px-2"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Rechazar
                              </Button>
                            </>
                          )}
                          
                          {notification.type === 'chat_mention' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                onOpenChat();
                                setShowNotifications(false);
                              }}
                              className="h-7 px-2"
                            >
                              Ver chat
                            </Button>
                          )}
                          
                          {notification.type === 'game_start' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                onJoinRoom(notification.roomId);
                                setShowNotifications(false);
                              }}
                              className="h-7 px-2"
                            >
                              Ir al juego
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {notificationPermission === 'default' && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                Activa las notificaciones para recibir invitaciones instantáneas
              </p>
              <Button
                size="sm"
                onClick={requestNotificationPermission}
                className="w-full"
              >
                Activar notificaciones
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
