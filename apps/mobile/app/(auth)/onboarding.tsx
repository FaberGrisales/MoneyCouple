import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';
import { MCIcon } from '../../components/ui/MCIcon';
import { MCText } from '../../components/ui/MCText';

const SLIDES = [
  {
    title: 'Registra gastos\nen segundos',
    sub: 'Foto, voz o chat. Gemma se encarga.',
    icon: 'camera',
    c1: '#FF6B6B',
    c2: '#FFB3B3',
  },
  {
    title: 'IA que entiende\ntus facturas',
    sub: 'Categoriza, divide y aprende contigo.',
    icon: 'sparkle',
    c1: '#6C5CE7',
    c2: '#A29BFE',
  },
  {
    title: 'Juntos\nsi quieres',
    sub: 'Vincula a tu pareja para dividir gastos.',
    icon: 'heart',
    c1: '#00D9A3',
    c2: '#00B386',
  },
] as const;

export default function OnboardingScreen() {
  const { t, accent } = useTheme();
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const s = SLIDES[slide]!;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      <View style={styles.topBar}>
        <View style={styles.logo}>
          <View style={[styles.logoIcon, { backgroundColor: accent }]}>
            <MCText style={styles.logoText}>m</MCText>
          </View>
          <MCText style={[styles.logoName, { color: t.text }]}>MoneyCouple</MCText>
        </View>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/')}>
          <MCText style={{ color: t.textSec, fontSize: 13, fontWeight: '600' }}>Saltar</MCText>
        </TouchableOpacity>
      </View>

      <View style={styles.illo}>
        <View style={[styles.illoOuter, { backgroundColor: s.c1 + '33' }]}>
          <View style={[styles.illoInner, { backgroundColor: s.c1 }]}>
            <MCIcon name={s.icon} size={64} color="#fff" strokeWidth={1.4} />
          </View>
        </View>
      </View>

      <View style={styles.copy}>
        <MCText style={[styles.title, { color: t.text }]}>{s.title}</MCText>
        <MCText style={[styles.sub, { color: t.textSec }]}>{s.sub}</MCText>

        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  flex: i === slide ? 2 : 0.5,
                  backgroundColor: i === slide ? accent : t.borderStrong,
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: accent }]}
          onPress={() => {
            if (slide < SLIDES.length - 1) setSlide(slide + 1);
            else router.replace('/(auth)/login');
          }}
        >
          <MCText style={styles.btnText}>
            {slide < SLIDES.length - 1 ? 'Siguiente' : 'Empezar'}
          </MCText>
          <MCIcon name="arrowR" size={16} color="#fff" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  logoName: { fontSize: 14, fontWeight: '700', letterSpacing: -0.3 },
  illo: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  illoOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illoInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { padding: 28, paddingBottom: 40, gap: 0 },
  title: { fontSize: 32, fontWeight: '700', letterSpacing: -1, lineHeight: 36, marginBottom: 10 },
  sub: { fontSize: 15, lineHeight: 22, marginBottom: 24 },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 24 },
  dot: { height: 6, borderRadius: 3 },
  btn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
