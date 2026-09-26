import { FirebaseSignalingService } from '@/multiplayer/signaling/firebase-signaling';
import type { PlayerRole, Room } from '@/multiplayer/signaling/types';
import type { ConnectionState, MultiplayerTransport } from '@/multiplayer/transport';
import { WebRTCTransport } from '@/multiplayer/webrtc/webrtc-transport';

export type MultiplayerSessionSnapshot = {
  state: ConnectionState;
  roomId?: string;
  role?: PlayerRole;
  transport?: MultiplayerTransport;
  error?: string;
};

export class MultiplayerSession {
  private readonly listeners = new Set<(snapshot: MultiplayerSessionSnapshot) => void>();
  private snapshot: MultiplayerSessionSnapshot = { state: 'idle' };
  private transport?: WebRTCTransport;

  subscribe(listener: (snapshot: MultiplayerSessionSnapshot) => void) {
    this.listeners.add(listener);
    listener(this.snapshot);
    return () => { this.listeners.delete(listener); };
  }

  async createRoom(): Promise<string> {
    const signaling = new FirebaseSignalingService();
    this.publish({ state: 'connecting' });
    const room = await signaling.createRoom();
    this.connect(signaling, room, 'host');
    return room.id;
  }

  async joinRoom(roomId: string): Promise<void> {
    const signaling = new FirebaseSignalingService();
    this.publish({ state: 'connecting', roomId });
    const room = await signaling.joinRoom(roomId.trim());
    this.connect(signaling, room, 'joiner');
  }

  async disconnect() {
    await this.transport?.disconnect();
    this.transport = undefined;
    this.publish({ state: 'disconnected' });
  }

  private connect(signaling: FirebaseSignalingService, room: Room, role: PlayerRole) {
    const transport = new WebRTCTransport(signaling, room, role);
    this.transport = transport;
    this.publish({ state: 'connecting', roomId: room.id, role, transport });
    void transport.connect().then(() => {
      this.publish({ state: 'connected', roomId: room.id, role, transport });
    }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Connection took a little break. Please try again.';
      this.publish({ state: 'failed', roomId: room.id, role, error: message });
    });
  }

  private publish(snapshot: MultiplayerSessionSnapshot) {
    this.snapshot = snapshot;
    this.listeners.forEach((listener) => listener(snapshot));
  }
}

/** One app-level session survives the room route while the game route is mounted. */
export const multiplayerSession = new MultiplayerSession();
