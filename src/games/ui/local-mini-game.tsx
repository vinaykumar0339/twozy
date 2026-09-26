import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { GameDefinition } from '@/games/registry';
import { palette, PrimaryButton } from '@/ui/screen';

type Phase = 'ready' | 'countdown' | 'playing' | 'result';
type Player = 'player-one' | 'player-two';

const moves = ['↑', '→', '↓', '←'];

export function LocalMiniGame({ game, onDone, finishLabel = 'Back to games' }: { game: GameDefinition; onDone: () => void; finishLabel?: string }) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [count, setCount] = useState(3);
  const [first, setFirst] = useState<number>();
  const [second, setSecond] = useState<number>();
  const [choiceOne, setChoiceOne] = useState<string>();
  const [choiceTwo, setChoiceTwo] = useState<string>();
  const [progress, setProgress] = useState(0);
  const [cells, setCells] = useState<number[]>([]);
  const [mirrorMove] = useState(() => moves[Math.floor(Math.random() * moves.length)]);
  const [result, setResult] = useState({ title: '', detail: '' });

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (count === 0) { setPhase('playing'); return; }
    const timer = setTimeout(() => setCount((value) => value - 1), 650);
    return () => clearTimeout(timer);
  }, [count, phase]);

  const begin = () => { setCount(3); setPhase('countdown'); };
  const finish = (title: string, detail: string) => { setResult({ title, detail }); setPhase('result'); };
  const playerName = (player: Player) => player === 'player-one' ? 'YOU' : 'THEM';

  const tap = (player: Player) => {
    const now = Date.now();
    if (player === 'player-one') setFirst(now); else setSecond(now);
    const other = player === 'player-one' ? second : first;
    if (other) {
      const gap = Math.abs(other - now);
      finish(gap < 250 ? 'Tiny bit of telepathy!' : 'So close — lovely rhythm.', `${gap} milliseconds apart`);
    }
  };

  const choose = (player: Player, choice: string) => {
    if (player === 'player-one') setChoiceOne(choice); else setChoiceTwo(choice);
    const other = player === 'player-one' ? choiceTwo : choiceOne;
    if (other) finish(other === choice ? 'Same wavelength!' : 'Two excellent different ideas.', other === choice ? 'You picked the same path.' : 'Your brains took a scenic route.');
  };

  const addProgress = (player: Player) => {
    const next = progress + 1;
    setProgress(next);
    if (next >= 8) finish('You did it together!', game.id === 'catch-together' ? 'Every snack made it safely home.' : game.id === 'cooperative-chaos' ? 'Pizza has landed. Somehow.' : 'That marble stayed wonderfully steady.');
  };

  const mirror = (player: Player, move: string) => {
    if (player === 'player-one') { setChoiceOne(move); return; }
    finish(choiceOne === move ? 'A perfect little mirror!' : 'Almost — still a very stylish move.', choiceOne === move ? 'You copied each other exactly.' : 'The mirror had a funny wobble.');
  };

  const draw = (cell: number) => {
    if (cells.includes(cell)) return;
    const next = [...cells, cell];
    setCells(next);
    if (next.length >= 5) finish('A tiny masterpiece!', 'Your shared house is delightfully abstract.');
  };

  const instructions = useMemo(() => {
    if (game.id === 'same-direction') return 'Each person picks a path. No hints!';
    if (game.id === 'mirror') return 'You moves first. They mirror your move.';
    if (game.id === 'shared-balance') return 'Take turns giving the platform a gentle nudge.';
    if (game.id === 'catch-together') return 'Both players help catch the flying pizza.';
    if (game.id === 'perfect-timing') return 'Tap your own star at the same moment.';
    if (game.id === 'tiny-drawing') return 'Take turns adding squares to your tiny house.';
    if (game.id === 'cooperative-chaos') return 'Work together to guide the pizza ship home.';
    return 'Tap your own star at the same moment.';
  }, [game.id]);

  return <View style={styles.wrap}>
    <View style={[styles.icon, { backgroundColor: game.color }]}><Text style={styles.iconText}>{game.emoji}</Text></View>
    <Text style={styles.title}>{game.title}</Text><Text style={styles.instructions}>{instructions}</Text>
    {phase === 'ready' ? <PrimaryButton label="Ready, set…" onPress={begin} /> : phase === 'countdown' ? <Text style={styles.count}>{count || 'GO!'}</Text> : phase === 'result' ? <View style={styles.result}><Text style={styles.stars}>✦ ✦ ✦</Text><Text style={styles.resultTitle}>{result.title}</Text><Text style={styles.resultDetail}>{result.detail}</Text><PrimaryButton label={finishLabel} onPress={onDone} /></View> : <GameControls game={game} choiceOne={choiceOne} choiceTwo={choiceTwo} mirrorMove={mirrorMove} progress={progress} cells={cells} onTap={tap} onChoose={choose} onProgress={addProgress} onMirror={mirror} onDraw={draw} playerName={playerName} />}
  </View>;
}

