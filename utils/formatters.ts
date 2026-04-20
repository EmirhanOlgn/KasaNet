import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

/** Para tutarını Türk formatında gösterir: ₺1.234,56 */
export function formatCurrency(amount: number, currency = '₺'): string {
  const sign = amount < 0 ? '-' : '';
  const formatted = Math.abs(amount)
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}${currency}${formatted}`;
}

/** Kısa para formatı: ₺1.2K, ₺3.5M */
export function formatCurrencyShort(amount: number, currency = '₺'): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `${currency}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${currency}${(amount / 1_000).toFixed(1)}K`;
  }
  return `${currency}${amount.toFixed(0)}`;
}

/** Tarih formatla: "15 Nisan 2026 Çarşamba" */
export function formatDateFull(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMMM yyyy EEEE', { locale: tr });
}

/** Kısa tarih: "15 Nis" */
export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMM', { locale: tr });
}

/** Ay formatla: "Nisan 2026" */
export function formatMonth(yearMonth: string): string {
  return format(parseISO(`${yearMonth}-01`), 'MMMM yyyy', { locale: tr });
}
