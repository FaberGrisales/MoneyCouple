import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MCIcon } from '../../components/ui/MCIcon';
import { MCText } from '../../components/ui/MCText';
import { DonutChart } from '../../components/charts/DonutChart';
import { WalletCard } from '../../components/shared/WalletCard';
import { TransactionRow } from '../../components/shared/TransactionRow';
import { InsightCard } from '../../components/shared/InsightCard';
import { useTheme } from '../../hooks/useTheme';
import { useDashboard } from '../../hooks/useGastos';
import { formatCOPFull, formatCOP } from '@moneycouple/shared-utils';
import { MC_CATS } from '../../constants/tokens';

type ViewMode = 'personal' | 'couple';

export default function HomeScreen() {
  const { t, accent } = useTheme();
  const router = useRouter();
  const [view, setView] = useState<ViewMode>('personal');
  const paired = false;
  const isCouple = view === 'couple';

  const { data: dashboard, isLoading, isError } = useDashboard();

  // Derived data from API or empty fallback
  const totalGastos = dashboard?.totalGastos ?? 0;
  const carteras = dashboard?.carteras ?? [];
  const gastosRecientes = dashboard?.gastosRecientes ?? [];
  const porCategoria = dashboard?.porCategoria ?? [];

  const catData = porCategoria.map((c) => ({
    key: c.categoria,
    value: c.total,
    color: MC_CATS[c.categoria as keyof typeof MC_CATS]?.color ?? '#B0BEC5',
  }));
  const catSum = catData.reduce((s, c) => s + c.value, 0);

  const walletTotal = carteras.reduce((s, w) => s + w.saldoActual, 0);
  const total = isCouple ? walletTotal : walletTotal;

  const monthBudget = 1000000;
  const monthSpent = totalGastos;
  const pct = monthBudget > 0 ? Math.min(1, monthSpent / monthBudget) : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {isCouple ? (
              <View style={styles.doubleAvatar}>
                <View style={[styles.avatar, { backgroundColor: accent, borderColor: t.bg }]}>
                  <MCText style={styles.avatarText}>J</MCText>
                </View>
                <View
                  style={[
                    styles.avatar,
                    styles.avatarOverlap,
                    { backgroundColor: '#FF6B6B', borderColor: t.bg },
                  ]}
                >
                  <MCText style={styles.avatarText}>M</MCText>
                </View>
              </View>
            ) : (
              <View style={[styles.avatar, { backgroundColor: accent }]}>
                <MCText style={styles.avatarText}>J</MCText>
              </View>
            )}
            <View>
              <MCText style={[styles.headerDate, { color: t.textSec }]}>
                {new Date().toLocaleDateString('es-CO', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                })}
              </MCText>
              <MCText style={styles.headerName}>
                Hola, {isCouple ? 'Juan & María' : 'Juan'} 👋
              </MCText>
            </View>
          </View>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: t.surfaceVar }]}>
            <MCIcon name="bell" size={18} color={t.text} />
            <View style={[styles.notifDot, { borderColor: t.surfaceVar }]} />
          </TouchableOpacity>
        </View>

        {/* Personal / Pareja toggle */}
        {paired && (
          <View style={[styles.toggle, { backgroundColor: t.surfaceVar, borderColor: t.border }]}>
            <TouchableOpacity
              style={[styles.toggleBtn, !isCouple && { backgroundColor: t.surface }]}
              onPress={() => setView('personal')}
            >
              <MCIcon
                name="user"
                size={14}
                color={!isCouple ? t.text : t.textSec}
                strokeWidth={2}
              />
              <MCText
                style={[
                  styles.toggleLabel,
                  { color: !isCouple ? t.text : t.textSec, fontWeight: !isCouple ? '700' : '500' },
                ]}
              >
                Personal
              </MCText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, isCouple && { backgroundColor: t.surface }]}
              onPress={() => {
                setView('couple');
                router.push('/pareja/dashboard');
              }}
            >
              <MCText style={{ color: '#FF6B6B' }}>♥</MCText>
              <MCText
                style={[
                  styles.toggleLabel,
                  { color: isCouple ? t.text : t.textSec, fontWeight: isCouple ? '700' : '500' },
                ]}
              >
                Pareja
              </MCText>
            </TouchableOpacity>
          </View>
        )}

        {/* Hero card */}
        <View style={[styles.heroCard, { backgroundColor: t.surface, borderColor: t.border }]}>
          <View style={[styles.heroOrb, { backgroundColor: accent + '33' }]} />
          <View style={styles.heroRow}>
            <MCText style={[styles.heroLabel, { color: t.textSec }]}>
              {isCouple ? 'Patrimonio conjunto' : 'Patrimonio neto'}
            </MCText>
            <View style={[styles.currencyBtn, { backgroundColor: t.surfaceVar }]}>
              <MCText style={{ fontSize: 11, fontWeight: '600', color: t.text }}>COP ▾</MCText>
            </View>
          </View>
          {isLoading ? (
            <ActivityIndicator size="large" color={accent} style={{ marginVertical: 16 }} />
          ) : (
            <>
              <MCText style={[styles.heroAmount, { color: t.text }]}>{formatCOPFull(total)}</MCText>
              <View style={styles.heroChange}>
                <View style={styles.changeBadge}>
                  <MCIcon name="arrowU" size={12} color="#10B981" strokeWidth={2.5} />
                  <MCText style={styles.changeText}>{isCouple ? '+3.9%' : '+2.5%'}</MCText>
                </View>
                <MCText style={[styles.changeSub, { color: t.textSec }]}>
                  {isCouple ? '+$320K este mes' : '+$120K vs mes pasado'}
                </MCText>
              </View>
            </>
          )}
        </View>

        {/* Wallets */}
        {carteras.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MCText style={[styles.sectionLabel, { color: t.textSec }]}>CARTERAS</MCText>
              <TouchableOpacity onPress={() => router.push('/carteras')}>
                <MCText style={[styles.sectionAction, { color: accent }]}>Ver todas</MCText>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.walletsScroll}
            >
              {carteras.map((w) => (
                <WalletCard
                  key={w.id}
                  wallet={{
                    id: w.id,
                    name: w.nombre,
                    brand: w.color,
                    balance: w.saldoActual,
                    type: w.tipo,
                  }}
                />
              ))}
              <TouchableOpacity style={[styles.addWallet, { borderColor: t.borderStrong }]}>
                <MCIcon name="plus" size={20} color={t.textSec} />
                <MCText style={[styles.addWalletLabel, { color: t.textSec }]}>Agregar</MCText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Budget */}
        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          <View style={styles.budgetHeader}>
            <View>
              <MCText style={[styles.budgetLabel, { color: t.textSec }]}>
                {isCouple ? 'Presupuesto compartido · este mes' : 'Presupuesto de este mes'}
              </MCText>
              <MCText style={[styles.budgetAmount, { color: t.text }]}>
                {formatCOP(monthSpent)}{' '}
                <MCText style={{ color: t.textSec, fontSize: 14, fontWeight: '500' }}>
                  / {formatCOP(monthBudget)}
                </MCText>
              </MCText>
            </View>
            <MCText
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: pct > 0.9 ? '#FF6B6B' : pct > 0.7 ? '#F59E0B' : '#10B981',
              }}
            >
              {Math.round(pct * 100)}%
            </MCText>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: t.surfaceVar }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${pct * 100}%` as `${number}%`, backgroundColor: accent },
              ]}
            />
          </View>
          <MCText style={[styles.budgetSub, { color: t.textSec }]}>
            Te quedan{' '}
            <MCText style={{ color: t.text, fontWeight: '600' }}>
              {formatCOP(Math.max(0, monthBudget - monthSpent))}
            </MCText>
          </MCText>
        </View>

        {/* Categories donut */}
        {(catData.length > 0 || !isLoading) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MCText style={[styles.sectionLabel, { color: t.textSec }]}>POR CATEGORÍA</MCText>
              <TouchableOpacity onPress={() => router.push('/analisis')}>
                <MCText style={[styles.sectionAction, { color: accent }]}>Detalle</MCText>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: t.surface,
                  borderColor: t.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                },
              ]}
            >
              {catData.length > 0 ? (
                <>
                  <DonutChart data={catData} size={120} stroke={18} />
                  <View style={{ flex: 1, gap: 6 }}>
                    {catData.slice(0, 4).map((c) => (
                      <View key={c.key} style={styles.catRow}>
                        <View style={[styles.catDot, { backgroundColor: c.color }]} />
                        <MCText style={[styles.catName, { color: t.text }]}>
                          {MC_CATS[c.key as keyof typeof MC_CATS]?.name ?? c.key}
                        </MCText>
                        <MCText style={[styles.catPct, { color: t.textSec }]}>
                          {catSum > 0 ? Math.round((c.value / catSum) * 100) : 0}%
                        </MCText>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <MCText style={[{ color: t.textSec, textAlign: 'center', flex: 1 }]}>
                  {isError ? 'No se pudo cargar los datos' : 'Sin gastos este mes'}
                </MCText>
              )}
            </View>
          </View>
        )}

        {/* AI Insight */}
        <InsightCard
          text={
            isCouple
              ? 'Gastan 30% más juntos los fines de semana. María cubrió 57% de gastos compartidos este mes.'
              : 'Registra tus gastos para recibir insights personalizados.'
          }
        />

        {/* Recent transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MCText style={[styles.sectionLabel, { color: t.textSec }]}>RECIENTES</MCText>
            <TouchableOpacity onPress={() => router.push('/analisis')}>
              <MCText style={[styles.sectionAction, { color: accent }]}>Ver todo</MCText>
            </TouchableOpacity>
          </View>
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
              <MCText
                style={[
                  { color: t.textSec, textAlign: 'center', paddingVertical: 16, fontSize: 13 },
                ]}
              >
                {isError ? 'No se pudo conectar al servidor' : 'No hay gastos este mes'}
              </MCText>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 110, gap: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  doubleAvatar: { flexDirection: 'row' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarOverlap: { marginLeft: -10 },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  headerDate: { fontSize: 11, fontWeight: '500' },
  headerName: { fontSize: 16, fontWeight: '600', letterSpacing: -0.3 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF6B6B',
    borderWidth: 1.5,
  },
  toggle: {
    marginHorizontal: 20,
    marginBottom: 14,
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    borderWidth: 0.5,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  toggleLabel: { fontSize: 13 },
  heroCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 28,
    padding: 22,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  heroOrb: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroLabel: { fontSize: 12, fontWeight: '500', letterSpacing: 0.3, textTransform: 'uppercase' },
  currencyBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  heroAmount: { fontSize: 44, fontWeight: '700', letterSpacing: -1.6, marginTop: 6 },
  heroChange: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#10B98122',
  },
  changeText: { fontSize: 12, fontWeight: '600', color: '#10B981' },
  changeSub: { fontSize: 12 },
  section: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionLabel: { fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },
  sectionAction: { fontSize: 13, fontWeight: '600' },
  walletsScroll: { paddingLeft: 20 },
  addWallet: {
    width: 90,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    marginRight: 10,
  },
  addWalletLabel: { fontSize: 11, fontWeight: '600' },
  card: { marginHorizontal: 20, borderRadius: 20, padding: 16, borderWidth: 0.5, marginBottom: 16 },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  budgetLabel: { fontSize: 12, fontWeight: '500' },
  budgetAmount: { fontSize: 18, fontWeight: '700', marginTop: 2 },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 4 },
  budgetSub: { fontSize: 11 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { flex: 1, fontSize: 12 },
  catPct: { fontSize: 11, fontWeight: '500' },
});
