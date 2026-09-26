import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PlayerId } from '@/games/engine/types';
import { applyTapTogetherAction, createTapTogetherRound, startTapTogetherRound, type TapTogetherState } from '@/games/mini-games/tap-together';
import { multiplayerSession, type MultiplayerSessionSnapshot } from '@/multiplayer/session';
import { palette, PrimaryButton } from '@/ui/screen';

export function RemoteTapTogether({ onDone }: { onDone: () => void }) {
  const [session, setSession] = useState<MultiplayerSessionSnapshot>({ state: 'idle' });
  const [round, setRound] = useState<TapTogetherState>(() => createTapTogetherRound(Date.now()));
  const [count, setCount] = useState(3);
  useEffect(() => multiplayerSession.subscribe(setSession), []);
  const launch = useCallback((seed: number, number: number, startAt: number) => {
    setRound({ ...createTapTogetherRound(seed, number), phase: 'countdown' });
    const tick = () => { const left = Math.max(0, Math.ceil((startAt - Date.now()) / 1000)); setCount(left); if (left === 0) setRound((value) => startTapTogetherRound(value, startAt)); else setTimeout(tick, 100); };
    tick();
  }, []);
  useEffect(() => {
    if (session.state !== 'connected' || !session.transport || !session.roomId || !session.role) return;
    const off = session.transport.onMessage((message) => {
      if (message.sessionId !== session.roomId || message.type === 'SESSION_ENDED' || message.gameId !== 'tap-together') return;
      if (message.type === 'ROUND_STARTED') launch(message.seed, message.round, message.startAt);
      if (message.type === 'PLAYER_ACTION') setRound((value) => applyTapTogetherAction(value, message.action));
      if (message.type === 'ROUND_COMPLETED') setRound((value) => ({ ...value, phase: 'complete', result: message.result }));
    });
    if (session.role === 'host') { const startAt = Date.now() + 3000; launch(round.seed, round.round, startAt); session.transport.send({ type: 'ROUND_STARTED', sessionId: session.roomId, gameId: 'tap-together', round: round.round, seed: round.seed, startAt }); }
    return off;
    // The subscription is intentionally bound once for this room.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [launch, session.state, session.transport]);
  useEffect(() => { if (session.role === 'host' && session.transport && session.roomId && round.phase === 'complete' && round.result) session.transport.send({ type: 'ROUND_COMPLETED', sessionId: session.roomId, gameId: 'tap-together', result: round.result }); }, [round.phase, round.result, session]);
  if (session.state !== 'connected' || !session.transport || !session.roomId || !session.role) return <View style={styles.center}><Text style={styles.title}>Your connection took a little break.</Text><PrimaryButton label="Back to games" onPress={onDone} /></View>;
  const { transport, roomId, role } = session;
  const mine: PlayerId = role === 'host' ? 'player-one' : 'player-two';
  const tap = () => { const action = { type: 'tap' as const, playerId: mine, timestamp: Date.now() }; setRound((value) => applyTapTogetherAction(value, action)); transport.send({ type: 'PLAYER_ACTION', sessionId: roomId, gameId: 'tap-together', action }); };
  const again = () => { if (role !== 'host') return; const next = createTapTogetherRound(Date.now(), round.round + 1); const startAt = Date.now() + 3000; launch(next.seed, next.round, startAt); transport.send({ type: 'ROUND_STARTED', sessionId: roomId, gameId: 'tap-together', round: next.round, seed: next.seed, startAt }); };
  if (round.phase === 'complete') return <View style={styles.center}><Text style={styles.stars}>✦ ✦ ✦</Text><Text style={styles.title}>{round.result?.message}</Text><Text style={styles.detail}>{round.result?.differenceMs ?? 0} milliseconds apart</Text>{role === 'host' ? <PrimaryButton label="One more" onPress={again} /> : <Text style={styles.wait}>Waiting for your friend to start the next one…</Text>}</View>;
  return <View style={styles.center}><Text style={styles.kicker}>TAP AT THE SAME MOMENT</Text><Text style={styles.count}>{round.phase === 'playing' ? 'TAP!' : String(count || 'TAP!')}</Text><Text style={styles.detail}>{round.phase === 'playing' ? 'Tap your star. Your friend has theirs.' : 'Get your thumb ready…'}</Text><Pressable disabled={round.phase !== 'playing' || Boolean(round.taps[mine])} onPress={tap} style={({ pressed }) => [styles.star, Boolean(round.phase !== 'playing' || round.taps[mine]) && styles.disabled, pressed && styles.pressed]}><Text style={styles.starText}>✦</Text><Text style={styles.you}>YOUR TAP</Text></Pressable></View>;
}

const styles = StyleSheet.create({ center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }, kicker: { color: palette.purple, fontWeight: '900', fontSize: 10, letterSpacing: 1.3 }, count: { color: palette.ink, fontSize: 76, fontWeight: '900', letterSpacing: -3, marginTop: 12 }, detail: { color: palette.muted, fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 27 }, star: { width: 190, height: 190, borderRadius: 32, backgroundColor: '#E8DFFF', borderWidth: 3, borderColor: '#CBB9FC', alignItems: 'center', justifyContent: 'center' }, starText: { color: palette.purple, fontSize: 67 }, you: { color: palette.ink, fontWeight: '900', fontSize: 10, letterSpacing: 1.1 }, disabled: { opacity: .4 }, pressed: { opacity: .75, transform: [{ scale: .96 }] }, stars: { color: '#E3A31D', fontSize: 20, letterSpacing: 6 }, title: { color: palette.ink, fontSize: 25, fontWeight: '900', textAlign: 'center', marginTop: 14 }, wait: { color: palette.muted, fontSize: 13, textAlign: 'center', marginTop: 18 }, });
