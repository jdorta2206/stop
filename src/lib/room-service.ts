

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
    limit,
    where,
    Timestamp
} from "firebase/firestore";
import type { GameState, PlayerResponses, RoundResults, PlayerResponseSet } from '@/components/game/types/game-types';
import type { EvaluateRoundOutput } from '@/ai/flows/validate-player-word-flow';
import { evaluateRound } from '@/ai/flows/validate-player-word-flow';
import type { Language } from '@/contexts/language-context';
import { rankingManager } from './ranking';
import type { ChatMessage } from '@/components/chat/chat-message-item';

export interface Player {
    id: string;
    name: string;
    avatar: string; // Avatar is now always a string
    isReady: boolean;
    status: 'online' | 'away' | 'offline';
    joinedAt: any;
    isHost: boolean;
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
    gameState?: GameState;
    currentLetter?: string | null;
    playerResponses?: PlayerResponses;
    roundResults?: Record<string, Record<string, { response: string; score: number; isValid: boolean; }>>;
    gameScores?: Record<string, number>;
    roundStartedAt?: any;
    roundNumber: number;
}

const roomsCollection = collection(db, 'rooms');
const ALPHABET = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

function generateRoomId(length: number = 6): string {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


export interface CreateRoomInput {
  creatorId: string;
  creatorName: string | null;
  creatorAvatar: string | null;
}

export interface CreateRoomOutput {
  id: string;
  hostId: string;
  status: string;
}

export const createRoom = async (input: CreateRoomInput): Promise<CreateRoomOutput> => {
  const { creatorId, creatorName, creatorAvatar } = input;

  if (!creatorId) {
    throw new Error('User is not authenticated.');
  }
  
  const newRoomId = generateRoomId();
  const newRoomDocRef = doc(db, "rooms", newRoomId);

  // Safely handle nullable user data to prevent Firestore errors
  const finalCreatorName = creatorName || 'Jugador Anónimo';
  const finalCreatorAvatar = creatorAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(finalCreatorName)}`;

  const hostPlayer: Player = {
    id: creatorId,
    name: finalCreatorName,
    avatar: finalCreatorAvatar,
    isReady: false,
    status: 'online',
    joinedAt: serverTimestamp(),
    isHost: true,
  };

  const newRoomData: Omit<Room, 'id'> = {
      players: { [creatorId]: hostPlayer },
      hostId: creatorId,
      createdAt: serverTimestamp(),
      status: 'waiting',
      settings: {
        maxPlayers: 10,
        roundDuration: 60,
        isPrivate: true,
        language: 'es',
      },
      gameScores: { [creatorId]: 0 },
      roundNumber: 0,
  };

  // CRITICAL: Use await to ensure the document is created before returning
  await setDoc(newRoomDocRef, newRoomData);

  return {
    id: newRoomId,
    hostId: creatorId,
    status: 'waiting',
  };
};

export const getRoom = async (roomId: string): Promise<Room | null> => {
    if (!roomId) return null;
    const roomDocRef = doc(roomsCollection, roomId.toUpperCase());
    const docSnap = await getDoc(roomDocRef);
    return docSnap.exists() ? { ...docSnap.data(), id: docSnap.id } as Room : null;
};

export const addPlayerToRoom = async (roomId: string, playerId: string, playerName: string, playerAvatar: string | null): Promise<void> => {
    const roomDocRef = doc(roomsCollection, roomId.toUpperCase());

    await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomDocRef);
        if (!roomSnap.exists()) {
            throw new Error("La sala no existe.");
        }

        const room = roomSnap.data() as Room;
        const playerPath = `players.${playerId}`;
        const finalPlayerName = playerName || 'Jugador Anónimo';
        
        let finalPlayerAvatar = playerAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(finalPlayerName)}`;


        if (room.players && room.players[playerId]) {
            // Player exists, just update status and info
             const updates: Record<string, any> = {
                [`${playerPath}.status`]: 'online',
                [`${playerPath}.name`]: finalPlayerName,
                [`${playerPath}.avatar`]: finalPlayerAvatar,
            };
            // If the player joining is the host, ensure their host status is preserved.
            if(room.hostId === playerId){
                updates[`${playerPath}.isHost`] = true;
            }
            transaction.update(roomDocRef, updates);
        } else {
            // New player joining
            if (Object.keys(room.players || {}).length >= room.settings.maxPlayers) {
                throw new Error("La sala está llena.");
            }
            const newPlayer: Player = {
                id: playerId,
                name: finalPlayerName,
                avatar: finalPlayerAvatar,
                isReady: false,
                status: 'online',
                joinedAt: serverTimestamp(),
                isHost: false, // A new player joining is never the host initially
            };
            transaction.update(roomDocRef, { 
                [playerPath]: newPlayer,
                [`gameScores.${playerId}`]: 0 // Initialize score for new player
            });
        }
    });
};

