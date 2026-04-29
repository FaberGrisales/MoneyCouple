import { Stack } from 'expo-router';

export default function GastoLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="nuevo" options={{ presentation: 'modal' }} />
      <Stack.Screen name="chat" />
      <Stack.Screen name="foto" />
      <Stack.Screen name="voz" />
      <Stack.Screen name="manual" />
    </Stack>
  );
}
