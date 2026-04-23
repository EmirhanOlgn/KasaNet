import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { ReminderConfig, ShopMeta } from '../types';

const CHANNEL_ID = 'kasanet-reminders';

/** Uygulama açılışında çağrılır: handler ve Android kanalı */
export async function initNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Hatırlatmalar',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
    });
  }
}

/** Bildirim iznini iste, mevcutsa true döner */
export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const res = await Notifications.requestPermissionsAsync();
  return res.granted;
}

/**
 * UI'daki gün numarasını (1=Pzt ... 7=Paz) expo-notifications weekday
 * formatına çevirir (1=Paz, 2=Pzt ... 7=Cmt).
 */
function toExpoWeekday(uiDay: number): number {
  return (uiDay % 7) + 1;
}

function identifier(shopId: string, uiDay: number): string {
  return `kasanet_${shopId}_${uiDay}`;
}

/** Belirli bir dükkana ait tüm hatırlatmaları iptal et */
export async function cancelShopReminders(shopId: string): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => n.identifier.startsWith(`kasanet_${shopId}_`))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/** Dükkan için bildirimleri (yeniden) zamanla. Önceki kayıtlar silinir. */
export async function scheduleShopReminders(
  shopId: string,
  shopName: string,
  config: ReminderConfig,
): Promise<void> {
  await cancelShopReminders(shopId);

  if (!config.enabled || config.days.length === 0) return;

  const granted = await ensureNotificationPermission();
  if (!granted) throw new Error('Bildirim izni verilmedi');

  await Promise.all(
    config.days.map((day) =>
      Notifications.scheduleNotificationAsync({
        identifier: identifier(shopId, day),
        content: {
          title: shopName,
          body: 'Bugünün gelir/gider kaydını eklemeyi unutmayın',
          data: { shopId },
          ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: toExpoWeekday(day),
          hour: config.hour,
          minute: config.minute,
        },
      }),
    ),
  );
}

/**
 * Uygulama açılışında tüm dükkanların zamanlanmış bildirimlerini
 * mevcut meta verilerine göre senkronize eder.
 */
export async function syncAllReminders(shops: ShopMeta[]): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  const kasanetIds = new Set(
    all
      .map((n) => n.identifier)
      .filter((id) => id.startsWith('kasanet_')),
  );

  for (const shop of shops) {
    const r = shop.reminder;
    if (r?.enabled && r.days.length > 0) {
      await scheduleShopReminders(shop.id, shop.name, r);
    } else {
      // Meta'da kapalı ama eski kayıtlar varsa temizle
      const hasStale = Array.from(kasanetIds).some((id) =>
        id.startsWith(`kasanet_${shop.id}_`),
      );
      if (hasStale) await cancelShopReminders(shop.id);
    }
  }
}

/** Ayarların doğru kurulduğunu test etmek için anında bildirim gönder */
export async function sendTestNotification(shopName: string): Promise<void> {
  const granted = await ensureNotificationPermission();
  if (!granted) throw new Error('Bildirim izni verilmedi');
  await Notifications.scheduleNotificationAsync({
    content: {
      title: shopName,
      body: 'Test bildirimi — hatırlatmalar bu şekilde görünecek',
      ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
    },
    trigger: null,
  });
}
