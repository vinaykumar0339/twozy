import type { IceCandidatePayload, SessionDescriptionPayload } from '@/multiplayer/signaling/types';
import type { PeerConnection, PeerOptions } from '@/multiplayer/webrtc/peer';

export function createPeer(options: PeerOptions): PeerConnection {
  return new RTCPeerConnection(options) as unknown as PeerConnection;
}

export function createIceCandidate(candidate: IceCandidatePayload): IceCandidatePayload {
  return candidate;
}

export function normalizeDescription(description: RTCSessionDescriptionInit): SessionDescriptionPayload {
  if (!description.type || !description.sdp) throw new Error('WebRTC returned an incomplete session description.');
  return { type: description.type as 'offer' | 'answer', sdp: description.sdp };
}
