
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
import { initializeFirebase } from '../firebase';
import type { GameState, PlayerResponses, RoundResults, PlayerResponseSet } from '../components/game/types/game-types';
import type { Language } from '../contexts/language-context';
import { rankingManager } from './ranking';
import type { ChatMessage } from '../components/chat/chat-message-item';

export interface Player {
    id: string;
    name: string;
    avatar: string;
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
    roundResults?: RoundResults;
    gameScores?: Record<string, number>;
    roundStartedAt?: any;
    roundNumber: number;
}


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
}

const db = initializeFirebase().firestore;

export async function createRoom(input: CreateRoomInput): Promise<CreateRoomOutput> {
  const { creatorId, creatorName, creatorAvatar } = input;

  if (!creatorId) {
    throw new Error('User is not authenticated.');
  }
  
  const newRoomId = generateRoomId();
  const newRoomDocRef = doc(db, "rooms", newRoomId);

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

  await setDoc(newRoomDocRef, newRoomData);

  return {
    id: newRoomId,
  };
}

export const getRoom = async (roomId: string): Promise<Room | null> => {
    if (!roomId) return null;
    const roomDocRef = doc(db, "rooms", roomId.toUpperCase());
    const docSnap = await getDoc(roomDocRef);
    return docSnap.exists() ? { ...docSnap.data(), id: docSnap.id } as Room : null;
};

