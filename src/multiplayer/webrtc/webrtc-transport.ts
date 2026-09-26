import { parseGameMessage, type GameMessage } from '@/multiplayer/protocol';
import type { ConnectionState, MultiplayerTransport } from '@/multiplayer/transport';
import type { IceCandidatePayload, PlayerRole, Room } from '@/multiplayer/signaling/types';
import type { SignalingService } from '@/multiplayer/signaling/types';
import { createIceCandidate, createPeer, normalizeDescription } from '@/multiplayer/webrtc/peer-factory';
import type { DataChannel, PeerConnection, PeerOptions } from '@/multiplayer/webrtc/peer';

const DEFAULT_ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];
const CONNECTION_TIMEOUT_MS = 30_000;

export class WebRTCTransport implements MultiplayerTransport {
  private connectionState: ConnectionState = 'idle';
  private peer?: PeerConnection;
  private channel?: DataChannel;
  private listeners = new Set<(message: GameMessage) => void>();
  private cleanups: Array<() => void> = [];
  private connected?: Promise<void>;
  private resolveConnected?: () => void;
  private rejectConnected?: (error: Error) => void;
  private connectionTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly signaling: SignalingService,
    readonly room: Room,
    private readonly role: PlayerRole,
    private readonly options: PeerOptions = { iceServers: DEFAULT_ICE_SERVERS },
  ) {}

  async connect(): Promise<void> {
    if (this.connected) return this.connected;
    this.connectionState = 'connecting';
    this.connected = new Promise<void>((resolve, reject) => { this.resolveConnected = resolve; this.rejectConnected = reject; });
    this.connectionTimer = setTimeout(() => this.fail(new Error('Your connection is taking too long. Try a different network or create a new room.')), CONNECTION_TIMEOUT_MS);
    try {
      const peer = createPeer(this.options);
      this.peer = peer;
      this.bindPeer(peer);
      if (this.role === 'host') await this.connectAsHost();
      else await this.connectAsJoiner();
    } catch (error) {
      this.fail(error);
    }
    return this.connected;
  }

  disconnect(): Promise<void> {
    if (this.connectionTimer) clearTimeout(this.connectionTimer);
    this.cleanups.forEach((cleanup) => cleanup());
    this.cleanups = [];
    this.channel?.close();
    this.peer?.close();
    this.channel = undefined;
    this.peer = undefined;
    this.connectionState = 'disconnected';
    return this.signaling.cleanupRoom(this.room.id).catch(() => undefined);
  }

  send(message: GameMessage) {
    if (this.channel?.readyState !== 'open') throw new Error('Your duo is not connected yet.');
    this.channel.send(JSON.stringify(message));
  }

  onMessage(callback: (message: GameMessage) => void) {
    this.listeners.add(callback);
    return () => { this.listeners.delete(callback); };
  }
  getConnectionState() { return this.connectionState; }

  private async connectAsHost() {
    const peer = this.requirePeer();
    this.bindChannel(peer.createDataChannel('twozy-game', { ordered: true }));
    this.cleanups.push(this.signaling.watchAnswer(this.room.id, async (answer) => {
      try { await peer.setRemoteDescription(answer); } catch (error) { this.fail(error); }
    }));
    this.watchRemoteCandidates('joiner');
    const offer = normalizeDescription(await peer.createOffer());
    await peer.setLocalDescription(offer);
    await this.signaling.setOffer(this.room.id, offer);
  }

  private async connectAsJoiner() {
    const peer = this.requirePeer();
    const room = await this.signaling.getRoom(this.room.id);
    if (!room.offer) throw new Error('Your friend is still opening the room. Try again in a moment.');
    await peer.setRemoteDescription(room.offer);
    this.watchRemoteCandidates('host');
    const answer = normalizeDescription(await peer.createAnswer());
    await peer.setLocalDescription(answer);
    await this.signaling.setAnswer(this.room.id, answer);
  }

  private bindPeer(peer: PeerConnection) {
    peer.onicecandidate = (event) => {
      if (!event.candidate) return;
      const raw = 'toJSON' in event.candidate ? event.candidate.toJSON?.() : event.candidate;
      if (raw) void this.signaling.addIceCandidate(this.room.id, this.role, raw as IceCandidatePayload);
    };
    peer.ondatachannel = (event) => this.bindChannel(event.channel);
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'failed') this.fail(new Error('The peer-to-peer connection could not be established.'));
      if (peer.connectionState === 'disconnected') this.connectionState = 'reconnecting';
    };
  }

  private bindChannel(channel: DataChannel) {
    this.channel = channel;
    channel.onopen = () => {
      if (this.connectionTimer) clearTimeout(this.connectionTimer);
      this.connectionState = 'connected';
      void this.signaling.setStatus(this.room.id, 'connected');
      this.resolveConnected?.();
    };
    channel.onclose = () => { if (this.connectionState === 'connected') this.connectionState = 'disconnected'; };
    channel.onmessage = (event) => {
      if (typeof event.data !== 'string') return;
      const message = parseGameMessage(event.data);
      if (message) this.listeners.forEach((listener) => listener(message));
    };
  }

  private watchRemoteCandidates(owner: PlayerRole) {
    this.cleanups.push(this.signaling.watchIceCandidates(this.room.id, owner, async (candidate) => {
      try { await this.requirePeer().addIceCandidate(createIceCandidate(candidate)); } catch (error) { this.fail(error); }
    }));
  }

  private requirePeer() { if (!this.peer) throw new Error('Peer connection has not been created.'); return this.peer; }
  private fail(error: unknown) {
    if (this.connectionTimer) clearTimeout(this.connectionTimer);
    const message = error instanceof Error ? error : new Error('Connection failed.');
    this.connectionState = 'failed';
    this.rejectConnected?.(message);
  }
}
