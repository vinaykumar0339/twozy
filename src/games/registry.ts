export type GameId =
  | 'tap-together'
  | 'same-direction'
  | 'shared-balance'
  | 'mirror'
  | 'catch-together'
  | 'perfect-timing'
  | 'tiny-drawing'
  | 'cooperative-chaos';

export type GameDefinition = {
  id: GameId;
  title: string;
  subtitle: string;
  emoji: string;
  duration: string;
  color: string;
};

export const games: GameDefinition[] = [
  { id: 'tap-together', title: 'Tap Together', subtitle: 'Find the same moment', emoji: '✦', duration: '10 sec', color: '#E8DFFF' },
  { id: 'same-direction', title: 'Same Direction', subtitle: 'Trust your first thought', emoji: '↔', duration: '10 sec', color: '#D7F3DD' },
  { id: 'shared-balance', title: 'Shared Balance', subtitle: 'Keep the marble steady', emoji: '⚪', duration: '20 sec', color: '#FFE79B' },
  { id: 'mirror', title: 'Mirror', subtitle: 'Copy a tiny move', emoji: '◈', duration: '15 sec', color: '#FFD7DF' },
  { id: 'catch-together', title: 'Catch Together', subtitle: 'Catch the snack', emoji: '🍕', duration: '20 sec', color: '#DCEFFF' },
  { id: 'perfect-timing', title: 'Perfect Timing', subtitle: 'Tap on the glow', emoji: '◌', duration: '10 sec', color: '#E8DFFF' },
  { id: 'tiny-drawing', title: 'Tiny Drawing', subtitle: 'Draw a tiny house', emoji: '✎', duration: '20 sec', color: '#D7F3DD' },
  { id: 'cooperative-chaos', title: 'Co-op Chaos', subtitle: 'Guide pizza home', emoji: '🛸', duration: '20 sec', color: '#FFE79B' },
];

export function getGame(id: string): GameDefinition | undefined {
  return games.find((game) => game.id === id);
}

export function getNextGame(exclude?: string): GameDefinition {
  const choices = games.filter((game) => game.id !== exclude);
  return choices[Math.floor(Math.random() * choices.length)] ?? games[0];
}
