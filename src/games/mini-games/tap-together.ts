import type { GameAction, GamePhase, GameResult, PlayerId } from '@/games/engine/types';

export type TapTogetherState = {
  gameId: 'tap-together';
  seed: number;
  round: number;
  phase: GamePhase;
  startedAt?: number;
  taps: Partial<Record<PlayerId, number>>;
  result?: GameResult;
};

export function createTapTogetherRound(seed: number, round = 1): TapTogetherState {
  return {
    gameId: 'tap-together',
    seed,
    round,
    phase: 'lobby',
    taps: {},
  };
}

export function startTapTogetherRound(state: TapTogetherState, startedAt: number): TapTogetherState {
  return { ...state, phase: 'playing', startedAt };
}

export function applyTapTogetherAction(
  state: TapTogetherState,
  action: GameAction,
): TapTogetherState {
  if (state.phase !== 'playing' || action.type !== 'tap' || state.taps[action.playerId]) {
    return state;
  }

  const taps = { ...state.taps, [action.playerId]: action.timestamp };
  const firstTap = taps['player-one'];
  const secondTap = taps['player-two'];

  if (!firstTap || !secondTap) {
    return { ...state, taps };
  }

  const differenceMs = Math.abs(firstTap - secondTap);
  return {
    ...state,
    phase: 'complete',
    taps,
    result: scoreTapTogether(differenceMs),
  };
}

export function scoreTapTogether(differenceMs: number): GameResult {
  const syncPercent = Math.max(0, Math.round(100 - differenceMs / 14));

  if (differenceMs <= 120) {
    return { differenceMs, syncPercent, message: 'Tiny bit of telepathy!', reward: 'comet' };
  }
  if (differenceMs <= 400) {
    return { differenceMs, syncPercent, message: 'That was beautifully in sync.', reward: 'star' };
  }
  return { differenceMs, syncPercent, message: 'Close! Your timing has personality.', reward: 'spark' };
}
