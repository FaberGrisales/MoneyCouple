import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { formatCOP } from '@moneycouple/shared-utils';
import { MC_CATS } from '../../constants/tokens';
import { useTheme } from '../../hooks/useTheme';
import { MCIcon } from '../ui/MCIcon';
import { MCText } from '../ui/MCText';

interface Transaction {
  id: string;
  merchant: string;
  category: string | null;
  amount: number;
  when: string;
  method: string;
  shared?: boolean;
  isIncome?: boolean;
}

interface Props {
  transaction: Transaction;
  isLast?: boolean;
  onPress?: () => void;
}

export function TransactionRow({ transaction: tx, isLast, onPress }: Props) {
  const { t } = useTheme();
  const cat = tx.category ? MC_CATS[tx.category as keyof typeof MC_CATS] : null;
  const iconName = tx.isIncome ? 'arrowD' : cat ? (cat as { icon: string }).icon : 'dot';
  const iconColor = tx.isIncome ? '#10B981' : cat ? (cat as { color: string }).color : t.textSec;
  const iconBg = tx.isIncome
    ? '#10B98122'
    : cat
      ? (cat as { color: string }).color + '22'
      : t.surfaceVar;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.row, !isLast && { borderBottomWidth: 0.5, borderBottomColor: t.border }]}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <MCIcon name={iconName} size={18} color={iconColor} strokeWidth={1.8} />
      </View>
      <View style={styles.info}>
        <View style={styles.merchantRow}>
          <MCText style={[styles.merchant, { color: t.text }]}>{tx.merchant}</MCText>
          {tx.shared && (
            <View style={styles.sharedBadge}>
              <MCText style={styles.sharedText}>×2</MCText>
            </View>
          )}
        </View>
        <MCText style={[styles.meta, { color: t.textSec }]}>
          {tx.when} · {tx.method}
        </MCText>
      </View>
      <MCText style={[styles.amount, { color: tx.isIncome ? '#10B981' : t.text }]}>
        {tx.isIncome ? '+' : '−'}
        {formatCOP(Math.abs(tx.amount))}
      </MCText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, minWidth: 0 },
  merchantRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  merchant: { fontSize: 15, fontWeight: '500' },
  sharedBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#FF6B6B22',
  },
  sharedText: { fontSize: 9, fontWeight: '700', color: '#FF6B6B', letterSpacing: 0.4 },
  meta: { fontSize: 12, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '600' },
});
