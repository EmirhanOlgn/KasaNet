import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import StatCard from '../../../components/StatCard';
import MonthlyChart from '../../../components/MonthlyChart';
import DetailRow from '../../../components/DetailRow';
import Card from '../../../components/ui/Card';
import { useShopStore } from '../../../store/useShopStore';
import { calculateMonthly } from '../../../services/calculator';
import { formatCurrency, formatDateShort } from '../../../utils/formatters';
import { colors, typography, spacing } from '../../../utils/constants';

export default function MonthlyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeShop, loading, openShop } = useShopStore();

  const [currentMonth, setCurrentMonth] = useState(() =>
    format(new Date(), 'yyyy-MM'),
  );

  useEffect(() => {
    if (id && !activeShop) openShop(id);
  }, [id, activeShop, openShop]);

  const stats = useMemo(() => {
    if (!activeShop) return null;
    return calculateMonthly(activeShop.entries, currentMonth);
  }, [activeShop, currentMonth]);

  const monthLabel = useMemo(
    () =>
      format(parseISO(`${currentMonth}-01`), 'MMMM yyyy', { locale: tr }),
    [currentMonth],
  );

  const handlePrev = useCallback(() => {
    setCurrentMonth((m) =>
      format(subMonths(parseISO(`${m}-01`), 1), 'yyyy-MM'),
    );
  }, []);

  const handleNext = useCallback(() => {
    setCurrentMonth((m) =>
      format(addMonths(parseISO(`${m}-01`), 1), 'yyyy-MM'),
    );
  }, []);

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
        <Text style={styles.headerTitle}>Aylık İstatistikler</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Ay Navigasyonu */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={handlePrev} hitSlop={8}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <TouchableOpacity onPress={handleNext} hitSlop={8}>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {stats && (
          <>
            {/* 4 İstatistik Kartı */}
            <View style={styles.statGrid}>
              <StatCard
                label="Toplam Gelir"
                value={formatCurrency(stats.totalIncome)}
                color={colors.income}
              />
              <StatCard
                label="Toplam Gider"
                value={formatCurrency(stats.totalExpense)}
                color={colors.expense}
              />
            </View>
            <View style={styles.statGrid}>
              <StatCard
                label="Ciro"
                value={formatCurrency(stats.revenue)}
                color={colors.profit}
              />
              <StatCard
                label="Net Kazanç"
                value={formatCurrency(stats.netProfit)}
                color={stats.netProfit >= 0 ? colors.income : colors.expense}
              />
            </View>

            {/* Grafik */}
            <MonthlyChart data={stats.dailyBreakdown} />

            {/* Detaylı İstatistikler */}
            <Card style={styles.detailCard}>
              <DetailRow
                label="Kar Marjı"
                value={`%${stats.profitMargin.toFixed(1)}`}
              />
              <DetailRow
                label="Günlük Ortalama Kazanç"
                value={formatCurrency(stats.dailyAverage)}
              />
              {stats.bestDay && (
                <DetailRow
                  label="En İyi Gün"
                  value={`${formatDateShort(stats.bestDay.date)} - ${formatCurrency(stats.bestDay.income - stats.bestDay.expense)}`}
                />
              )}
              {stats.worstDay && (
                <DetailRow
                  label="En Kötü Gün"
                  value={`${formatDateShort(stats.worstDay.date)} - ${formatCurrency(stats.worstDay.income - stats.worstDay.expense)}`}
                />
              )}
              <DetailRow
                label="Çalışılan Gün"
                value={`${stats.workingDays} gün`}
              />
              {stats.workingDays > 0 && (
                <>
                  <DetailRow
                    label="Gün Başı Ort. Gelir"
                    value={formatCurrency(
                      stats.totalIncome / stats.workingDays,
                    )}
                  />
                  <DetailRow
                    label="Gün Başı Ort. Gider"
                    value={formatCurrency(
                      stats.totalExpense / stats.workingDays,
                    )}
                    isLast
                  />
                </>
              )}
            </Card>
          </>
        )}
      </ScrollView>
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.lg,
    color: colors.surface,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  monthLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.md,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  statGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  detailCard: {
    marginBottom: spacing.lg,
  },
});
