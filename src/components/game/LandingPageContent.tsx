
'use client';

import { useState, useEffect } from 'react';
import { Users, Trophy } from 'lucide-react';
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

export function LandingPageContent() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { user } = useAuth();
  const { language, translate } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const categories = ['place', 'animal', 'name', 'food', 'color', 'object', 'brand'];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-red-500/20 text-foreground">
      <AppHeader />
      
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <main className="flex-grow flex flex-col">
        <section className="flex-grow flex flex-col items-center justify-center text-center py-12 px-4">
          <div className="w-32 h-32 flex items-center justify-center mx-auto mb-4">
            <img src="/android-chrome-192x192.png" alt={translate('game.logoAlt')} width={128} height={128} className="p-2 rounded-full bg-white/20 shadow-lg" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary tracking-tighter mt-4 mb-2">{translate('landing.title')}</h1>
          <p className="text-xl md:text-2xl text-foreground mb-4 font-light">{translate('landing.subtitle')}</p>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-base">
            {translate('landing.description')}
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <Link href="/play-solo">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 text-lg rounded-full shadow-xl transition-transform hover:scale-105">
                {translate('landing.playNow')}
              </Button>
            </Link>
            
            {isMounted && (
              <>
                <Dialog open={roomModalOpen} onOpenChange={setRoomModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="secondary"
                      onClick={() => user ? setRoomModalOpen(true) : setAuthModalOpen(true)}
                      className="font-semibold py-3 px-6 text-md rounded-full shadow-lg transition-transform hover:scale-105"
                    >
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
                  <Button variant="outline" className="text-white font-semibold py-3 px-6 text-md rounded-full shadow-lg border-white/30 bg-black/20 hover:bg-white/10 hover:text-white transition-transform hover:scale-105">
                    <Trophy className="w-5 h-5 mr-2" />
                    {translate('landing.ranking')}
                  </Button>
                </Link>

                <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-white font-semibold py-3 px-6 text-md rounded-full shadow-lg border-white/30 bg-black/20 hover:bg-white/10 hover:text-white transition-transform hover:scale-105"
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
          </div>
        </section>

        <section className="py-16 px-4 bg-card/80 backdrop-blur-sm">
          <h2 className="text-4xl font-bold text-primary text-center mb-8">{translate('categories.title')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 max-w-6xl mx-auto">
            {categories.map((category, index) => (
              <div 
                key={index} 
                className="bg-background/50 border border-border/30 rounded-xl p-6 flex items-center justify-center shadow-lg hover:bg-background/70 transition-colors"
              >
                <span className="text-foreground text-lg font-medium text-center">{translate(`categories.list.${category}`)}</span>
              </div>
            ))}
          </div>
        </section>
        
        {isMounted && user && (
          <section className="py-16 px-4 bg-card/80 backdrop-blur-sm">
              <DailyMissionsCard />
          </section>
        )}

      </main>
      
      <AppFooter language={language} />
    </div>
  );
}
