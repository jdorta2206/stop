'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Users, Trophy, BrainCircuit, Lightbulb, Share2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/auth/AuthModal";
import { useLanguage } from '@/contexts/language-context';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ContactsManager from './ContactsManager';
import { useRouter } from 'next/navigation';
import { createRoom } from '@/lib/room-service';
import { rankingManager } from '@/lib/ranking';

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M22.25 12.01C22.25 17.65 17.65 22.25 12.01 22.25C10.03 22.25 8.16998 21.68 6.56998 20.68L2.75 21.75L3.85 18.01C2.8 16.34 2.25 14.28 2.25 12.01C2.25 6.37 6.85 1.77 12.49 1.77C15.11 1.77 17.51 2.78 19.31 4.57C21.11 6.37 22.25 8.78 22.25 12.01Z"
            fill="#25D366"
        />
        <path
            d="M17.37 14.54C17.12 14.41 15.91 13.82 15.69 13.73C15.48 13.65 15.31 13.6 15.17 13.85C15.02 14.1 14.53 14.65 14.4 14.82C14.28 14.97 14.15 15 13.88 14.88C13.61 14.76 12.51 14.38 11.38 13.36C10.49 12.56 9.87 11.69 9.74 11.43C9.61 11.18 9.73 11.06 9.84 10.96C9.94001 10.86 10.08 10.68 10.21 10.54C10.34 10.4 10.39 10.28 10.46 10.12C10.53 9.96001 10.48 9.81001 10.43 9.69001C10.38 9.57001 9.78 8.26001 9.58 7.82001C9.38 7.38001 9.18 7.44001 9.06 7.44001L8.57 7.45001C8.42 7.45001 8.18 7.52001 7.99 7.73001C7.8 7.94001 7.18 8.51001 7.18 9.71001C7.18 10.91 8.04 12.04 8.16 12.2C8.29 12.35 9.92 14.82 12.33 15.82C14.74 16.82 14.74 16.3 15.17 16.25C15.6 16.2 16.71 15.62 16.93 15.02C17.15 14.42 17.15 13.92 17.08 13.8C17.01 13.68 16.88 13.62 16.63 13.5C16.38 13.38 15.17 12.79 14.95 12.7C14.73 12.61 14.56 12.66 14.41 12.91C14.27 13.16 13.78 13.71 13.65 13.88C13.53 14.03 13.4 14.05 13.13 13.93C12.86 13.81 11.76 13.43 10.63 12.41C9.74001 11.61 9.12 10.74 8.99 10.48C8.86 10.23 8.98 10.11 9.09 10.01C9.19 9.91001 9.33 9.73001 9.46 9.59001C9.59 9.45001 9.64 9.33001 9.71 9.17001C9.78 9.01001 9.73 8.86001 9.68 8.74001C9.63 8.62001 9.03 7.31001 8.83 6.87001C8.63 6.43001 8.43 6.49001 8.31 6.49001L7.82 6.50001C7.67 6.50001 7.43 6.57001 7.24 6.78001C7.05 6.99001 6.43 7.56001 6.43 8.76001C6.43 9.96001 7.29 11.09 7.41 11.25C7.54 11.4 9.17 13.87 11.58 14.87C13.99 15.87 13.99 15.35 14.42 15.3C14.85 15.25 15.96 14.67 16.18 14.07C16.4 13.47 16.4 12.97 16.33 12.85C16.26 12.73 16.13 12.67 15.88 12.55"
            fill="white"
        />
    </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        {...props}
    >
        <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06c0 5.52 4.5 10.02 10 10.02s10-4.5 10-10.02C22 6.53 17.5 2.04 12 2.04z" fill="#1877F2"/>
        <path d="M16.5 10.28H14.15V20h-3.22V10.28H9.5V7.45h1.43V5.78c0-1.61.99-2.79 2.95-2.79h1.9v2.8h-1.39c-.68 0-.8.32-.8.8v1.75h2.2l-.26 2.83z" fill="#fff"/>
    </svg>
);

