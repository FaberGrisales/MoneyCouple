import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MCIcon } from '../../components/ui/MCIcon';
import { MCText } from '../../components/ui/MCText';
import { useTheme } from '../../hooks/useTheme';
import { formatCOPFull } from '@moneycouple/shared-utils';

export default function ManualScreen() {
  const { t, accent } = useTheme();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');

  const numAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MCIcon name="chevL" size={22} color={t.text} strokeWidth={2} />
        </TouchableOpacity>
        <MCText style={[styles.title, { color: t.text }]}>Ingreso Manual</MCText>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Amount display */}
        <View style={styles.amountSection}>
          <MCText style={[styles.amountLabel, { color: t.textSec }]}>Monto del gasto</MCText>
          <MCText style={[styles.amountDisplay, { color: t.text }]}>
            {numAmount > 0 ? formatCOPFull(numAmount) : '$0'}
          </MCText>
        </View>

        {/* Amount input */}
        <View style={[styles.inputRow, { backgroundColor: t.surface, borderColor: t.border }]}>
          <MCText style={{ color: t.textSec, fontSize: 16, fontWeight: '600' }}>$</MCText>
          <TextInput
            style={[styles.input, { color: t.text }]}
            placeholder="0"
            placeholderTextColor={t.textTer}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <MCText style={[styles.currency, { color: t.textSec }]}>COP</MCText>
        </View>

        {/* Description */}
        <View style={[styles.inputRow, { backgroundColor: t.surface, borderColor: t.border }]}>
          <MCIcon name="edit" size={18} color={t.textSec} strokeWidth={1.8} />
          <TextInput
            style={[styles.input, { color: t.text }]}
            placeholder="Descripción"
            placeholderTextColor={t.textTer}
            value={desc}
            onChangeText={setDesc}
          />
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: accent, opacity: numAmount > 0 ? 1 : 0.4 }]}
          disabled={numAmount === 0}
          onPress={() => router.back()}
        >
          <MCIcon name="check" size={20} color="#fff" strokeWidth={2.5} />
          <MCText style={styles.saveBtnText}>Guardar gasto</MCText>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 18, fontWeight: '700', letterSpacing: -0.4 },
  content: { padding: 20, gap: 14 },
  amountSection: { alignItems: 'center', paddingVertical: 16 },
  amountLabel: { fontSize: 13, fontWeight: '500', marginBottom: 8 },
  amountDisplay: { fontSize: 40, fontWeight: '700', letterSpacing: -1.5 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  input: { flex: 1, fontSize: 16, fontWeight: '500' },
  currency: { fontSize: 13, fontWeight: '600' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
