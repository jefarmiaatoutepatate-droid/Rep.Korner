import React from 'react';
import { ScrollView, View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';
import { Card, SectionHeader, GradientBg, Avatar } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { useAuthStore } from '@/store/authStore';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);

  const confirmLogout = () => {
    Alert.alert('Se déconnecter', 'Tu devras te reconnecter pour accéder à ton suivi.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est définitive : ton compte et toutes tes données (repas, séances, mensurations…) seront effacés.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Tout supprimer', style: 'destructive', onPress: () => deleteAccount() },
      ],
    );
  };

  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '—';

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <GradientBg />
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: 40 }}>
        <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 }}>
          <Icon name="chevLeft" size={18} color={COLORS.accent} />
          <Text style={{ color: COLORS.accent, fontSize: 14 }}>Retour</Text>
        </Pressable>

        <Text style={{ color: COLORS.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.3, marginBottom: 18 }}>Compte</Text>

        {/* Profil */}
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar initial={(user?.name?.[0] ?? '?').toUpperCase()} size={54} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.text, fontSize: 17, fontWeight: '800' }}>{user?.name ?? '—'}</Text>
            <Text style={{ color: COLORS.muted, fontSize: 13, marginTop: 2 }}>{user?.email ?? '—'}</Text>
            <Text style={{ color: COLORS.faint, fontSize: 11.5, marginTop: 3 }}>Membre depuis {memberSince}</Text>
          </View>
        </Card>

        {/* Synchronisation */}
        <SectionHeader title="Synchronisation" />
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: COLORS.surfaceHi, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 18 }}>☁️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.text, fontWeight: '600', fontSize: 14 }}>Sauvegarde cloud</Text>
            <Text style={{ color: COLORS.faint, fontSize: 11.5, marginTop: 1 }}>
              {user?.remote_id ? 'Activée · données synchronisées' : 'Locale (activer Supabase pour la sync multi-appareils)'}
            </Text>
          </View>
          <View style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: user?.remote_id ? 'rgba(31,169,126,0.14)' : COLORS.surfaceHi }}>
            <Text style={{ color: user?.remote_id ? COLORS.success : COLORS.muted, fontSize: 11, fontWeight: '700' }}>
              {user?.remote_id ? 'Activée' : 'Locale'}
            </Text>
          </View>
        </Card>

        {/* Actions */}
        <SectionHeader title="Actions" />
        <Pressable onPress={confirmLogout}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: COLORS.surfaceHi, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 17 }}>🚪</Text>
            </View>
            <Text style={{ color: COLORS.text, fontWeight: '600', fontSize: 14, flex: 1 }}>Se déconnecter</Text>
            <Icon name="chevRight" size={18} color={COLORS.faint} />
          </Card>
        </Pressable>

        <Pressable onPress={confirmDelete}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: 'rgba(229,72,77,0.3)' }}>
            <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: 'rgba(229,72,77,0.12)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="trash" size={18} color={COLORS.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.danger, fontWeight: '700', fontSize: 14 }}>Supprimer mon compte</Text>
              <Text style={{ color: COLORS.faint, fontSize: 11.5, marginTop: 1 }}>Définitif — efface toutes tes données</Text>
            </View>
          </Card>
        </Pressable>
      </ScrollView>
    </View>
  );
}
