import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../utils/constants';

interface CategoryRowProps {
  name: string;
  onDelete: () => void;
}

export default function CategoryRow({ name, onDelete }: CategoryRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.name}>{name}</Text>
      <TouchableOpacity onPress={onDelete} hitSlop={8}>
        <Ionicons name="close-circle" size={20} color={colors.expense} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },
});
