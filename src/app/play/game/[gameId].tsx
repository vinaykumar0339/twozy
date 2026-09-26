import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getGame, getNextGame } from '@/games/registry';
import { LocalMiniGame } from '@/games/ui/local-mini-game';
import { RemoteTapTogether } from '@/games/ui/remote-tap-together';
import { Header, palette } from '@/ui/screen';

export default function GameRoute() {
  const { gameId, mode, session } = useLocalSearchParams<{ gameId: string; mode?: string; session?: string }>();
  const game = getGame(gameId);
  if (!game) return <SafeAreaView style={styles.safe}><Header title="Game not found" onBack={() => router.replace('/play')} /><View /></SafeAreaView>;
  const quickMix = session === 'quick';
  const done = () => quickMix ? router.replace(`/play/game/${getNextGame(game.id).id}?session=quick`) : router.replace('/play');
  return <SafeAreaView style={styles.safe} edges={['top']}><Header title={quickMix ? 'Quick mix' : game.duration} onBack={() => router.back()} />{mode === 'online' && game.id === 'tap-together' ? <RemoteTapTogether onDone={done} /> : <LocalMiniGame game={game} onDone={done} finishLabel={quickMix ? 'Next surprise' : 'Back to games'} />}</SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: palette.cream } });
