import {
  parseISO,
  differenceInCalendarDays,
  format,
  eachMonthOfInterval,
  getDaysInMonth,
} from 'date-fns';
import type {
  DayEntry,
  MonthlyStats,
  DailyPoint,
  RangeAnalysis,
} from '../types';

/** Belirli ay için girişleri filtrele */
function filterByMonth(entries: DayEntry[], yearMonth: string): DayEntry[] {
  return entries.filter((e) => e.date.startsWith(yearMonth));
}

/** Belirli tarih aralığı için girişleri filtrele */
function filterByRange(
  entries: DayEntry[],
  start: string,
  end: string,
): DayEntry[] {
  return entries.filter((e) => e.date >= start && e.date <= end);
}

/** Kar marjı hesapla (%) */
export function profitMargin(income: number, expense: number): number {
  if (income === 0) return 0;
  return ((income - expense) / income) * 100;
}

/** En iyi günü bul (en yüksek net kazanç) */
export function findBestDay(entries: DayEntry[]): DayEntry | null {
  if (entries.length === 0) return null;
  return entries.reduce((best, e) =>
    e.income - e.expense > best.income - best.expense ? e : best,
  );
}

/** En kötü günü bul (en düşük net kazanç) */
export function findWorstDay(entries: DayEntry[]): DayEntry | null {
  if (entries.length === 0) return null;
  return entries.reduce((worst, e) =>
    e.income - e.expense < worst.income - worst.expense ? e : worst,
  );
}

/** Grafik için günlük veri noktaları oluştur */
export function generateDailyPoints(
  entries: DayEntry[],
  yearMonth: string,
): DailyPoint[] {
  const monthEntries = filterByMonth(entries, yearMonth);
  const daysInMonth = getDaysInMonth(parseISO(`${yearMonth}-01`));
  const entryMap = new Map<number, DayEntry>();

  for (const e of monthEntries) {
    const day = parseInt(e.date.split('-')[2], 10);
    entryMap.set(day, e);
  }

  const points: DailyPoint[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const entry = entryMap.get(d);
    points.push({
      day: d,
      income: entry?.income ?? 0,
      expense: entry?.expense ?? 0,
      net: (entry?.income ?? 0) - (entry?.expense ?? 0),
    });
  }

  return points;
}

/** Aylık istatistik hesapla */
export function calculateMonthly(
  entries: DayEntry[],
  yearMonth: string,
): MonthlyStats {
  const monthEntries = filterByMonth(entries, yearMonth);

  let totalIncome = 0;
  let totalExpense = 0;

  for (const e of monthEntries) {
    totalIncome += e.income;
    totalExpense += e.expense;
  }

  const netProfit = totalIncome - totalExpense;
  const workingDays = monthEntries.length;

  return {
    month: yearMonth,
    totalIncome,
    totalExpense,
    revenue: totalIncome,
    netProfit,
    profitMargin: profitMargin(totalIncome, totalExpense),
    dailyAverage: workingDays > 0 ? netProfit / workingDays : 0,
    bestDay: findBestDay(monthEntries),
    worstDay: findWorstDay(monthEntries),
    workingDays,
    dailyBreakdown: generateDailyPoints(entries, yearMonth),
  };
}

/** Trend hesapla: son N günün ortalamasını ilk N/2 ve son N/2 olarak karşılaştır */
export function calculateTrend(
  entries: DayEntry[],
  days: number,
): 'up' | 'down' | 'stable' {
  if (entries.length < 4) return 'stable';

  const sorted = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-days);

  if (sorted.length < 4) return 'stable';

  const mid = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, mid);
  const secondHalf = sorted.slice(mid);

  const avgFirst =
    firstHalf.reduce((s, e) => s + (e.income - e.expense), 0) /
    firstHalf.length;
  const avgSecond =
    secondHalf.reduce((s, e) => s + (e.income - e.expense), 0) /
    secondHalf.length;

  const diff = avgSecond - avgFirst;
  const threshold = Math.abs(avgFirst) * 0.1 || 50;

  if (diff > threshold) return 'up';
  if (diff < -threshold) return 'down';
  return 'stable';
}

/** Tarih aralığı analizi */
export function calculateRange(
  entries: DayEntry[],
  start: string,
  end: string,
): RangeAnalysis {
  const rangeEntries = filterByRange(entries, start, end);
  const totalDays =
    differenceInCalendarDays(parseISO(end), parseISO(start)) + 1;

  let totalIncome = 0;
  let totalExpense = 0;

  for (const e of rangeEntries) {
    totalIncome += e.income;
    totalExpense += e.expense;
  }

  const netProfit = totalIncome - totalExpense;
  const workingDays = rangeEntries.length;

  // Aylık kırılım
  const months = eachMonthOfInterval({
    start: parseISO(start),
    end: parseISO(end),
  });

  const monthlyBreakdown = months.map((m) => {
    const ym = format(m, 'yyyy-MM');
    return calculateMonthly(rangeEntries, ym);
  });

  return {
    startDate: start,
    endDate: end,
    totalDays,
    workingDays,
    totalIncome,
    totalExpense,
    netProfit,
    dailyAverageIncome: workingDays > 0 ? totalIncome / workingDays : 0,
    dailyAverageExpense: workingDays > 0 ? totalExpense / workingDays : 0,
    dailyAverageProfit: workingDays > 0 ? netProfit / workingDays : 0,
    isProfit: netProfit >= 0,
    profitMargin: profitMargin(totalIncome, totalExpense),
    trend: calculateTrend(rangeEntries, rangeEntries.length),
    monthlyBreakdown,
  };
}
