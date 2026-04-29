import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';
import { MCIcon } from '../../components/ui/MCIcon';
import { MCText } from '../../components/ui/MCText';

const METHODS = [
  {
    id: 'foto',
    icon: 'camera',
    label: 'Foto',
    sub: 'Toma foto a la factura',
    c1: '#FF6B6B',
    route: '/gasto/foto',
  },
  {
    id: 'chat',
    icon: 'msg',
    label: 'Chat',
    sub: 'Cuéntale a Gemma',
    c1: '#6C5CE7',
    route: '/gasto/chat',
  },
  {
    id: 'voz',
    icon: 'mic',
    label: 'Voz',
    sub: 'Habla naturalmente',
    c1: '#00B8D4',
    route: '/gasto/voz',
  },
  {
    id: 'manual',
    icon: 'edit',
    label: 'Manual',
    sub: 'Ingreso tradicional',
    c1: null,
    route: '/gasto/manual',
  },
] as const;

export default function NuevoGastoScreen() {
  const { t, accent } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.surface }]}>
      {/* Drag handle */}
      <View style={[styles.handle, { backgroundColor: t.border }]} />

      <MCText style={[styles.title, { color: t.text }]}>Agregar gasto</MCText>
      <MCText style={[styles.sub, { color: t.textSec }]}>Elige cómo registrarlo</MCText>

      <View style={styles.grid}>
        {METHODS.map((m) => {
          const c1 = m.c1 ?? accent;
          return (
            <TouchableOpacity
              key={m.id}
              style={[styles.methodCard, { backgroundColor: t.surfaceVar, borderColor: t.border }]}
              onPress={() => router.push(m.route)}
              activeOpacity={0.8}
            >
              <View style={[styles.methodIcon, { backgroundColor: c1, shadowColor: c1 }]}>
                <MCIcon name={m.icon} size={22} color="#fff" strokeWidth={2} />
              </View>
              <MCText style={[styles.methodLabel, { color: t.text }]}>{m.label}</MCText>
              <MCText style={[styles.methodSub, { color: t.textSec }]}>{m.sub}</MCText>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 16, paddingBottom: 36 },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    paddingHorizontal: 6,
    marginBottom: 4,
  },
  sub: { fontSize: 13, paddingHorizontal: 6, marginBottom: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  methodCard: {
    width: '48%',
    minHeight: 120,
    borderRadius: 20,
    padding: 18,
    borderWidth: 0.5,
    gap: 8,
  },
  methodIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  methodLabel: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  methodSub: { fontSize: 12, lineHeight: 16 },
});
