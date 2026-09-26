# Twozy prototype architecture

## Information architecture

| Surface | Purpose | MVP content |
| --- | --- | --- |
| Play | Start a session with as little friction as possible | Duo status, shared-world preview, `Play together` |
| Room | Connect exactly two people | Create room, join room, connection/retry state |
| Session | Run a short cooperative set | Mini-game, friendly result, next game |
| World | Make the pair's progress visible | Shared unlocks and session milestones |
| Share | Optional social moment after a session | Result card, native share sheet |

The current prototype implements Play, World, and a one-phone version of the first mini-game. It deliberately does not present an online room as working before signaling and WebRTC are configured.

## Multiplayer boundary

```text
Room UI -> SignalingService (Firebase RTDB only) -> WebRTCTransport -> game protocol -> game engine -> mini-game UI
```

`src/games/` never imports Firebase or a WebRTC package. `MultiplayerTransport` is the only connection contract a session may use. `WebRTCTransport` will own `RTCPeerConnection` and one reliable ordered `RTCDataChannel`; it can later receive TURN servers through connection configuration without changing game code.

## Firebase Realtime Database signaling schema

```text
rooms/{roomId}
  hostId: string
  status: "waiting" | "negotiating" | "connected" | "closed"
  createdAt: server timestamp
  expiresAt: server timestamp
  offer: { type, sdp }
  answer: { type, sdp }
  candidates/
    host/{candidateId}: { candidate, sdpMid, sdpMLineIndex }
    joiner/{candidateId}: { candidate, sdpMid, sdpMLineIndex }
```

Rules should restrict a room to its host and one joiner, validate field shapes and sizes, prohibit writes after `closed`, and prevent reads after `expiresAt`. A client explicitly removes its room on normal completion; a scheduled cleanup mechanism deletes abandoned or expired rooms. No gameplay events or positions are written to this path.

## WebRTC lifecycle

1. Host creates a random, validated room ID and a peer connection, then writes its offer.
2. Joiner reads the offer, creates its peer connection and answer, then writes the answer.
3. Both peers append ICE candidates under their own branch and listen for the other branch.
4. When the DataChannel opens, each side sends a `ROUND_STARTED` handshake. The signaling listeners are detached.
5. Game actions travel only on the DataChannel. The host is authoritative for round starts and completion transitions.
6. A close, explicit leave, or timeout sends `SESSION_ENDED`, closes the peer connection, and cleans the temporary room record.
7. On `disconnected`, the UI enters a friendly reconnecting state. Try ICE restart once; if it does not recover, offer a new room. Some NATs require a future TURN relay, so direct connection is never represented as guaranteed.

## Game protocol

`src/multiplayer/protocol.ts` defines the initial compact JSON messages:

| Message | Sender | Meaning |
| --- | --- | --- |
| `ROUND_STARTED` | Host | Game ID, deterministic seed, round, shared start timestamp |
| `PLAYER_ACTION` | Either player | A validated local action and timestamp |
| `ROUND_COMPLETED` | Host | Canonical cooperative result |
| `SESSION_ENDED` | Either player | Normal completion, departure, or lost connection |

Inbound JSON is size-limited and checked against known message types before it reaches game logic. Per-message validation will additionally verify session ID, game ID, player ownership, expected phase, and timestamp tolerance.

## First mini-game: Tap Together

- **Goal:** each player taps once after the shared countdown reaches `TAP!`.
- **Inputs:** one timestamped `tap` action per player.
- **Authority:** host broadcasts a shared start timestamp and resolves the round after both actions arrive.
- **Result:** absolute difference in milliseconds produces a shared sync percentage and an encouraging message. There is no player-versus-player score.
- **Local prototype:** the two large controls let two people take one side each of a single phone. The same reducer in `src/games/mini-games/tap-together.ts` will be used when remote actions arrive via WebRTC.

## Next implementation gate

To prove real end-to-end networking, add Firebase project credentials and Firebase RTDB rules, then install and configure a React Native WebRTC library with a config plugin. Since WebRTC includes native code, it must be tested in an Expo development build—not Expo Go. Implement the signaling and transport behind the existing interfaces, then test two physical devices across same Wi-Fi and different networks before adding more games.
