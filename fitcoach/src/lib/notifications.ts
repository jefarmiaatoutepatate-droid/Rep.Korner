/**
 * Notifications locales (expo-notifications) : bilan hebdo dimanche 20h
 * + rappels pesée lundi & jeudi matin (§2, §6, §8).
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'FitCoach',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return status === 'granted';
}

/** (Re)programme les rappels récurrents. Idempotent : purge d'abord. */
export async function scheduleRecurringReminders(): Promise<void> {
  const granted = await requestPermissions();
  if (!granted) return;
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Bilan hebdo : dimanche 20h (weekday 1=dimanche côté Expo)
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📊 Bilan de la semaine',
      body: 'Ton bilan hebdo est prêt. Ouvre FitCoach pour voir ta reco d\'ajustement.',
    },
    trigger: { weekday: 1, hour: 20, minute: 0, repeats: true },
  });

  // Pesées : lundi (2) et jeudi (5) à 7h30
  for (const weekday of [2, 5]) {
    await Notifications.scheduleNotificationAsync({
      content: { title: '⚖️ Pesée du matin', body: 'Pèse-toi à jeun et note ton poids.' },
      trigger: { weekday, hour: 7, minute: 30, repeats: true },
    });
  }
}