export const removePlayerFromRoom = async (roomId: string, playerId: string): Promise<void> => {
    const roomDocRef = doc(roomsCollection, roomId.toUpperCase());
    const room = await getRoom(roomId);
    if (!room) return;

    await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomDocRef);
        if (!roomSnap.exists()) {
            return;
        }

        const currentRoom = roomSnap.data() as Room;
        const playerPath = `players.${playerId}`;
        const gameScorePath = `gameScores.${playerId}`;
        
        // Prepare updates to remove player data
        const updates: { [key: string]: any } = {
            [playerPath]: deleteField(),
            [gameScorePath]: deleteField(),
        };

        // If the player leaving is the host, assign a new host
        if (currentRoom.hostId === playerId) {
            const otherPlayers = Object.keys(currentRoom.players).filter(id => id !== playerId);
            if (otherPlayers.length > 0) {
                const newHostId = otherPlayers[0]; // Assign the first player in the list as the new host
                updates['hostId'] = newHostId;
                updates[`players.${newHostId}.isHost`] = true;
            } else {
                // If no players are left, maybe the room should be deleted or marked as inactive
                // For now, just remove the host
                updates['hostId'] = null; 
            }
        }

        transaction.update(roomDocRef, updates);
    });
};


export const updatePlayerInRoom = async (roomId: string, playerId: string, data: Partial<Player>): Promise<void> => {
    const roomDocRef = doc(roomsCollection, roomId.toUpperCase());
    const updateData: Record<string, any> = {};
    for (const key in data) {
        if(Object.prototype.hasOwnProperty.call(data, key)){
            const typedKey = key as keyof Player;
            // Ensure avatar is always a string
            if(typedKey === 'avatar' && !data[typedKey]){
                continue; // Do not update avatar to null or undefined
            }
            updateData[`players.${playerId}.${typedKey}`] = data[typedKey];
        }
    }
    
    const docSnap = await getDoc(roomDocRef);
    if (docSnap.exists()) {
        await updateDoc(roomDocRef, updateData);
    } else {
        console.warn(`Attempted to update player in a room that does not exist: ${roomId}`);
    }
};


export const updateRoomSettings = async (roomId: string, settings: Partial<Room['settings']>): Promise<void> => {
    const roomDocRef = doc(roomsCollection, roomId.toUpperCase());
    const updateData: Record<string, any> = {};
     for (const key in settings) {
        updateData[`settings.${key}`] = settings[key as keyof typeof settings];
    }
    await updateDoc(roomDocRef, updateData);
};

export const onRoomUpdate = (roomId: string, callback: (room: Room | null) => void) => {
    const roomDocRef = doc(roomsCollection, roomId.toUpperCase());
    return onSnapshot(roomDocRef, (doc) => {
        callback(doc.exists() ? { id: doc.id, ...doc.data() } as Room : null);
    });
};

// GAME LOGIC FUNCTIONS

export const startGame = async (roomId: string) => {
    const roomDocRef = doc(roomsCollection, roomId.toUpperCase());
    const room = await getRoom(roomId);
    if (!room) return;
    
    const playerIds = Object.keys(room.players);
    const initialScores: Record<string, number> = {};
    playerIds.forEach(id => {
      initialScores[id] = 0;
    });

    await updateDoc(roomDocRef, {
        status: 'playing',
        gameState: 'SPINNING',
        roundNumber: 1,
        gameScores: initialScores,
    });
    // Start the first round after a short delay
    setTimeout(() => startNextRound(roomId), 1000);
};

export const startNextRound = async (roomId: string) => {
    const roomDocRef = doc(roomsCollection, roomId.toUpperCase());
    const room = await getRoom(roomId);
    if (!room) return;

    const letter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];

    const playerIds = Object.keys(room.players);
    const initialResponses: PlayerResponses = {};
    playerIds.forEach(id => {
      initialResponses[id] = {};
    });

    await updateDoc(roomDocRef, {
        gameState: 'PLAYING',
        currentLetter: letter,
        playerResponses: initialResponses,
        roundResults: null,
        roundStartedAt: serverTimestamp(),
    });
}

export const submitPlayerAnswers = async (roomId: string, playerId: string, answers: PlayerResponseSet) => {
    const roomDocRef = doc(roomsCollection, roomId.toUpperCase());
    // Use dot notation for nested fields for atomic updates
    const updatePayload: { [key: string]: any } = {};
    for (const category in answers) {
        // This ensures we are setting a field within the player's response object
        updatePayload[`playerResponses.${playerId}.${category}`] = answers[category];
    }
    await updateDoc(roomDocRef, updatePayload);
};


