import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { MCIcon } from '../ui/MCIcon';
import { MCText } from '../ui/MCText';

interface NavItem {
  name: string;
  icon: string;
  label: string;
  isFab?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'index', icon: 'home', label: 'Inicio' },
  { name: 'analytics', icon: 'chart', label: 'Analisis' },
  { name: 'add', icon: 'plus', label: '', isFab: true },
  { name: 'wallets', icon: 'wallet', label: 'Carteras' },
  { name: 'profile', icon: 'user', label: 'Perfil' },
];

interface TabBarProps {
  state: { index: number };
  navigation: { navigate: (name: string) => void };
}

export function BottomTabBar({ state, navigation }: TabBarProps) {
  const { t, dark, accent } = useTheme();
  const router = useRouter();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: dark ? 'rgba(15,17,20,0.92)' : 'rgba(255,255,255,0.94)',
          borderTopColor: t.border,
        },
      ]}
    >
      {NAV_ITEMS.map((item, index) => {
        const isActive = state.index === index;

        if (item.isFab) {
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.fab, { backgroundColor: accent, shadowColor: accent }]}
              onPress={() => router.push('/gasto/nuevo')}
              activeOpacity={0.8}
            >
              <MCIcon name="plus" size={26} color="#fff" strokeWidth={2.4} />
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={item.name}
            style={styles.tab}
            onPress={() => navigation.navigate(item.name)}
            activeOpacity={0.7}
          >
            <MCIcon
              name={item.icon}
              size={22}
              color={isActive ? t.text : t.textTer}
              strokeWidth={isActive ? 2 : 1.6}
            />
            {item.label ? (
              <MCText
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? t.text : t.textTer,
                }}
              >
                {item.label}
              </MCText>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    borderTopWidth: 0.5,
  },
  tab: {
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});
