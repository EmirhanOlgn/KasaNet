import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import CategoryManager from '../../../components/CategoryManager';
import ReminderSettings from '../../../components/ReminderSettings';
import { useShopStore } from '../../../store/useShopStore';
import { getShopFileInfo } from '../../../services/fileManager';
import { colors, typography, spacing } from '../../../utils/constants';

export default function SettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    activeShop, loading, openShop,
    updateMeta, updateCategories, updateReminder, exportShop, deleteShop,
  } = useShopStore();

  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [desc, setDesc] = useState('');
  const [fileInfo, setFileInfo] = useState<{
    size: number; entryCount: number;
  } | null>(null);

  useEffect(() => {
    if (id && !activeShop) openShop(id);
  }, [id, activeShop, openShop]);

  // Only populate form fields on initial load, not on every activeShop update
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (activeShop && !initialized) {
      setName(activeShop.meta.name);
      setOwner(activeShop.meta.owner ?? '');
      setDesc(activeShop.meta.description ?? '');
      setInitialized(true);
    }
    if (activeShop) {
      getShopFileInfo(activeShop.meta.id).then(setFileInfo).catch(() => {});
    }
  }, [activeShop, initialized]);

  const handleSaveMeta = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Dükkan adı boş olamaz');
      return;
    }
    await updateMeta({
      name: name.trim(),
      owner: owner.trim() || undefined,
      description: desc.trim() || undefined,
    });
    Alert.alert('Başarılı', 'Bilgiler güncellendi');
  }, [name, owner, desc, updateMeta]);

  const handleDeleteAll = useCallback(() => {
    if (!activeShop) return;
    Alert.alert(
      'Tüm Verileri Sil',
      `"${activeShop.meta.name}" kalıcı olarak silinecek. Bu işlem geri alınamaz!`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await deleteShop(activeShop.meta.id);
            router.replace('/');
          },
        },
      ],
    );
  }, [activeShop, deleteShop, router]);

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
        <Text style={styles.headerTitle}>Dükkan Ayarları</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.sectionTitle}>Dükkan Bilgileri</Text>
        <Card style={styles.sectionCard}>
          <Input label="Dükkan Adı" value={name} onChangeText={setName} />
          <Input label="Sahip" value={owner} onChangeText={setOwner}
            placeholder="Opsiyonel" />
          <Input label="Açıklama" value={desc} onChangeText={setDesc}
            placeholder="Opsiyonel" />
          <Button title="Kaydet" onPress={handleSaveMeta} size="md" />
        </Card>

        {activeShop && (
          <ReminderSettings
            shopName={activeShop.meta.name}
            value={activeShop.meta.reminder}
            onSave={updateReminder}
          />
        )}

        {activeShop && (
          <CategoryManager
            categories={activeShop.categories}
            onUpdate={updateCategories}
          />
        )}

        <Text style={styles.sectionTitle}>Dosya İşlemleri</Text>
        <Card style={styles.sectionCard}>
          {fileInfo && (
            <Text style={styles.infoLabel}>
              Dosya: {(fileInfo.size / 1024).toFixed(1)} KB |{' '}
              {fileInfo.entryCount} kayıt
            </Text>
          )}
          <Button
            title="Dosyayı Dışa Aktar"
            variant="secondary"
            onPress={() => activeShop && exportShop(activeShop.meta.id)}
            size="md"
            icon={<Ionicons name="share-outline" size={18} color={colors.surface} />}
            style={{ marginBottom: spacing.sm }}
          />
          <Button
            title="Tüm Verileri Sil"
            variant="danger"
            onPress={handleDeleteAll}
            size="md"
            icon={<Ionicons name="trash-outline" size={18} color={colors.surface} />}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.base,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionCard: { marginBottom: spacing.md },
  infoLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});
