import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Card from './ui/Card';
import Badge from './ui/Badge';
import type { ShopMeta } from '../types';
import { colors, typography, spacing } from '../utils/constants';

interface ShopCardProps {
  shop: ShopMeta;
  onPress: () => void;
  onExport: () => void;
  onDelete: () => void;
}

export default function ShopCard({
  shop,
  onPress,
  onExport,
  onDelete,
}: ShopCardProps) {
  return (
    <Animated.View entering={FadeInDown.duration(300).springify()}>
    <Card style={styles.card}>
      <View style={styles.content}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          style={styles.mainArea}
        >
          <View style={styles.iconWrap}>
            <Ionicons name="storefront" size={28} color={colors.secondary} />
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {shop.name}
            </Text>
            {shop.owner ? (
              <Text style={styles.owner} numberOfLines={1}>
                {shop.owner}
              </Text>
            ) : null}
            {shop.description ? (
              <Badge text={shop.description} variant="neutral" />
            ) : null}
          </View>
        </TouchableOpacity>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onExport}
            hitSlop={8}
            style={styles.actionBtn}
          >
            <Ionicons
              name="share-outline"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            hitSlop={8}
            style={styles.actionBtn}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={colors.expense}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.md,
    color: colors.textPrimary,
  },
  owner: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginLeft: spacing.sm,
  },
  actionBtn: {
    padding: spacing.xs,
  },
});
