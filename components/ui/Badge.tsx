import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../utils/constants';

interface BadgeProps {
  text: string;
  variant?: 'income' | 'expense' | 'info' | 'neutral';
  style?: ViewStyle;
}

const variantColors = {
  income: { bg: colors.incomeLight, text: colors.income },
  expense: { bg: colors.expenseLight, text: colors.expense },
  info: { bg: '#E3F2FD', text: colors.profit },
  neutral: { bg: '#F3F4F6', text: colors.textSecondary },
};

export default function Badge({ text, variant = 'neutral', style }: BadgeProps) {
  const c = variantColors[variant];

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, style]}>
      <Text style={[styles.text, { color: c.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xs,
  },
});
