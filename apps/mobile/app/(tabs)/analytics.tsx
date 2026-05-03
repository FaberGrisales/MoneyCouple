import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatCOP, formatCOPFull } from '@moneycouple/shared-utils';
import { DonutChart } from '../../components/charts/DonutChart';
import { TransactionRow } from '../../components/shared/TransactionRow';
import { MCIcon } from '../../components/ui/MCIcon';
import { MCText } from '../../components/ui/MCText';
import { MC_CATS } from '../../constants/tokens';
import { useDashboard } from '../../hooks/useGastos';
import { useTheme } from '../../hooks/useTheme';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const MONTH_NAMES_FULL = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function getMonthLabel(year: number, month: number): string {
  const mName = MONTH_NAMES_FULL[month - 1] ?? MONTHS[month - 1] ?? '';
  return `${mName} ${year}`;
}

export default function AnalyticsScreen() {
  const { t, accent } = useTheme();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: dashboard, isLoading } = useDashboard();

  const totalGastos = dashboard?.totalGastos ?? 0;
  const porCategoria = dashboard?.porCategoria ?? [];
  const gastosRecientes = dashboard?.gastosRecientes ?? [];

  const catData = porCategoria.map((c) => ({
    key: c.categoria,
    value: c.total,
    color: MC_CATS[c.categoria as keyof typeof MC_CATS]?.color ?? '#B0BEC5',
  }));
  const catSum = catData.reduce((s, c) => s + c.value, 0);

  function prevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <MCText style={[styles.title, { color: t.text }]}>Analisis</MCText>
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={prevMonth} style={styles.monthBtn} activeOpacity={0.7}>
              <MCIcon name="chevL" size={18} color={t.text} strokeWidth={2} />
            </TouchableOpacity>
            <MCText style={[styles.monthLabel, { color: t.text }]}>
              {getMonthLabel(year, month)}
            </MCText>
            <TouchableOpacity onPress={nextMonth} style={styles.monthBtn} activeOpacity={0.7}>
              <MCIcon name="chevR" size={18} color={t.text} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Resumen card */}
        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          <MCText style={[styles.cardLabel, { color: t.textSec }]}>Total del mes</MCText>
          {isLoading ? (
            <ActivityIndicator size="large" color={accent} style={{ marginVertical: 12 }} />
          ) : (
            <>
              <MCText style={[styles.totalAmount, { color: t.text }]}>
                {formatCOPFull(totalGastos)}
              </MCText>
              <View style={styles.comparRow}>
                <View style={[styles.comparBadge, { backgroundColor: '#10B98122' }]}>
                  <MCIcon name="arrowU" size={12} color="#10B981" strokeWidth={2.5} />
                  <MCText style={styles.comparText}>+2.5% vs abr</MCText>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Donut chart section */}
        {(catData.length > 0 || !isLoading) && (
          <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
            <MCText style={[styles.sectionTitle, { color: t.text }]}>Por categoria</MCText>
            {isLoading ? (
              <ActivityIndicator size="small" color={accent} style={{ marginVertical: 12 }} />
            ) : catData.length > 0 ? (
              <View style={styles.donutRow}>
                <DonutChart data={catData} size={160} stroke={22} />
                <View style={styles.legendList}>
                  {catData.map((c) => {
                    const catInfo = MC_CATS[c.key as keyof typeof MC_CATS];
                    const pct = catSum > 0 ? Math.round((c.value / catSum) * 100) : 0;
                    return (
                      <View key={c.key} style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: c.color }]} />
                        <MCText style={[styles.legendName, { color: t.text }]} numberOfLines={1}>
                          {catInfo?.name ?? c.key}
                        </MCText>
                        <View style={styles.legendRight}>
                          <MCText style={[styles.legendAmt, { color: t.text }]}>
                            {formatCOP(c.value)}
                          </MCText>
                          <MCText style={[styles.legendPct, { color: t.textSec }]}>{pct}%</MCText>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : (
              <MCText style={[styles.emptyText, { color: t.textSec }]}>Sin gastos este mes</MCText>
            )}
          </View>
        )}

        {/* Gastos recientes */}
        <View style={styles.sectionBlock}>
          <MCText style={[styles.sectionLabel, { color: t.textSec }]}>GASTOS RECIENTES</MCText>
          <View
            style={[
              styles.card,
              {
                backgroundColor: t.surface,
                borderColor: t.border,
                paddingHorizontal: 16,
                paddingVertical: 4,
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={accent} style={{ marginVertical: 16 }} />
            ) : gastosRecientes.length > 0 ? (
              gastosRecientes.map((tx, i) => (
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
                  isLast={i === gastosRecientes.length - 1}
                />
              ))
            ) : (
              <MCText style={[styles.emptyText, { color: t.textSec }]}>Sin gastos este mes</MCText>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 110 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  monthSelector: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthBtn: { padding: 4 },
  monthLabel: { fontSize: 14, fontWeight: '600', minWidth: 100, textAlign: 'center' },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    padding: 16,
    borderWidth: 0.5,
  },
  cardLabel: { fontSize: 12, fontWeight: '500', marginBottom: 6 },
  totalAmount: { fontSize: 38, fontWeight: '700', letterSpacing: -1 },
  comparRow: { flexDirection: 'row', marginTop: 8 },
  comparBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  comparText: { fontSize: 12, fontWeight: '600', color: '#10B981' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  donutRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  legendList: { flex: 1, gap: 8, justifyContent: 'center' },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  legendName: { flex: 1, fontSize: 12 },
  legendRight: { alignItems: 'flex-end' },
  legendAmt: { fontSize: 12, fontWeight: '600' },
  legendPct: { fontSize: 11 },
  sectionBlock: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  emptyText: { textAlign: 'center', paddingVertical: 16, fontSize: 13 },
});
