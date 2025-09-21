
'use server';
/**
 * @fileOverview A flow to create a new game room in Firestore.
 */

import { ai } from '@/lib/genkit';
import { z } from 'zod';
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Player, Room } from '@/lib/room-service';
import type { Language } from '@/contexts/language-context';


const CreateRoomInputSchema = z.object({
  creatorId: z.string().describe('The ID of the user creating the room.'),
  creatorName: z.string().describe('The display name of the creator.'),
  creatorAvatar: z.string().nullable().describe('The avatar URL of the creator.'),
});

const CreateRoomOutputSchema = z.object({
    id: z.string(),
    hostId: z.string(),
    status: z.string(),
});

export type CreateRoomInput = z.infer<typeof CreateRoomInputSchema>;
export type CreateRoomOutput = z.infer<typeof CreateRoomOutputSchema>;

export async function createRoom(input: CreateRoomInput): Promise<CreateRoomOutput> {
  return await createRoomFlow(input);
}

const createRoomFlow = ai.defineFlow(
  {
    name: 'createRoomFlow',
    inputSchema: CreateRoomInputSchema,
    outputSchema: CreateRoomOutputSchema,
  },
  async (input: CreateRoomInput) => {
    const { creatorId, creatorName, creatorAvatar } = input;

    const finalCreatorName = creatorName || 'Jugador Anónimo';
    const finalCreatorAvatar =
      creatorAvatar ||
      `https://api.dicebear.com/7.x/pixel-art/svg?seed=${finalCreatorName}`;

    const creatorPlayer: Player = {
      id: creatorId,
      name: finalCreatorName,
      avatar: finalCreatorAvatar,
      isReady: false,
      status: 'online',
      joinedAt: serverTimestamp(),
      isHost: true,
    };

    const newRoomData: Omit<Room, 'id'> = {
      players: {
        [creatorId]: creatorPlayer,
      },
      hostId: creatorId,
      createdAt: serverTimestamp(),
      status: 'waiting',
      settings: {
        maxPlayers: 10,
        roundDuration: 60,
        isPrivate: true,
        language: 'es' as Language,
      },
    };

    const roomsCollection = collection(db, 'rooms');
    const roomDocRef = await addDoc(roomsCollection, newRoomData);

    return {
      id: roomDocRef.id,
      hostId: newRoomData.hostId,
      status: newRoomData.status,
    };
  }
);
