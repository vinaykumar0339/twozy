import type { GameAction, GameResult } from '@/games/engine/types';

export type GameMessage =
  | { type: 'ROUND_STARTED'; sessionId: string; gameId: string; round: number; seed: number; startAt: number }
  | { type: 'PLAYER_ACTION'; sessionId: string; gameId: string; action: GameAction }
  | { type: 'ROUND_COMPLETED'; sessionId: string; gameId: string; result: GameResult }
  | { type: 'SESSION_ENDED'; sessionId: string; reason: 'completed' | 'left' | 'connection-lost' };

const MAX_MESSAGE_BYTES = 4_096;

/** A small boundary check before a peer message reaches game code. */
export function parseGameMessage(raw: string): GameMessage | null {
  if (raw.length === 0 || raw.length > MAX_MESSAGE_BYTES) return null;

  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || !('type' in value)) return null;
    const type = (value as { type?: unknown }).type;
    if (
      type !== 'ROUND_STARTED' &&
      type !== 'PLAYER_ACTION' &&
      type !== 'ROUND_COMPLETED' &&
      type !== 'SESSION_ENDED'
    ) {
      return null;
    }
    return value as GameMessage;
  } catch {
    return null;
  }
}
