import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MCIcon } from '../../components/ui/MCIcon';
import { MCText } from '../../components/ui/MCText';
import { useTheme } from '../../hooks/useTheme';
import { useCreateGasto } from '../../hooks/useGastos';
import { useParsearTexto, type GastoParseado } from '../../hooks/useIA';
import { formatCOPFull } from '@moneycouple/shared-utils';

type Message =
  | { id: string; from: 'bot'; text: string; time: string }
  | { id: string; from: 'user'; text: string; time: string }
  | {
      id: string;
      from: 'bot';
      kind: 'parsed';
      parsed: GastoParseado;
      time: string;
    };

const QUICK_REPLIES = ['Gasté 45 mil en Starbucks', '$25K en Uber', '120K en Éxito ayer'];

function nowTime() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function ChatScreen() {
  const { t, accent } = useTheme();
  const router = useRouter();
  const [draft, setDraft] = useState('');
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      from: 'bot',
      text: '¡Hola! Cuéntame sobre tu gasto. Puedes decirme cuánto, dónde y cuándo 💸',
      time: nowTime(),
    },
  ]);
  const listRef = useRef<FlatList>(null);

  const parsearTexto = useParsearTexto();
  const createGasto = useCreateGasto();

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: String(Date.now()), from: 'user', text, time: nowTime() };
    setMessages((m) => [...m, userMsg]);
    setDraft('');
    setStep(1);

    parsearTexto.mutate(
      { texto: text },
      {
        onSuccess: (parsed) => {
          const parsedMsg: Message = {
            id: String(Date.now() + 1),
            from: 'bot',
            kind: 'parsed',
            parsed,
            time: nowTime(),
          };
          setMessages((m) => [...m, parsedMsg]);
          setStep(2);
        },
        onError: () => {
          const errMsg: Message = {
            id: String(Date.now() + 1),
            from: 'bot',
            text: 'No pude entender el gasto, intenta de nuevo',
            time: nowTime(),
          };
          setMessages((m) => [...m, errMsg]);
          setStep(0);
        },
      },
    );
  };

  const handleConfirm = (parsed: GastoParseado) => {
    createGasto.mutate(
      {
        monto: parsed.monto,
        descripcion: parsed.descripcion,
        categoria: parsed.categoriaSugerida ?? 'OTROS',
        fechaGasto: parsed.fecha,
        fuenteRegistro: 'CHAT',
        ...(parsed.establecimiento != null && { establecimiento: parsed.establecimiento }),
      } as Parameters<typeof createGasto.mutate>[0],
      {
        onSuccess: () => router.back(),
      },
    );
  };

  const renderMessage = ({ item: m }: { item: Message }) => {
    if (m.from === 'user') {
      return (
        <View style={styles.userMsgWrap}>
          <View style={[styles.userBubble, { backgroundColor: accent }]}>
            <MCText style={{ color: '#fff', fontSize: 14 }}>{m.text}</MCText>
          </View>
          <MCText style={[styles.msgTime, { color: t.textSec, textAlign: 'right' }]}>
            {m.time} ✓✓
          </MCText>
        </View>
      );
    }
    if ('kind' in m && m.kind === 'parsed') {
      const { parsed } = m;
      const merchant = parsed.establecimiento ?? parsed.descripcion;
      const category = parsed.categoriaSugerida ?? 'OTROS';
      return (
        <View style={styles.botMsgWrap}>
          <BotAvatar />
          <View style={[styles.parsedCard, { backgroundColor: t.surface, borderColor: t.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
              <MCIcon name="check" size={14} color="#10B981" strokeWidth={2.6} />
              <MCText style={{ fontWeight: '600', fontSize: 13 }}>¡Entendido!</MCText>
            </View>
            <View style={styles.parsedGrid}>
              <MCText style={{ color: t.textSec, fontSize: 13 }}>Monto</MCText>
              <MCText style={{ fontWeight: '700', fontSize: 13 }}>
                {formatCOPFull(parsed.monto)}
              </MCText>
              <MCText style={{ color: t.textSec, fontSize: 13 }}>Comercio</MCText>
              <MCText style={{ fontWeight: '600', fontSize: 13 }}>{merchant}</MCText>
              <MCText style={{ color: t.textSec, fontSize: 13 }}>Categoría</MCText>
              <MCText style={{ fontWeight: '600', fontSize: 13 }}>{category}</MCText>
            </View>
            <View style={styles.parsedActions}>
              <TouchableOpacity
                onPress={() => handleConfirm(parsed)}
                style={[styles.confirmBtn, { backgroundColor: accent }]}
                disabled={createGasto.isPending}
              >
                {createGasto.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MCText style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
                    Confirmar
                  </MCText>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editBtn, { backgroundColor: t.surfaceVar }]}
                onPress={() => router.push('/gasto/manual')}
              >
                <MCText style={{ color: t.text, fontWeight: '600', fontSize: 13 }}>Editar</MCText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.botMsgWrap}>
        <BotAvatar />
        <View style={[styles.botBubble, { backgroundColor: t.surface, borderColor: t.border }]}>
          <MCText style={{ fontSize: 14, color: t.text }}>{'text' in m ? m.text : ''}</MCText>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: t.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: t.surfaceVar }]}
        >
          <MCIcon name="x" size={18} color={t.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.gemmaIcon}>
            <MCIcon name="sparkle" size={16} color="#fff" strokeWidth={2.4} />
          </View>
          <View>
            <MCText style={{ fontSize: 14, fontWeight: '600', letterSpacing: -0.2, color: t.text }}>
              Gemma
            </MCText>
            <MCText style={{ fontSize: 10, fontWeight: '600', color: '#10B981' }}>
              ● en línea
            </MCText>
          </View>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          <>
            {step === 1 && (
              <View style={styles.botMsgWrap}>
                <BotAvatar />
                <View
                  style={[
                    styles.typingBubble,
                    { backgroundColor: t.surface, borderColor: t.border },
                  ]}
                >
                  {[0, 1, 2].map((i) => (
                    <View key={i} style={[styles.typingDot, { backgroundColor: t.textTer }]} />
                  ))}
                </View>
              </View>
            )}
            {step === 0 && (
              <View style={styles.quickReplies}>
                {QUICK_REPLIES.map((qr) => (
                  <TouchableOpacity
                    key={qr}
                    onPress={() => send(qr)}
                    style={[styles.qrBtn, { backgroundColor: t.surfaceVar, borderColor: t.border }]}
                  >
                    <MCText style={{ fontSize: 12, color: t.text }}>{qr}</MCText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        }
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.inputBar, { borderTopColor: t.border }]}>
          <TouchableOpacity style={[styles.inputIcon, { backgroundColor: t.surfaceVar }]}>
            <MCIcon name="attach" size={18} color={t.textSec} />
          </TouchableOpacity>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => send(draft)}
            placeholder="Escribe tu gasto..."
            placeholderTextColor={t.textTer}
            style={[
              styles.textInput,
              { backgroundColor: t.surfaceVar, borderColor: t.border, color: t.text },
            ]}
          />
          <TouchableOpacity
            onPress={() => send(draft)}
            disabled={parsearTexto.isPending}
            style={[styles.sendBtn, { backgroundColor: draft ? accent : t.surfaceVar }]}
          >
            {parsearTexto.isPending ? (
              <ActivityIndicator size="small" color={draft ? '#fff' : t.textSec} />
            ) : (
              <MCIcon name="send" size={16} color={draft ? '#fff' : t.textSec} strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function BotAvatar() {
  return (
    <View style={styles.botAvatar}>
      <MCIcon name="sparkle" size={14} color="#fff" strokeWidth={2.4} />
    </View>
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gemmaIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: { padding: 16, gap: 10, paddingBottom: 20 },
  botMsgWrap: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
    maxWidth: '85%',
    marginBottom: 10,
  },
  botAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  botBubble: {
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 0.5,
  },
  typingBubble: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    borderWidth: 0.5,
    alignItems: 'center',
  },
  typingDot: { width: 6, height: 6, borderRadius: 3 },
  userMsgWrap: { alignSelf: 'flex-end', maxWidth: '80%', marginBottom: 10 },
  userBubble: {
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  parsedCard: { borderRadius: 18, borderTopLeftRadius: 4, padding: 14, borderWidth: 0.5, flex: 1 },
  parsedGrid: { gap: 4, marginBottom: 12 },
  parsedActions: { flexDirection: 'row', gap: 8 },
  confirmBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  editBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  quickReplies: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  qrBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, borderWidth: 0.5 },
  inputBar: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 0.5,
  },
  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 0.5,
    fontSize: 14,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgTime: { fontSize: 10, marginTop: 3 },
});
