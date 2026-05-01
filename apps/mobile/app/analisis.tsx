import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MCIcon } from '../components/ui/MCIcon';
import { MCText } from '../components/ui/MCText';
import { useTheme } from '../hooks/useTheme';

export default function AnalisisScreen() {
  const { t, accent } = useTheme();
  const router = useRouter();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <MCIcon name="chevL" size={22} color={t.text} strokeWidth={2} />
        <MCText style={[styles.backLabel, { color: t.text }]}>Inicio</MCText>
      </TouchableOpacity>
      <View style={styles.center}>
        <View style={[styles.iconBox, { backgroundColor: accent + '22' }]}>
          <MCIcon name="chart" size={36} color={accent} strokeWidth={1.6} />
        </View>
        <MCText style={[styles.title, { color: t.text }]}>Análisis detallado</MCText>
        <MCText style={[styles.sub, { color: t.textSec }]}>Gráficas y tendencias — Fase 4</MCText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  back: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 6 },
  backLabel: { fontSize: 16, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: -60 },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '700' },
  sub: { fontSize: 14 },
});
