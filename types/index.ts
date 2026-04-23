/** Tek bir günün gelir/gider kaydı */
export interface DayEntry {
  date: string;
  /** Toplam gelir (details dizisinden hesaplanır) */
  income: number;
  /** Toplam gider (details dizisinden hesaplanır) */
  expense: number;
  /** Eski alan - geriye uyumluluk */
  note?: string;
  /** İşlem kalemleri */
  details: TransactionDetail[];
}

/** Detaylı işlem kalemi */
export interface TransactionDetail {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category?: string;
  description?: string;
}

/** Dükkan dosya yapısı (.kasanet JSON dosyası) */
export interface ShopFile {
  version: string;
  meta: ShopMeta;
  entries: DayEntry[];
  categories: CategoryConfig;
  createdAt: string;
  updatedAt: string;
}

/** Dükkan meta bilgileri */
export interface ShopMeta {
  id: string;
  name: string;
  currency: string;
  owner?: string;
  description?: string;
  reminder?: ReminderConfig;
}

/** Günlük bildirim hatırlatma ayarı */
export interface ReminderConfig {
  enabled: boolean;
  /** 0-23 */
  hour: number;
  /** 0-59 */
  minute: number;
  /** Hangi günler: 1=Pzt ... 7=Paz */
  days: number[];
}

/** Kategori yapılandırması */
export interface CategoryConfig {
  incomeCategories: string[];
  expenseCategories: string[];
}

/** Aylık istatistik hesaplama sonucu */
export interface MonthlyStats {
  month: string;
  totalIncome: number;
  totalExpense: number;
  revenue: number;
  netProfit: number;
  profitMargin: number;
  dailyAverage: number;
  bestDay: DayEntry | null;
  worstDay: DayEntry | null;
  workingDays: number;
  dailyBreakdown: DailyPoint[];
}

/** Grafik veri noktası */
export interface DailyPoint {
  day: number;
  income: number;
  expense: number;
  net: number;
}

/** Tarih aralığı analiz sonucu */
export interface RangeAnalysis {
  startDate: string;
  endDate: string;
  totalDays: number;
  workingDays: number;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  dailyAverageIncome: number;
  dailyAverageExpense: number;
  dailyAverageProfit: number;
  isProfit: boolean;
  profitMargin: number;
  trend: 'up' | 'down' | 'stable';
  monthlyBreakdown: MonthlyStats[];
}
