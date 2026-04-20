import { File, Directory, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as Crypto from 'expo-crypto';
import type { ShopFile, ShopMeta, DayEntry } from '../types';
import { isValidShopFile } from '../utils/validators';
import { defaultCategories, defaultCurrency } from '../utils/constants';

/** Dükkan dosyalarının saklandığı dizin */
const shopsDir = new Directory(Paths.document, 'shops');

/** Dizinin var olduğundan emin ol */
function ensureDir(): void {
  if (!shopsDir.exists) {
    shopsDir.create({ intermediates: true });
  }
}

/** Dükkan dosya referansı döndür */
function shopFile(shopId: string): File {
  return new File(shopsDir, `${shopId}.kasanet`);
}

/** Dosyaya güvenli yazma */
function safeWrite(shopId: string, data: ShopFile): void {
  const json = JSON.stringify(data, null, 2);
  const target = shopFile(shopId);

  if (target.exists) target.delete();
  target.create();
  target.write(json);
}

/** Yeni dükkan dosyası oluştur */
export function createShop(
  name: string,
  owner?: string,
  description?: string,
): ShopFile {
  ensureDir();

  const id = Crypto.randomUUID();
  const now = new Date().toISOString();

  const shop: ShopFile = {
    version: '1.0.0',
    meta: { id, name, currency: defaultCurrency, owner, description },
    entries: [],
    categories: {
      incomeCategories: [...defaultCategories.incomeCategories],
      expenseCategories: [...defaultCategories.expenseCategories],
    },
    createdAt: now,
    updatedAt: now,
  };

  safeWrite(id, shop);
  return shop;
}

/** Dükkan dosyasını oku (eski formattaki dosyaları otomatik migrate eder) */
export async function readShop(shopId: string): Promise<ShopFile> {
  const file = shopFile(shopId);
  if (!file.exists) {
    throw new Error(`Dükkan dosyası bulunamadı: ${shopId}`);
  }
  const raw = await file.text();
  const data: unknown = JSON.parse(raw);
  if (!isValidShopFile(data)) {
    throw new Error('Geçersiz dükkan dosyası formatı');
  }
  // Migrate old entries without details array
  for (const entry of data.entries) {
    if (!entry.details) {
      entry.details = [];
    }
  }
  return data;
}

/** Tüm dükkan dosyalarının meta bilgilerini listele */
export async function listShops(): Promise<ShopMeta[]> {
  ensureDir();
  const items = shopsDir.list();
  const metas: ShopMeta[] = [];

  for (const item of items) {
    if (item instanceof File && item.uri.endsWith('.kasanet')) {
      try {
        const raw = await item.text();
        const data: unknown = JSON.parse(raw);
        if (isValidShopFile(data)) {
          metas.push(data.meta);
        }
      } catch {
        // Bozuk dosyaları atla
      }
    }
  }
  return metas;
}

/** Günlük kayıt ekle veya güncelle */
export async function updateEntry(
  shopId: string,
  entry: DayEntry,
): Promise<void> {
  const shop = await readShop(shopId);
  const idx = shop.entries.findIndex((e) => e.date === entry.date);
  if (idx >= 0) {
    shop.entries[idx] = entry;
  } else {
    shop.entries.push(entry);
  }
  shop.updatedAt = new Date().toISOString();
  safeWrite(shopId, shop);
}

/** Bir günün kaydını sil */
export async function deleteEntry(
  shopId: string,
  date: string,
): Promise<void> {
  const shop = await readShop(shopId);
  shop.entries = shop.entries.filter((e) => e.date !== date);
  shop.updatedAt = new Date().toISOString();
  safeWrite(shopId, shop);
}

/** Dükkan meta bilgilerini güncelle */
export async function updateShopMeta(
  shopId: string,
  updates: Partial<Omit<ShopMeta, 'id'>>,
): Promise<void> {
  const shop = await readShop(shopId);
  shop.meta = { ...shop.meta, ...updates };
  shop.updatedAt = new Date().toISOString();
  safeWrite(shopId, shop);
}

/** Dükkan kategorilerini güncelle */
export async function updateCategories(
  shopId: string,
  incomeCategories: string[],
  expenseCategories: string[],
): Promise<void> {
  const shop = await readShop(shopId);
  shop.categories = { incomeCategories, expenseCategories };
  shop.updatedAt = new Date().toISOString();
  safeWrite(shopId, shop);
}

/** Dükkan dosyasını tamamen sil */
export function deleteShop(shopId: string): void {
  const file = shopFile(shopId);
  if (file.exists) file.delete();
}

/** Dükkan dosyasını paylaşım için dışa aktar */
export async function exportShop(shopId: string): Promise<void> {
  const file = shopFile(shopId);
  if (!file.exists) {
    throw new Error('Dışa aktarılacak dosya bulunamadı');
  }
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Paylaşım bu cihazda desteklenmiyor');
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Dükkan Dosyasını Paylaş',
  });
}

/** Cihazdan dosya seçerek içe aktar */
export async function importShop(): Promise<ShopFile> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', '*/*'],
    copyToCacheDirectory: true,
  });

  if (result.canceled || result.assets.length === 0) {
    throw new Error('Dosya seçimi iptal edildi');
  }

  const pickedFile = new File(result.assets[0].uri);
  const raw = await pickedFile.text();

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('Dosya geçerli bir JSON değil');
  }

  if (!isValidShopFile(data)) {
    throw new Error(
      'Geçersiz dosya formatı. Lütfen bir .kasanet dosyası seçin.',
    );
  }

  const newId = Crypto.randomUUID();
  data.meta.id = newId;
  data.updatedAt = new Date().toISOString();

  ensureDir();
  safeWrite(newId, data);
  return data;
}

/** Dükkan dosyasının boyut bilgisini döndür */
export async function getShopFileInfo(
  shopId: string,
): Promise<{ size: number; entryCount: number }> {
  const file = shopFile(shopId);
  if (!file.exists) throw new Error('Dosya bulunamadı');
  const shop = await readShop(shopId);
  return { size: file.size, entryCount: shop.entries.length };
}
