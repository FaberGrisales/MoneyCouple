import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { MCIcon } from '../ui/MCIcon';
import { MCText } from '../ui/MCText';

export function InsightCard({ text }: { text: string }) {
  const { t, dark } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: dark ? '#1E2126' : '#F8F4FF',
          borderColor: dark ? '#2A2D33' : '#E8DFFF',
        },
      ]}
    >
      <View style={styles.icon}>
        <MCIcon name="sparkle" size={18} color="#fff" strokeWidth={2.2} />
      </View>
      <View style={styles.content}>
        <MCText style={styles.label}>Insight de Gemma</MCText>
        <MCText style={[styles.text, { color: t.text }]}>{text}</MCText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    borderWidth: 0.5,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6C5CE7',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  text: { fontSize: 13, lineHeight: 18 },
});
