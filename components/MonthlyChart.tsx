import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import type { DailyPoint } from '../types';
import { colors, typography, spacing } from '../utils/constants';

type LineKey = 'income' | 'expense' | 'net';

interface MonthlyChartProps {
  data: DailyPoint[];
}

const LINE_CONFIG: Record<LineKey, { label: string; color: string }> = {
  income: { label: 'Gelir', color: colors.chartGreen },
  expense: { label: 'Gider', color: colors.chartRed },
  net: { label: 'Net', color: colors.chartBlue },
};

export default function MonthlyChart({ data }: MonthlyChartProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [activeLines, setActiveLines] = useState<Set<LineKey>>(
    new Set(['income', 'expense', 'net']),
  );
  const [period, setPeriod] = useState<'week' | 'month'>('month');

  const toggleLine = (key: LineKey) => {
    setActiveLines((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const chartData = useMemo(() => {
    if (period === 'week') {
      // Son 7 veri noktası
      const last7 = data.filter(
        (d) => d.income > 0 || d.expense > 0,
      ).slice(-7);
      if (last7.length === 0) return null;
      return {
        points: last7,
        labels: last7.map((d) => String(d.day)),
      };
    }
    // month - tüm günler
    return {
      points: data,
      labels: data.map((d) => (d.day % 5 === 0 ? String(d.day) : '')),
    };
  }, [data, period]);

  const hasData = data.some((d) => d.income > 0 || d.expense > 0);
  if (!hasData) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Grafik için veri yok</Text>
      </View>
    );
  }

  const datasets = (['income', 'expense', 'net'] as LineKey[])
    .filter((k) => activeLines.has(k))
    .map((k) => ({
      data: (chartData?.points ?? data).map((d) => d[k] || 0),
      color: () => LINE_CONFIG[k].color,
      strokeWidth: 2,
    }));

  // Minimum 1 dataset lazım
  if (datasets.length === 0 || !chartData) return null;

  return (
    <View style={styles.container}>
      {/* Periyot Seçimi */}
      <View style={styles.periodRow}>
        {(['week', 'month'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodBtn, period === p && styles.periodActive]}
            onPress={() => setPeriod(p)}
          >
            <Text
              style={[
                styles.periodText,
                period === p && styles.periodTextActive,
              ]}
            >
              {p === 'week' ? 'Haftalık' : 'Aylık'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Grafik */}
      <LineChart
        data={{
          labels: chartData.labels,
          datasets,
          legend: datasets.length > 1
            ? (['income', 'expense', 'net'] as LineKey[])
                .filter((k) => activeLines.has(k))
                .map((k) => LINE_CONFIG[k].label)
            : undefined,
        }}
        width={screenWidth - spacing.xl * 2}
        height={200}
        yAxisSuffix=""
        yAxisLabel="₺"
        chartConfig={{
          backgroundColor: colors.surface,
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: () => colors.textSecondary,
          propsForDots: { r: '2' },
          propsForLabels: { fontSize: 10 },
        }}
        bezier
        style={styles.chart}
        withInnerLines={false}
        fromZero
      />

      {/* Çizgi Toggle */}
      <View style={styles.toggleRow}>
        {(['income', 'expense', 'net'] as LineKey[]).map((k) => {
          const active = activeLines.has(k);
          const cfg = LINE_CONFIG[k];
          return (
            <TouchableOpacity
              key={k}
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: active ? cfg.color : '#F3F4F6',
                  borderColor: cfg.color,
                },
              ]}
              onPress={() => toggleLine(k)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.toggleDot,
                  { backgroundColor: active ? '#fff' : cfg.color },
                ]}
              />
              <Text
                style={[
                  styles.toggleText,
                  { color: active ? '#fff' : colors.textSecondary },
                ]}
              >
                {cfg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 3,
    marginBottom: spacing.md,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 6,
  },
  periodActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  periodTextActive: {
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  chart: {
    borderRadius: 12,
    marginLeft: -spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 6,
  },
  toggleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  toggleText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.size.xs,
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
});
