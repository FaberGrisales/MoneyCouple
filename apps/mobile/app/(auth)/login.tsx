import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';
import { MCIcon } from '../../components/ui/MCIcon';
import { MCText } from '../../components/ui/MCText';

export default function LoginScreen() {
  const { t, accent } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      <View style={styles.logo}>
        <View style={[styles.logoIcon, { backgroundColor: accent }]}>
          <MCText style={styles.logoText}>m</MCText>
        </View>
        <MCText style={[styles.logoName, { color: t.text }]}>MoneyCouple</MCText>
      </View>

      <MCText style={[styles.title, { color: t.text }]}>Bienvenido{'\n'}de vuelta 👋</MCText>
      <MCText style={[styles.sub, { color: t.textSec }]}>Ingresa para continuar</MCText>

      <View style={styles.form}>
        <MCText style={[styles.fieldLabel, { color: t.textSec }]}>EMAIL</MCText>
        <View style={[styles.field, { backgroundColor: t.surface, borderColor: t.border }]}>
          <MCIcon name="mail" size={18} color={t.textSec} />
          <MCText style={{ fontSize: 15, color: t.text, flex: 1 }}>juan@gmail.com</MCText>
        </View>

        <MCText style={[styles.fieldLabel, { color: t.textSec }]}>CONTRASEÑA</MCText>
        <View style={[styles.field, { backgroundColor: t.surface, borderColor: t.border }]}>
          <MCIcon name="lock" size={18} color={t.textSec} />
          <MCText style={{ fontSize: 15, letterSpacing: 4, color: t.text, flex: 1 }}>
            ••••••••
          </MCText>
          <MCIcon name="eye" size={18} color={t.textSec} />
        </View>

        <TouchableOpacity>
          <MCText style={[styles.forgot, { color: accent }]}>¿Olvidaste tu contraseña?</MCText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginBtn, { backgroundColor: accent }]}
          onPress={() => router.replace('/(tabs)')}
        >
          <MCText style={styles.loginBtnText}>Iniciar sesión</MCText>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: t.border }]} />
          <MCText style={[styles.dividerText, { color: t.textSec }]}>O CONTINÚA CON</MCText>
          <View style={[styles.dividerLine, { backgroundColor: t.border }]} />
        </View>

        <View style={styles.socialRow}>
          {['Google', 'Apple'].map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.socialBtn, { backgroundColor: t.surface, borderColor: t.border }]}
            >
              <MCText style={{ color: t.text, fontWeight: '600', fontSize: 14 }}>{p}</MCText>
            </TouchableOpacity>
          ))}
        </View>

        <MCText style={[styles.signupText, { color: t.textSec }]}>
          ¿No tienes cuenta?{' '}
          <MCText
            style={{ color: accent, fontWeight: '700' }}
            onPress={() => router.push('/(auth)/onboarding')}
          >
            Regístrate
          </MCText>
        </MCText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 24, paddingTop: 8 },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    marginBottom: 32,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  logoName: { fontSize: 14, fontWeight: '700', letterSpacing: -0.3 },
  title: { fontSize: 30, fontWeight: '700', letterSpacing: -0.8, lineHeight: 36, marginBottom: 8 },
  sub: { fontSize: 14, marginBottom: 28 },
  form: { gap: 0 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
    marginBottom: 14,
  },
  forgot: { fontSize: 13, fontWeight: '600', paddingVertical: 4, marginBottom: 18 },
  loginBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 20 },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: 0.5 },
  dividerText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  socialRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  socialBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 0.5,
  },
  signupText: { textAlign: 'center', fontSize: 13 },
});
