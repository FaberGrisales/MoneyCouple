import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DonutChart } from '../../components/charts/DonutChart';
import { TransactionRow } from '../../components/shared/TransactionRow';
import { MCIcon } from '../../components/ui/MCIcon';
import { MCText } from '../../components/ui/MCText';
import { MC_CATS } from '../../constants/tokens';
import { useDivisionActual, useParejaDashboard, useSaldarDivision } from '../../hooks/usePareja';
import { useTheme } from '../../hooks/useTheme';
import { formatCOP } from '@moneycouple/shared-utils';

export default function ParejaDashboard() {
  const { t, accent } = useTheme();
  const router = useRouter();

  const { data: dashboard, isLoading: dashLoading, isError: dashError } = useParejaDashboard();
  const { data: division, isLoading: divLoading, isError: divError } = useDivisionActual();
  const { mutate: saldar, isPending: saldando } = useSaldarDivision();

  const isLoading = dashLoading || divLoading;
  const isError = dashError || divError;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <MCIcon name="chevL" size={22} color={t.text} strokeWidth={2} />
          <MCText style={[styles.backLabel, { color: t.text }]}>Inicio</MCText>
        </TouchableOpacity>
        <ActivityIndicator size="large" color={accent} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (isError || !dashboard) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <MCIcon name="chevL" size={22} color={t.text} strokeWidth={2} />
          <MCText style={[styles.backLabel, { color: t.text }]}>Inicio</MCText>
        </TouchableOpacity>
        <View style={styles.emptyCenter}>
          <MCText style={{ fontSize: 36, marginBottom: 12 }}>♥</MCText>
          <MCText style={[styles.emptyTitle, { color: t.text }]}>No tienes pareja vinculada</MCText>
          <MCText style={[styles.emptySub, { color: t.textSec }]}>
            Ve a Perfil para vincular una cuenta.
          </MCText>
        </View>
      </SafeAreaView>
    );
  }

  const u1 = dashboard.usuarios[0];
  const u2 = dashboard.usuarios[1];
  const u1Initial = u1?.nombre?.[0]?.toUpperCase() ?? '?';
  const u2Initial = u2?.nombre?.[0]?.toUpperCase() ?? '?';

  const fechaVinc = dashboard.pareja.fechaVinculacion
    ? new Date(dashboard.pareja.fechaVinculacion).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  // Division data — prefer detailed /divisiones/actual if available, fallback to dashboard.division
  const div1YaPago = division?.usuario1.yaPago ?? dashboard.division.yaPago1;
  const div1DebePagar = division?.usuario1.debePagar ?? dashboard.division.debePagar1;
  const div1Balance = division?.usuario1.balance ?? dashboard.division.balance1;
  const div2YaPago = division?.usuario2.yaPago ?? dashboard.division.yaPago2;
  const div2DebePagar = division?.usuario2.debePagar ?? dashboard.division.debePagar2;
  const div2Balance = division?.usuario2.balance ?? dashboard.division.balance2;
  const deudorId = division?.deudorId ?? dashboard.division.deudorId;
  const montoDebido = division?.montoDebido ?? dashboard.division.montoDebido;
  const saldado = division?.saldado ?? false;

  const deudorNombre =
    deudorId === (division?.usuario1.id ?? u1?.id)
      ? (division?.usuario1.nombre ?? u1?.nombre)
      : (division?.usuario2.nombre ?? u2?.nombre);
  const acreedorNombre =
    deudorId === (division?.usuario1.id ?? u1?.id)
      ? (division?.usuario2.nombre ?? u2?.nombre)
      : (division?.usuario1.nombre ?? u1?.nombre);

  const catData = dashboard.porCategoria.map((c) => ({
    key: c.categoria,
    value: c.total,
    color: MC_CATS[c.categoria as keyof typeof MC_CATS]?.color ?? '#B0BEC5',
  }));

  const tipoDivisionLabel =
    dashboard.pareja.tipoDivision === 'CINCUENTA_CINCUENTA'
      ? '50/50'
      : dashboard.pareja.tipoDivision === 'POR_INGRESOS'
        ? 'Por ingresos'
        : 'Personalizado';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <MCIcon name="chevL" size={22} color={t.text} strokeWidth={2} />
          <MCText style={[styles.backLabel, { color: t.text }]}>Inicio</MCText>
        </TouchableOpacity>
        <MCText style={[styles.screenTitle, { color: t.text }]}>Mi Pareja</MCText>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Couple hero card */}
        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          <View style={styles.heroAvatarRow}>
            <View style={[styles.heroAvatar, { backgroundColor: accent }]}>
              <MCText style={styles.heroAvatarText}>{u1Initial}</MCText>
            </View>
            <MCText style={{ fontSize: 20, marginHorizontal: -4, zIndex: 1 }}>♥</MCText>
            <View style={[styles.heroAvatar, { backgroundColor: '#FF6B6B' }]}>
              <MCText style={styles.heroAvatarText}>{u2Initial}</MCText>
            </View>
          </View>
          <MCText style={[styles.heroNames, { color: t.text }]}>
            {u1?.nombre ?? '?'} & {u2?.nombre ?? '?'}
          </MCText>
          {fechaVinc != null && (
            <MCText style={[styles.heroSub, { color: t.textSec }]}>
              Vinculados desde {fechaVinc}
            </MCText>
          )}
          {/* Tipo división badge */}
          <View style={[styles.badge, { backgroundColor: accent + '22' }]}>
            <MCIcon name="split" size={13} color={accent} strokeWidth={2} />
            <MCText style={[styles.badgeText, { color: accent }]}>
              División: {tipoDivisionLabel}
            </MCText>
          </View>
        </View>

        {/* División card */}
        <MCText style={[styles.sectionLabel, { color: t.textSec }]}>DIVISIÓN DEL MES</MCText>
        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          {/* Two-column layout */}
          <View style={styles.divRow}>
            {/* Usuario 1 */}
            <View style={[styles.divCol, { borderRightWidth: 0.5, borderRightColor: t.border }]}>
              <View style={[styles.divAvatar, { backgroundColor: accent }]}>
                <MCText style={styles.divAvatarText}>{u1Initial}</MCText>
              </View>
              <MCText style={[styles.divName, { color: t.text }]}>{u1?.nombre ?? '?'}</MCText>
              <View style={styles.divStat}>
                <MCText style={[styles.divStatLabel, { color: t.textSec }]}>Pagó</MCText>
                <MCText style={[styles.divStatValue, { color: t.text }]}>
                  {formatCOP(div1YaPago)}
                </MCText>
              </View>
              <View style={styles.divStat}>
                <MCText style={[styles.divStatLabel, { color: t.textSec }]}>Debe</MCText>
                <MCText style={[styles.divStatValue, { color: t.text }]}>
                  {formatCOP(div1DebePagar)}
                </MCText>
              </View>
              <View style={styles.divStat}>
                <MCText style={[styles.divStatLabel, { color: t.textSec }]}>Balance</MCText>
                <MCText
                  style={[styles.divStatValue, { color: div1Balance >= 0 ? '#10B981' : '#FF6B6B' }]}
                >
                  {div1Balance >= 0 ? '+' : ''}
                  {formatCOP(div1Balance)}
                </MCText>
              </View>
            </View>

            {/* Usuario 2 */}
            <View style={styles.divCol}>
              <View style={[styles.divAvatar, { backgroundColor: '#FF6B6B' }]}>
                <MCText style={styles.divAvatarText}>{u2Initial}</MCText>
              </View>
              <MCText style={[styles.divName, { color: t.text }]}>{u2?.nombre ?? '?'}</MCText>
              <View style={styles.divStat}>
                <MCText style={[styles.divStatLabel, { color: t.textSec }]}>Pagó</MCText>
                <MCText style={[styles.divStatValue, { color: t.text }]}>
                  {formatCOP(div2YaPago)}
                </MCText>
              </View>
              <View style={styles.divStat}>
                <MCText style={[styles.divStatLabel, { color: t.textSec }]}>Debe</MCText>
                <MCText style={[styles.divStatValue, { color: t.text }]}>
                  {formatCOP(div2DebePagar)}
                </MCText>
              </View>
              <View style={styles.divStat}>
                <MCText style={[styles.divStatLabel, { color: t.textSec }]}>Balance</MCText>
                <MCText
                  style={[styles.divStatValue, { color: div2Balance >= 0 ? '#10B981' : '#FF6B6B' }]}
                >
                  {div2Balance >= 0 ? '+' : ''}
                  {formatCOP(div2Balance)}
                </MCText>
              </View>
            </View>
          </View>

          {/* Settlement row */}
          <View style={[styles.settlementRow, { borderTopColor: t.border }]}>
            {saldado ? (
              <View style={styles.saldadoRow}>
                <MCIcon name="check" size={16} color="#10B981" strokeWidth={2.5} />
                <MCText style={styles.saldadoText}>Saldado este mes</MCText>
              </View>
            ) : montoDebido > 0.01 && deudorNombre != null && acreedorNombre != null ? (
              <View style={styles.deudaRow}>
                <MCText style={[styles.deudaText, { color: t.textSec }]}>
                  <MCText style={{ fontWeight: '700', color: t.text }}>{deudorNombre}</MCText>
                  {' le debe '}
                  <MCText style={{ fontWeight: '700', color: '#FF6B6B' }}>
                    {formatCOP(montoDebido)}
                  </MCText>
                  {' a '}
                  <MCText style={{ fontWeight: '700', color: t.text }}>{acreedorNombre}</MCText>
                </MCText>
                <TouchableOpacity
                  style={[styles.saldarBtn, { backgroundColor: accent }]}
                  onPress={() => saldar({})}
                  disabled={saldando}
                >
                  <MCText style={styles.saldarBtnText}>
                    {saldando ? 'Guardando...' : 'Marcar como saldado'}
                  </MCText>
                </TouchableOpacity>
              </View>
            ) : (
              <MCText style={[styles.deudaText, { color: t.textSec }]}>
                Sin deuda pendiente este mes
              </MCText>
            )}
          </View>
        </View>

        {/* Gastos compartidos section */}
        <MCText style={[styles.sectionLabel, { color: t.textSec }]}>GASTOS COMPARTIDOS</MCText>
        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          <MCText style={[styles.totalCompartido, { color: t.text }]}>
            Total compartido este mes:{' '}
            <MCText style={{ color: accent, fontWeight: '700' }}>
              {formatCOP(dashboard.totalGastosCompartidos)}
            </MCText>
          </MCText>

          {/* Donut */}
          {catData.length > 0 && (
            <View style={styles.donutRow}>
              <DonutChart data={catData} size={120} stroke={16} />
              <View style={{ flex: 1, gap: 6 }}>
                {catData.slice(0, 4).map((c) => {
                  const catSum = catData.reduce((s, x) => s + x.value, 0);
                  return (
                    <View key={c.key} style={styles.catRow}>
                      <View style={[styles.catDot, { backgroundColor: c.color }]} />
                      <MCText style={[styles.catName, { color: t.text }]}>
                        {MC_CATS[c.key as keyof typeof MC_CATS]?.name ?? c.key}
                      </MCText>
                      <MCText style={[styles.catPct, { color: t.textSec }]}>
                        {catSum > 0 ? Math.round((c.value / catSum) * 100) : 0}%
                      </MCText>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* Recent shared gastos */}
        {dashboard.gastosRecientes.length > 0 && (
          <>
            <MCText style={[styles.sectionLabel, { color: t.textSec }]}>
              RECIENTES COMPARTIDOS
            </MCText>
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
              {dashboard.gastosRecientes.map((g, i) => (
                <TransactionRow
                  key={g.id}
                  transaction={{
                    id: g.id,
                    merchant: g.descripcion ?? g.categoria,
                    category: g.categoria,
                    amount: -g.monto,
                    when: new Date(g.fechaGasto).toLocaleDateString('es-CO'),
                    method: 'MANUAL',
                    shared: true,
                  }}
                  isLast={i === dashboard.gastosRecientes.length - 1}
                />
              ))}
            </View>
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 20,
  },
  back: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 6 },
  backLabel: { fontSize: 16, fontWeight: '600' },
  screenTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.4 },
  scroll: { paddingBottom: 40, gap: 0 },
  emptyCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptySub: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 16,
  },
  card: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    borderWidth: 0.5,
    marginBottom: 4,
  },
  heroAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  heroAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatarText: { fontSize: 22, fontWeight: '700', color: '#fff' },
  heroNames: { fontSize: 20, fontWeight: '700', textAlign: 'center', letterSpacing: -0.5 },
  heroSub: { fontSize: 13, textAlign: 'center', marginTop: 4 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  divRow: { flexDirection: 'row' },
  divCol: { flex: 1, alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8, gap: 8 },
  divAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  divAvatarText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  divName: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  divStat: { alignItems: 'center', gap: 2 },
  divStatLabel: { fontSize: 11, fontWeight: '500' },
  divStatValue: { fontSize: 14, fontWeight: '700' },
  settlementRow: {
    borderTopWidth: 0.5,
    marginTop: 12,
    paddingTop: 12,
    alignItems: 'center',
    gap: 12,
  },
  saldadoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saldadoText: { fontSize: 14, fontWeight: '700', color: '#10B981' },
  deudaRow: { alignItems: 'center', gap: 12, width: '100%' },
  deudaText: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  saldarBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  saldarBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  totalCompartido: { fontSize: 14, fontWeight: '500', marginBottom: 16 },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { flex: 1, fontSize: 12 },
  catPct: { fontSize: 11, fontWeight: '500' },
});
