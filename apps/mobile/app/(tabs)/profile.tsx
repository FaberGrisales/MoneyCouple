import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatCOPFull } from '@moneycouple/shared-utils';
import { MCIcon } from '../../components/ui/MCIcon';
import { MCText } from '../../components/ui/MCText';
import { MC_ACCENTS } from '../../constants/tokens';
import {
  useAceptarPareja,
  useInvitarPareja,
  useProfile,
  useUpdateIngresos,
} from '../../hooks/useProfile';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/authStore';

type AccentKey = keyof typeof MC_ACCENTS;

export default function ProfileScreen() {
  const { t, accent, dark, toggleDark, setAccent, accentKey } = useTheme();
  const { data: profile, isLoading } = useProfile();
  const updateIngresosMutation = useUpdateIngresos();
  const invitarMutation = useInvitarPareja();
  const aceptarMutation = useAceptarPareja();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [ingresosModal, setIngresosModal] = useState(false);
  const [ingresosStr, setIngresosStr] = useState('');

  const [parejaModal, setParejaModal] = useState(false);
  const [codigoPareja, setCodigoPareja] = useState('');
  const [codigoGenerado, setCodigoGenerado] = useState<string | null>(null);

  function handleSaveIngresos() {
    const val = parseFloat(ingresosStr.replace(/[^0-9.]/g, ''));
    if (!isNaN(val) && val >= 0) {
      updateIngresosMutation.mutate(
        { ingresoMensual: val },
        {
          onSuccess: () => {
            setIngresosModal(false);
            setIngresosStr('');
          },
        },
      );
    }
  }

  function handleInvitar() {
    invitarMutation.mutate(undefined, {
      onSuccess: (data) => {
        setCodigoGenerado(data.codigo);
      },
    });
  }

  function handleAceptar() {
    if (!codigoPareja.trim()) return;
    aceptarMutation.mutate(
      { codigo: codigoPareja.trim() },
      {
        onSuccess: () => {
          setParejaModal(false);
          setCodigoPareja('');
          setCodigoGenerado(null);
        },
      },
    );
  }

  async function handleLogout() {
    await clearAuth();
    router.replace('/(auth)/login');
  }

  const avatarLetter = profile?.nombre?.[0]?.toUpperCase() ?? '?';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          {isLoading ? (
            <ActivityIndicator size="large" color={accent} />
          ) : (
            <>
              <View style={[styles.avatarCircle, { backgroundColor: accent }]}>
                <MCText style={styles.avatarLetter}>{avatarLetter}</MCText>
              </View>
              <MCText style={[styles.profileName, { color: t.text }]}>
                {profile?.nombre ?? ''}
              </MCText>
              <MCText style={[styles.profileEmail, { color: t.textSec }]}>
                {profile?.email ?? ''}
              </MCText>
            </>
          )}
        </View>

        {/* Cuenta section */}
        <MCText style={[styles.sectionLabel, { color: t.textSec }]}>CUENTA</MCText>
        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          {/* Ingresos mensuales */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => {
              setIngresosStr(String(profile?.ingresoMensual ?? ''));
              setIngresosModal(true);
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.rowIcon, { backgroundColor: accent + '22' }]}>
              <MCIcon name="arrowU" size={16} color={accent} strokeWidth={2} />
            </View>
            <MCText style={[styles.rowLabel, { color: t.text }]}>Ingresos mensuales</MCText>
            <MCText style={[styles.rowValue, { color: t.textSec }]}>
              {profile ? formatCOPFull(profile.ingresoMensual) : '--'}
            </MCText>
            <MCIcon name="chevR" size={16} color={t.textTer} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: t.border }]} />

          {/* Tipo de cuenta */}
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: accent + '22' }]}>
              <MCIcon name="star" size={16} color={accent} strokeWidth={2} />
            </View>
            <MCText style={[styles.rowLabel, { color: t.text }]}>Tipo de cuenta</MCText>
            <View style={[styles.badge, { backgroundColor: accent + '22' }]}>
              <MCText style={[styles.badgeText, { color: accent }]}>
                {profile?.tipoCuenta ?? '--'}
              </MCText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: t.border }]} />

          {/* Email verificado */}
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: accent + '22' }]}>
              <MCIcon name="check" size={16} color={accent} strokeWidth={2} />
            </View>
            <MCText style={[styles.rowLabel, { color: t.text }]}>Email verificado</MCText>
            {profile?.emailVerificado ? (
              <MCIcon name="check" size={18} color="#10B981" strokeWidth={2.5} />
            ) : (
              <MCIcon name="x" size={18} color="#FF6B6B" strokeWidth={2.5} />
            )}
          </View>
        </View>

        {/* Preferencias section */}
        <MCText style={[styles.sectionLabel, { color: t.textSec }]}>PREFERENCIAS</MCText>
        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          {/* Dark mode */}
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: accent + '22' }]}>
              <MCIcon name={dark ? 'moon' : 'sun'} size={16} color={accent} strokeWidth={2} />
            </View>
            <MCText style={[styles.rowLabel, { color: t.text }]}>Modo oscuro</MCText>
            <Switch
              value={dark}
              onValueChange={toggleDark}
              trackColor={{ false: t.border, true: accent + '88' }}
              thumbColor={dark ? accent : t.textTer}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: t.border }]} />

          {/* Accent color */}
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: accent + '22' }]}>
              <MCIcon name="settings" size={16} color={accent} strokeWidth={2} />
            </View>
            <MCText style={[styles.rowLabel, { color: t.text }]}>Color de acento</MCText>
            <View style={styles.accentDots}>
              {(Object.keys(MC_ACCENTS) as AccentKey[]).map((key) => {
                const col = MC_ACCENTS[key].primary;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.accentDot,
                      { backgroundColor: col },
                      accentKey === key && styles.accentDotSelected,
                    ]}
                    onPress={() => setAccent(key)}
                    activeOpacity={0.8}
                  >
                    {accentKey === key && (
                      <MCIcon name="check" size={10} color="#fff" strokeWidth={2.5} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Pareja section */}
        <MCText style={[styles.sectionLabel, { color: t.textSec }]}>PAREJA</MCText>
        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          {profile?.parejaId ? (
            <View style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: '#FF6B6B22' }]}>
                <MCIcon name="heart" size={16} color="#FF6B6B" strokeWidth={2} />
              </View>
              <MCText style={[styles.rowLabel, { color: t.text }]}>Vinculado</MCText>
              <View style={[styles.badge, { backgroundColor: '#FF6B6B22' }]}>
                <MCText style={[styles.badgeText, { color: '#FF6B6B' }]}>Activo</MCText>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.row}
              onPress={() => setParejaModal(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.rowIcon, { backgroundColor: '#FF6B6B22' }]}>
                <MCIcon name="link" size={16} color="#FF6B6B" strokeWidth={2} />
              </View>
              <MCText style={[styles.rowLabel, { color: t.text }]}>Vincular pareja</MCText>
              <MCIcon name="chevR" size={16} color={t.textTer} />
            </TouchableOpacity>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: '#FF6B6B' }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <MCIcon name="logout" size={18} color="#FF6B6B" strokeWidth={2} />
          <MCText style={styles.logoutText}>Cerrar sesion</MCText>
        </TouchableOpacity>
      </ScrollView>

      {/* Ingresos modal */}
      <Modal
        visible={ingresosModal}
        transparent
        animationType="slide"
        onRequestClose={() => setIngresosModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIngresosModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.modalSheet, { backgroundColor: t.surface }]}
          >
            <View style={[styles.handle, { backgroundColor: t.borderStrong }]} />
            <MCText style={[styles.modalTitle, { color: t.text }]}>Ingresos mensuales</MCText>
            <MCText style={[styles.fieldLabel, { color: t.textSec }]}>Nuevo monto</MCText>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: t.surfaceVar, borderColor: t.border, color: t.text },
              ]}
              placeholderTextColor={t.textTer}
              placeholder="0"
              value={ingresosStr}
              onChangeText={setIngresosStr}
              keyboardType="numeric"
              autoFocus
            />
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: accent }]}
              onPress={handleSaveIngresos}
              activeOpacity={0.8}
              disabled={updateIngresosMutation.isPending}
            >
              {updateIngresosMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MCText style={styles.saveBtnText}>Guardar</MCText>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Pareja modal */}
      <Modal
        visible={parejaModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setParejaModal(false);
          setCodigoGenerado(null);
          setCodigoPareja('');
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setParejaModal(false);
            setCodigoGenerado(null);
            setCodigoPareja('');
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.modalSheet, { backgroundColor: t.surface }]}
          >
            <View style={[styles.handle, { backgroundColor: t.borderStrong }]} />
            <MCText style={[styles.modalTitle, { color: t.text }]}>Vincular pareja</MCText>

            {/* Aceptar with code */}
            <MCText style={[styles.fieldLabel, { color: t.textSec }]}>
              Ingresa el codigo de tu pareja
            </MCText>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: t.surfaceVar, borderColor: t.border, color: t.text },
              ]}
              placeholderTextColor={t.textTer}
              placeholder="Codigo de vinculo"
              value={codigoPareja}
              onChangeText={setCodigoPareja}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: accent }]}
              onPress={handleAceptar}
              activeOpacity={0.8}
              disabled={aceptarMutation.isPending || !codigoPareja.trim()}
            >
              {aceptarMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MCText style={styles.saveBtnText}>Vincular</MCText>
              )}
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: t.border, marginVertical: 16 }]} />

            {/* Generate invite code */}
            <MCText style={[styles.fieldLabel, { color: t.textSec }]}>O crea tu codigo</MCText>
            {codigoGenerado ? (
              <View
                style={[styles.codeBox, { backgroundColor: accent + '22', borderColor: accent }]}
              >
                <MCText style={[styles.codeText, { color: accent }]}>{codigoGenerado}</MCText>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.outlineBtn, { borderColor: accent }]}
                onPress={handleInvitar}
                activeOpacity={0.8}
                disabled={invitarMutation.isPending}
              >
                {invitarMutation.isPending ? (
                  <ActivityIndicator size="small" color={accent} />
                ) : (
                  <MCText style={[styles.outlineBtnText, { color: accent }]}>Generar codigo</MCText>
                )}
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 110 },
  avatarSection: { alignItems: 'center', paddingVertical: 28, gap: 8 },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 36, fontWeight: '700', color: '#fff' },
  profileName: { fontSize: 20, fontWeight: '700' },
  profileEmail: { fontSize: 14 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 4,
  },
  card: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 0.5,
    marginBottom: 20,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 15 },
  rowValue: { fontSize: 14 },
  divider: { height: 0.5, marginHorizontal: 16 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  accentDots: { flexDirection: 'row', gap: 8 },
  accentDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentDotSelected: {
    transform: [{ scale: 1.2 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#FF6B6B' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingTop: 12,
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  saveBtn: {
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  codeBox: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  codeText: { fontSize: 22, fontWeight: '700', letterSpacing: 4 },
  outlineBtn: {
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  outlineBtnText: { fontSize: 15, fontWeight: '600' },
  sun: {},
  settings: {},
});
