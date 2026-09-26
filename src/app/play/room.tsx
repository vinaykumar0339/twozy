import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { multiplayerSession, type MultiplayerSessionSnapshot } from '@/multiplayer/session';
import { Header, palette, PrimaryButton } from '@/ui/screen';

export default function RoomRoute() {
  const [snapshot, setSnapshot] = useState<MultiplayerSessionSnapshot>({ state: 'idle' });
  const [code, setCode] = useState('');
  useEffect(() => multiplayerSession.subscribe(setSnapshot), []);
  useEffect(() => { if (snapshot.state === 'connected') router.replace('/play/game/tap-together?mode=online'); }, [snapshot.state]);
  const busy = snapshot.state === 'connecting';
  return <SafeAreaView style={styles.safe} edges={['top']}><Header title="Connect your duo" onBack={() => { void multiplayerSession.disconnect(); router.back(); }} /><View style={styles.body}>
    <Text style={styles.emoji}>⌁</Text><Text style={styles.title}>Play on two phones.</Text><Text style={styles.copy}>Create a private room, send the code, then Tap Together begins directly between your phones.</Text>
    {snapshot.roomId && snapshot.role === 'host' ? <View style={styles.codeCard}><Text style={styles.codeLabel}>YOUR ROOM CODE</Text><Text selectable style={styles.code}>{snapshot.roomId}</Text><Text style={styles.wait}>Waiting for your friend to join…</Text></View> : <><PrimaryButton label={busy ? 'Opening room…' : 'Create a room'} disabled={busy} onPress={() => { void multiplayerSession.createRoom(); }} /><Text style={styles.or}>OR JOIN A FRIEND</Text><TextInput value={code} onChangeText={setCode} autoCapitalize="none" autoCorrect={false} placeholder="Paste room code" placeholderTextColor="#9292A5" style={styles.input} /><PrimaryButton label={busy ? 'Connecting…' : 'Join room'} disabled={busy || !code.trim()} onPress={() => { void multiplayerSession.joinRoom(code); }} /></>}
    {snapshot.error ? <Text style={styles.error}>{snapshot.error}</Text> : null}<Text style={styles.note}>Firebase only helps your phones find each other. Game taps use the private WebRTC connection.</Text>
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: palette.cream }, body: { flex: 1, padding: 25, alignItems: 'center', paddingTop: 45 }, emoji: { color: palette.purple, fontSize: 58, fontWeight: '900' }, title: { color: palette.ink, fontSize: 30, fontWeight: '900', letterSpacing: -1, marginTop: 15 }, copy: { color: palette.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 10, marginBottom: 30 }, codeCard: { backgroundColor: palette.paper, borderWidth: 1, borderColor: palette.line, borderRadius: 21, padding: 20, alignSelf: 'stretch', alignItems: 'center' }, codeLabel: { color: palette.purple, fontSize: 10, letterSpacing: 1.4, fontWeight: '900' }, code: { color: palette.ink, fontSize: 22, letterSpacing: 1, fontWeight: '900', marginTop: 12 }, wait: { color: palette.muted, fontSize: 12, marginTop: 10 }, or: { color: palette.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginVertical: 17 }, input: { alignSelf: 'stretch', height: 56, borderRadius: 17, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.paper, paddingHorizontal: 16, color: palette.ink, fontWeight: '800', marginBottom: 12 }, error: { color: '#B94962', fontSize: 12, textAlign: 'center', marginTop: 14 }, note: { color: palette.muted, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 19 }, });