function GameControls({ game, choiceOne, choiceTwo, mirrorMove, progress, cells, onTap, onChoose, onProgress, onMirror, onDraw, playerName }: {
  game: GameDefinition; choiceOne?: string; choiceTwo?: string; mirrorMove: string; progress: number; cells: number[]; onTap: (player: Player) => void; onChoose: (player: Player, choice: string) => void; onProgress: (player: Player) => void; onMirror: (player: Player, move: string) => void; onDraw: (cell: number) => void; playerName: (player: Player) => string;
}) {
  if (game.id === 'same-direction') return <View style={styles.twoUp}><ChoiceCard label={playerName('player-one')} chosen={choiceOne} onChoice={(value) => onChoose('player-one', value)} /><ChoiceCard label={playerName('player-two')} chosen={choiceTwo} onChoice={(value) => onChoose('player-two', value)} /></View>;
  if (game.id === 'mirror') return <View style={styles.mirror}><Text style={styles.target}>Copy this: {mirrorMove}</Text><Text style={styles.mirrorHint}>{choiceOne ? 'Now they copy it!' : 'You choose a move first.'}</Text><View style={styles.moveRow}>{moves.map((move) => <Pressable key={move} disabled={Boolean(choiceOne)} onPress={() => onMirror('player-one', move)} style={styles.move}><Text style={styles.moveText}>{move}</Text></Pressable>)}</View>{choiceOne ? <View style={styles.moveRow}>{moves.map((move) => <Pressable key={move} onPress={() => onMirror('player-two', move)} style={styles.move}><Text style={styles.moveText}>{move}</Text></Pressable>)}</View> : null}</View>;
  if (game.id === 'tiny-drawing') return <View style={styles.grid}>{Array.from({ length: 9 }, (_, index) => <Pressable key={index} onPress={() => onDraw(index)} style={[styles.cell, cells.includes(index) && styles.filled]}><Text>{cells.includes(index) ? '✦' : ''}</Text></Pressable>)}</View>;
  if (game.id === 'tap-together' || game.id === 'perfect-timing') return <View style={styles.twoUp}><ActionCard label={playerName('player-one')} emoji="✦" tone="#FFE79B" onPress={() => onTap('player-one')} /><ActionCard label={playerName('player-two')} emoji="✦" tone="#E8DFFF" onPress={() => onTap('player-two')} /></View>;
  return <View style={styles.progressArea}><View style={styles.track}><View style={[styles.fill, { width: `${Math.min(progress * 12.5, 100)}%` }]} /></View><Text style={styles.progressText}>{progress} / 8 shared moves</Text><View style={styles.twoUp}><ActionCard label={playerName('player-one')} emoji={game.id === 'catch-together' ? '🍕' : game.id === 'cooperative-chaos' ? '←' : '↙'} tone="#FFE79B" onPress={() => onProgress('player-one')} /><ActionCard label={playerName('player-two')} emoji={game.id === 'catch-together' ? '🧺' : game.id === 'cooperative-chaos' ? '→' : '↗'} tone="#D7F3DD" onPress={() => onProgress('player-two')} /></View></View>;
}

