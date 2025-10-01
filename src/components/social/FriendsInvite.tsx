

import { useState } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { 
  Loader2,
  UserPlus,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { addFriend, searchUsers, type Friend } from '../../lib/friends-service';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../lib/firebase';

interface FriendsInviteProps {
  onFriendAdded: () => void;
}

export default function FriendsInvite({ onFriendAdded }: FriendsInviteProps) {
  const [user] = useAuthState(auth);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [invitedFriends, setInvitedFriends] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      return;
    };
    setIsLoading(true);
    setSearchResults([]);
    try {
      const results = await searchUsers(query);
      // Filter out the current user from search results
      const filteredResults = results.filter(result => result.id !== user?.uid);
      setSearchResults(filteredResults);
      if (filteredResults.length === 0) {
        toast.info("No se encontraron jugadores con ese nombre.");
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
      setSearchResults(prev => prev.filter(p => p.id !== friend.id)); // Remove from results after adding
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="p-2">
        <div className="flex w-full items-center space-x-2">
            <Input
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-grow"
            />
            <Button type="button" onClick={handleSearch} disabled={isLoading || !searchQuery.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
        </div>
        
        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
            {isLoading && (
                 <div className="flex justify-center items-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            )}
            {searchResults.length > 0 && !isLoading && searchResults.map(friend => (
                <div key={friend.id} className="flex items-center justify-between p-2 rounded-lg bg-card/50">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={friend.avatar || ''} data-ai-hint="avatar person" />
                            <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{friend.name}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddFriend(friend)}
                      disabled={invitedFriends.has(friend.id)}
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {invitedFriends.has(friend.id) ? 'Añadido' : 'Añadir'}
                    </Button>
                </div>
            ))}
        </div>
    </div>
  );
}
