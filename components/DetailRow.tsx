import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../utils/constants';

interface DetailRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

export default function DetailRow({
  label,
  value,
  isLast = false,
}: DetailRowProps) {
  return (
    <View style={[styles.row, !isLast && styles.border]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  value: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
    color: colors.textPrimary,
  },
});
