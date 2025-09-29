
"use client";

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Check, RefreshCw, User } from 'lucide-react';

const AVATAR_STYLES = [
  'adventurer', 'adventurer-neutral', 'avataaars', 'big-ears',
  'big-ears-neutral', 'big-smile', 'bottts', 'croodles',
  'croodles-neutral', 'fun-emoji', 'icons', 'identicon',
  'initials', 'lorelei', 'lorelei-neutral', 'micah',
  'miniavs', 'notionists', 'open-peeps', 'personas',
  'pixel-art', 'pixel-art-neutral'
];

const COLORS = ['amber', 'blue', 'cyan', 'emerald', 'fuchsia', 'green', 'indigo', 'lime', 'orange', 'pink', 'purple', 'red', 'rose', 'sky', 'teal', 'violet', 'yellow'];

interface AvatarSelectorProps {
  username?: string;
  onAvatarChange?: (avatarUrl: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showUsername?: boolean;
}

export default function AvatarSelector({ 
  username = 'Usuario',
  onAvatarChange,
  size = 'md',
  showUsername = true
}: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('pixel-art');
  const [seed, setSeed] = useState<string>('');
  const [open, setOpen] = useState(false);
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };
  
  useEffect(() => {
    // Ensure this code runs only on the client
    if (typeof window !== 'undefined') {
      const savedAvatar = localStorage.getItem('user-avatar');
      const savedSeed = localStorage.getItem('avatar-seed') || username;
      const savedStyle = localStorage.getItem('avatar-style') || 'pixel-art';
      
      if (savedAvatar) {
        setSelectedAvatar(savedAvatar);
      } else {
        generateAvatar(savedStyle, savedSeed);
      }
      
      setSelectedStyle(savedStyle);
      setSeed(savedSeed);
    }
  }, [username]);
  
  const generateAvatar = (style = selectedStyle, seedValue = seed || username) => {
    const apiSeed = seedValue || Math.random().toString(36).substring(2, 10);
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const url = `https://api.dicebear.com/7.x/${style}/svg?seed=${apiSeed}&backgroundColor=${randomColor}`;
    
    setSelectedAvatar(url);
    setSeed(apiSeed);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('user-avatar', url);
      localStorage.setItem('avatar-seed', apiSeed);
      localStorage.setItem('avatar-style', style);
    }
    
    if (onAvatarChange) {
      onAvatarChange(url);
    }
  };
  
  const handleStyleSelect = (style: string) => {
    setSelectedStyle(style);
    generateAvatar(style, seed);
  };
  
  const handleRegenerate = () => {
    generateAvatar(selectedStyle, Math.random().toString(36).substring(2, 10));
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="p-0 h-auto hover:opacity-80 relative group">
            <Avatar className={`${sizeClasses[size]} border-2 border-white/50 transition-all hover:border-primary`}>
              <AvatarImage src={selectedAvatar} alt={username} />
              <AvatarFallback>
                <User />
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="text-xs text-white font-bold">Cambiar</span>
            </div>
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Personaliza tu avatar</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col gap-4">
            <div className="flex justify-center my-4">
              <Avatar className="h-32 w-32 border-4 border-primary/30">
                <AvatarImage src={selectedAvatar} alt={username} />
                <AvatarFallback>
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
            </div>
            
            <Button onClick={handleRegenerate} variant="outline" className="mb-2">
              <RefreshCw className="w-4 h-4 mr-2" />
              Generar aleatorio
            </Button>
            
            <div className="text-sm font-medium mb-1">Selecciona un estilo:</div>
            <ScrollArea className="h-60 rounded-md border">
              <div className="grid grid-cols-2 gap-2 p-3">
                {AVATAR_STYLES.map((style) => {
                  const isSelected = style === selectedStyle;
                  const previewUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=sample`;
                  
                  return (
                    <Button
                      key={style}
                      variant={isSelected ? "default" : "outline"}
                      className={`h-auto p-2 justify-start ${isSelected ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => handleStyleSelect(style)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={previewUrl} alt={style} />
                        </Avatar>
                        <span className="text-xs capitalize flex-1">{style.replace('-', ' ')}</span>
                        {isSelected && <Check className="h-4 w-4" />}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
            
            <Button onClick={() => setOpen(false)}>Confirmar</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {showUsername && (
        <span className="text-sm font-medium">{username}</span>
      )}
    </div>
  );
}
