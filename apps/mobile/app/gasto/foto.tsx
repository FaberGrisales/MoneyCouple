import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MCIcon } from '../../components/ui/MCIcon';
import { MCText } from '../../components/ui/MCText';
import { useTheme } from '../../hooks/useTheme';
import { useProcesarFacturaYGuardar, type FacturaProcesada } from '../../hooks/useIA';
import { formatCOPFull } from '@moneycouple/shared-utils';

type AppState = 'idle' | 'processing' | 'review' | 'saving';

export default function FotoScreen() {
  const { t, accent } = useTheme();
  const router = useRouter();
  const [appState, setAppState] = useState<AppState>('idle');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [parsed, setParsed] = useState<FacturaProcesada | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const procesarFactura = useProcesarFacturaYGuardar();

  const processImage = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!asset.base64) {
      Alert.alert('Error', 'No se pudo obtener la imagen en base64');
      return;
    }
    setImageUri(asset.uri);
    setErrorMsg(null);
    setAppState('processing');

    procesarFactura.mutate(
      { imagenBase64: asset.base64, mimeType: 'image/jpeg' },
      {
        onSuccess: (result) => {
          setParsed(result.parsed);
          setAppState('review');
        },
        onError: (err) => {
          setErrorMsg(err.message ?? 'Error al procesar la factura');
          setAppState('idle');
        },
      },
    );
  };

  const handleTakePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara para tomar fotos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0] != null) {
      await processImage(result.assets[0]);
    }
  };

  const handlePickGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para seleccionar fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled && result.assets[0] != null) {
      await processImage(result.assets[0]);
    }
  };

  const handleConfirm = () => {
    router.back();
  };

  const handleDiscard = () => {
    setImageUri(null);
    setParsed(null);
    setErrorMsg(null);
    setAppState('idle');
  };

  const getConfianzaColor = (c: number) => {
    if (c >= 0.8) return '#10B981';
    if (c >= 0.5) return '#F59E0B';
    return '#EF4444';
  };

  if (appState === 'processing' || appState === 'saving') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={accent} />
          <MCText style={[styles.loadingText, { color: t.textSec }]}>
            {appState === 'saving' ? 'Guardando...' : 'Procesando factura con Gemma...'}
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
            onPress={handleDiscard}
            style={[styles.backBtn, { backgroundColor: t.surfaceVar }]}
          >
            <MCIcon name="chevL" size={22} color={t.text} strokeWidth={2} />
          </TouchableOpacity>
          <MCText style={{ fontSize: 17, fontWeight: '700', color: t.text }}>Resultado</MCText>
          <View style={{ width: 36 }} />
        </View>
        <ScrollView
          contentContainerStyle={styles.reviewContent}
          showsVerticalScrollIndicator={false}
        >
          {imageUri != null && (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
          )}

          <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
            <View style={styles.cardRow}>
              <MCText style={[styles.cardLabel, { color: t.textSec }]}>Total</MCText>
              <MCText style={[styles.cardValueLarge, { color: t.text }]}>
                {formatCOPFull(parsed.montoTotal)}
              </MCText>
            </View>

            <View style={styles.cardRow}>
              <MCText style={[styles.cardLabel, { color: t.textSec }]}>Comercio</MCText>
              <MCText style={[styles.cardValue, { color: t.text }]}>
                {parsed.establecimiento}
              </MCText>
            </View>

            {parsed.categoriaSugerida != null && (
              <View style={styles.cardRow}>
                <MCText style={[styles.cardLabel, { color: t.textSec }]}>Categoría</MCText>
                <MCText style={[styles.cardValue, { color: t.text }]}>
                  {parsed.categoriaSugerida}
                </MCText>
              </View>
            )}

            <View style={styles.cardRow}>
              <MCText style={[styles.cardLabel, { color: t.textSec }]}>Confianza IA</MCText>
              <View style={[styles.badge, { backgroundColor: confianzaColor + '22' }]}>
                <MCText style={[styles.badgeText, { color: confianzaColor }]}>
                  {Math.round(parsed.confianza * 100)}%
                </MCText>
              </View>
            </View>
          </View>

          {parsed.items.length > 0 && (
            <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
              <MCText style={[styles.sectionTitle, { color: t.text }]}>Artículos</MCText>
              {parsed.items.map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <MCText style={[styles.itemName, { color: t.text }]} numberOfLines={1}>
                    {item.nombre}
                  </MCText>
                  <MCText style={[styles.itemPrice, { color: t.textSec }]}>
                    {formatCOPFull(item.precioTotal)}
                  </MCText>
                </View>
              ))}
            </View>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.confirmBtn, { backgroundColor: accent }]}
            >
              <MCText style={styles.confirmBtnText}>Confirmar y guardar</MCText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDiscard}
              style={[styles.discardBtn, { backgroundColor: t.surfaceVar, borderColor: t.border }]}
            >
              <MCText style={[styles.discardBtnText, { color: t.text }]}>Descartar</MCText>
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
        <MCText style={{ fontSize: 17, fontWeight: '700', color: t.text }}>Foto / Factura</MCText>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.idleContent}>
        <View style={[styles.iconBox, { backgroundColor: '#FF6B6B22' }]}>
          <MCIcon name="camera" size={36} color="#FF6B6B" strokeWidth={1.6} />
        </View>
        <MCText style={[styles.idleTitle, { color: t.text }]}>Escanea tu factura</MCText>
        <MCText style={[styles.idleSub, { color: t.textSec }]}>
          Gemma extrae automáticamente el monto, comercio y categoría
        </MCText>

        {errorMsg != null && (
          <View style={[styles.errorBox, { backgroundColor: '#EF444422', borderColor: '#EF4444' }]}>
            <MCText style={{ color: '#EF4444', fontSize: 13, textAlign: 'center' }}>
              {errorMsg}
            </MCText>
          </View>
        )}

        <TouchableOpacity
          onPress={handleTakePhoto}
          style={[styles.optionBtn, { backgroundColor: t.surface, borderColor: t.border }]}
        >
          <View style={[styles.optionIcon, { backgroundColor: accent + '22' }]}>
            <MCIcon name="camera" size={24} color={accent} strokeWidth={1.8} />
          </View>
          <View style={styles.optionText}>
            <MCText style={[styles.optionTitle, { color: t.text }]}>Tomar foto</MCText>
            <MCText style={[styles.optionSub, { color: t.textSec }]}>
              Usa la cámara de tu dispositivo
            </MCText>
          </View>
          <MCIcon name="chevR" size={18} color={t.textTer} strokeWidth={1.8} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePickGallery}
          style={[styles.optionBtn, { backgroundColor: t.surface, borderColor: t.border }]}
        >
          <View style={[styles.optionIcon, { backgroundColor: '#6C5CE722' }]}>
            <MCIcon name="gallery" size={24} color="#6C5CE7" strokeWidth={1.8} />
          </View>
          <View style={styles.optionText}>
            <MCText style={[styles.optionTitle, { color: t.text }]}>Elegir de galería</MCText>
            <MCText style={[styles.optionSub, { color: t.textSec }]}>
              Selecciona una foto existente
            </MCText>
          </View>
          <MCIcon name="chevR" size={18} color={t.textTer} strokeWidth={1.8} />
        </TouchableOpacity>
      </View>
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
  idleContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    gap: 16,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  idleTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  idleSub: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 8 },
  errorBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    width: '100%',
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    width: '100%',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { flex: 1, gap: 2 },
  optionTitle: { fontSize: 15, fontWeight: '600' },
  optionSub: { fontSize: 12 },
  reviewContent: { padding: 20, gap: 16 },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#00000011',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: { fontSize: 13 },
  cardValue: { fontSize: 14, fontWeight: '600' },
  cardValueLarge: { fontSize: 20, fontWeight: '700' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  itemName: { flex: 1, fontSize: 13 },
  itemPrice: { fontSize: 13, fontWeight: '600' },
  actionRow: { gap: 10, marginTop: 8 },
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
