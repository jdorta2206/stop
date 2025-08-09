
'use client';

import React from 'react';
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
    fill="currentColor"
    {...props}>
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.456l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.451-4.438-9.887-9.889-9.888-5.452 0-9.888 4.434-9.888 9.888 0 2.044.594 3.996 1.697 5.662l-1.192 4.359 4.425-1.166zm8.163-4.919c-1.296-2.028-2.068-2.656-2.92-3.13-1.026-.554-1.396-.759-2.274-1.22-1.121-.574-1.88-1.139-2.585-1.745-.884-.759-1.631-1.81-1.77-2.23-.139-.42-.095-1.041.139-1.528.234-.486.554-1.004.975-1.22.42-.215.842-.234 1.262-.095.421.14 1.042.759 1.464 1.221.422.46.758 1.14.975 1.488.217.347.161.765.043 1.201-.118.436-.437.955-.576 1.139s-.161.46-.079.734c.081.273.273.554.532.813.259.259.632.655 1.082 1.121.574.599 1.183 1.139 1.838 1.575.654.436 1.285.678 1.766.678.482 0 1.004-.14 1.349-.436.346-.297.554-.656.733-1.063.18-.408.347-.815.532-1.221.182-.407.322-.554.576-.554.254 0 .532.02.766.02.234 0 .436.02.615.02.18 0 .46.04.576.04.119 0 .273.04.37.04s.273.06.347.08c.074.02.161.04.234.06.075.02.14.04.217.06.075.02.139.04.18.04.04.02.06.02.06.02z"/>
    </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="currentColor"
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
