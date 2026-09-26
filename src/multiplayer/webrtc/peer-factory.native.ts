import { RTCIceCandidate, RTCPeerConnection } from 'react-native-webrtc';

import type { IceCandidatePayload, SessionDescriptionPayload } from '@/multiplayer/signaling/types';
import type { PeerConnection, PeerOptions } from '@/multiplayer/webrtc/peer';

export function createPeer(options: PeerOptions): PeerConnection {
  return new RTCPeerConnection(options) as unknown as PeerConnection;
}

export function createIceCandidate(candidate: IceCandidatePayload): IceCandidatePayload {
  return new RTCIceCandidate(candidate).toJSON() as IceCandidatePayload;
}

export function normalizeDescription(description: { type?: string; sdp?: string | null }): SessionDescriptionPayload {
  if (!description.type || !description.sdp) throw new Error('WebRTC returned an incomplete session description.');
  return { type: description.type as 'offer' | 'answer', sdp: description.sdp };
}
