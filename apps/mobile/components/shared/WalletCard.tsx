import React from 'react';
import { StyleSheet, View } from 'react-native';

import { formatCOP } from '@moneycouple/shared-utils';
import { useTheme } from '../../hooks/useTheme';
import { MCText } from '../ui/MCText';

interface Wallet {
  id: string;
  name: string;
  brand: string;
  balance: number;
  type: string;
}

export function WalletCard({ wallet: w }: { wallet: Wallet }) {
  const { t } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={[styles.brand, { backgroundColor: w.brand }]}>
        <MCText style={styles.brandText}>{w.name[0]}</MCText>
      </View>
      <MCText style={[styles.name, { color: t.textSec }]}>{w.name}</MCText>
      <MCText style={[styles.balance, { color: w.balance < 0 ? '#FF6B6B' : t.text }]}>
        {formatCOP(w.balance)}
      </MCText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 140,
    padding: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 0.5,
  },
  brand: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brandText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  name: { fontSize: 11, fontWeight: '500' },
  balance: { fontSize: 16, fontWeight: '700', marginTop: 2 },
});
