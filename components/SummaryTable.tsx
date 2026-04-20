import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './ui/Card';
import Badge from './ui/Badge';
import DetailRow from './DetailRow';
import type { RangeAnalysis } from '../types';
import { formatCurrency } from '../utils/formatters';
import { colors, typography, spacing } from '../utils/constants';

interface SummaryTableProps {
  analysis: RangeAnalysis;
}

export default function SummaryTable({ analysis }: SummaryTableProps) {
  const trendIcon =
    analysis.trend === 'up' ? '↑' : analysis.trend === 'down' ? '↓' : '→';
  const trendLabel =
    analysis.trend === 'up'
      ? 'Yükseliş'
      : analysis.trend === 'down'
        ? 'Düşüş'
        : 'Stabil';

  return (
    <View>
      {/* Büyük Rakamlar */}
      <View style={styles.bigNumbers}>
        <View style={styles.bigItem}>
          <Text style={styles.bigLabel}>Toplam Gelir</Text>
          <Text style={[styles.bigValue, { color: colors.income }]}>
            {formatCurrency(analysis.totalIncome)}
          </Text>
        </View>
        <View style={styles.bigItem}>
          <Text style={styles.bigLabel}>Toplam Gider</Text>
          <Text style={[styles.bigValue, { color: colors.expense }]}>
            {formatCurrency(analysis.totalExpense)}
          </Text>
        </View>
        <View style={styles.bigItem}>
          <Text style={styles.bigLabel}>Net Kazanç</Text>
          <Text
            style={[
              styles.bigValue,
              {
                color: analysis.isProfit ? colors.income : colors.expense,
              },
            ]}
          >
            {formatCurrency(analysis.netProfit)}
          </Text>
        </View>
      </View>

      {/* Durum Badge + Trend */}
      <View style={styles.badgeRow}>
        <Badge
          text={analysis.isProfit ? 'KÂRDA' : 'ZARARDA'}
          variant={analysis.isProfit ? 'income' : 'expense'}
        />
        <Badge text={`${trendIcon} ${trendLabel}`} variant="info" />
        <Badge
          text={`Kar Marjı: %${analysis.profitMargin.toFixed(1)}`}
          variant="neutral"
        />
      </View>

      {/* Detay Kartı */}
      <Card style={styles.detailCard}>
        <DetailRow label="Toplam Gün" value={`${analysis.totalDays} gün`} />
        <DetailRow label="Kayıtlı Gün" value={`${analysis.workingDays} gün`} />
        <DetailRow
          label="Günlük Ort. Gelir"
          value={formatCurrency(analysis.dailyAverageIncome)}
        />
        <DetailRow
          label="Günlük Ort. Gider"
          value={formatCurrency(analysis.dailyAverageExpense)}
        />
        <DetailRow
          label="Günlük Ort. Kazanç"
          value={formatCurrency(analysis.dailyAverageProfit)}
          isLast
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  bigNumbers: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  bigItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  bigLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  bigValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.base,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  detailCard: {
    marginBottom: spacing.lg,
  },
});
