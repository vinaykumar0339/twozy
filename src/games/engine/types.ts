export type PlayerId = 'player-one' | 'player-two';

export type GamePhase = 'lobby' | 'countdown' | 'playing' | 'complete';

export type GameResult = {
  syncPercent: number;
  differenceMs: number;
  message: string;
  reward: 'spark' | 'star' | 'comet';
};

export type GameAction = {
  type: 'tap';
  playerId: PlayerId;
  timestamp: number;
};