function ChoiceCard({ label, chosen, onChoice }: { label: string; chosen?: string; onChoice: (choice: string) => void }) {
  return <View style={styles.choiceCard}><Text style={styles.cardLabel}>{label}</Text><View style={styles.choiceRow}>{['←', '→'].map((choice) => <Pressable key={choice} disabled={Boolean(chosen)} onPress={() => onChoice(choice)} style={styles.choice}><Text style={styles.choiceText}>{choice}</Text></Pressable>)}</View></View>;
}

function ActionCard({ label, emoji, tone, onPress }: { label: string; emoji: string; tone: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.action, { backgroundColor: tone }, pressed && styles.pressed]}><Text style={styles.cardLabel}>{label}</Text><Text style={styles.actionEmoji}>{emoji}</Text></Pressable>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 24, alignItems: 'center', paddingTop: 44 }, icon: { width: 68, height: 68, borderRadius: 23, alignItems: 'center', justifyContent: 'center' }, iconText: { color: palette.ink, fontSize: 32, fontWeight: '900' }, title: { color: palette.ink, fontSize: 31, fontWeight: '900', letterSpacing: -1, marginTop: 16 }, instructions: { color: palette.muted, fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 7, marginBottom: 36, maxWidth: 290 }, count: { color: palette.purple, fontSize: 88, fontWeight: '900', marginTop: 42 }, twoUp: { flexDirection: 'row', gap: 13, alignSelf: 'stretch', justifyContent: 'center' }, action: { height: 186, flex: 1, borderRadius: 25, borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }, actionEmoji: { color: palette.ink, fontSize: 50, marginTop: 12 }, cardLabel: { color: palette.ink, fontSize: 10, letterSpacing: 1.1, fontWeight: '900' }, pressed: { opacity: .78, transform: [{ scale: .97 }] }, choiceCard: { flex: 1, height: 174, backgroundColor: palette.paper, borderRadius: 23, borderWidth: 1, borderColor: palette.line, alignItems: 'center', justifyContent: 'center', gap: 20 }, choiceRow: { flexDirection: 'row', gap: 9 }, choice: { width: 49, height: 49, borderRadius: 15, backgroundColor: '#E8DFFF', alignItems: 'center', justifyContent: 'center' }, choiceText: { color: palette.purple, fontSize: 28, fontWeight: '900' }, mirror: { alignSelf: 'stretch', alignItems: 'center' }, target: { color: palette.ink, fontSize: 28, fontWeight: '900', marginBottom: 7 }, mirrorHint: { color: palette.muted, fontSize: 13, marginBottom: 21 }, moveRow: { flexDirection: 'row', gap: 9, marginBottom: 12 }, move: { width: 58, height: 58, borderRadius: 18, backgroundColor: '#E8DFFF', alignItems: 'center', justifyContent: 'center' }, moveText: { color: palette.purple, fontSize: 26, fontWeight: '900' }, progressArea: { alignSelf: 'stretch', alignItems: 'center' }, track: { height: 18, backgroundColor: '#ECE8E0', borderRadius: 9, overflow: 'hidden', alignSelf: 'stretch', marginTop: 17 }, fill: { height: '100%', backgroundColor: '#7ED08D', borderRadius: 9 }, progressText: { color: palette.muted, fontSize: 12, marginVertical: 17 }, grid: { width: 222, flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, cell: { width: 69, height: 69, borderRadius: 14, backgroundColor: palette.paper, borderWidth: 1, borderColor: palette.line, alignItems: 'center', justifyContent: 'center' }, filled: { backgroundColor: '#D7F3DD', borderColor: '#91D79D' }, result: { alignSelf: 'stretch', alignItems: 'center', marginTop: 12 }, stars: { color: '#E3A31D', letterSpacing: 6, fontSize: 19 }, resultTitle: { color: palette.ink, textAlign: 'center', fontSize: 25, lineHeight: 31, fontWeight: '900', marginTop: 10 }, resultDetail: { color: palette.muted, textAlign: 'center', fontSize: 13, marginTop: 8, marginBottom: 32 },
});
