import { create } from 'zustand';
import type { ShopFile, ShopMeta, DayEntry, ReminderConfig } from '../types';
import * as fm from '../services/fileManager';
import * as notif from '../services/notifications';

interface ShopState {
  /** Tüm dükkan meta listesi */
  shops: ShopMeta[];
  /** Aktif açık dükkan verisi */
  activeShop: ShopFile | null;
  /** Yükleniyor durumu */
  loading: boolean;
  /** Hata mesajı */
  error: string | null;

  loadShops: () => Promise<void>;
  openShop: (shopId: string) => Promise<void>;
  createShop: (name: string, owner?: string, desc?: string) => Promise<void>;
  deleteShop: (shopId: string) => Promise<void>;
  updateEntry: (entry: DayEntry) => Promise<void>;
  deleteEntry: (date: string) => Promise<void>;
  updateMeta: (updates: Partial<Omit<ShopMeta, 'id'>>) => Promise<void>;
  updateReminder: (config: ReminderConfig | null) => Promise<void>;
  updateCategories: (income: string[], expense: string[]) => Promise<void>;
  exportShop: (shopId: string) => Promise<void>;
  importShop: () => Promise<void>;
  clearError: () => void;
}

export const useShopStore = create<ShopState>((set, get) => ({
  shops: [],
  activeShop: null,
  loading: false,
  error: null,

  loadShops: async () => {
    set({ loading: true, error: null });
    try {
      const shops = await fm.listShops();
      set({ shops, loading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Dükkanlar yüklenemedi',
        loading: false,
      });
    }
  },

  openShop: async (shopId: string) => {
    set({ loading: true, error: null });
    try {
      const shop = await fm.readShop(shopId);
      set({ activeShop: shop, loading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Dükkan açılamadı',
        loading: false,
      });
    }
  },

  createShop: async (name, owner, desc) => {
    set({ loading: true, error: null });
    try {
      fm.createShop(name, owner, desc);
      await get().loadShops();
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Dükkan oluşturulamadı',
        loading: false,
      });
    }
  },

  deleteShop: async (shopId) => {
    set({ loading: true, error: null });
    try {
      fm.deleteShop(shopId);
      await notif.cancelShopReminders(shopId).catch(() => {});
      const { activeShop } = get();
      if (activeShop?.meta.id === shopId) {
        set({ activeShop: null });
      }
      await get().loadShops();
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Dükkan silinemedi',
        loading: false,
      });
    }
  },

  updateEntry: async (entry) => {
    const { activeShop } = get();
    if (!activeShop || get().loading) return;
    set({ loading: true });
    try {
      await fm.updateEntry(activeShop.meta.id, entry);
      await get().openShop(activeShop.meta.id);
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Kayıt güncellenemedi',
        loading: false,
      });
    }
  },

  deleteEntry: async (date) => {
    const { activeShop } = get();
    if (!activeShop || get().loading) return;
    set({ loading: true });
    try {
      await fm.deleteEntry(activeShop.meta.id, date);
      await get().openShop(activeShop.meta.id);
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Kayıt silinemedi',
        loading: false,
      });
    }
  },

  updateMeta: async (updates) => {
    const { activeShop } = get();
    if (!activeShop) return;
    try {
      await fm.updateShopMeta(activeShop.meta.id, updates);
      await get().openShop(activeShop.meta.id);
      await get().loadShops();
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Bilgiler güncellenemedi',
      });
    }
  },

  updateReminder: async (config) => {
    const { activeShop } = get();
    if (!activeShop) return;
    try {
      await fm.updateShopMeta(activeShop.meta.id, {
        reminder: config ?? undefined,
      });
      if (config && config.enabled && config.days.length > 0) {
        await notif.scheduleShopReminders(
          activeShop.meta.id,
          activeShop.meta.name,
          config,
        );
      } else {
        await notif.cancelShopReminders(activeShop.meta.id);
      }
      await get().openShop(activeShop.meta.id);
      await get().loadShops();
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Hatırlatma ayarlanamadı',
      });
    }
  },

  updateCategories: async (income, expense) => {
    const { activeShop } = get();
    if (!activeShop) return;
    try {
      await fm.updateCategories(activeShop.meta.id, income, expense);
      await get().openShop(activeShop.meta.id);
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Kategoriler güncellenemedi',
      });
    }
  },

  exportShop: async (shopId) => {
    try {
      await fm.exportShop(shopId);
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Dışa aktarma başarısız',
      });
    }
  },

  importShop: async () => {
    set({ loading: true, error: null });
    try {
      await fm.importShop();
      await get().loadShops();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'İçe aktarma başarısız';
      if (msg !== 'Dosya seçimi iptal edildi') {
        set({ error: msg, loading: false });
      } else {
        set({ loading: false });
      }
    }
  },

  clearError: () => set({ error: null }),
}));
