import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import Badge from './ui/Badge';
import type { DayEntry, TransactionDetail } from '../types';
import { formatDateFull, formatCurrency } from '../utils/formatters';
import { colors, typography, spacing, borderRadius } from '../utils/constants';

interface DayDetailModalProps {
  visible: boolean;
  onClose: () => void;
  date: string;
  entry?: DayEntry;
  onSave: (entry: DayEntry) => void;
  onDeleteDay?: (date: string) => void;
  incomeCategories: string[];
  expenseCategories: string[];
}

type EditingTransaction = {
  id?: string;
  type: 'income' | 'expense';
  amount: string;
  description: string;
  category: string;
};

function parseTurkishNumber(s: string): number {
  const cleaned = s.replace(/\./g, '').replace(',', '.');
  return Math.max(0, parseFloat(cleaned) || 0);
}

export default function DayDetailModal({
  visible,
  onClose,
  date,
  entry,
  onSave,
  onDeleteDay,
  incomeCategories,
  expenseCategories,
}: DayDetailModalProps) {
  const [details, setDetails] = useState<TransactionDetail[]>([]);
  const [editing, setEditing] = useState<EditingTransaction | null>(null);

  // Sync details when modal opens
  React.useEffect(() => {
    if (visible) {
      if (entry?.details && entry.details.length > 0) {
        setDetails([...entry.details]);
      } else if (entry && (entry.income > 0 || entry.expense > 0)) {
        // Migrate old format: create details from income/expense
        const migrated: TransactionDetail[] = [];
        if (entry.income > 0) {
          migrated.push({
            id: Crypto.randomUUID(),
            type: 'income',
            amount: entry.income,
            description: entry.note ?? '',
          });
        }
        if (entry.expense > 0) {
          migrated.push({
            id: Crypto.randomUUID(),
            type: 'expense',
            amount: entry.expense,
            description: '',
          });
        }
        setDetails(migrated);
      } else {
        setDetails([]);
      }
      setEditing(null);
    }
  }, [visible, entry]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const d of details) {
      if (d.type === 'income') income += d.amount;
      else expense += d.amount;
    }
    return { income, expense, net: income - expense };
  }, [details]);

  const saveAll = () => {
    if (details.length === 0) {
      // No entries - delete the day
      if (onDeleteDay && entry) {
        onDeleteDay(date);
      }
      onClose();
      return;
    }
    const newEntry: DayEntry = {
      date,
      income: totals.income,
      expense: totals.expense,
      details: [...details],
    };
    onSave(newEntry);
    onClose();
  };

  const addTransaction = (type: 'income' | 'expense') => {
    setEditing({ type, amount: '', description: '', category: '' });
  };

  const editTransaction = (tx: TransactionDetail) => {
    setEditing({
      id: tx.id,
      type: tx.type,
      amount: String(tx.amount),
      description: tx.description ?? '',
      category: tx.category ?? '',
    });
  };

  const deleteTransaction = (id: string) => {
    setDetails((prev) => prev.filter((d) => d.id !== id));
  };

  const saveEditing = () => {
    if (!editing) return;
    const amount = parseTurkishNumber(editing.amount);
    if (amount <= 0) {
      Alert.alert('Uyarı', 'Tutar 0\'dan büyük olmalıdır.');
      return;
    }

    const tx: TransactionDetail = {
      id: editing.id ?? Crypto.randomUUID(),
      type: editing.type,
      amount,
      category: editing.category || undefined,
      description: editing.description.trim() || undefined,
    };

    if (editing.id) {
      // Update existing
      setDetails((prev) => prev.map((d) => (d.id === editing.id ? tx : d)));
    } else {
      // Add new
      setDetails((prev) => [...prev, tx]);
    }
    setEditing(null);
  };

  const categories =
    editing?.type === 'income' ? incomeCategories : expenseCategories;

  // Sub-modal: editing a single transaction
  if (editing) {
    return (
      <Modal
        visible={visible}
        onClose={() => setEditing(null)}
        title={
          editing.id
            ? editing.type === 'income'
              ? 'Geliri Düzenle'
              : 'Gideri Düzenle'
            : editing.type === 'income'
              ? 'Gelir Ekle'
              : 'Gider Ekle'
        }
      >
        <Input
          label="Tutar"
          value={editing.amount}
          onChangeText={(t) => setEditing({ ...editing, amount: t })}
          placeholder="0"
          keyboardType="numeric"
          prefix="₺"
        />

        <Input
          label="Açıklama (opsiyonel)"
          value={editing.description}
          onChangeText={(t) => setEditing({ ...editing, description: t })}
          placeholder="Açıklama..."
        />

        {categories.length > 0 && (
          <View style={styles.categorySection}>
            <Text style={styles.categoryLabel}>Kategori</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    editing.category === cat && {
                      backgroundColor:
                        editing.type === 'income'
                          ? colors.income
                          : colors.expense,
                    },
                  ]}
                  onPress={() =>
                    setEditing({
                      ...editing,
                      category: editing.category === cat ? '' : cat,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      editing.category === cat && { color: '#fff' },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Button
          title="Kaydet"
          onPress={saveEditing}
          size="lg"
          style={{ marginTop: spacing.md }}
        />
        <Button
          title="İptal"
          variant="secondary"
          onPress={() => setEditing(null)}
          size="md"
          style={{ marginTop: spacing.sm }}
        />
      </Modal>
    );
  }

  // Main modal: day detail list
  return (
    <Modal visible={visible} onClose={onClose} title={formatDateFull(date)}>
      {/* Totals */}
      {details.length > 0 && (
        <View style={styles.totalsRow}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Gelir</Text>
            <Text style={[styles.totalValue, { color: colors.income }]}>
              {formatCurrency(totals.income)}
            </Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Gider</Text>
            <Text style={[styles.totalValue, { color: colors.expense }]}>
              {formatCurrency(totals.expense)}
            </Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Net</Text>
            <Text
              style={[
                styles.totalValue,
                { color: totals.net >= 0 ? colors.income : colors.expense },
              ]}
            >
              {formatCurrency(totals.net)}
            </Text>
          </View>
        </View>
      )}

      {/* Transaction list */}
      {details.length > 0 ? (
        <View style={styles.list}>
          {details.map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View
                style={[
                  styles.txIcon,
                  {
                    backgroundColor:
                      tx.type === 'income' ? '#E8F5E9' : '#FFEBEE',
                  },
                ]}
              >
                <Ionicons
                  name={
                    tx.type === 'income'
                      ? 'arrow-down-circle'
                      : 'arrow-up-circle'
                  }
                  size={22}
                  color={
                    tx.type === 'income' ? colors.income : colors.expense
                  }
                />
              </View>
              <TouchableOpacity
                style={styles.txInfo}
                onPress={() => editTransaction(tx)}
                activeOpacity={0.6}
              >
                <View style={styles.txTopRow}>
                  <Text style={styles.txAmount}>
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </Text>
                  {tx.category ? (
                    <Badge
                      text={tx.category}
                      variant={tx.type === 'income' ? 'income' : 'expense'}
                    />
                  ) : null}
                </View>
                {tx.description ? (
                  <Text style={styles.txDesc} numberOfLines={1}>
                    {tx.description}
                  </Text>
                ) : null}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteTransaction(tx.id)}
                hitSlop={8}
                style={styles.txDelete}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons
            name="receipt-outline"
            size={40}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>
            Bu güne ait kayıt yok
          </Text>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: '#E8F5E9' }]}
          onPress={() => addTransaction('income')}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={20} color={colors.income} />
          <Text style={[styles.addBtnText, { color: colors.income }]}>
            Gelir Ekle
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: '#FFEBEE' }]}
          onPress={() => addTransaction('expense')}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={20} color={colors.expense} />
          <Text style={[styles.addBtnText, { color: colors.expense }]}>
            Gider Ekle
          </Text>
        </TouchableOpacity>
      </View>

      {/* Save / Delete */}
      {details.length > 0 && (
        <Button
          title="Kaydet"
          onPress={saveAll}
          size="lg"
          style={{ marginTop: spacing.md }}
        />
      )}

      {entry && onDeleteDay && (
        <Button
          title="Tüm Günü Sil"
          variant="danger"
          onPress={() => {
            Alert.alert(
              'Günü Sil',
              'Bu günün tüm kayıtları silinecek. Emin misiniz?',
              [
                { text: 'İptal', style: 'cancel' },
                {
                  text: 'Sil',
                  style: 'destructive',
                  onPress: () => {
                    onDeleteDay(date);
                    onClose();
                  },
                },
              ],
            );
          }}
          size="md"
          style={{ marginTop: spacing.sm }}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  totalsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  totalBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  totalValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
  },
  list: {
    marginBottom: spacing.md,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  txInfo: {
    flex: 1,
  },
  txTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  txAmount: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },
  txDesc: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  txDelete: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  addBtnText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.size.sm,
  },
  categorySection: {
    marginBottom: spacing.md,
  },
  categoryLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: '#F3F4F6',
  },
  categoryChipText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },
});
