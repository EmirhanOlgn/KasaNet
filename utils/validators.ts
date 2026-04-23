import type { ShopFile, DayEntry, ShopMeta, CategoryConfig } from '../types';

/** Geçerli bir ISO tarih formatı mı kontrol eder (YYYY-MM-DD) */
export function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
}

/** DayEntry doğrulama */
export function isValidDayEntry(entry: unknown): entry is DayEntry {
  if (!entry || typeof entry !== 'object') return false;
  const e = entry as Record<string, unknown>;
  const baseValid =
    typeof e.date === 'string' &&
    isValidDate(e.date) &&
    typeof e.income === 'number' &&
    e.income >= 0 &&
    typeof e.expense === 'number' &&
    e.expense >= 0;
  if (!baseValid) return false;
  // details is optional for backward compat (old files may not have it)
  if (e.details !== undefined && !Array.isArray(e.details)) return false;
  return true;
}

/** ShopMeta doğrulama */
export function isValidShopMeta(meta: unknown): meta is ShopMeta {
  if (!meta || typeof meta !== 'object') return false;
  const m = meta as Record<string, unknown>;
  if (
    typeof m.id !== 'string' ||
    m.id.length === 0 ||
    typeof m.name !== 'string' ||
    m.name.length === 0 ||
    typeof m.currency !== 'string'
  ) {
    return false;
  }
  // reminder alanı isteğe bağlı
  if (m.reminder !== undefined) {
    const r = m.reminder as Record<string, unknown>;
    if (
      typeof r !== 'object' ||
      typeof r.enabled !== 'boolean' ||
      typeof r.hour !== 'number' ||
      typeof r.minute !== 'number' ||
      !Array.isArray(r.days) ||
      !r.days.every((d: unknown) => typeof d === 'number' && d >= 1 && d <= 7)
    ) {
      return false;
    }
  }
  return true;
}

/** CategoryConfig doğrulama */
export function isValidCategories(cat: unknown): cat is CategoryConfig {
  if (!cat || typeof cat !== 'object') return false;
  const c = cat as Record<string, unknown>;
  return (
    Array.isArray(c.incomeCategories) &&
    Array.isArray(c.expenseCategories) &&
    c.incomeCategories.every((x: unknown) => typeof x === 'string') &&
    c.expenseCategories.every((x: unknown) => typeof x === 'string')
  );
}

/** ShopFile tam doğrulama */
export function isValidShopFile(data: unknown): data is ShopFile {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.version === 'string' &&
    isValidShopMeta(d.meta) &&
    Array.isArray(d.entries) &&
    d.entries.every(isValidDayEntry) &&
    isValidCategories(d.categories) &&
    typeof d.createdAt === 'string' &&
    typeof d.updatedAt === 'string'
  );
}
