

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Loader2,
  UserPlus,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import type { Language } from '@/contexts/language-context';
import { searchUserById, addFriend, type Friend } from '@/lib/friends-service';
import { useAuth } from '@/hooks/use-auth';

interface FriendsInviteProps {
  language?: Language;
  onFriendAdded: () => void;
}

export default function FriendsInvite({ language = 'es', onFriendAdded }: FriendsInviteProps) {
  const { user } = useAuth();
  const [searchResult, setSearchResult] = useState<Friend | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [invitedFriends, setInvitedFriends] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResult(null);
      return;
    };
    setIsLoading(true);
    setSearchResult(null);
    try {
      const result = await searchUserById(searchQuery.trim());
      if (result && result.id !== user?.uid) {
        setSearchResult(result);
      } else {
        toast.info("No se encontró ningún jugador con ese ID o es tu propio ID.");
      }
    } catch (error) {
      toast.error("No se pudo realizar la búsqueda.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddFriend = async (friend: Friend) => {
    if (!user) {
       toast.error("Debes iniciar sesión para añadir amigos.");
       return;
    }
    try {
      await addFriend(user.uid, friend.id, friend.name, friend.avatar);
      toast.success(`${friend.name} ha sido añadido a tus amigos.`);
      setInvitedFriends(prev => new Set(prev).add(friend.id));
      onFriendAdded(); // Callback to refresh the friends list on the parent component
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="p-2">
        <div className="flex w-full items-center space-x-2">
            <Input
                placeholder="Pegar ID de usuario..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-grow"
            />
            <Button type="button" onClick={handleSearch} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
        </div>
        
        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
            {isLoading && (
                 <div className="flex justify-center items-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            )}
            {!searchResult && !isLoading && (
                <div className="text-center text-muted-foreground p-4">
                    <p>Busca a un jugador por su ID para añadirlo.</p>
                </div>
            )}
            {searchResult && !isLoading && (
                <div key={searchResult.id} className="flex items-center justify-between p-2 rounded-lg bg-card/50">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={searchResult.avatar || ''} data-ai-hint="avatar person" />
                            <AvatarFallback>{searchResult.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{searchResult.name}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddFriend(searchResult)}
                      disabled={invitedFriends.has(searchResult.id)}
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {invitedFriends.has(searchResult.id) ? 'Añadido' : 'Añadir'}
                    </Button>
                </div>
            )}
        </div>
    </div>
  );
}
