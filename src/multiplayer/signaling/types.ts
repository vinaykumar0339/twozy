export type PlayerRole = 'host' | 'joiner';
export type RoomStatus = 'waiting' | 'negotiating' | 'connected' | 'closed';

export type SessionDescriptionPayload = { type: 'offer' | 'answer'; sdp: string };
export type IceCandidatePayload = { candidate: string; sdpMid: string | null; sdpMLineIndex: number | null };

export type Room = {
  id: string;
  hostId: string;
  joinerId?: string;
  status: RoomStatus;
  createdAt: number;
  expiresAt: number;
  offer?: SessionDescriptionPayload;
  answer?: SessionDescriptionPayload;
};

export interface SignalingService {
  createRoom(): Promise<Room>;
  joinRoom(roomId: string): Promise<Room>;
  getRoom(roomId: string): Promise<Room>;
  setOffer(roomId: string, offer: SessionDescriptionPayload): Promise<void>;
  setAnswer(roomId: string, answer: SessionDescriptionPayload): Promise<void>;
  addIceCandidate(roomId: string, owner: PlayerRole, candidate: IceCandidatePayload): Promise<void>;
  setStatus(roomId: string, status: RoomStatus): Promise<void>;
  watchAnswer(roomId: string, callback: (answer: SessionDescriptionPayload) => void): () => void;
  watchIceCandidates(roomId: string, owner: PlayerRole, callback: (candidate: IceCandidatePayload) => void): () => void;
  cleanupRoom(roomId: string): Promise<void>;
}