export function LandingPageContent() {
  const router = useRouter();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { user, isLoading: isAuthLoading } = useAuth();
  const { language, translate } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const categories = ['place', 'animal', 'name', 'food', 'color', 'object', 'brand'];

  const handleShare = (platform: 'whatsapp' | 'facebook') => {
    const text = encodeURIComponent(translate('social.shareText'));
    const url = encodeURIComponent("https://juego-stop.netlify.app/");
    let shareUrl = '';

    if (platform === 'whatsapp') {
      shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
    } else {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
    }

    window.open(shareUrl, '_blank');
    toast({
      title: translate('social.shareTitle'),
      description: translate('social.shareDescription', { platform })
    });
  };
  
  const handlePrivateRoomClick = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    
    setIsCreatingRoom(true);
    try {
      const playerProfile = await rankingManager.getPlayerRanking(
        user.uid, 
        user.displayName ?? 'Anonymous',
        user.photoURL ?? null
      );
      
      const newRoom = await createRoom(
        user.uid, 
        playerProfile.playerName ?? 'Anonymous', 
        playerProfile.photoURL ?? null
      );

      toast({
        title: translate('rooms.create.title'),
        description: translate('rooms.create.success', { roomId: newRoom.id }),
      });
      router.push(`/multiplayer?roomId=${newRoom.id}`);

    } catch (error) {
      toast({
        title: translate('errors.roomCreation'),
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleInviteClick = () => {
    if (user) {
      setIsInviteModalOpen(true);
    } else {
      setAuthModalOpen(true);
    }
  };

  const whyPlayFeatures = [
    { key: 'multiplayer', icon: <Users className="h-10 w-10 text-white" /> },
    { key: 'scoringSystem', icon: <BrainCircuit className="h-10 w-10 text-white" /> },
    { key: 'free', icon: <Lightbulb className="h-10 w-10 text-white" /> }
  ];

  return (
    <div className="flex flex-col min-h-screen text-white">
      <AppHeader />
      
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
      
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="sm:max-w-md bg-transparent border-none shadow-none p-0">
          <ContactsManager language={language} roomCode="----" onClose={() => setIsInviteModalOpen(false)} />
        </DialogContent>
      </Dialog>

      <main className="flex-grow flex flex-col">
        <section className="flex-grow flex flex-col items-center justify-center text-center py-12 px-4">
          <div className="relative w-32 h-32 flex items-center justify-center mx-auto mb-4">
            <img 
              src="/android-chrome-192x192.png" 
              alt={translate('game.logoAlt')} 
              width={128} 
              height={128} 
              className="p-2 rounded-full shadow-lg" 
            />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tighter mt-4 mb-2">
            {translate('landing.title')}
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-4 font-light">
            {translate('landing.subtitle')}
          </p>
          <p className="max-w-2xl mx-auto mb-8 text-base">
            {translate('landing.description')}
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <Link href="/play-solo">
              <Button className="bg-white hover:bg-gray-200 text-blue-600 font-bold py-3 px-8 text-lg rounded-full shadow-xl transition-transform hover:scale-105">
                {translate('landing.playNow')}
              </Button>
            </Link>
            
            {isMounted && !isAuthLoading && (
              <>
                <Button 
                  variant="outline"
                  onClick={handlePrivateRoomClick}
                  disabled={isCreatingRoom}
                  className="font-bold py-3 px-6 text-md rounded-full shadow-lg transition-transform hover:scale-105"
                >
                  {isCreatingRoom && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {translate('landing.privateRoom')}
                </Button>
                <Link href="/leaderboard">
                  <Button 
                    className="font-bold py-3 px-6 text-md rounded-full shadow-lg transition-transform hover:scale-105 bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    {translate('landing.ranking')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="py-16 px-4 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-10">
              {translate('categories.title')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 max-w-6xl mx-auto">
              {categories.map((category) => (
                <div 
                  key={category} 
                  className="bg-white/10 border border-white/20 rounded-xl p-4 flex items-center justify-center shadow-lg hover:bg-white/20 transition-colors text-center"
                >
                  <span className="text-white text-lg font-medium">
                    {translate(`categories.list.${category}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-12">
              {translate('categories.whyPlay.title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
              {whyPlayFeatures.map(({key, icon}) => (
                <div 
                  key={key} 
                  className="flex flex-col items-center text-center p-6 bg-white/10 rounded-lg shadow-lg"
                >
                  <div className="p-4 bg-white/20 rounded-full mb-4">
                    {icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">
                    {translate(`categories.whyPlay.features.${key}.title`)}
                  </h3>
                  <p className="text-white/70">
                    {translate(`categories.whyPlay.features.${key}.description`)}
                  </p>
                </div>
              ))}
            </div>
             <div className="mt-12 flex justify-center items-center gap-4">
                <Button variant="ghost" onClick={() => handleShare('whatsapp')} className="p-2 h-auto rounded-full bg-white/10 hover:bg-white/20">
                    <WhatsappIcon />
                </Button>
                <Button variant="ghost" onClick={() => handleShare('facebook')} className="p-2 h-auto rounded-full bg-white/10 hover:bg-white/20">
                    <FacebookIcon />
                </Button>
                <Button variant="outline" onClick={handleInviteClick} className="rounded-full bg-transparent border-white text-white hover:bg-white hover:text-black">
                    <Share2 className="mr-2 h-4 w-4" />
                    {translate('social.inviteFriends')}
                </Button>
            </div>
          </div>
        </section>
      </main>
      
      <AppFooter language={language} />
    </div>
  );
}
