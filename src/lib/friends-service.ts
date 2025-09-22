

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
    Timestamp,
    addDoc,
    updateDoc,
    onSnapshot
} from "firebase/firestore";

export interface Friend {
    id: string; // This is the UID of the friend
    name: string;
    avatar?: string | null;
    addedAt: Timestamp;
}

export interface GameInvitation {
  id: string;
  fromUser: string;
  fromUserId: string;
  roomId: string;
  message: string;
  timestamp: Timestamp;
  type: 'room_invite' | 'game_start' | 'game_finish' | 'chat_mention';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

// Function to search for users by user ID
export const searchUserById = async (userId: string): Promise<Friend | null> => {
    if (!userId) return null;
    
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            name: data.displayName,
            avatar: data.photoURL,
            addedAt: Timestamp.now() // This is temporary, not stored
        };
    }
    
    return null;
};


// Function to add a friend
export const addFriend = async (currentUserId: string, friendId: string, friendName: string, friendAvatar: string | null = null): Promise<void> => {
    if (currentUserId === friendId) {
        throw new Error("You cannot add yourself as a friend.");
    }
    const friendDocRef = doc(db, `users/${currentUserId}/friends`, friendId);
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
    const friendsRef = collection(db, `users/${userId}/friends`);
    const q = query(friendsRef, orderBy('addedAt', 'desc'));

    const querySnapshot = await getDocs(q);
    const friends: Friend[] = [];
    querySnapshot.forEach((doc) => {
        friends.push({ id: doc.id, ...doc.data() } as Friend);
    });
    return friends;
};

export const sendChallengeNotification = async (senderId: string, senderName: string, recipientId: string, roomId: string): Promise<void> => {
    if (!recipientId) throw new Error("Recipient ID is required.");
    
    const notificationsRef = collection(db, `users/${recipientId}/notifications`);
    
    const newNotification = {
        fromUserId: senderId,
        fromUser: senderName,
        roomId: roomId,
        message: `¡${senderName} te ha desafiado a una partida de STOP!`,
        timestamp: Timestamp.now(),
        type: 'room_invite',
        status: 'pending'
    };
    
    await addDoc(notificationsRef, newNotification);
};

export const onNotificationsUpdate = (userId: string, callback: (notifications: GameInvitation[]) => void) => {
    const notificationsRef = collection(db, `users/${userId}/notifications`);
    const q = query(notificationsRef, orderBy('timestamp', 'desc'), limit(20));

    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as GameInvitation));
        callback(notifications);
    });
};

export const updateNotificationStatus = async (userId: string, notificationId: string, status: 'accepted' | 'declined'): Promise<void> => {
    const notificationDocRef = doc(db, `users/${userId}/notifications`, notificationId);
    await updateDoc(notificationDocRef, { status });
};
