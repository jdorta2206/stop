
import { db } from './firebase';
import { 
    doc, 
    getDoc, 
    setDoc, 
    collection,
    query,
    where,
    getDocs,
    limit,
    orderBy,
    startAt,
    endAt,
    collectionGroup,
    Timestamp
} from "firebase/firestore";

export interface Friend {
    id: string; // This is the UID of the friend
    name: string;
    avatar?: string | null;
    addedAt: Timestamp;
}

// Function to search for users by name
export const searchUsers = async (nameQuery: string): Promise<Friend[]> => {
    if (!nameQuery) return [];
    
    const usersRef = collection(db, 'rankings');
    const q = query(
      usersRef, 
      orderBy('playerName'),
      startAt(nameQuery),
      endAt(nameQuery + '\uf8ff'),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    const users: Friend[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
            id: doc.id,
            name: data.playerName,
            avatar: data.photoURL,
            addedAt: Timestamp.now() // This is just for the type, not stored here
        });
    });
    return users;
};

// Function to add a friend
export const addFriend = async (currentUserId: string, friendId: string, friendName: string, friendAvatar: string | null = null): Promise<void> => {
    if (currentUserId === friendId) {
        throw new Error("You cannot add yourself as a friend.");
    }
    const friendDocRef = doc(db, `rankings/${currentUserId}/friends`, friendId);
    const friendDoc = await getDoc(friendDocRef);

    if (friendDoc.exists()) {
        throw new Error(`${friendName} is already your friend.`);
    }

    await setDoc(friendDocRef, {
        id: friendId,
        name: friendName,
        avatar: friendAvatar,
        addedAt: Timestamp.now()
    });
};

// Function to get a user's friends
export const getFriends = async (userId: string): Promise<Friend[]> => {
    const friendsRef = collection(db, `rankings/${userId}/friends`);
    const q = query(friendsRef, orderBy('addedAt', 'desc'));

    const querySnapshot = await getDocs(q);
    const friends: Friend[] = [];
    querySnapshot.forEach((doc) => {
        friends.push(doc.data() as Friend);
    });
    return friends;
};
