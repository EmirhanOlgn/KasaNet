import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  getDaysInMonth,
  getDay,
  parseISO,
} from 'date-fns';
import { tr } from 'date-fns/locale';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { colors, typography, spacing, borderRadius } from '../utils/constants';

const WEEK_DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  selectedDate: string;
  title: string;
}

export default function DatePickerModal({
  visible,
  onClose,
  onSelect,
  selectedDate,
  title,
}: DatePickerModalProps) {
  const [viewMonth, setViewMonth] = useState(() =>
    selectedDate ? selectedDate.slice(0, 7) : format(new Date(), 'yyyy-MM'),
  );

  // Sync viewMonth when modal opens with a different selectedDate
  useEffect(() => {
    if (visible && selectedDate) {
      setViewMonth(selectedDate.slice(0, 7));
    }
  }, [visible, selectedDate]);

  const monthLabel = useMemo(
    () =>
      format(parseISO(`${viewMonth}-01`), 'MMMM yyyy', { locale: tr }),
    [viewMonth],
  );

  const cells = useMemo(() => {
    const first = startOfMonth(parseISO(`${viewMonth}-01`));
    const days = getDaysInMonth(first);
    let startIdx = getDay(first) - 1;
    if (startIdx < 0) startIdx = 6;

    const arr: (number | null)[] = [];
    for (let i = 0; i < startIdx; i++) arr.push(null);
    for (let d = 1; d <= days; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [viewMonth]);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  const handleSelect = (day: number) => {
    const dateStr = `${viewMonth}-${String(day).padStart(2, '0')}`;
    onSelect(dateStr);
    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose} title={title}>
      {/* Ay navigasyonu */}
      <View style={styles.nav}>
        <TouchableOpacity
          onPress={() =>
            setViewMonth((m) =>
              format(subMonths(parseISO(`${m}-01`), 1), 'yyyy-MM'),
            )
          }
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity
          onPress={() =>
            setViewMonth((m) =>
              format(addMonths(parseISO(`${m}-01`), 1), 'yyyy-MM'),
            )
          }
          hitSlop={8}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Hafta günleri */}
      <View style={styles.weekRow}>
        {WEEK_DAYS.map((d) => (
          <Text key={d} style={styles.weekDay}>
            {d}
          </Text>
        ))}
      </View>

      {/* Günler */}
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((day, ci) => {
            if (day === null) {
              return <View key={ci} style={styles.cell} />;
            }
            const dateStr = `${viewMonth}-${String(day).padStart(2, '0')}`;
            const isSelected = dateStr === selectedDate;
            return (
              <TouchableOpacity
                key={ci}
                style={[styles.cell, isSelected && styles.selectedCell]}
                onPress={() => handleSelect(day)}
              >
                <Text
                  style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </Modal>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  monthLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.md,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    borderRadius: borderRadius.sm,
  },
  selectedCell: {
    backgroundColor: colors.secondary,
  },
  dayText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.textPrimary,
  },
  selectedDayText: {
    color: colors.surface,
    fontFamily: typography.fontFamily.bold,
  },
});
