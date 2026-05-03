import { Link, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { MCText } from '../components/ui/MCText';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Pantalla no encontrada' }} />
      <View style={styles.container}>
        <MCText style={styles.title}>Esta pantalla no existe.</MCText>
        <Link href="/(tabs)" style={styles.link}>
          <MCText style={styles.linkText}>¡Volver al inicio!</MCText>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  link: { marginTop: 15 },
  linkText: { color: '#00D9A3', fontSize: 16, fontWeight: '600' },
});
