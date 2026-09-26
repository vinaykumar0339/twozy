import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="index" />
    <Stack.Screen name="play/index" />
    <Stack.Screen name="play/room" />
    <Stack.Screen name="play/game/[gameId]" />
  </Stack>;
}
