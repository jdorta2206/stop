
import { db } from './firebase';
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection, 
    serverTimestamp,
    onSnapshot,
    deleteField,
    runTransaction,
    addDoc,
    query,
    orderBy,
    limit
} from "firebase/firestore";
import type { GameState, PlayerResponses, RoundResults } from '@/components/game/types/game-types';
import { evaluateRound } from '@/ai/flows/validate-player-word-flow';
import type { Language } from '@/contexts/language-context';
import { rankingManager } from './ranking';
import type { ChatMessage } from '@/components/chat/chat-message-item';

export interface Player {
    id: string;
    name: string;
    avatar?: string | null;
    isReady: boolean;
    status: 'online' | 'away' | 'offline';
    joinedAt: any;
    isHost?: boolean;
}

export interface Room {
    id: string;
    players: Record<string, Player>;
    createdAt: any;
    status: 'waiting' | 'playing' | 'finished';
    hostId: string;
    settings: {
        maxPlayers: number;
        roundDuration: number;
        isPrivate: boolean;
        language: Language;
        password?: string;
    };
    // State for the actual game
    gameState?: GameState;
    currentLetter?: string | null;
    playerResponses?: PlayerResponses;
    roundResults?: RoundResults | null;
    gameScores?: Record<string, number>;
    roundStartedAt?: any;
}

const roomsCollection = collection(db, 'rooms');

const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createRoom = async (creatorId: string, creatorName?: string | null, creatorAvatar?: string | null): Promise<Room> => {
    const roomId = generateRoomId();
    
    // Fetch player profile to ensure we have the most up-to-date info.
    const playerProfile = await rankingManager.getPlayerRanking(creatorId, creatorName, creatorAvatar);

    const creatorPlayer: Player = {
        id: creatorId,
        name: playerProfile.playerName,
        avatar: playerProfile.photoURL,
        isReady: false,
        status: 'online',
        joinedAt: serverTimestamp(),
        isHost: true,
    };

    const newRoom: Room = {
        id: roomId,
        players: {
            [creatorId]: creatorPlayer,
        },
        hostId: creatorId,
        createdAt: serverTimestamp(),
        status: 'waiting',
        settings: {
            maxPlayers: 8,
            roundDuration: 60,
            isPrivate: true,
            language: 'es'
        },
    };

    const roomDocRef = doc(roomsCollection, roomId);
    await setDoc(roomDocRef, newRoom);
    return newRoom;
};

export const getRoom = async (roomId: string): Promise<Room | null> => {
    const roomDocRef = doc(roomsCollection, roomId);
    const docSnap = await getDoc(roomDocRef);
    return docSnap.exists() ? docSnap.data() as Room : null;
};

export const addPlayerToRoom = async (roomId: string, playerId: string, playerName: string, playerAvatar: string | null): Promise<void> => {
    const room = await getRoom(roomId);
    if (!room) throw new Error("Room not found");

    // Si el jugador ya existe, simplemente actualiza su estado a online y sus datos
    if (room.players[playerId]) {
        await updatePlayerInRoom(roomId, playerId, { 
            status: 'online', 
            name: playerName, 
            avatar: playerAvatar 
        });
        return;
    }

    if (Object.keys(room.players).length >= room.settings.maxPlayers) {
        throw new Error("Room is full");
    }

    const newPlayer: Player = {
        id: playerId,
        name: playerName,
        avatar: playerAvatar,
        isReady: false,
        status: 'online',
        joinedAt: serverTimestamp(),
    };

    const roomDocRef = doc(roomsCollection, roomId);
    await updateDoc(roomDocRef, {
        [`players.${playerId}`]: newPlayer,
    });
};

export const removePlayerFromRoom = async (roomId: string, playerId: string): Promise<void> => {
    const roomDocRef = doc(roomsCollection, roomId);
    await updateDoc(roomDocRef, {
        [`players.${playerId}`]: deleteField()
    });
};

export const updatePlayerInRoom = async (roomId: string, playerId: string, data: Partial<Player>): Promise<void> => {
    const roomDocRef = doc(roomsCollection, roomId);
    const updateData: Record<string, any> = {};
    for (const key in data) {
        updateData[`players.${playerId}.${key}`] = data[key as keyof typeof data];
    }
    await updateDoc(roomDocRef, updateData);
};

export const updateRoomSettings = async (roomId: string, settings: Partial<Room['settings']>): Promise<void> => {
    const roomDocRef = doc(roomsCollection, roomId);
    const updateData: Record<string, any> = {};
     for (const key in settings) {
        updateData[`settings.${key}`] = settings[key as keyof typeof settings];
    }
    await updateDoc(roomDocRef, updateData);
};

