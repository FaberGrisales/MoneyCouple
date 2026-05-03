import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatCOPFull } from '@moneycouple/shared-utils';
import { TransactionRow } from '../components/shared/TransactionRow';
import { MCIcon } from '../components/ui/MCIcon';
import { MCText } from '../components/ui/MCText';
import { MC_CATS } from '../constants/tokens';
import { useDashboard } from '../hooks/useGastos';
import { useTheme } from '../hooks/useTheme';

const FILTER_ALL = 'ALL';

type CatKey = keyof typeof MC_CATS;

const FILTER_CHIPS: { key: string; label: string }[] = [
  { key: FILTER_ALL, label: 'Todos' },
  { key: 'COMIDA', label: 'Comida' },
  { key: 'TRANSPORTE', label: 'Transporte' },
  { key: 'COMPRAS', label: 'Compras' },
  { key: 'SALUD', label: 'Salud' },
  { key: 'OTROS', label: 'Otros' },
];

function getMonthLabel(): string {
  return new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
}

export default function AnalisisScreen() {
  const { t, accent } = useTheme();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<string>(FILTER_ALL);

  const { data: dashboard, isLoading } = useDashboard();

  const totalGastos = dashboard?.totalGastos ?? 0;
  const gastosRecientes = dashboard?.gastosRecientes ?? [];

  const filtered =
    activeFilter === FILTER_ALL
      ? gastosRecientes
      : gastosRecientes.filter((g) => g.categoria === activeFilter);

  const monthLabel = getMonthLabel();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      {/* Back header */}
      <TouchableOpacity style={styles.back} onPress={() => router.back()} activeOpacity={0.7}>
        <MCIcon name="chevL" size={22} color={t.text} strokeWidth={2} />
        <MCText style={[styles.backLabel, { color: t.text }]}>Inicio</MCText>
      </TouchableOpacity>

      {/* Month + total */}
      <View style={styles.summaryBlock}>
        <MCText style={[styles.monthLabel, { color: t.textSec }]}>{monthLabel}</MCText>
        <MCText style={[styles.totalAmount, { color: t.text }]}>
          {formatCOPFull(totalGastos)}
        </MCText>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsContent}
      >
        {FILTER_CHIPS.map((chip) => {
          const active = activeFilter === chip.key;
          const catColor =
            chip.key !== FILTER_ALL ? (MC_CATS[chip.key as CatKey]?.color ?? accent) : accent;
          return (
            <TouchableOpacity
              key={chip.key}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? catColor : t.surfaceVar,
                  borderColor: active ? catColor : t.border,
                },
              ]}
              onPress={() => setActiveFilter(chip.key)}
              activeOpacity={0.7}
            >
              <MCText style={[styles.chipText, { color: active ? '#fff' : t.textSec }]}>
                {chip.label}
              </MCText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Transaction list */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={accent} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <MCIcon name="search" size={36} color={t.textTer} />
            <MCText style={[styles.emptyText, { color: t.textSec }]}>Sin gastos este mes</MCText>
          </View>
        ) : (
          <View style={[styles.txCard, { backgroundColor: t.surface, borderColor: t.border }]}>
            {filtered.map((tx, i) => (
              <TransactionRow
                key={tx.id}
                transaction={{
                  id: tx.id,
                  merchant: tx.establecimiento ?? tx.descripcion ?? tx.categoria,
                  category: tx.categoria,
                  amount: -tx.monto,
                  when: new Date(tx.fechaGasto).toLocaleDateString('es-CO'),
                  method: tx.fuenteRegistro,
                  shared: tx.esCompartido,
                }}
                isLast={i === filtered.length - 1}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
  },
  backLabel: { fontSize: 16, fontWeight: '600' },
  summaryBlock: { paddingHorizontal: 20, paddingBottom: 16 },
  monthLabel: { fontSize: 13, fontWeight: '500', textTransform: 'capitalize', marginBottom: 4 },
  totalAmount: { fontSize: 36, fontWeight: '700', letterSpacing: -1 },
  chipsScroll: { flexGrow: 0, marginBottom: 12 },
  chipsContent: { paddingHorizontal: 20, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 0.5,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  listContent: { paddingHorizontal: 20, paddingBottom: 110 },
  txCard: {
    borderRadius: 20,
    borderWidth: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14 },
});
