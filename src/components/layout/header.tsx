
"use client";

import { useLanguage, type LanguageOption } from '@/contexts/language-context';
import { useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { Volume2, VolumeX } from 'lucide-react';
import { useSound } from '@/hooks/use-sound';
import { ChatPanel } from '../chat/chat-panel';
import { onChatUpdate, sendMessageToRoom } from '@/lib/room-service';
import { AuthStatus } from '../auth/auth-status';
import type { ChatMessage } from '../chat/chat-message-item';

export function AppHeader() {
  const { language, setLanguage, translate } = useLanguage();
  const { user } = useAuth();
  const { isMuted, toggleMute } = useSound();
  const [isMounted, setIsMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [roomId, setRoomId] = useState<string | null>('global');
  const [logoSrc, setLogoSrc] = useState('/android-chrome-192x192.png');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isChatOpen && roomId) {
      const unsubscribe = onChatUpdate(roomId, (messages) => {
        setChatMessages(messages);
      });
      return () => unsubscribe();
    }
  }, [isChatOpen, roomId]);

  const handleLanguageChange = useCallback((langCode: LanguageOption['code']) => {
    setLanguage(langCode);
  }, [setLanguage]);

  const handleSendMessage = (text: string) => {
    if (user && roomId) {
      sendMessageToRoom(roomId, {
        text,
        sender: {
          uid: user.uid,
          name: user.displayName || 'Anonymous',
          avatar: user.photoURL
        }
      });
    }
  };
  
  if (!isMounted) {
      return (
        <header className="py-4 px-4 md:px-8 bg-transparent absolute top-0 left-0 right-0 z-10">
          <div className="container mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity" aria-label="Stop Game">
              <img
                src="/android-chrome-192x192.png"
                alt="Logo Stop"
                width={40}
                height={40}
                className="h-10 w-auto rounded-full"
              />
              <span className="text-xl font-bold text-white">Stop</span>
            </Link>
          </div>
      </header>
      )
  }

  return (
    <>
      <header className="py-4 px-4 md:px-8 bg-transparent absolute top-0 left-0 right-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity" aria-label={translate('game.title')}>
            <img
              src={logoSrc}
              alt={translate('game.logoAlt')}
              width={40}
              height={40}
              className="h-10 w-auto rounded-full"
            />
            <span className="text-xl font-bold text-white">{translate('game.title')}</span>
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:flex items-center gap-1 bg-black/20 p-1 rounded-full border border-white/20">
              {(['es', 'en', 'fr', 'pt'] as const).map(langCode => (
                <Button
                  key={langCode}
                  variant={language === langCode ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleLanguageChange(langCode)}
                  className="rounded-full !px-3 !py-1 text-xs"
                >
                  {langCode.toUpperCase()}
                </Button>
              ))}
            </div>
            
            <Button withSound variant="ghost" size="icon" onClick={toggleMute} className="rounded-full bg-black/20 text-white hover:bg-white/20 hover:text-white/80">
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            
            <AuthStatus />
          </div>
        </div>
      </header>
      
      {roomId && user && (
        <ChatPanel 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={chatMessages}
          currentUserUid={user.uid}
          onSendMessage={handleSendMessage}
          translateUi={translate}
          language={language}
          roomId={roomId}
        />
      )}
    </>
  );
}
