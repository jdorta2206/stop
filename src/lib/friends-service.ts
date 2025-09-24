

import { db } from './firebase-config';
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
  recipientId: string;
  roomId: string;
  message: string;
  timestamp: Timestamp;
  type: 'room_invite' | 'game_start' | 'game_finish' | 'chat_mention';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
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
            addedAt: Timestamp.now()
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
        avatar: friendAvatar || null,
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
        friends.push({ id: doc.id, ...doc.data() } as Friend);
    });
    return friends;
};

export const sendChallengeNotification = async (senderId: string, senderName: string, recipientId: string, roomId: string): Promise<void> => {
    if (!recipientId) {
      throw new Error("El ID del destinatario es requerido.");
    }
    
    const recipientDocRef = doc(db, 'rankings', recipientId);
    const recipientDoc = await getDoc(recipientDocRef);
    if (!recipientDoc.exists()) {
        throw new Error(`El jugador al que intentas invitar no existe.`);
    }

    const notificationsRef = collection(db, 'notifications');
    const newNotification = {
        fromUserId: senderId,
        fromUser: senderName,
        recipientId: recipientId,
        roomId: roomId,
        message: `¡${senderName} te ha desafiado a una partida de STOP!`,
        timestamp: Timestamp.now(),
        type: 'room_invite' as const,
        status: 'pending' as const,
    };
    
    await addDoc(notificationsRef, newNotification);
};


export const onNotificationsUpdate = (userId: string, callback: (notifications: GameInvitation[]) => void) => {
    const notificationsRef = collection(db, `notifications`);
    const q = query(
        notificationsRef, 
        where('recipientId', '==', userId), 
        orderBy('timestamp', 'desc'), 
        limit(20)
    );

    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as GameInvitation));
        callback(notifications);
    });
};

export const updateNotificationStatus = async (notificationId: string, status: 'accepted' | 'declined'): Promise<void> => {
    const notificationDocRef = doc(db, `notifications`, notificationId);
    await updateDoc(notificationDocRef, { status });
};