export const addPlayerToRoom = async (roomId: string, playerId: string, playerName: string, playerAvatar: string | null): Promise<void> => {
    const roomDocRef = doc(db, "rooms", roomId.toUpperCase());

    await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomDocRef);
        if (!roomSnap.exists()) {
            throw new Error("La sala no existe o el código es incorrecto.");
        }

        const room = roomSnap.data() as Room;
        const playerPath = `players.${playerId}`;
        const finalPlayerName = playerName || 'Jugador Anónimo';
        
        const finalPlayerAvatar = playerAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(finalPlayerName)}`;


        if (room.players && room.players[playerId]) {
            // Player exists, just update status and info
             const updates: Record<string, any> = {
                [`${playerPath}.status`]: 'online',
                [`${playerPath}.name`]: finalPlayerName,
                [`${playerPath}.avatar`]: finalPlayerAvatar,
            };
            if(room.hostId === playerId){
                updates[`${playerPath}.isHost`] = true;
            }
            transaction.update(roomDocRef, updates);
        } else {
            // New player joining
            if (Object.keys(room.players || {}).length >= room.settings.maxPlayers) {
                throw new Error("La sala está llena. No puedes unirte.");
            }
            const newPlayer: Player = {
                id: playerId,
                name: finalPlayerName,
                avatar: finalPlayerAvatar,
                isReady: false,
                status: 'online',
                joinedAt: serverTimestamp(),
                isHost: false,
            };
            transaction.update(roomDocRef, { 
                [playerPath]: newPlayer,
                [`gameScores.${playerId}`]: 0 
            });
        }
    });
};

export const removePlayerFromRoom = async (roomId: string, playerId: string): Promise<void> => {
    const roomDocRef = doc(db, "rooms", roomId.toUpperCase());

    await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomDocRef);
        if (!roomSnap.exists()) {
            return;
        }

        const currentRoom = roomSnap.data() as Room;
        const playerPath = `players.${playerId}`;
        const gameScorePath = `gameScores.${playerId}`;
        
        const updates: { [key: string]: any } = {
            [playerPath]: deleteField(),
            [gameScorePath]: deleteField(),
        };

        if (currentRoom.hostId === playerId) {
            const otherPlayers = Object.keys(currentRoom.players).filter(id => id !== playerId);
            if (otherPlayers.length > 0) {
                const newHostId = otherPlayers.sort((a,b) => {
                    const timeA = currentRoom.players[a].joinedAt?.toMillis() || 0;
                    const timeB = currentRoom.players[b].joinedAt?.toMillis() || 0;
                    return timeA - timeB;
                })[0];
                updates['hostId'] = newHostId;
                updates[`players.${newHostId}.isHost`] = true;
            } else {
                // If last player leaves, we could also delete the room
                // For now, just nullify the host
                updates['hostId'] = null; 
            }
        }

        transaction.update(roomDocRef, updates);
    });
};


export const updatePlayerInRoom = async (roomId: string, playerId: string, data: Partial<Player>): Promise<void> => {
    const roomDocRef = doc(db, "rooms", roomId.toUpperCase());
    const updateData: Record<string, any> = {};
    for (const key in data) {
        if(Object.prototype.hasOwnProperty.call(data, key)){
            updateData[`players.${playerId}.${key as keyof Player}`] = data[key as keyof Player];
        }
    }
    
    await updateDoc(roomDocRef, updateData);
};


export const updateRoomSettings = async (roomId: string, settings: Partial<Room['settings']>): Promise<void> => {
    const roomDocRef = doc(db, "rooms", roomId.toUpperCase());
    const updateData: Record<string, any> = {};
     for (const key in settings) {
        updateData[`settings.${key}`] = settings[key as keyof typeof settings];
    }
    await updateDoc(roomDocRef, updateData);
};

export const onRoomUpdate = (roomId: string, callback: (room: Room | null) => void): (() => void) => {
    const roomDocRef = doc(db, "rooms", roomId.toUpperCase());
    const unsubscribe = onSnapshot(roomDocRef, (doc) => {
        callback(doc.exists() ? { id: doc.id, ...doc.data() } as Room : null);
    }, (error) => {
        console.error("Error en la suscripción a la sala:", error);
        callback(null);
    });
    return unsubscribe;
};


// GAME LOGIC FUNCTIONS

export const startGame = async (roomId: string) => {
    const roomDocRef = doc(db, "rooms", roomId.toUpperCase());
    const room = await getRoom(roomId);
    if (!room) return;
    
    const playerIds = Object.keys(room.players);
    const initialScores: Record<string, number> = {};
    playerIds.forEach(id => {
      initialScores[id] = 0;
    });

    await updateDoc(roomDocRef, {
        status: 'playing',
        roundNumber: 0,
        gameScores: initialScores,
        gameState: 'SPINNING', // Start directly with spinning
    });
};

export const startNextRound = async (roomId: string) => {
    const roomDocRef = doc(db, "rooms", roomId.toUpperCase());

    await updateDoc(roomDocRef, {
        gameState: 'SPINNING',
        playerResponses: {},
        roundResults: null,
    });
}

export const spinWheelAndStartRound = async (roomId: string, letter: string): Promise<void> => {
    const roomDocRef = doc(db, 'rooms', roomId.toUpperCase());

    await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomDocRef);
        if (!roomSnap.exists()) {
            throw new Error("Room does not exist.");
        }
        const room = roomSnap.data() as Room;

        transaction.update(roomDocRef, {
            gameState: 'PLAYING',
            currentLetter: letter,
            roundStartedAt: serverTimestamp(),
            roundNumber: (room.roundNumber || 0) + 1,
            playerResponses: {},
            roundResults: null,
        });
    });
};

export const submitPlayerAnswers = async (roomId: string, playerId: string, answers: PlayerResponseSet) => {
    const roomDocRef = doc(db, "rooms", roomId.toUpperCase());
    const updatePayload: { [key: string]: any } = {};
    for (const category in answers) {
        updatePayload[`playerResponses.${playerId}.${category}`] = answers[category];
    }
    await updateDoc(roomDocRef, updatePayload);
};


export const triggerGlobalStop = async (roomId: string) => {
    const roomDocRef = doc(db, "rooms", roomId.toUpperCase());
    await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomDocRef);
        if (!roomSnap.exists()) return;
        const room = roomSnap.data() as Room;
        if (room.gameState === 'PLAYING') {
            transaction.update(roomDocRef, { gameState: 'EVALUATING' });
            // The evaluation is now triggered by this state change via a listener or separate call
        }
    });
     // After the state is set, trigger the evaluation.
    await evaluateRoundForRoom(roomId);
};

export const evaluateRoundForRoom = async (roomId: string) => {
    const roomDocRef = doc(db, 'rooms', roomId.toUpperCase());

    await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomDocRef);
        if (!roomSnap.exists()) {
            throw new Error("Room data is incomplete for evaluation.");
        }
        const room = roomSnap.data() as Room;

        if (!room.currentLetter || !room.players || !room.playerResponses) {
             transaction.update(roomDocRef, { gameState: 'RESULTS', roundResults: {}, gameScores: room.gameScores || {} });
             return;
        }

        const allPlayerIds = Object.keys(room.players);
        const allWordsByCategory: Record<string, string[]> = {};
        
        // Populate all valid words submitted by all players
        for (const playerId of allPlayerIds) {
            const playerAnswers = room.playerResponses[playerId] || {};
            for (const category in playerAnswers) {
                const word = playerAnswers[category]?.trim().toLowerCase();
                if (word && word.startsWith(room.currentLetter.toLowerCase())) {
                    if (!allWordsByCategory[category]) {
                        allWordsByCategory[category] = [];
                    }
                    allWordsByCategory[category].push(word);
                }
            }
        }
        
        const finalResults: RoundResults = {};
        const newGameScores = { ...(room.gameScores || {}) };

        // Calculate scores for each player
        for (const playerId of allPlayerIds) {
            finalResults[playerId] = {};
            let roundScore = 0;
            const playerAnswers = room.playerResponses[playerId] || {};
            
            // Define categories based on one of the player's responses or a default set
            const categories = Object.keys(room.settings.language ? CATEGORIES_BY_LANG[room.settings.language] : CATEGORIES_BY_LANG['es']).map(c => c.toLowerCase());


            for (const category of Object.keys(playerAnswers)) {
                const word = playerAnswers[category]?.trim().toLowerCase() || '';
                let score = 0;
                let isValid = false;

                if (word && word.startsWith(room.currentLetter.toLowerCase())) {
                     // Very basic validation for now, just checking existence
                     const wordOccurrences = allWordsByCategory[category]?.filter(w => w === word).length || 0;
                     if(wordOccurrences > 0) {
                        isValid = true;
                        score = (wordOccurrences === 1) ? 10 : 5; // 10 if unique, 5 if repeated
                     }
                }
                finalResults[playerId][category] = { response: playerAnswers[category] || '', score, isValid };
                roundScore += score;
            }
            newGameScores[playerId] = (newGameScores[playerId] || 0) + roundScore;
        }
        
        transaction.update(roomDocRef, { 
            roundResults: finalResults,
            gameScores: newGameScores,
            gameState: 'RESULTS'
        });
    });
};

const CATEGORIES_BY_LANG: Record<string, string[]> = {
    es: ["Nombre", "Lugar", "Animal", "Objeto", "Color", "Fruta", "Marca"],
    en: ["Name", "Place", "Animal", "Thing", "Color", "Fruit", "Brand"],
    fr: ["Nom", "Lieu", "Animal", "Chose", "Couleur", "Fruit", "Marque"],
    pt: ["Nome", "Lugar", "Animal", "Coisa", "Cor", "Fruta", "Marca"],
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