export const triggerGlobalStop = async (roomId: string) => {
    const roomDocRef = doc(roomsCollection, roomId.toUpperCase());
    const room = await getRoom(roomId);
    if(room?.gameState === 'PLAYING') {
      await updateDoc(roomDocRef, { gameState: 'EVALUATING' });
      await evaluateRoundForRoom(roomId);
    }
};

export const evaluateRoundForRoom = async (roomId: string) => {
    const room = await getRoom(roomId.toUpperCase());
    if (!room || !room.currentLetter || !room.players) {
        throw new Error("Room data is incomplete for evaluation.");
    }
    
    const roomDocRef = doc(roomsCollection, roomId.toUpperCase());
    await updateDoc(roomDocRef, { gameState: 'EVALUATING' });

    const allPlayerIds = Object.keys(room.players);
    const allWordsByCategory: Record<string, string[]> = {};
    
    // 1. Collect all valid words from all players
    for (const playerId of allPlayerIds) {
        const playerAnswers = room.playerResponses?.[playerId] || {};
        const categories = Object.keys(playerAnswers);

        for (const category of categories) {
            const word = playerAnswers[category]?.trim().toLowerCase();
            if (word) {
                // Simplified validation: just check if it starts with the letter
                // A full implementation would use a dictionary or an AI call here
                if (word.startsWith(room.currentLetter.toLowerCase())) {
                    if (!allWordsByCategory[category]) {
                        allWordsByCategory[category] = [];
                    }
                    allWordsByCategory[category].push(word);
                }
            }
        }
    }
    
    // 2. Calculate scores
    const finalResults: Record<string, Record<string, { response: string; score: number; isValid: boolean }>> = {};
    const roundScores: Record<string, number> = {};
    const newGameScores: Record<string, number> = room.gameScores || {};

    for (const playerId of allPlayerIds) {
        finalResults[playerId] = {};
        roundScores[playerId] = 0;
        const playerAnswers = room.playerResponses?.[playerId] || {};
        const categories = Object.keys(playerAnswers);

        for (const category of categories) {
            const word = playerAnswers[category]?.trim().toLowerCase() || '';
            let score = 0;
            let isValid = false;

            if (word && word.startsWith(room.currentLetter.toLowerCase())) {
                 const wordOccurrences = allWordsByCategory[category]?.filter(w => w === word).length || 0;
                 if(wordOccurrences > 0) { // Should be at least 1 if submitted
                    isValid = true;
                    if (wordOccurrences === 1) {
                        score = 10; // Unique word
                    } else {
                        score = 5; // Repeated word
                    }
                 }
            }

            finalResults[playerId][category] = { response: playerAnswers[category] || '', score, isValid };
            roundScores[playerId] += score;
        }
        newGameScores[playerId] = (newGameScores[playerId] || 0) + roundScores[playerId];
    }
    
    // 3. Save results to Firestore and update game state
    await updateDoc(roomDocRef, { 
        roundResults: finalResults,
        gameScores: newGameScores,
        gameState: 'RESULTS'
    });

    // 4. Save individual game results for player history (optional but good for stats)
    for (const playerId of allPlayerIds) {
        const playerInfo = room.players[playerId];
        const playerRoundScore = roundScores[playerId] || 0;
        const won = playerRoundScore > 0 && playerRoundScore === Math.max(...Object.values(roundScores));

        await rankingManager.saveGameResult({
            playerId,
            playerName: playerInfo.name,
            photoURL: playerInfo.avatar,
            score: playerRoundScore,
            categories: room.playerResponses?.[playerId] || {},
            letter: room.currentLetter,
            gameMode: 'private',
            roomId: roomId,
            won
        });
    }
};

// CHAT FUNCTIONS
export const sendMessageToRoom = async (roomId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<void> => {
    const chatCollectionRef = collection(db, `rooms/${roomId.toUpperCase()}/chat`);
    await addDoc(chatCollectionRef, {
        ...message,
        timestamp: serverTimestamp(),
    });
};

export const onChatUpdate = (roomId: string, callback: (messages: ChatMessage[]) => void) => {
    const chatCollectionRef = collection(db, `rooms/${roomId.toUpperCase()}/chat`);
    const q = query(chatCollectionRef, orderBy('timestamp', 'asc'), limit(50));

    return onSnapshot(q, (querySnapshot) => {
        const messages: ChatMessage[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
                id: doc.id,
                text: data.text,
                sender: data.sender,
                timestamp: data.timestamp?.toDate() || new Date(),
            } as ChatMessage);
        });
        callback(messages);
    });
};
