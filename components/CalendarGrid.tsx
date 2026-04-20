import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  startOfMonth,
  getDay,
  getDaysInMonth,
  format,
  parseISO,
} from 'date-fns';
import type { DayEntry } from '../types';
import { colors, typography, spacing, borderRadius } from '../utils/constants';

const WEEK_DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

interface CalendarGridProps {
  yearMonth: string;
  entries: DayEntry[];
  onDayPress: (date: string) => void;
}

function CalendarGrid({ yearMonth, entries, onDayPress }: CalendarGridProps) {
  const entryMap = useMemo(() => {
    const map = new Map<string, DayEntry>();
    for (const e of entries) {
      if (e.date.startsWith(yearMonth)) {
        map.set(e.date, e);
      }
    }
    return map;
  }, [entries, yearMonth]);

  const { cells, totalRows } = useMemo(() => {
    const firstDay = startOfMonth(parseISO(`${yearMonth}-01`));
    const daysInMonth = getDaysInMonth(firstDay);

    // getDay: 0=Paz, 1=Pzt ... 6=Cmt → Pzt başlangıç için ayarla
    let startIdx = getDay(firstDay) - 1;
    if (startIdx < 0) startIdx = 6;

    const cells: (number | null)[] = [];
    for (let i = 0; i < startIdx; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    return { cells, totalRows: cells.length / 7 };
  }, [yearMonth]);

  const rows: (number | null)[][] = [];
  for (let r = 0; r < totalRows; r++) {
    rows.push(cells.slice(r * 7, (r + 1) * 7));
  }

  return (
    <View style={styles.container}>
      <View style={styles.weekHeader}>
        {WEEK_DAYS.map((d) => (
          <Text key={d} style={styles.weekDay}>
            {d}
          </Text>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((day, ci) => {
            if (day === null) {
              return <View key={ci} style={styles.cell} />;
            }

            const dateStr = `${yearMonth}-${String(day).padStart(2, '0')}`;
            const entry = entryMap.get(dateStr);
            const today = dateStr === format(new Date(), 'yyyy-MM-dd');
            const hasEntry = !!entry;
            const inc = entry?.income ?? 0;
            const exp = entry?.expense ?? 0;
            const total = inc + exp;
            const net = inc - exp;
            const incRatio = total > 0 ? inc / total : 0.5;
            const expRatio = total > 0 ? exp / total : 0.5;

            // Format net for display
            const netLabel = hasEntry
              ? net > 0
                ? `+${net >= 1000 ? `${(net / 1000).toFixed(1)}K` : net}`
                : net < 0
                  ? `${Math.abs(net) >= 1000 ? `-${(Math.abs(net) / 1000).toFixed(1)}K` : net}`
                  : '0'
              : '';

            return (
              <Pressable
                key={ci}
                style={({ pressed }) => [
                  styles.cell,
                  today && styles.todayCell,
                  hasEntry && {
                    backgroundColor:
                      net > 0
                        ? 'rgba(0, 200, 83, 0.08)'
                        : net < 0
                          ? 'rgba(255, 23, 68, 0.08)'
                          : '#F0F9FF',
                  },
                  pressed && styles.pressedCell,
                ]}
                onPress={() => onDayPress(dateStr)}
              >
                <Text
                  style={[
                    styles.dayNum,
                    today && styles.todayText,
                  ]}
                >
                  {day}
                </Text>
                {hasEntry && (
                  <>
                    <Text
                      style={[
                        styles.netLabel,
                        {
                          color:
                            net > 0
                              ? colors.income
                              : net < 0
                                ? colors.expense
                                : colors.textSecondary,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {netLabel}
                    </Text>
                    <View style={styles.miniBar}>
                      <View
                        style={[
                          styles.barSegment,
                          {
                            backgroundColor: colors.income,
                            flex: incRatio,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.barSegment,
                          {
                            backgroundColor: colors.expense,
                            flex: expRatio,
                          },
                        ]}
                      />
                    </View>
                  </>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export default React.memo(CalendarGrid);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 1,
    borderRadius: borderRadius.sm,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  pressedCell: {
    backgroundColor: '#E0E7FF',
    transform: [{ scale: 0.92 }],
  },
  dayNum: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.textPrimary,
  },
  todayText: {
    fontFamily: typography.fontFamily.bold,
    color: colors.secondary,
  },
  netLabel: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 7,
    opacity: 0.55,
    marginTop: 1,
  },
  miniBar: {
    flexDirection: 'row',
    height: 3,
    width: '70%',
    borderRadius: 2,
    marginTop: 1,
    overflow: 'hidden',
  },
  barSegment: {
    height: 3,
  },
});
