import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TAB_COLOR, withAlpha } from '@/constants/theme';
import { GradientBg, IconButton } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { useAuthStore } from '@/store/authStore';
import { useDayStore } from '@/store/dayStore';
import { getCoachMessages, addCoachMessage, clearCoachMessages } from '@/db/repositories';
import { askCoach, greeting, type CoachTurn } from '@/lib/coach';
import type { CoachMessage } from '@/types';

const COACH = TAB_COLOR.coach;

const SUGGESTIONS = [
  'Il me reste quoi à manger aujourd’hui ?',
  'Propose-moi un dîner riche en protéines',
  'Comment bien progresser au squat ?',
  'Ma séance de demain, des conseils ?',
];

export default function CoachScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const refreshDay = useDayStore((s) => s.refresh);
  const firstName = user?.name?.split(' ')[0] ?? '';

  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const scrollDown = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);

  const load = useCallback(async () => {
    let rows = await getCoachMessages();
    if (rows.length === 0) {
      // Accueil personnalisé instantané, persisté comme 1er message du coach.
      await addCoachMessage('assistant', greeting(firstName));
      rows = await getCoachMessages();
    }
    setMessages(rows);
    scrollDown();
  }, [firstName]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || sending) return;
    setInput('');
    setSending(true);

    await addCoachMessage('user', content);
    const withUser = await getCoachMessages();
    setMessages(withUser);
    scrollDown();

    try {
      const history: CoachTurn[] = withUser.map((m) => ({ role: m.role, content: m.content }));
      const { reply, logged } = await askCoach(history, firstName);
      await addCoachMessage('assistant', reply);
      if (logged) refreshDay().catch(() => {}); // le journal a changé → maj Home/Nutrition
    } catch {
      await addCoachMessage('assistant', "Aïe, je n'ai pas réussi à répondre (souci réseau ou proxy). Réessaie dans un instant. 🙏");
    } finally {
      setMessages(await getCoachMessages());
      setSending(false);
      scrollDown();
    }
  };

  const confirmClear = () => {
    Alert.alert('Nouvelle conversation', 'Effacer l’historique avec Coach Léo ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Effacer', style: 'destructive', onPress: async () => { await clearCoachMessages(); await load(); } },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <GradientBg />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={0}>
        {/* En-tête coach */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: insets.top + 10, paddingBottom: 12 }}>
          <View style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: withAlpha(COACH, 0.15), borderWidth: 1, borderColor: withAlpha(COACH, 0.25), alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 24 }}>🧑‍🏫</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.2 }}>Coach Léo</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.success }} />
              <Text style={{ color: COLORS.muted, fontSize: 12 }}>Nutrition &amp; muscu · en ligne</Text>
            </View>
          </View>
          <IconButton icon="trash" onPress={confirmClear} color={COLORS.faint} />
        </View>

        {/* Fil de discussion */}
        <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 8, gap: 10 }} onContentSizeChange={scrollDown} keyboardShouldPersistTaps="handled">
          {messages.map((m) => <Bubble key={m.id} message={m} />)}
          {sending && (
            <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 18, borderBottomLeftRadius: 6, paddingVertical: 12, paddingHorizontal: 14 }}>
              <ActivityIndicator size="small" color={COACH} />
              <Text style={{ color: COLORS.muted, fontSize: 13 }}>Coach Léo réfléchit…</Text>
            </View>
          )}

          {/* Suggestions quand la conversation démarre */}
          {messages.length <= 1 && !sending && (
            <View style={{ marginTop: 8, gap: 8 }}>
              <Text style={{ color: COLORS.faint, fontSize: 12, marginLeft: 2 }}>Suggestions</Text>
              {SUGGESTIONS.map((s) => (
                <Pressable key={s} onPress={() => send(s)} style={{ alignSelf: 'flex-start', backgroundColor: withAlpha(COACH, 0.1), borderWidth: 1, borderColor: withAlpha(COACH, 0.25), borderRadius: 16, paddingVertical: 10, paddingHorizontal: 14 }}>
                  <Text style={{ color: COLORS.text, fontSize: 13.5 }}>{s}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Barre de saisie */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 10, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.bg }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Écris à Coach Léo…"
            placeholderTextColor={COLORS.faint}
            multiline
            style={{ flex: 1, maxHeight: 120, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 18, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8, color: COLORS.text, fontSize: 15 }}
          />
          <Pressable
            onPress={() => send(input)}
            disabled={sending || input.trim().length === 0}
            style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: input.trim().length ? COACH : COLORS.surfaceHi, alignItems: 'center', justifyContent: 'center', opacity: sending ? 0.6 : 1 }}
          >
            <Icon name="arrow" size={20} color={input.trim().length ? '#fff' : COLORS.faint} strokeWidth={2.2} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Bubble({ message }: { message: CoachMessage }) {
  const isUser = message.role === 'user';
  return (
    <View
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '86%',
        backgroundColor: isUser ? COLORS.accent : COLORS.surface,
        borderWidth: isUser ? 0 : 1,
        borderColor: COLORS.border,
        borderRadius: 18,
        borderBottomRightRadius: isUser ? 6 : 18,
        borderBottomLeftRadius: isUser ? 18 : 6,
        paddingVertical: 11,
        paddingHorizontal: 14,
      }}
    >
      <Text style={{ color: isUser ? '#fff' : COLORS.text, fontSize: 15, lineHeight: 21 }}>{message.content}</Text>
    </View>
  );
}
