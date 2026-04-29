import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MCIcon } from '../../components/ui/MCIcon';
import { MCText } from '../../components/ui/MCText';
import { useTheme } from '../../hooks/useTheme';

export default function ProfileScreen() {
  const { t, accent } = useTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      <View style={styles.center}>
        <View style={[styles.iconBox, { backgroundColor: accent + '22' }]}>
          <MCIcon name="user" size={32} color={accent} strokeWidth={1.6} />
        </View>
        <MCText style={[styles.title, { color: t.text }]}>Perfil</MCText>
        <MCText style={[styles.sub, { color: t.textSec }]}>Próximamente — Fase 4</MCText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '700' },
  sub: { fontSize: 14 },
});
