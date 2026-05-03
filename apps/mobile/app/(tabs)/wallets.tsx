import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatCOPFull } from '@moneycouple/shared-utils';
import { WalletCard } from '../../components/shared/WalletCard';
import { MCIcon } from '../../components/ui/MCIcon';
import { MCText } from '../../components/ui/MCText';
import { useCarteras } from '../../hooks/useCarteras';
import { useCreateCartera } from '../../hooks/useCarteras';
import { useDeleteCartera } from '../../hooks/useCarteras';
import { useTheme } from '../../hooks/useTheme';

const TIPO_OPTIONS = [
  { value: 'BILLETERA_DIGITAL', label: 'Billetera Digital' },
  { value: 'BANCO_AHORROS', label: 'Banco Ahorros' },
  { value: 'BANCO_CORRIENTE', label: 'Banco Corriente' },
  { value: 'TARJETA_CREDITO', label: 'Tarjeta Credito' },
  { value: 'TARJETA_DEBITO', label: 'Tarjeta Debito' },
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'INVERSION', label: 'Inversion' },
  { value: 'CRIPTO', label: 'Cripto' },
  { value: 'OTRO', label: 'Otro' },
];

const COLOR_SWATCHES = ['#00D9A3', '#6C5CE7', '#FF6B6B', '#0084FF', '#F59E0B', '#4ECDC4'];

function tipoToIcon(tipo: string): string {
  if (tipo.startsWith('BANCO')) return 'home';
  if (tipo === 'TARJETA_CREDITO') return 'card';
  if (tipo === 'TARJETA_DEBITO') return 'card';
  if (tipo === 'EFECTIVO') return 'cash';
  return 'wallet';
}

function tipoToLabel(tipo: string): string {
  return TIPO_OPTIONS.find((o) => o.value === tipo)?.label ?? tipo;
}

