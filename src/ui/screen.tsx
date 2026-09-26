import { Pressable, StyleSheet, Text, View } from 'react-native';

export const palette = { ink: '#242446', muted: '#777993', cream: '#FFF9F1', paper: '#FFFFFF', purple: '#6855DB', line: '#EDE9E1' } as const;

export function BackButton({ onPress }: { onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onPress} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>;
}

export function PrimaryButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, disabled && styles.disabled, pressed && styles.pressed]}><Text style={styles.buttonText}>{label}</Text><Text style={styles.arrow}>→</Text></Pressable>;
}

export function Header({ title, onBack }: { title: string; onBack?: () => void }) {
  return <View style={styles.header}>{onBack ? <BackButton onPress={onBack} /> : <View style={styles.back} />}<Text style={styles.headerTitle}>{title}</Text><View style={styles.back} /></View>;
}

const styles = StyleSheet.create({
  header: { height: 66, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }, headerTitle: { color: palette.ink, fontSize: 15, fontWeight: '900' },
  back: { width: 38, height: 38, borderRadius: 13, backgroundColor: palette.paper, borderWidth: 1, borderColor: palette.line, alignItems: 'center', justifyContent: 'center' }, backText: { color: palette.ink, fontSize: 33, lineHeight: 32, marginTop: -4 },
  button: { backgroundColor: palette.purple, borderRadius: 19, minHeight: 57, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, alignSelf: 'stretch', shadowColor: '#4E3FC0', shadowOpacity: .22, shadowRadius: 9, shadowOffset: { width: 0, height: 4 }, elevation: 3 }, buttonText: { color: '#fff', fontSize: 16, fontWeight: '900' }, arrow: { color: '#fff', fontSize: 24 }, disabled: { opacity: .5 }, pressed: { opacity: .84, transform: [{ scale: .985 }] },
});
