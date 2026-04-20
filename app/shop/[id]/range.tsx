import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { format, subDays } from 'date-fns';
import { BarChart } from 'react-native-chart-kit';
import { tr } from 'date-fns/locale';
import RangePicker from '../../../components/RangePicker';
import SummaryTable from '../../../components/SummaryTable';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/EmptyState';
import { useShopStore } from '../../../store/useShopStore';
import { calculateRange } from '../../../services/calculator';
import { colors, typography, spacing } from '../../../utils/constants';
import type { RangeAnalysis } from '../../../types';

export default function RangeScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeShop, loading, openShop } = useShopStore();

  const [startDate, setStartDate] = useState(() =>
    format(subDays(new Date(), 29), 'yyyy-MM-dd'),
  );
  const [endDate, setEndDate] = useState(() =>
    format(new Date(), 'yyyy-MM-dd'),
  );
  const [analysis, setAnalysis] = useState<RangeAnalysis | null>(null);

  useEffect(() => {
    if (id && !activeShop) openShop(id);
  }, [id, activeShop, openShop]);

  const handleAnalyze = useCallback(() => {
    if (!activeShop) return;
    const result = calculateRange(activeShop.entries, startDate, endDate);
    setAnalysis(result);
  }, [activeShop, startDate, endDate]);

  // Otomatik analiz (tarih değişince)
  useEffect(() => {
    if (activeShop) handleAnalyze();
  }, [activeShop, handleAnalyze]);

  const barChartData = useMemo(() => {
    if (!analysis || analysis.monthlyBreakdown.length <= 1) return null;

    const months = analysis.monthlyBreakdown.filter(
      (m) => m.workingDays > 0,
    );
    if (months.length <= 1) return null;

    return {
      labels: months.map((m) => {
        const [, month] = m.month.split('-');
        const monthNames = [
          'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
          'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara',
        ];
        return monthNames[parseInt(month, 10) - 1];
      }),
      datasets: [
        {
          data: months.map((m) => m.totalIncome),
          color: () => colors.chartGreen,
        },
        {
          data: months.map((m) => m.totalExpense),
          color: () => colors.chartRed,
        },
      ],
      legend: ['Gelir', 'Gider'],
    };
  }, [analysis]);

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
        <Text style={styles.headerTitle}>Tarih Aralığı Analiz</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <RangePicker
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
        />

        <Button
          title="Analiz Et"
          onPress={handleAnalyze}
          size="lg"
          style={{ marginBottom: spacing.lg }}
        />

        {analysis && analysis.workingDays > 0 ? (
          <>
            <SummaryTable analysis={analysis} />

            {barChartData && (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Aylık Karşılaştırma</Text>
                <BarChart
                  data={barChartData}
                  width={screenWidth - spacing.xl * 2}
                  height={220}
                  yAxisSuffix=""
                  yAxisLabel="₺"
                  chartConfig={{
                    backgroundColor: colors.surface,
                    backgroundGradientFrom: colors.surface,
                    backgroundGradientTo: colors.surface,
                    decimalPlaces: 0,
                    color: (opacity = 1) =>
                      `rgba(0, 0, 0, ${opacity})`,
                    labelColor: () => colors.textSecondary,
                    barPercentage: 0.6,
                    propsForLabels: {
                      fontSize: 10,
                    },
                  }}
                  style={styles.chart}
                  fromZero
                />
              </View>
            )}
          </>
        ) : analysis ? (
          <EmptyState
            icon="analytics-outline"
            title="Veri bulunamadı"
            message="Seçilen tarih aralığında kayıt yok"
          />
        ) : null}
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
  chartContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  chartTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  chart: {
    borderRadius: 12,
    marginLeft: -spacing.md,
  },
});