export const onRoomUpdate = (roomId: string, callback: (room: Room | null) => void) => {
    const roomDocRef = doc(roomsCollection, roomId);
    return onSnapshot(roomDocRef, (doc) => {
        callback(doc.exists() ? doc.data() as Room : null);
    });
};

// GAME LOGIC FUNCTIONS

export const startGame = async (roomId: string) => {
    const roomDocRef = doc(roomsCollection, roomId);
    await updateDoc(roomDocRef, {
        status: 'playing',
        gameState: 'SPINNING',
        playerResponses: {},
        roundResults: null,
    });
};

export const setLetterForRound = async (roomId: string, letter: string) => {
    const roomDocRef = doc(roomsCollection, roomId);
    
    // Use a transaction to prevent multiple players setting the letter
    await runTransaction(db, async (transaction) => {
        const roomDoc = await transaction.get(roomDocRef);
        if (!roomDoc.exists()) throw "Document does not exist!";
        
        // Only set letter if still in SPINNING state
        if (roomDoc.data().gameState === 'SPINNING') {
            transaction.update(roomDocRef, { 
                currentLetter: letter,
                gameState: 'PLAYING',
                roundStartedAt: serverTimestamp(),
            });
        }
    });
};


export const submitPlayerAnswers = async (roomId: string, playerId: string, answers: Record<string, string>) => {
    const roomDocRef = doc(roomsCollection, roomId);
    await updateDoc(roomDocRef, {
        [`playerResponses.${playerId}`]: answers,
    });
};

export const triggerGlobalStop = async (roomId: string) => {
    const roomDocRef = doc(roomsCollection, roomId);
    const room = await getRoom(roomId);
    if(room?.gameState === 'PLAYING') {
      await updateDoc(roomDocRef, { gameState: 'EVALUATING' });
      await evaluateRoundForRoom(roomId);
    }
};


export const evaluateRoundForRoom = async (roomId: string) => {
     const room = await getRoom(roomId);
    if (!room || !room.currentLetter || !room.playerResponses) {
        throw new Error("Room data is incomplete for evaluation.");
    }
    
    const roomDocRef = doc(roomsCollection, roomId);
    await updateDoc(roomDocRef, { gameState: 'EVALUATING' });

    const allPlayerIds = Object.keys(room.players);
    const finalResults: Record<string, any> = {};
    const roundScores: Record<string, number> = {};

    for (const playerId of allPlayerIds) {
        const playerAnswers = room.playerResponses[playerId] || {};
        const payload = Object.keys(playerAnswers).map(category => ({
            category,
            word: playerAnswers[category] || ""
        }));

        try {
            const result = await evaluateRound({
                letter: room.currentLetter,
                language: room.settings.language,
                playerResponses: payload,
            });
            
            let playerScore = 0;
            if (result.results) {
                for (const category in result.results) {
                    playerScore += result.results[category].player.score;
                }
            }
            finalResults[playerId] = result.results;
            roundScores[playerId] = playerScore;
            
        } catch (e) {
            finalResults[playerId] = {};
            roundScores[playerId] = 0;
        }
    }

    const winnerId = Object.keys(roundScores).reduce((a, b) => roundScores[a] > roundScores[b] ? a : b);

     for (const playerId of allPlayerIds) {
        const playerInfo = room.players[playerId];
        await rankingManager.saveGameResult({
            playerId,
            playerName: playerInfo.name,
            photoURL: playerInfo.avatar,
            score: roundScores[playerId] || 0,
            categories: room.playerResponses[playerId] || {},
            letter: room.currentLetter,
            gameMode: 'private',
            roomId: roomId,
            won: playerId === winnerId,
        });
     }
    
    await updateDoc(roomDocRef, { 
        roundResults: finalResults,
        gameState: 'RESULTS'
    });
};

// CHAT FUNCTIONS
export const sendMessageToRoom = async (roomId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<void> => {
    const chatCollectionRef = collection(db, `rooms/${roomId}/chat`);
    await addDoc(chatCollectionRef, {
        ...message,
        timestamp: serverTimestamp(),
    });
};

export const onChatUpdate = (roomId: string, callback: (messages: ChatMessage[]) => void) => {
    const chatCollectionRef = collection(db, `rooms/${roomId}/chat`);
    const q = query(chatCollectionRef, orderBy('timestamp', 'asc'), limit(50));

    return onSnapshot(q, (querySnapshot) => {
        const messages: ChatMessage[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toDate() || new Date(),
            } as ChatMessage);
        });
        callback(messages);
    });
};
