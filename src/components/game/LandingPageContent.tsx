
'use client';

import { useState, useEffect } from 'react';
import { Users, Trophy, Gamepad2, BrainCircuit, Lightbulb } from 'lucide-react';
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
import { useToast } from '@/components/ui/use-toast';

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 12A10 10 0 0 0 12 2a10 10 0 0 0-10 10c0 2.89 1.21 5.5 3.19 7.42L4 22l2.58-1.19A9.93 9.93 0 0 0 12 22a10 10 0 0 0 10-10z" />
    <path d="M9.1 8.5a.64.64 0 0 1 .5-.3h.1c.3 0 .5.1.6.2s.3.3.4.5.1.4.1.6v.1c0 .2 0 .4-.1.5l-.2.4-1.2 2.1c-.2.3-.3.5-.2.7s.2.4.4.5.3.2.5.2h.1c.3 0 .6-.1.8-.3l1.9-1.1a1 1 0 0 1 .5-.2c.2 0 .4.1.5.2l.4.5c.1.1.2.3.2.5s0 .4-.1.5l-2.1 2.4c-.2.2-.4.4-.6.5s-.4.2-.6.2a2.3 2.3 0 0 1-1.4-.5c-.3-.2-.5-.5-.7-.8s-.3-.6-.3-1v-.1c0-.2 0-.4.1-.5l.2-.4 1.2-2.1c.2-.3.1-.6 0-.8s-.3-.3-.5-.3h-.1c-.3 0-.5.1-.7.3l-1.1.9a1.9 1.9 0 0 1-1.3.5h-.1c-.3 0-.5-.1-.7-.2s-.3-.3-.4-.5-.1-.4-.1-.6v-.1c0-.2.1-.4.2-.6l.4-.5c.1-.1.3-.2.5-.2Z" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);


export function LandingPageContent() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { user } = useAuth();
  const { language, translate } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const categories = ['place', 'animal', 'name', 'food', 'color', 'object', 'brand'];

  const handleShare = (platform: 'whatsapp' | 'facebook') => {
    const text = encodeURIComponent("¡Juega STOP conmigo! Es un reto de palabras súper divertido. ¿Te atreves a ganarme? 🔥");
    const url = encodeURIComponent("https://juego-stop.netlify.app/");
    let shareUrl = '';

    if (platform === 'whatsapp') {
      shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
    } else {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
    }

    window.open(shareUrl, '_blank');
    toast({
      title: "¡Comparte la diversión!",
      description: `Se ha abierto una nueva pestaña para compartir en ${platform}.`
    });
  };

  const whyPlayFeatures = [
    { key: 'multiplayer', icon: <Users className="h-10 w-10 text-primary" /> },
    { key: 'scoringSystem', icon: <BrainCircuit className="h-10 w-10 text-primary" /> },
    { key: 'free', icon: <Lightbulb className="h-10 w-10 text-primary" /> }
  ];


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-red-500/20 text-foreground">
      <AppHeader />
      
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <main className="flex-grow flex flex-col">
        <section className="flex-grow flex flex-col items-center justify-center text-center py-12 px-4">
          <div className="relative w-32 h-32 flex items-center justify-center mx-auto mb-4">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
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
                      className="font-bold py-3 px-6 text-md rounded-full shadow-lg transition-transform hover:scale-105"
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

                 <Button onClick={() => handleShare('whatsapp')} variant="ghost" size="icon" className="rounded-full bg-green-500/20 text-green-300 hover:bg-green-500/40">
                    <WhatsappIcon />
                </Button>
                <Button onClick={() => handleShare('facebook')} variant="ghost" size="icon" className="rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/40">
                    <FacebookIcon />
                </Button>
              </>
            )}
          </div>
        </section>

        <section className="py-16 px-4 bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-primary text-center mb-10">{translate('categories.title')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 max-w-6xl mx-auto">
              {categories.map((category) => (
                <div 
                  key={category} 
                  className="bg-background/50 border border-border/30 rounded-xl p-4 flex items-center justify-center shadow-lg hover:bg-background/70 transition-colors text-center"
                >
                  <span className="text-foreground text-lg font-medium">{translate(`categories.list.${category}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
           <div className="container mx-auto">
                <h2 className="text-4xl font-bold text-primary text-center mb-12">{translate('categories.whyPlay.title')}</h2>
                <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
                    {whyPlayFeatures.map(({key, icon}) => (
                        <div key={key} className="flex flex-col items-center text-center p-6 bg-card/50 rounded-lg shadow-lg">
                            <div className="p-4 bg-primary/20 rounded-full mb-4">
                                {icon}
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-primary">{translate(`categories.whyPlay.features.${key}.title`)}</h3>
                            <p className="text-muted-foreground">{translate(`categories.whyPlay.features.${key}.description`)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
      </main>
      
      <AppFooter language={language} />
    </div>
  );
}
