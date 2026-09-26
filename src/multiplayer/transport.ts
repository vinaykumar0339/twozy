import type { GameMessage } from '@/multiplayer/protocol';

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'failed';

/**
 * Mini-games only know this contract. A future WebRTC implementation sends through a
 * DataChannel; Firebase remains limited to room discovery and SDP/ICE signaling.
 */
export interface MultiplayerTransport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(message: GameMessage): void;
  onMessage(callback: (message: GameMessage) => void): () => void;
  getConnectionState(): ConnectionState;
}
