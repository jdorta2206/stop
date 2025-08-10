
"use client";

import { useLanguage, type LanguageOption } from '@/contexts/language-context';
import { useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '../auth/AuthModal';
import { UserAccount } from '../auth/UserAccount';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Coins, Volume2, VolumeX, MessageSquare, Trophy } from 'lucide-react';
import { useSound } from '@/hooks/use-sound';
import { ChatPanel } from '../chat/chat-panel';
import { onChatUpdate, sendMessageToRoom, type ChatMessage } from '@/lib/room-service';

export function AppHeader() {
  const { language, setLanguage, translate } = useLanguage();
  const router = useRouter();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;
  const { isMuted, toggleMute } = useSound();
  const [isMounted, setIsMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  // Esto debería venir de un contexto o de la URL
  const [roomId, setRoomId] = useState<string | null>('global'); 

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
          name: user.name || 'Anonymous',
          avatar: user.photoURL,
          uid: user.uid,
        },
      });
    }
  };


  return (
    <>
      <header className="py-4 px-4 md:px-8 bg-black/10">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity" aria-label={translate('game.title')}>
            <img
              src="/android-chrome-192x192.png"
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
            
            <Button variant="ghost" size="icon" onClick={toggleMute} className="rounded-full bg-black/20 text-white hover:bg-white/20 hover:text-black">
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            
            {isMounted && (
              <>
                {isAuthenticated && user ? (
                  <>
                    <UserAccount />
                  </>
                ) : (
                  <Button 
                    variant="secondary"
                    className="font-semibold rounded-full shadow-lg"
                    onClick={() => setAuthModalOpen(true)}
                    disabled={isLoading}
                  >
                    {translate('auth.signIn')}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </header>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      {isMounted && roomId && (
         <ChatPanel 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={chatMessages}
          currentUserUid={user?.uid}
          onSendMessage={handleSendMessage}
          translateUi={translate}
          language={language}
          roomId={roomId}
        />
      )}
    </>
  );
}
