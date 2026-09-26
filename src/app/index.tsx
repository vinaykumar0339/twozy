import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, PrimaryButton } from '@/ui/screen';

export default function HomeRoute() {
  return <SafeAreaView style={styles.safe} edges={['top']}><StatusBar style="dark" /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><View style={styles.brandMark}><Text style={styles.brandMarkText}>∞</Text></View><Text style={styles.brand}>twozy</Text><View style={styles.avatars}><Text>🧑🏽</Text><Text style={styles.avatarOverlap}>🧑🏻</Text></View></View>
    <View style={styles.hero}><Text style={styles.badge}>●  DUO PLAYGROUND</Text><Text style={styles.eyebrow}>PLAY · LAUGH · REPEAT</Text><Text style={styles.title}>A little fun,{"\n"}for the two of you.</Text><Text style={styles.copy}>Eight small games made for shared moments, not scoreboards.</Text></View>
    <View style={styles.island}><Text style={styles.cloud}>☁️</Text><Text style={styles.tree}>🌳</Text><Text style={styles.tent}>⛺</Text><Text style={styles.dog}>🐶</Text><Text style={styles.star}>✦</Text><Text style={styles.caption}>Your world grows with every session</Text></View>
    <PrimaryButton label="Play together" onPress={() => router.push('/play?session=quick')} />
    <Pressable accessibilityRole="button" onPress={() => router.push('/play/room')} style={styles.twoPhones}><Text style={styles.twoPhonesText}>⌁  Connect two phones</Text></Pressable>
    <View style={styles.stats}><Stat emoji="⚡" title="12" label="great syncs" /><Stat emoji="🌱" title="4" label="things built" /><Stat emoji="😂" title="7" label="chaos moments" /></View>
  </ScrollView></SafeAreaView>;
}

function Stat({ emoji, title, label }: { emoji: string; title: string; label: string }) { return <View style={styles.stat}><Text>{emoji}</Text><Text style={styles.statTitle}>{title}</Text><Text style={styles.statLabel}>{label}</Text></View>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.cream }, content: { padding: 20, paddingBottom: 42 }, header: { flexDirection: 'row', alignItems: 'center', marginBottom: 36 }, brandMark: { backgroundColor: palette.purple, width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, brandMarkText: { color: '#fff', fontSize: 25, fontWeight: '900', marginTop: -2 }, brand: { color: palette.ink, fontSize: 22, fontWeight: '900', letterSpacing: -1, marginLeft: 8 }, avatars: { marginLeft: 'auto', flexDirection: 'row', backgroundColor: '#FFE79B', borderRadius: 20, padding: 6 }, avatarOverlap: { marginLeft: -5 }, hero: { alignItems: 'center' }, badge: { color: palette.ink, backgroundColor: '#D7F3DD', borderRadius: 18, paddingHorizontal: 11, paddingVertical: 7, fontSize: 10, fontWeight: '900', letterSpacing: .7 }, eyebrow: { color: palette.purple, marginTop: 19, fontSize: 10, letterSpacing: 1.4, fontWeight: '900' }, title: { color: palette.ink, textAlign: 'center', fontWeight: '900', letterSpacing: -1.5, fontSize: 37, lineHeight: 41, marginTop: 7 }, copy: { color: palette.muted, fontSize: 15, textAlign: 'center', lineHeight: 21, marginTop: 12, maxWidth: 290 }, island: { height: 230, marginVertical: 12, borderRadius: 90, backgroundColor: '#D7F3DD', borderWidth: 5, borderColor: '#A8DCB4', overflow: 'hidden', position: 'relative' }, cloud: { position: 'absolute', left: 18, top: 20, fontSize: 33 }, tree: { position: 'absolute', left: 29, bottom: 28, fontSize: 72 }, tent: { position: 'absolute', right: 41, bottom: 40, fontSize: 56 }, dog: { position: 'absolute', right: 120, bottom: 30, fontSize: 29 }, star: { position: 'absolute', right: 52, top: 30, color: '#DCA620', fontSize: 30 }, caption: { position: 'absolute', bottom: 14, alignSelf: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 13, paddingVertical: 8, color: palette.ink, fontSize: 11, fontWeight: '800' }, twoPhones: { alignSelf: 'center', padding: 16 }, twoPhonesText: { color: palette.purple, fontSize: 13, fontWeight: '900' }, stats: { flexDirection: 'row', backgroundColor: palette.paper, borderWidth: 1, borderColor: palette.line, borderRadius: 19, paddingVertical: 14, marginTop: 5 }, stat: { flex: 1, alignItems: 'center' }, statTitle: { color: palette.ink, fontSize: 17, fontWeight: '900', marginTop: 2 }, statLabel: { color: palette.muted, fontSize: 10 },
});
