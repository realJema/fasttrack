import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, CardHeader } from '../../components/ui';
import { colors, radii } from '../../constants/theme';
import { useFasting } from '../../context/FastingProvider';
import type { FastRecord } from '../../types';
import { DAY_NAMES, formatShortDate } from '../../utils/time';

const DAY_MS = 86400000;

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Consecutive days (ending today or yesterday) that contain a completed fast. */
function computeStreak(history: FastRecord[], now: number): number {
  const days = new Set(history.filter((r) => r.status === 'completed').map((r) => dayKey(r.startAt)));
  if (days.size === 0) return 0;
  let streak = 0;
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor.getTime()))) {
    cursor.setTime(cursor.getTime() - DAY_MS);
    if (!days.has(dayKey(cursor.getTime()))) return 0;
  }
  while (days.has(dayKey(cursor.getTime()))) {
    streak++;
    cursor.setTime(cursor.getTime() - DAY_MS);
  }
  return streak;
}

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { history, now } = useFasting();

  const totalHours = history.reduce((acc, r) => acc + r.durationMs / 3600000, 0);
  const streak = computeStreak(history, now);
  const longest = Math.max(...history.filter((r) => r.status === 'completed').map((r) => r.durationMs / 3600000), 0);

  // Last 7 days of fasting hours.
  const todayIndex = new Date(now).getDay();
  const weekly: { label: string; hours: number; isToday: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const ts = now - i * DAY_MS;
    const key = dayKey(ts);
    const hours = history
      .filter((r) => dayKey(r.startAt) === key)
      .reduce((acc, r) => acc + r.durationMs / 3600000, 0);
    weekly.push({ label: DAY_NAMES[new Date(ts).getDay()], hours, isToday: new Date(ts).getDay() === todayIndex });
  }
  const maxHours = Math.max(...weekly.map((d) => d.hours), 1);

  const stats = [
    { label: 'Total fasts', value: String(history.length) },
    { label: 'Hours fasted', value: totalHours >= 100 ? totalHours.toFixed(0) : totalHours.toFixed(1) },
    { label: 'Streak', value: `${streak}d` },
    { label: 'Longest fast', value: `${longest.toFixed(1)}h` },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>Analytics</Text>
      <Text style={styles.subtitle}>Everything is stored on your device</Text>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Card style={styles.chartCard}>
          <CardHeader title="This week" />
          <View style={styles.chartRow}>
            {weekly.map((day, i) => (
              <View key={i} style={styles.chartCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[styles.bar, { height: `${Math.max(4, (day.hours / maxHours) * 100)}%` }, day.isToday && day.hours > 0 ? styles.barToday : null]}
                  />
                </View>
                <Text style={styles.barLabel}>{day.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.historyCard}>
          <CardHeader title="Recent fasts" />
          {history.length === 0 ? (
            <Text style={styles.empty}>
              No fasts yet. Finish your first fast and it will show up here.
            </Text>
          ) : (
            history.slice(0, 12).map((record) => {
              const hours = record.durationMs / 3600000;
              const success = record.status === 'completed';
              return (
                <View key={record.id} style={styles.historyRow}>
                  <View style={[styles.historyIcon, success ? styles.iconGood : styles.iconBad]}>
                    <Text style={styles.historyEmoji}>{success ? '✅' : '⏹️'}</Text>
                  </View>
                  <View style={styles.historyBody}>
                    <Text style={styles.historyTitle}>
                      {record.method} · {hours.toFixed(1)}h
                    </Text>
                    <Text style={styles.historyDetail}>
                      {formatShortDate(record.startAt)} ·{' '}
                      {success ? 'Completed' : 'Stopped early'}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 18 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 4, marginBottom: 6 },
  scroll: { paddingBottom: 32 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  statCard: {
    flexBasis: '46%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    paddingVertical: 18,
    alignItems: 'center',
  },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.muted, marginTop: 4 },
  chartCard: { marginTop: 16 },
  chartRow: { flexDirection: 'row', gap: 8, height: 140, alignItems: 'flex-end' },
  chartCol: { flex: 1, alignItems: 'center', gap: 6, height: '100%' },
  barTrack: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  bar: {
    width: 18,
    borderRadius: 9,
    backgroundColor: colors.lavenderAlt,
  },
  barToday: { backgroundColor: colors.primary },
  barLabel: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  historyCard: { marginTop: 16 },
  empty: { fontSize: 13.5, color: colors.muted, lineHeight: 20, paddingVertical: 8 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGood: { backgroundColor: colors.greenSoft },
  iconBad: { backgroundColor: colors.redSoft },
  historyEmoji: { fontSize: 17 },
  historyBody: { flex: 1 },
  historyTitle: { fontSize: 14.5, fontWeight: '700', color: colors.text },
  historyDetail: { fontSize: 12, color: colors.muted, marginTop: 2 },
});