export default function WalletsScreen() {
  const { t, accent } = useTheme();
  const { data, isLoading } = useCarteras();
  const createMutation = useCreateCartera();
  const deleteMutation = useDeleteCartera();

  const [modalVisible, setModalVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('BILLETERA_DIGITAL');
  const [saldoStr, setSaldoStr] = useState('');
  const [color, setColor] = useState('#00D9A3');
  const [showTipoList, setShowTipoList] = useState(false);

  const carteras = data?.carteras ?? [];
  const totalBalance = carteras.reduce((s, c) => s + c.saldoActual, 0);

  function resetForm() {
    setNombre('');
    setTipo('BILLETERA_DIGITAL');
    setSaldoStr('');
    setColor('#00D9A3');
    setShowTipoList(false);
  }

  function handleSave() {
    const saldo = parseFloat(saldoStr.replace(/[^0-9.]/g, '')) || 0;
    createMutation.mutate(
      { nombre, tipo, saldoActual: saldo, icono: 'wallet', color },
      {
        onSuccess: () => {
          setModalVisible(false);
          resetForm();
        },
      },
    );
  }

  function handleDelete(id: string) {
    deleteMutation.mutate(id);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <MCText style={[styles.title, { color: t.text }]}>Mis Carteras</MCText>
          <MCText style={[styles.totalLabel, { color: t.textSec }]}>
            Total: {formatCOPFull(totalBalance)}
          </MCText>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: accent }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <MCIcon name="plus" size={20} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={accent} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Horizontal wallet cards */}
          {carteras.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
              contentContainerStyle={styles.horizontalContent}
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
            </ScrollView>
          )}

          {/* All accounts section */}
          <MCText style={[styles.sectionLabel, { color: t.textSec }]}>TODAS LAS CUENTAS</MCText>

          {carteras.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: t.surface, borderColor: t.border }]}>
              <MCIcon name="wallet" size={32} color={t.textSec} />
              <MCText style={[styles.emptyText, { color: t.textSec }]}>
                No tienes carteras aun
              </MCText>
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: accent }]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
              >
                <MCText style={styles.emptyBtnText}>Agregar cartera</MCText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.listCard, { backgroundColor: t.surface, borderColor: t.border }]}>
              {carteras.map((c, i) => (
                <View
                  key={c.id}
                  style={[
                    styles.accountRow,
                    i < carteras.length - 1 && {
                      borderBottomWidth: 0.5,
                      borderBottomColor: t.border,
                    },
                  ]}
                >
                  <View style={[styles.colorBar, { backgroundColor: c.color }]} />
                  <View style={[styles.iconCircle, { backgroundColor: c.color + '22' }]}>
                    <MCIcon name={tipoToIcon(c.tipo)} size={18} color={c.color} strokeWidth={1.8} />
                  </View>
                  <View style={styles.accountInfo}>
                    <MCText style={[styles.accountName, { color: t.text }]}>{c.nombre}</MCText>
                    <MCText style={[styles.accountType, { color: t.textSec }]}>
                      {tipoToLabel(c.tipo)}
                    </MCText>
                  </View>
                  <MCText
                    style={[
                      styles.accountBalance,
                      { color: c.saldoActual < 0 ? '#FF6B6B' : t.text },
                    ]}
                  >
                    {formatCOPFull(c.saldoActual)}
                  </MCText>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(c.id)}
                    activeOpacity={0.7}
                  >
                    <MCIcon name="trash" size={16} color={t.textTer} strokeWidth={1.6} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Bottom add button */}
          <TouchableOpacity
            style={[styles.bottomAddBtn, { borderColor: accent }]}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <MCIcon name="plus" size={18} color={accent} strokeWidth={2} />
            <MCText style={[styles.bottomAddText, { color: accent }]}>Agregar cartera</MCText>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Add cartera modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setModalVisible(false);
            resetForm();
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.modalSheet, { backgroundColor: t.surface }]}
            onPress={() => {
              /* stop propagation */
            }}
          >
            {/* Handle bar */}
            <View style={[styles.handle, { backgroundColor: t.borderStrong }]} />

            <MCText style={[styles.modalTitle, { color: t.text }]}>Nueva cartera</MCText>

            {/* Nombre */}
            <MCText style={[styles.fieldLabel, { color: t.textSec }]}>Nombre</MCText>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: t.surfaceVar, borderColor: t.border, color: t.text },
              ]}
              placeholderTextColor={t.textTer}
              placeholder="Ej: Nequi, Bancolombia..."
              value={nombre}
              onChangeText={setNombre}
            />

            {/* Tipo selector */}
            <MCText style={[styles.fieldLabel, { color: t.textSec }]}>Tipo</MCText>
            <TouchableOpacity
              style={[
                styles.input,
                styles.tipoSelector,
                { backgroundColor: t.surfaceVar, borderColor: t.border },
              ]}
              onPress={() => setShowTipoList(!showTipoList)}
              activeOpacity={0.7}
            >
              <MCText style={{ color: t.text }}>
                {TIPO_OPTIONS.find((o) => o.value === tipo)?.label ?? tipo}
              </MCText>
              <MCIcon name={showTipoList ? 'chevD' : 'chevR'} size={16} color={t.textSec} />
            </TouchableOpacity>
            {showTipoList && (
              <View
                style={[
                  styles.tipoDropdown,
                  { backgroundColor: t.surfaceVar, borderColor: t.border },
                ]}
              >
                {TIPO_OPTIONS.map((o) => (
                  <TouchableOpacity
                    key={o.value}
                    style={[
                      styles.tipoOption,
                      tipo === o.value && { backgroundColor: accent + '22' },
                    ]}
                    onPress={() => {
                      setTipo(o.value);
                      setShowTipoList(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <MCText style={{ color: tipo === o.value ? accent : t.text }}>{o.label}</MCText>
                    {tipo === o.value && (
                      <MCIcon name="check" size={14} color={accent} strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Saldo inicial */}
            <MCText style={[styles.fieldLabel, { color: t.textSec }]}>Saldo inicial</MCText>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: t.surfaceVar, borderColor: t.border, color: t.text },
              ]}
              placeholderTextColor={t.textTer}
              placeholder="0"
              value={saldoStr}
              onChangeText={setSaldoStr}
              keyboardType="numeric"
            />

            {/* Color swatches */}
            <MCText style={[styles.fieldLabel, { color: t.textSec }]}>Color</MCText>
            <View style={styles.swatchRow}>
              {COLOR_SWATCHES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.swatch,
                    { backgroundColor: c },
                    color === c && styles.swatchSelected,
                  ]}
                  onPress={() => setColor(c)}
                  activeOpacity={0.8}
                >
                  {color === c && <MCIcon name="check" size={14} color="#fff" strokeWidth={2.5} />}
                </TouchableOpacity>
              ))}
            </View>

            {/* Save button */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: accent }]}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={createMutation.isPending || !nombre.trim()}
            >
              {createMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MCText style={styles.saveBtnText}>Guardar</MCText>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  totalLabel: { fontSize: 13, marginTop: 2 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalScroll: { marginBottom: 20 },
  horizontalContent: { paddingHorizontal: 20 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  listCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 0.5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: 16,
    gap: 12,
  },
  colorBar: { width: 4, height: '100%', borderTopRightRadius: 2, borderBottomRightRadius: 2 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 15, fontWeight: '500' },
  accountType: { fontSize: 12, marginTop: 2 },
  accountBalance: { fontSize: 15, fontWeight: '700' },
  deleteBtn: { padding: 6 },
  emptyCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 0.5,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  emptyText: { fontSize: 14 },
  emptyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  emptyBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  bottomAddBtn: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  bottomAddText: { fontSize: 14, fontWeight: '600' },
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
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  tipoSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tipoDropdown: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    overflow: 'hidden',
  },
  tipoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  swatchRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchSelected: {
    transform: [{ scale: 1.15 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  saveBtn: {
    marginTop: 24,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
