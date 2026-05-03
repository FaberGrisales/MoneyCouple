import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MCIcon } from '../../components/ui/MCIcon';
import { MCText } from '../../components/ui/MCText';
import { useTheme } from '../../hooks/useTheme';
import { useProcesarTextoYGuardar, type GastoParseado } from '../../hooks/useIA';
import { formatCOPFull } from '@moneycouple/shared-utils';

type AppState = 'input' | 'processing' | 'review';

const EXAMPLES = [
  'Almorcé en El Corral por 35 mil',
  'Uber al trabajo 12 mil',
  'Mercado Éxito $180.000',
];

export default function VozScreen() {
  const { t, accent } = useTheme();
  const router = useRouter();
  const [text, setText] = useState('');
  const [appState, setAppState] = useState<AppState>('input');
  const [parsed, setParsed] = useState<GastoParseado | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const procesarTexto = useProcesarTextoYGuardar();

  const handleProcesar = () => {
    if (!text.trim()) return;
    setErrorMsg(null);
    setAppState('processing');

    procesarTexto.mutate(
      { texto: text },
      {
        onSuccess: (result) => {
          setParsed(result.parsed);
          setAppState('review');
        },
        onError: (err) => {
          setErrorMsg(err.message ?? 'Error al procesar el gasto');
          setAppState('input');
        },
      },
    );
  };

  const handleConfirm = () => {
    router.back();
  };

  const handleBack = () => {
    setParsed(null);
    setErrorMsg(null);
    setAppState('input');
  };

  const getConfianzaColor = (c: number) => {
    if (c >= 0.8) return '#10B981';
    if (c >= 0.5) return '#F59E0B';
    return '#EF4444';
  };

  if (appState === 'processing') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={accent} />
          <MCText style={[styles.loadingText, { color: t.textSec }]}>
            Procesando con Gemma...
          </MCText>
        </View>
      </SafeAreaView>
    );
  }

  if (appState === 'review' && parsed != null) {
    const confianzaColor = getConfianzaColor(parsed.confianza);
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
        <View style={[styles.header, { borderBottomColor: t.border }]}>
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.backBtn, { backgroundColor: t.surfaceVar }]}
          >
            <MCIcon name="chevL" size={22} color={t.text} strokeWidth={2} />
          </TouchableOpacity>
          <MCText style={{ fontSize: 17, fontWeight: '700', color: t.text }}>
            Confirmar gasto
          </MCText>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.reviewContent}>
          <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
            <View style={styles.cardRow}>
              <MCText style={[styles.cardLabel, { color: t.textSec }]}>Monto</MCText>
              <MCText style={[styles.cardValueLarge, { color: t.text }]}>
                {formatCOPFull(parsed.monto)}
              </MCText>
            </View>

            {parsed.establecimiento != null && (
              <View style={styles.cardRow}>
                <MCText style={[styles.cardLabel, { color: t.textSec }]}>Establecimiento</MCText>
                <MCText style={[styles.cardValue, { color: t.text }]}>
                  {parsed.establecimiento}
                </MCText>
              </View>
            )}

            <View style={styles.cardRow}>
              <MCText style={[styles.cardLabel, { color: t.textSec }]}>Categoría</MCText>
              <MCText style={[styles.cardValue, { color: t.text }]}>
                {parsed.categoriaSugerida ?? 'OTROS'}
              </MCText>
            </View>

            <View style={styles.cardRow}>
              <MCText style={[styles.cardLabel, { color: t.textSec }]}>Confianza IA</MCText>
              <View style={[styles.badge, { backgroundColor: confianzaColor + '22' }]}>
                <MCText style={[styles.badgeText, { color: confianzaColor }]}>
                  {Math.round(parsed.confianza * 100)}%
                </MCText>
              </View>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.confirmBtn, { backgroundColor: accent }]}
            >
              <MCText style={styles.confirmBtnText}>Confirmar</MCText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleBack}
              style={[styles.discardBtn, { backgroundColor: t.surfaceVar, borderColor: t.border }]}
            >
              <MCText style={[styles.discardBtnText, { color: t.text }]}>Volver</MCText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      <View style={[styles.header, { borderBottomColor: t.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: t.surfaceVar }]}
        >
          <MCIcon name="chevL" size={22} color={t.text} strokeWidth={2} />
        </TouchableOpacity>
        <MCText style={{ fontSize: 17, fontWeight: '700', color: t.text }}>Registro por Voz</MCText>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.inputContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.micArea, { backgroundColor: t.surfaceVar, borderColor: t.border }]}>
          <View style={[styles.micIcon, { backgroundColor: '#00B8D422' }]}>
            <MCIcon name="mic" size={40} color="#00B8D4" strokeWidth={1.6} />
          </View>
          <MCText style={[styles.micLabel, { color: t.textSec }]}>
            Describe tu gasto en palabras naturales
          </MCText>
        </View>

        <View style={styles.examplesRow}>
          {EXAMPLES.map((ex) => (
            <TouchableOpacity
              key={ex}
              onPress={() => setText(ex)}
              style={[styles.exampleChip, { backgroundColor: t.surfaceVar, borderColor: t.border }]}
            >
              <MCText style={[styles.exampleText, { color: t.text }]}>{ex}</MCText>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Ej: Gasté 45 mil en Starbucks esta mañana"
          placeholderTextColor={t.textTer}
          multiline
          numberOfLines={4}
          style={[
            styles.textInput,
            { backgroundColor: t.surface, borderColor: t.border, color: t.text },
          ]}
        />

        {errorMsg != null && (
          <View style={[styles.errorBox, { backgroundColor: '#EF444422', borderColor: '#EF4444' }]}>
            <MCText style={{ color: '#EF4444', fontSize: 13, textAlign: 'center' }}>
              {errorMsg}
            </MCText>
          </View>
        )}

        <TouchableOpacity
          onPress={handleProcesar}
          disabled={!text.trim() || procesarTexto.isPending}
          style={[styles.procBtn, { backgroundColor: text.trim() ? accent : t.surfaceVar }]}
        >
          {procesarTexto.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MCText style={[styles.procBtnText, { color: text.trim() ? '#fff' : t.textTer }]}>
              Procesar
            </MCText>
          )}
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
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { fontSize: 15, marginTop: 8 },
  inputContent: { padding: 20, gap: 16 },
  micArea: {
    alignItems: 'center',
    paddingVertical: 32,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
  },
  micIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micLabel: { fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
  examplesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  exampleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  exampleText: { fontSize: 12 },
  textInput: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  procBtn: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  procBtnText: { fontWeight: '700', fontSize: 16 },
  reviewContent: { padding: 20, gap: 16 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: { fontSize: 13 },
  cardValue: { fontSize: 14, fontWeight: '600' },
  cardValueLarge: { fontSize: 22, fontWeight: '700' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  actionRow: { gap: 10, marginTop: 4 },
  confirmBtn: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  discardBtn: {
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  discardBtnText: { fontWeight: '600', fontSize: 15 },
});
