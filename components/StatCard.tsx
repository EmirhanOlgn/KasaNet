import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Card from './ui/Card';
import { colors, typography, spacing } from '../utils/constants';

interface StatCardProps {
  label: string;
  value: string;
  color?: string;
  small?: boolean;
}

export default function StatCard({
  label,
  value,
  color = colors.textPrimary,
  small = false,
}: StatCardProps) {
  return (
    <Animated.View
      entering={FadeInUp.duration(400).springify()}
      style={styles.wrapper}
    >
      <Card style={styles.card} padding={spacing.md}>
        <Text style={styles.label}>{label}</Text>
        <Text
          style={[small ? styles.valueSmall : styles.value, { color }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Text>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  card: {
    flex: 1,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.lg,
  },
  valueSmall: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.base,
  },
});
