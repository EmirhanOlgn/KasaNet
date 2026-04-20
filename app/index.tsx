import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import ShopCard from '../components/ShopCard';
import EmptyState from '../components/EmptyState';
import { useShopStore } from '../store/useShopStore';
import type { ShopMeta } from '../types';
import { colors, typography, spacing } from '../utils/constants';

export default function HomeScreen() {
  const router = useRouter();
  const {
    shops,
    loading,
    error,
    loadShops,
    createShop,
    deleteShop,
    exportShop,
    importShop,
    clearError,
  } = useShopStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [shopName, setShopName] = useState('');
  const [shopOwner, setShopOwner] = useState('');
  const [shopDesc, setShopDesc] = useState('');

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error, [{ text: 'Tamam', onPress: clearError }]);
    }
  }, [error, clearError]);

  const handleCreate = useCallback(async () => {
    if (!shopName.trim()) return;
    await createShop(
      shopName.trim(),
      shopOwner.trim() || undefined,
      shopDesc.trim() || undefined,
    );
    setModalVisible(false);
    setShopName('');
    setShopOwner('');
    setShopDesc('');
  }, [shopName, shopOwner, shopDesc, createShop]);

  const handleDelete = useCallback(
    (shop: ShopMeta) => {
      Alert.alert(
        'Dükkanı Sil',
        `"${shop.name}" dükkanı ve tüm verileri silinecek. Emin misiniz?`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: () => deleteShop(shop.id),
          },
        ],
      );
    },
    [deleteShop],
  );

  const renderShop = useCallback(
    ({ item }: { item: ShopMeta }) => (
      <ShopCard
        shop={item}
        onPress={() => router.push(`/shop/${item.id}`)}
        onExport={() => exportShop(item.id)}
        onDelete={() => handleDelete(item)}
      />
    ),
    [router, exportShop, handleDelete],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>KasaNet</Text>
          <Text style={styles.subtitle}>Gelir / Gider Takip</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Yeni Dükkan"
          onPress={() => setModalVisible(true)}
          icon={
            <Ionicons name="add-circle" size={20} color={colors.surface} />
          }
          style={styles.actionBtn}
        />
        <Button
          title="İçe Aktar"
          variant="outline"
          onPress={importShop}
          icon={
            <Ionicons
              name="download-outline"
              size={20}
              color={colors.secondary}
            />
          }
          style={styles.actionBtn}
        />
      </View>

      {loading && shops.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      ) : (
        <FlatList
          data={shops}
          keyExtractor={(item) => item.id}
          renderItem={renderShop}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="storefront-outline"
              title="Henüz dükkan yok"
              message="Yeni dükkan oluşturarak veya dosya içe aktararak başlayın"
            />
          }
        />
      )}

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Yeni Dükkan Oluştur"
      >
        <Input
          label="Dükkan Adı *"
          value={shopName}
          onChangeText={setShopName}
          placeholder="Örn: Berber Salonu"
        />
        <Input
          label="Sahip (opsiyonel)"
          value={shopOwner}
          onChangeText={setShopOwner}
          placeholder="Örn: Ahmet"
        />
        <Input
          label="Açıklama (opsiyonel)"
          value={shopDesc}
          onChangeText={setShopDesc}
          placeholder="Örn: Merkez şube"
        />
        <Button
          title="Oluştur"
          onPress={handleCreate}
          disabled={!shopName.trim()}
          loading={loading}
          size="lg"
          style={{ marginTop: spacing.md }}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingTop: spacing.lg,
  },
  logo: {
    fontFamily: typography.fontFamily.extraBold,
    fontSize: typography.size.xxl,
    color: colors.surface,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.secondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  actionBtn: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
