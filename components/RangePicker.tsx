import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, subDays, subMonths, startOfYear } from 'date-fns';
import DatePickerModal from './DatePickerModal';
import { formatDateShort } from '../utils/formatters';
import { colors, typography, spacing, borderRadius } from '../utils/constants';

interface RangePickerProps {
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
}

const today = () => format(new Date(), 'yyyy-MM-dd');

const quickRanges = [
  { label: 'Son 7 Gün', getStart: () => format(subDays(new Date(), 6), 'yyyy-MM-dd') },
  { label: 'Son 30 Gün', getStart: () => format(subDays(new Date(), 29), 'yyyy-MM-dd') },
  { label: 'Son 3 Ay', getStart: () => format(subMonths(new Date(), 3), 'yyyy-MM-dd') },
  { label: 'Son 6 Ay', getStart: () => format(subMonths(new Date(), 6), 'yyyy-MM-dd') },
  { label: 'Bu Yıl', getStart: () => format(startOfYear(new Date()), 'yyyy-MM-dd') },
];

export default function RangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}: RangePickerProps) {
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(
    null,
  );

  return (
    <View style={styles.container}>
      <View style={styles.dateRow}>
        <TouchableOpacity
          style={styles.dateBox}
          onPress={() => setPickerTarget('start')}
          activeOpacity={0.7}
        >
          <Text style={styles.dateLabel}>Başlangıç</Text>
          <View style={styles.dateValueRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={colors.secondary}
            />
            <Text style={styles.dateValue}>{formatDateShort(startDate)}</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.arrow}>→</Text>

        <TouchableOpacity
          style={styles.dateBox}
          onPress={() => setPickerTarget('end')}
          activeOpacity={0.7}
        >
          <Text style={styles.dateLabel}>Bitiş</Text>
          <View style={styles.dateValueRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={colors.secondary}
            />
            <Text style={styles.dateValue}>{formatDateShort(endDate)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickScroll}
      >
        {quickRanges.map((r) => (
          <TouchableOpacity
            key={r.label}
            style={styles.quickBtn}
            onPress={() => {
              onStartChange(r.getStart());
              onEndChange(today());
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.quickText}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {pickerTarget && (
        <DatePickerModal
          visible
          onClose={() => setPickerTarget(null)}
          title={
            pickerTarget === 'start'
              ? 'Başlangıç Tarihi Seç'
              : 'Bitiş Tarihi Seç'
          }
          selectedDate={pickerTarget === 'start' ? startDate : endDate}
          onSelect={(date) => {
            if (pickerTarget === 'start') {
              // Ensure start <= end
              if (date > endDate) onEndChange(date);
              onStartChange(date);
            } else {
              // Ensure end >= start
              if (date < startDate) onStartChange(date);
              onEndChange(date);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dateBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  dateLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dateValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
    color: colors.textPrimary,
  },
  arrow: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.lg,
    color: colors.textSecondary,
  },
  quickScroll: {
    flexGrow: 0,
  },
  quickBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  quickText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.size.sm,
    color: colors.surface,
  },
});
