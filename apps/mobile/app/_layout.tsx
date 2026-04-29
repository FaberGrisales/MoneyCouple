import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { QueryProvider } from '../components/shared/QueryProvider';
import { ThemeProvider, useTheme } from '../hooks/useTheme';

function RootLayoutContent() {
  const { dark } = useTheme();
  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="gasto" />
        <Stack.Screen name="analisis" />
        <Stack.Screen name="carteras" />
        <Stack.Screen name="pareja" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <RootLayoutContent />
      </QueryProvider>
    </ThemeProvider>
  );
}
