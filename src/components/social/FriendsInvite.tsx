
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Search,
  Loader2,
  UserPlus
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { Language } from '@/contexts/language-context';
import { searchUsers, addFriend, Friend } from '@/lib/friends-service';
import { useAuth } from '@/hooks/use-auth';

interface FriendsInviteProps {
  language?: Language;
  onFriendAdded: () => void;
}

export default function FriendsInvite({ language = 'es', onFriendAdded }: FriendsInviteProps) {
  const { user } = useAuth();
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [invitedFriends, setInvitedFriends] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    };
    setIsLoading(true);
    try {
      const results = await searchUsers(searchQuery);
      // Filter out the current user from search results
      const filteredResults = results.filter(p => p.id !== user?.uid);
      setSearchResults(filteredResults);
    } catch (error) {
      toast({ title: "Error", description: "No se pudo realizar la búsqueda.", variant: "destructive"});
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddFriend = async (friend: Friend) => {
    if (!user) {
       toast({ title: "Error", description: "Debes iniciar sesión para añadir amigos.", variant: "destructive"});
       return;
    }
    try {
      await addFriend(user.uid, friend.id, friend.name, friend.avatar);
      toast({ title: "¡Éxito!", description: `${friend.name} ha sido añadido a tus amigos.` });
      setInvitedFriends(prev => new Set(prev).add(friend.id));
      onFriendAdded(); // Callback to refresh the friends list on the parent component
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive"});
    }
  };

  return (
    <div className="p-2">
        <div className="flex w-full items-center space-x-2">
            <Input
                placeholder="Buscar por nombre de usuario..."
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
            {searchResults.length === 0 && !isLoading ? (
                <div className="text-center text-muted-foreground p-4">
                    <p>Escribe un nombre para buscar jugadores.</p>
                </div>
            ) : (
                searchResults.map(player => (
                    <div key={player.id} className="flex items-center justify-between p-2 rounded-lg bg-card/50">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={player.avatar || ''} data-ai-hint="avatar person" />
                                <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{player.name}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddFriend(player)}
                          disabled={invitedFriends.has(player.id)}
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            {invitedFriends.has(player.id) ? 'Añadido' : 'Añadir'}
                        </Button>
                    </div>
                ))
            )}
        </div>
    </div>
  );
}
