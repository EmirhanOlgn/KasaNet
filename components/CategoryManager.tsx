import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './ui/Card';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Input from './ui/Input';
import CategoryRow from './CategoryRow';
import type { CategoryConfig } from '../types';
import { colors, typography, spacing } from '../utils/constants';

interface CategoryManagerProps {
  categories: CategoryConfig;
  onUpdate: (income: string[], expense: string[]) => Promise<void>;
}

export default function CategoryManager({
  categories,
  onUpdate,
}: CategoryManagerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [catType, setCatType] = useState<'income' | 'expense'>('income');
  const [newCat, setNewCat] = useState('');

  const handleAdd = useCallback(async () => {
    if (!newCat.trim()) return;
    const income = [...categories.incomeCategories];
    const expense = [...categories.expenseCategories];

    const target = catType === 'income' ? income : expense;
    if (target.includes(newCat.trim())) {
      Alert.alert('Uyarı', 'Bu kategori zaten var');
      return;
    }
    target.push(newCat.trim());

    await onUpdate(
      catType === 'income' ? target : income,
      catType === 'expense' ? target : expense,
    );
    setNewCat('');
    setModalVisible(false);
  }, [newCat, catType, categories, onUpdate]);

  const handleRemove = useCallback(
    (type: 'income' | 'expense', category: string) => {
      Alert.alert('Kategori Sil', `"${category}" silinecek. Emin misiniz?`, [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            const income =
              type === 'income'
                ? categories.incomeCategories.filter((c) => c !== category)
                : categories.incomeCategories;
            const expense =
              type === 'expense'
                ? categories.expenseCategories.filter((c) => c !== category)
                : categories.expenseCategories;
            onUpdate(income, expense);
          },
        },
      ]);
    },
    [categories, onUpdate],
  );

  const openAdd = (type: 'income' | 'expense') => {
    setCatType(type);
    setModalVisible(true);
  };

  return (
    <View>
      <Text style={styles.title}>Gelir Kategorileri</Text>
      <Card style={styles.card}>
        {categories.incomeCategories.map((cat) => (
          <CategoryRow
            key={cat}
            name={cat}
            onDelete={() => handleRemove('income', cat)}
          />
        ))}
        <Button
          title="Kategori Ekle"
          variant="outline"
          size="sm"
          onPress={() => openAdd('income')}
          icon={<Ionicons name="add" size={16} color={colors.secondary} />}
        />
      </Card>

      <Text style={styles.title}>Gider Kategorileri</Text>
      <Card style={styles.card}>
        {categories.expenseCategories.map((cat) => (
          <CategoryRow
            key={cat}
            name={cat}
            onDelete={() => handleRemove('expense', cat)}
          />
        ))}
        <Button
          title="Kategori Ekle"
          variant="outline"
          size="sm"
          onPress={() => openAdd('expense')}
          icon={<Ionicons name="add" size={16} color={colors.secondary} />}
        />
      </Card>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={
          catType === 'income'
            ? 'Gelir Kategorisi Ekle'
            : 'Gider Kategorisi Ekle'
        }
      >
        <Input
          label="Kategori Adı"
          value={newCat}
          onChangeText={setNewCat}
          placeholder="Örn: Satış, Kira..."
        />
        <Button
          title="Ekle"
          onPress={handleAdd}
          disabled={!newCat.trim()}
          size="lg"
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.base,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
});
