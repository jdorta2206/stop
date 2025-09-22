import { NextResponse } from 'next/server';
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Player, Room } from '@/lib/room-service';
import type { Language } from '@/contexts/language-context';

// Define input and output types for clarity, mirroring the old flow structure
export interface CreateRoomInput {
  creatorId: string;
  creatorName: string;
  creatorAvatar: string | null;
}

export interface CreateRoomOutput {
  id: string;
  hostId: string;
  status: string;
}

export async function POST(request: Request) {
  try {
    const input: CreateRoomInput = await request.json();
    const { creatorId, creatorName, creatorAvatar } = input;

    if (!creatorId || !creatorName) {
      return NextResponse.json({ error: 'Missing creator ID or name' }, { status: 400 });
    }

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

    const response: CreateRoomOutput = {
      id: roomDocRef.id,
      hostId: newRoomData.hostId,
      status: newRoomData.status,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error creating room:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
