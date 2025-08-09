
'use client';

import { useState, useEffect } from 'react';
import { Share2, Users, Trophy, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/auth/AuthModal";
import { useLanguage } from '@/contexts/language-context';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import RoomManager from '@/components/game/RoomManager';
import FriendsInvite from '@/components/social/FriendsInvite';
import { Button } from '@/components/ui/button';
import { DailyMissionsCard } from '@/components/missions/DailyMissionsCard';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="24" height="24">
    <path fill="currentColor" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" width="24" height="24">
        <circle cx="12" cy="12" r="12" fill="#1877F2"/>
        <path d="M13.43 21.94v-7.9h2.64l.39-3.06h-3.03V9.04c0-.88.24-1.49 1.52-1.49h1.62V4.89c-.28-.04-1.25-.12-2.37-.12-2.35 0-3.96 1.43-3.96 4.07v2.25H7.76v3.06h2.89v7.9h3.78z" fill="white"/>
    </svg>
);


export function LandingPageContent() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user } = useAuth();
  const { language, translate } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleShare = (platform: 'whatsapp' | 'facebook') => {
    const text = translate('social.share.room.invite', { roomUrl: window.location.href });
    const url = window.location.href;
    let shareUrl = '';

    if (platform === 'whatsapp') {
      shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    } else {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    }
    window.open(shareUrl, '_blank');
  };
  
  const categories = ['place', 'animal', 'name', 'food', 'color', 'object', 'brand'];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader onToggleChat={() => setIsChatOpen(!isChatOpen)} isChatOpen={isChatOpen} />
      
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <main className="flex-grow flex flex-col">
        <section className="flex-grow flex flex-col items-center justify-center text-center py-20 px-4">
          <div className="w-32 h-32 flex items-center justify-center mx-auto mb-6">
            <img src="/android-chrome-192x192.png" alt={translate('game.logoAlt')} width={128} height={128} className="p-2 rounded-full" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-primary mt-6 mb-4">{translate('landing.title')}</h1>
          <p className="text-xl md:text-2xl text-foreground mb-4">{translate('landing.subtitle')}</p>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            {translate('landing.description')}
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <Link href="/play-solo">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 text-md rounded-full shadow-lg">
                {translate('landing.playNow')}
              </Button>
            </Link>
            
            {isMounted && (
              <>
                <Dialog open={roomModalOpen} onOpenChange={setRoomModalOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            onClick={() => user ? setRoomModalOpen(true) : setAuthModalOpen(true)}
                            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold py-3 px-6 text-md rounded-full shadow-lg"
                        >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            {translate('landing.privateRoom')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{translate('landing.privateRoom')}</DialogTitle>
                        </DialogHeader>
                        <RoomManager language={language} />
                    </DialogContent>
                </Dialog>
                
                <Link href="/leaderboard">
                  <Button variant="outline" className="text-white font-semibold py-3 px-6 text-md rounded-full shadow-lg">
                    <Trophy className="w-5 h-5 mr-2" />
                    {translate('landing.ranking')}
                  </Button>
                </Link>

                <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="bg-white/10 text-white hover:bg-white/20 border-white/20 font-semibold py-3 px-6 text-md rounded-full shadow-lg"
                            onClick={() => user ? setIsInviteModalOpen(true) : setAuthModalOpen(true)}
                            >
                            <Users className="w-5 h-5 mr-2" />
                            {translate('social.inviteFriends')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{translate('social.inviteFriends')}</DialogTitle>
                        </DialogHeader>
                        <FriendsInvite language={language} onFriendAdded={() => {}}/>
                    </DialogContent>
                </Dialog>
              </>
            )}

            <Button 
              onClick={() => handleShare('whatsapp')}
              variant="ghost"
              size="icon"
              className="bg-transparent hover:bg-transparent text-white p-0 rounded-full flex items-center justify-center w-10 h-10"
              aria-label={translate('social.share.whatsapp')}
            >
              <WhatsAppIcon className="h-8 w-8 text-green-400" />
            </Button>
            
            <Button 
              onClick={() => handleShare('facebook')}
              variant="ghost"
              size="icon"
              className="bg-transparent hover:bg-transparent text-white p-0 rounded-full flex items-center justify-center w-10 h-10"
              aria-label={translate('social.share.facebook')}
            >
              <FacebookIcon className="h-8 w-8" />
            </Button>
          </div>
        </section>

        <section className="py-16 px-4 bg-card/80">
          <h2 className="text-4xl font-bold text-primary text-center mb-8">{translate('categories.title')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 max-w-6xl mx-auto">
            {categories.map((category, index) => (
              <div 
                key={index} 
                className="bg-background/50 border-border/30 rounded-xl p-6 flex items-center justify-center shadow-lg"
              >
                <span className="text-foreground text-xl font-medium">{translate(`categories.list.${category}`)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 px-4 text-center">
            <h2 className="text-4xl font-bold text-primary mb-8">{translate('categories.whyPlay.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-foreground">
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/50"><Users className="h-10 w-10 text-primary" /></div>
                    <h3 className="text-xl font-bold mb-2">{translate('categories.whyPlay.features.multiplayer.title')}</h3>
                    <p className="text-muted-foreground">{translate('categories.whyPlay.features.multiplayer.description')}</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/50"><Trophy className="h-10 w-10 text-primary" /></div>
                    <h3 className="text-xl font-bold mb-2">{translate('categories.whyPlay.features.scoringSystem.title')}</h3>
                    <p className="text-muted-foreground">{translate('categories.whyPlay.features.scoringSystem.description')}</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/50"><Share2 className="h-10 w-10 text-primary" /></div>
                    <h3 className="text-xl font-bold mb-2">{translate('categories.whyPlay.features.free.title')}</h3>
                    <p className="text-muted-foreground">{translate('categories.whyPlay.features.free.description')}</p>
                </div>
            </div>
        </section>
        
        {isMounted && user && (
          <section className="py-16 px-4 bg-card/80">
              <DailyMissionsCard />
          </section>
        )}

      </main>
      
      <AppFooter language={language} />
    </div>
  );
}
