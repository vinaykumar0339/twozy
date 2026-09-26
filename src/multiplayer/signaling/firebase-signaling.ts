import { get, onChildAdded, onValue, push, ref, remove, runTransaction, set, update } from 'firebase/database';

import { getAnonymousUserId, getTwozyDatabase } from '@/multiplayer/firebase';
import type { IceCandidatePayload, PlayerRole, Room, RoomStatus, SessionDescriptionPayload, SignalingService } from '@/multiplayer/signaling/types';

const ROOM_TTL_MS = 30 * 60 * 1000;
const ROOM_CODE = /^[A-Za-z0-9_-]{8,64}$/;

function isRoom(value: unknown, id: string): value is Room {
  if (!value || typeof value !== 'object') return false;
  const room = value as Partial<Room>;
  return typeof room.hostId === 'string' && typeof room.status === 'string' && typeof room.createdAt === 'number' && typeof room.expiresAt === 'number' && room.id === id;
}

function requireRoomCode(roomId: string) {
  if (!ROOM_CODE.test(roomId)) throw new Error('That room code does not look right.');
}

export class FirebaseSignalingService implements SignalingService {
  private readonly database = getTwozyDatabase();

  async createRoom(): Promise<Room> {
    const hostId = await getAnonymousUserId();
    const roomRef = push(ref(this.database, 'rooms'));
    if (!roomRef.key) throw new Error('Could not create a room code. Please try again.');
    const room: Room = { id: roomRef.key, hostId, status: 'waiting', createdAt: Date.now(), expiresAt: Date.now() + ROOM_TTL_MS };
    await set(roomRef, room);
    return room;
  }

  async getRoom(roomId: string): Promise<Room> {
    requireRoomCode(roomId);
    const snapshot = await get(ref(this.database, `rooms/${roomId}`));
    if (!isRoom(snapshot.val(), roomId)) throw new Error('That room is no longer available.');
    const room = snapshot.val() as Room;
    if (room.expiresAt <= Date.now() || room.status === 'closed') throw new Error('That room has expired.');
    return room;
  }

  async joinRoom(roomId: string): Promise<Room> {
    requireRoomCode(roomId);
    const joinerId = await getAnonymousUserId();
    const roomRef = ref(this.database, `rooms/${roomId}`);
    const room = await this.getRoom(roomId);
    const result = await runTransaction(ref(this.database, `rooms/${roomId}/joinerId`), (current: string | null) => {
      if (room.expiresAt <= Date.now() || (current && current !== joinerId)) return;
      return joinerId;
    });
    if (!result.committed || result.snapshot.val() !== joinerId) throw new Error('That room is full or has expired.');
    await update(roomRef, { status: 'negotiating' });
    return this.getRoom(roomId);
  }

  async setOffer(roomId: string, offer: SessionDescriptionPayload) { await update(ref(this.database, `rooms/${roomId}`), { offer, status: 'negotiating' }); }
  async setAnswer(roomId: string, answer: SessionDescriptionPayload) { await update(ref(this.database, `rooms/${roomId}`), { answer }); }
  async setStatus(roomId: string, status: RoomStatus) { await update(ref(this.database, `rooms/${roomId}`), { status }); }
  async addIceCandidate(roomId: string, owner: PlayerRole, candidate: IceCandidatePayload) { await set(push(ref(this.database, `rooms/${roomId}/candidates/${owner}`)), candidate); }
  async cleanupRoom(roomId: string) { await remove(ref(this.database, `rooms/${roomId}`)); }

  watchAnswer(roomId: string, callback: (answer: SessionDescriptionPayload) => void) {
    return onValue(ref(this.database, `rooms/${roomId}/answer`), (snapshot) => {
      const answer = snapshot.val() as SessionDescriptionPayload | null;
      if (answer?.type === 'answer' && typeof answer.sdp === 'string') callback(answer);
    });
  }

  watchIceCandidates(roomId: string, owner: PlayerRole, callback: (candidate: IceCandidatePayload) => void) {
    return onChildAdded(ref(this.database, `rooms/${roomId}/candidates/${owner}`), (snapshot) => {
      const candidate = snapshot.val() as IceCandidatePayload | null;
      if (candidate && typeof candidate.candidate === 'string') callback(candidate);
    });
  }
}
