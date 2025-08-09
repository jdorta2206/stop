
'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Users, Trophy, BrainCircuit, Lightbulb } from 'lucide-react';
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
      width="24" 
      height="24" 
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17.47 14.39C17.22 14.28 16.09 13.73 15.88 13.66C15.67 13.59 15.52 13.54 15.37 13.79C15.22 14.04 14.78 14.53 14.66 14.68C14.54 14.83 14.42 14.85 14.17 14.73C13.92 14.61 12.93 14.25 11.91 13.33C11.11 12.61 10.55 11.83 10.43 11.58C10.31 11.33 10.43 11.21 10.53 11.11C10.62 11.02 10.74 10.86 10.86 10.72C10.98 10.58 11.03 10.48 11.1 10.33C11.18 10.18 11.13 10.04 11.08 9.92C11.03 9.8 10.48 8.58 10.29 8.12C10.1 7.66 9.92 7.72 9.79 7.72H9.34C9.19 7.72 8.97 7.79 8.79 7.99C8.61 8.19 8.04 8.71 8.04 9.8C8.04 10.89 8.84 11.95 8.96 12.09C9.08 12.24 10.57 14.53 12.82 15.45C13.43 15.7 13.89 15.86 14.27 15.96C14.82 16.11 15.34 16.06 15.76 15.78C16.23 15.48 16.63 14.93 16.78 14.61C16.93 14.28 16.93 14.01 16.88 13.89C16.83 13.77 16.69 13.7 16.44 13.58C16.19 13.47 17.32 12.92 17.53 12.84C17.74 12.77 17.89 12.82 18.04 13.07C18.19 13.32 18.63 13.81 18.75 13.96C18.87 14.11 18.99 14.13 19.24 14.01C19.49 13.89 20.48 13.53 21.5 12.61C22.3 11.89 22.86 11.11 22.98 10.86C23.1 10.61 22.98 10.49 22.88 10.39C22.79 10.3 22.66 10.14 22.54 10C22.42 9.86 22.37 9.76 22.45 9.61C22.53 9.46 22.48 9.32 22.43 9.2C22.38 9.08 21.83 7.86 21.64 7.4C21.45 6.94 21.27 7 21.14 7H20.69C20.54 7 20.32 7.07 20.14 7.27C19.96 7.47 19.39 7.99 19.39 9.08C19.39 10.17 20.19 11.23 20.31 11.37C20.43 11.52 21.92 13.81 24.17 14.73C24.78 15 25.24 15.16 25.62 15.26C26.17 15.41 26.69 15.36 27.11 15.08C27.58 14.78 27.98 14.23 28.13 13.91C28.28 13.58 28.28 13.31 28.23 13.19C28.18 13.07 28.04 13 27.79 12.88" fill="#4CAF50"/>
      <path d="M16.5 12.4C16.5 12.4 16.4 12.3 16.2 12.3C16 12.2 15.8 12.2 15.7 12.4C15.6 12.5 15.5 12.7 15.5 12.7L15.4 13.2C15.4 13.3 15.4 13.4 15.3 13.5C15.2 13.6 15.1 13.6 15 13.6C14.9 13.6 14.8 13.6 14.7 13.5C14.6 13.4 14.6 13.3 14.6 13.2L14.5 12.7C14.5 12.5 14.4 12.4 14.3 12.3C14.2 12.2 14 12.2 13.8 12.3L13.3 12.4C13.2 12.4 13.1 12.5 13 12.6C12.9 12.7 12.9 12.8 12.9 12.9C12.9 13 12.9 13.1 13 13.2C13.1 13.3 13.2 13.3 13.3 13.3L13.8 13.2C14 13.2 14.2 13.2 14.3 13.1C14.5 13 14.6 12.9 14.6 12.7L14.8 12.2C14.8 12.1 14.9 12 15 11.9C15.1 11.8 15.2 11.8 15.3 11.8C15.5 11.8 15.6 11.9 15.7 12C15.8 12.1 15.8 12.2 15.8 12.3L16 12.8C16 13 16.1 13.1 16.2 13.2C16.3 13.3 16.5 13.3 16.6 13.2L17.1 13.1C17.2 13.1 17.3 13 17.4 12.9C17.5 12.8 17.5 12.7 17.5 12.6C17.5 12.5 17.5 12.4 17.4 12.3C17.3 12.2 17.2 12.2 17.1 12.2L16.6 12.3C16.6 12.3 16.5 12.4 16.5 12.4Z" fill="black"/>
    </svg>
);


const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="#1877F2"
    {...props}>
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.219C18.343 21.128 22 16.991 22 12z" />
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-red-600 via-red-800 to-yellow-600 text-white">
      <AppHeader />
      
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <main className="flex-grow flex flex-col">
        <section className="flex-grow flex flex-col items-center justify-center text-center py-12 px-4">
          <div className="relative w-32 h-32 flex items-center justify-center mx-auto mb-4">
            <img src="/android-chrome-192x192.png" alt={translate('game.logoAlt')} width={128} height={128} className="p-2 rounded-full shadow-lg" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tighter mt-4 mb-2">{translate('landing.title')}</h1>
          <p className="text-xl md:text-2xl text-yellow-300 mb-4 font-light">{translate('landing.subtitle')}</p>
          <p className="text-white/80 max-w-2xl mx-auto mb-8 text-base">
            {translate('landing.description')}
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <Link href="/play-solo">
              <Button className="bg-white hover:bg-gray-200 text-red-600 font-bold py-3 px-8 text-lg rounded-full shadow-xl transition-transform hover:scale-105">
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

                <Button onClick={() => handleShare('whatsapp')} variant="ghost" size="icon" className="rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors">
                    <WhatsappIcon />
                </Button>
                <Button onClick={() => handleShare('facebook')} variant="ghost" size="icon" className="rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                    <FacebookIcon />
                </Button>
              </>
            )}
          </div>
        </section>

        <section className="py-16 px-4 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-yellow-300 text-center mb-10">{translate('categories.title')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 max-w-6xl mx-auto">
              {categories.map((category) => (
                <div 
                  key={category} 
                  className="bg-red-800/50 border border-yellow-400/30 rounded-xl p-4 flex items-center justify-center shadow-lg hover:bg-red-700/70 transition-colors text-center"
                >
                  <span className="text-white text-lg font-medium">{translate(`categories.list.${category}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
           <div className="container mx-auto">
                <h2 className="text-4xl font-bold text-yellow-300 text-center mb-12">{translate('categories.whyPlay.title')}</h2>
                <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
                    {whyPlayFeatures.map(({key, icon}) => (
                        <div key={key} className="flex flex-col items-center text-center p-6 bg-red-800/40 rounded-lg shadow-lg">
                            <div className="p-4 bg-yellow-400/20 rounded-full mb-4">
                                {React.cloneElement(icon, { className: "h-10 w-10 text-yellow-300" })}
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">{translate(`categories.whyPlay.features.${key}.title`)}</h3>
                            <p className="text-white/70">{translate(`categories.whyPlay.features.${key}.description`)}</p>
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

    