import type { IceCandidatePayload, SessionDescriptionPayload } from '@/multiplayer/signaling/types';

export type DataChannel = {
  readyState: 'connecting' | 'open' | 'closing' | 'closed';
  send(data: string): void;
  close(): void;
  onopen: (() => void) | null;
  onclose: (() => void) | null;
  onmessage: ((event: { data: unknown }) => void) | null;
};

export type PeerConnection = {
  connectionState: string;
  createDataChannel(label: string, options?: { ordered?: boolean }): DataChannel;
  createOffer(): Promise<SessionDescriptionPayload>;
  createAnswer(): Promise<SessionDescriptionPayload>;
  setLocalDescription(description: SessionDescriptionPayload): Promise<void>;
  setRemoteDescription(description: SessionDescriptionPayload): Promise<void>;
  addIceCandidate(candidate: IceCandidatePayload): Promise<void>;
  close(): void;
  onicecandidate: ((event: { candidate: { toJSON?: () => IceCandidatePayload } | IceCandidatePayload | null }) => void) | null;
  onconnectionstatechange: (() => void) | null;
  ondatachannel: ((event: { channel: DataChannel }) => void) | null;
};

export type PeerOptions = { iceServers?: Array<{ urls: string | string[]; username?: string; credential?: string }> };
