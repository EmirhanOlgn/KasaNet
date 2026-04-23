import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './ui/Card';
import Button from './ui/Button';
import type { ReminderConfig } from '../types';
import {
  colors,
  typography,
  spacing,
  borderRadius,
} from '../utils/constants';
import {
  ensureNotificationPermission,
  sendTestNotification,
} from '../services/notifications';

const WEEK_DAYS: { id: number; label: string }[] = [
  { id: 1, label: 'Pzt' },
  { id: 2, label: 'Sal' },
  { id: 3, label: 'Çar' },
  { id: 4, label: 'Per' },
  { id: 5, label: 'Cum' },
  { id: 6, label: 'Cmt' },
  { id: 7, label: 'Paz' },
];

const DEFAULT_CONFIG: ReminderConfig = {
  enabled: false,
  hour: 20,
  minute: 0,
  days: [1, 2, 3, 4, 5, 6, 7],
};

interface Props {
  shopName: string;
  value?: ReminderConfig;
  onSave: (config: ReminderConfig | null) => Promise<void>;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export default function ReminderSettings({ shopName, value, onSave }: Props) {
  const [config, setConfig] = useState<ReminderConfig>(value ?? DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setConfig(value ?? DEFAULT_CONFIG);
  }, [value]);

  const toggleEnabled = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const granted = await ensureNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Bildirim İzni Gerekli',
          'Hatırlatma kurabilmek için bildirim iznini vermeniz gerekiyor. Telefon ayarlarından açabilirsiniz.',
          [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Ayarları Aç', onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
    }
    setConfig((c) => ({ ...c, enabled }));
  }, []);

  const toggleDay = useCallback((dayId: number) => {
    setConfig((c) => {
      const has = c.days.includes(dayId);
      const next = has ? c.days.filter((d) => d !== dayId) : [...c.days, dayId];
      return { ...c, days: next.sort((a, b) => a - b) };
    });
  }, []);

  const setQuickDays = useCallback((days: number[]) => {
    setConfig((c) => ({ ...c, days }));
  }, []);

  const bumpHour = (delta: number) =>
    setConfig((c) => ({ ...c, hour: (c.hour + delta + 24) % 24 }));
  const bumpMinute = (delta: number) =>
    setConfig((c) => ({ ...c, minute: (c.minute + delta + 60) % 60 }));

  const handleSave = useCallback(async () => {
    if (config.enabled && config.days.length === 0) {
      Alert.alert('Uyarı', 'En az bir gün seçmelisiniz');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...config,
        hour: clamp(Math.round(config.hour), 0, 23),
        minute: clamp(Math.round(config.minute), 0, 59),
      });
      Alert.alert(
        'Başarılı',
        config.enabled
          ? 'Hatırlatma kaydedildi'
          : 'Hatırlatma kapatıldı',
      );
    } catch (e) {
      Alert.alert(
        'Hata',
        e instanceof Error ? e.message : 'Hatırlatma kaydedilemedi',
      );
    } finally {
      setSaving(false);
    }
  }, [config, onSave]);

  const handleTest = useCallback(async () => {
    try {
      await sendTestNotification(shopName);
    } catch (e) {
      Alert.alert(
        'Hata',
        e instanceof Error ? e.message : 'Test bildirimi gönderilemedi',
      );
    }
  }, [shopName]);

  return (
    <View>
      <Text style={styles.title}>Günlük Hatırlatma</Text>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color={colors.textPrimary}
            />
            <Text style={styles.rowLabel}>Bildirimi Aç</Text>
          </View>
          <Switch
            value={config.enabled}
            onValueChange={toggleEnabled}
            trackColor={{ false: colors.border, true: colors.secondary }}
            thumbColor={colors.surface}
          />
        </View>

        {config.enabled && (
          <>
            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>Saat</Text>
            <View style={styles.timeRow}>
              <Stepper
                value={config.hour}
                onDecrement={() => bumpHour(-1)}
                onIncrement={() => bumpHour(1)}
              />
              <Text style={styles.timeSeparator}>:</Text>
              <Stepper
                value={config.minute}
                onDecrement={() => bumpMinute(-5)}
                onIncrement={() => bumpMinute(5)}
              />
            </View>

            <Text style={styles.sectionLabel}>Günler</Text>
            <View style={styles.daysRow}>
              {WEEK_DAYS.map((d) => {
                const active = config.days.includes(d.id);
                return (
                  <TouchableOpacity
                    key={d.id}
                    onPress={() => toggleDay(d.id)}
                    style={[styles.dayChip, active && styles.dayChipActive]}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        active && styles.dayChipTextActive,
                      ]}
                    >
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.quickRow}>
              <QuickPill
                label="Hepsi"
                onPress={() => setQuickDays([1, 2, 3, 4, 5, 6, 7])}
              />
              <QuickPill
                label="Hafta içi"
                onPress={() => setQuickDays([1, 2, 3, 4, 5])}
              />
              <QuickPill
                label="Hafta sonu"
                onPress={() => setQuickDays([6, 7])}
              />
            </View>
          </>
        )}

        <View style={styles.buttonsRow}>
          <Button
            title="Kaydet"
            onPress={handleSave}
            loading={saving}
            size="md"
            style={{ flex: 1 }}
          />
          {config.enabled && (
            <Button
              title="Test"
              variant="outline"
              onPress={handleTest}
              size="md"
              style={{ flex: 1 }}
              icon={
                <Ionicons
                  name="paper-plane-outline"
                  size={16}
                  color={colors.secondary}
                />
              }
            />
          )}
        </View>
      </Card>
    </View>
  );
}

function Stepper({
  value,
  onDecrement,
  onIncrement,
}: {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <View style={styles.stepper}>
      <TouchableOpacity
        onPress={onDecrement}
        style={styles.stepperBtn}
        hitSlop={8}
      >
        <Ionicons name="remove" size={18} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.stepperValue}>
        {String(value).padStart(2, '0')}
      </Text>
      <TouchableOpacity
        onPress={onIncrement}
        style={styles.stepperBtn}
        hitSlop={8}
      >
        <Ionicons name="add" size={18} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

function QuickPill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.quickPill}>
      <Text style={styles.quickPillText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.base,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowLabel: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  sectionLabel: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  timeSeparator: {
    fontFamily: typography.fontFamily.extraBold,
    fontSize: typography.size.xl,
    color: colors.textPrimary,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    minWidth: 120,
    justifyContent: 'space-between',
  },
  stepperBtn: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.lg,
    color: colors.textPrimary,
    minWidth: 36,
    textAlign: 'center',
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  dayChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 48,
    alignItems: 'center',
  },
  dayChipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  dayChipText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  dayChipTextActive: {
    color: colors.surface,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  quickPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
  },
  quickPillText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
