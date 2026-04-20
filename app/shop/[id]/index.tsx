import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import CalendarGrid from '../../../components/CalendarGrid';
import DayDetailModal from '../../../components/DayDetailModal';
import StatCard from '../../../components/StatCard';
import { useShopStore } from '../../../store/useShopStore';
import { formatCurrency } from '../../../utils/formatters';
import type { DayEntry } from '../../../types';
import { colors, typography, spacing } from '../../../utils/constants';

export default function CalendarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    activeShop,
    loading,
    openShop,
    updateEntry,
    deleteEntry,
    exportShop,
  } = useShopStore();

  const [currentMonth, setCurrentMonth] = useState(() =>
    format(new Date(), 'yyyy-MM'),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (id) openShop(id);
  }, [id, openShop]);

  const monthLabel = useMemo(
    () =>
      format(parseISO(`${currentMonth}-01`), 'MMMM yyyy', { locale: tr }),
    [currentMonth],
  );

  const monthEntries = useMemo(() => {
    if (!activeShop) return [];
    return activeShop.entries.filter((e) => e.date.startsWith(currentMonth));
  }, [activeShop, currentMonth]);

  const monthTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const e of monthEntries) {
      income += e.income;
      expense += e.expense;
    }
    return { income, expense, net: income - expense };
  }, [monthEntries]);

  const selectedEntry = useMemo(() => {
    if (!selectedDate || !activeShop) return undefined;
    return activeShop.entries.find((e) => e.date === selectedDate);
  }, [selectedDate, activeShop]);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((m) =>
      format(subMonths(parseISO(`${m}-01`), 1), 'yyyy-MM'),
    );
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((m) =>
      format(addMonths(parseISO(`${m}-01`), 1), 'yyyy-MM'),
    );
  }, []);

  const handleDayPress = useCallback((date: string) => {
    setSelectedDate(date);
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(
    async (entry: DayEntry) => {
      await updateEntry(entry);
    },
    [updateEntry],
  );

  const handleDeleteEntry = useCallback(
    async (date: string) => {
      await deleteEntry(date);
    },
    [deleteEntry],
  );

  if (loading && !activeShop) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.surface} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {activeShop?.meta.name ?? 'Dükkan'}
        </Text>
        <TouchableOpacity
          onPress={() => activeShop && exportShop(activeShop.meta.id)}
          hitSlop={8}
        >
          <Ionicons name="share-outline" size={22} color={colors.surface} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Ay Navigasyonu */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={handlePrevMonth} hitSlop={8}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <TouchableOpacity onPress={handleNextMonth} hitSlop={8}>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Takvim */}
        <CalendarGrid
          yearMonth={currentMonth}
          entries={activeShop?.entries ?? []}
          onDayPress={handleDayPress}
        />

        {/* Ay Özeti */}
        <View style={styles.summary}>
          <View style={styles.statRow}>
            <StatCard
              label="Gelir"
              value={formatCurrency(monthTotals.income)}
              color={colors.income}
              small
            />
            <StatCard
              label="Gider"
              value={formatCurrency(monthTotals.expense)}
              color={colors.expense}
              small
            />
            <StatCard
              label="Net"
              value={formatCurrency(monthTotals.net)}
              color={
                monthTotals.net >= 0 ? colors.income : colors.expense
              }
              small
            />
          </View>
          <Text style={styles.entryCount}>
            {monthEntries.length} gün kayıt girildi
          </Text>
        </View>
      </ScrollView>

      {/* Gün Detay Modalı */}
      {selectedDate && (
        <DayDetailModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          date={selectedDate}
          entry={selectedEntry}
          onSave={handleSave}
          onDeleteDay={selectedEntry ? handleDeleteEntry : undefined}
          incomeCategories={activeShop?.categories.incomeCategories ?? []}
          expenseCategories={activeShop?.categories.expenseCategories ?? []}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  title: {
    flex: 1,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.lg,
    color: colors.surface,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  monthLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.md,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  summary: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  entryCount: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
