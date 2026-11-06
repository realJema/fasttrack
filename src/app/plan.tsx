import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChipRow, Sheet } from '../components/Sheet';
import { Button } from '../components/ui';
import { colors, radii } from '../constants/theme';
import { useFasting } from '../context/FastingProvider';
import { WEEKDAY_LABELS, formatDayTime } from '../utils/time';

const METHODS = ['12:12', '14:10', '16:8', '18:6', '20:4'];

function buildDayOptions(): { ts: number; label: string }[] {
  const options: { ts: number; label: string }[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 0; i < 14; i++) {
    const d = new Date(base.getTime() + i * 86400000);
    const label = d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    options.push({ ts: d.getTime(), label: i === 0 ? 'Today' : label });
  }
  return options;
}

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const { plan, savePlan, now } = useFasting();

  const [step, setStep] = useState(2);
  const [startAt, setStartAt] = useState<number | null>(plan.startAt);
  const [constantly, setConstantly] = useState(plan.constantly);
  const [daysAmount, setDaysAmount] = useState(plan.daysAmount);
  const [week, setWeek] = useState<boolean[]>(plan.week);
  const [method, setMethod] = useState(plan.method);

  const [timeSheet, setTimeSheet] = useState(false);
  const [durationSheet, setDurationSheet] = useState(false);

  const [pickDay, setPickDay] = useState<number>(buildDayOptions()[0].ts);
  const [pickHour, setPickHour] = useState(12);
  const [pickMinute, setPickMinute] = useState(0);

  const days = buildDayOptions();
  const minutes = [0, 15, 30, 45];

  const openTimeSheet = () => {
    const when = startAt ?? Date.now();
    const d = new Date(when);
    const midnight = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    setPickDay(midnight);
    setPickHour(d.getHours());
    setPickMinute(minutes.reduce((a, b) => (Math.abs(b - d.getMinutes()) < Math.abs(a - d.getMinutes()) ? b : a)));
    setTimeSheet(true);
  };

  const applyTime = () => {
    setStartAt(pickDay + pickHour * 3600000 + pickMinute * 60000);
    setTimeSheet(false);
  };

  const applyDuration = () => {
    setDurationSheet(false);
  };

  const apply = async () => {
    await savePlan({ startAt, method, constantly, daysAmount, week });
    router.back();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Set a fasting plan</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.stepWrap}>
        <Text style={styles.stepText}>Step {step}/3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>When do you want to start?</Text>
        <View style={styles.fieldCard}>
          <Text style={styles.fieldValue}>{startAt ? formatDayTime(startAt) : 'Start now'}</Text>
          <Pressable accessibilityRole="button" onPress={openTimeSheet} hitSlop={8}>
            <Text style={styles.fieldAction}>Set time</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>How many days?</Text>
        <View style={styles.fieldCard}>
          <Text style={styles.fieldValue}>{constantly ? 'Constantly' : `${daysAmount} days`}</Text>
          <Pressable accessibilityRole="button" onPress={() => setDurationSheet(true)} hitSlop={8}>
            <Text style={styles.fieldAction}>Set duration</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>Weekly schedule</Text>
        <View style={styles.weekRow}>
          {WEEKDAY_LABELS.map((label, i) => (
            <Pressable
              key={i}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: week[i] }}
              style={[styles.weekChip, week[i] && styles.weekChipOn]}
              onPress={() => setWeek((prev) => prev.map((v, j) => (j === i ? !v : v)))}
            >
              <Text style={[styles.weekLabel, week[i] && styles.weekLabelOn]}>{label}</Text>
              {week[i] && <Ionicons name="checkmark" size={10} color={colors.primary} style={styles.weekCheck} />}
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Fasting goal</Text>
        <View style={styles.methodRow}>
          {METHODS.map((m) => (
            <Pressable
              key={m}
              accessibilityRole="radio"
              accessibilityState={{ checked: method === m }}
              style={[styles.methodChip, method === m && styles.methodChipOn]}
              onPress={() => setMethod(m)}
            >
              <Text style={[styles.methodLabel, method === m && styles.methodLabelOn]}>{m}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {step === 2 ? (
          <Button label="Next" onPress={() => setStep(3)} />
        ) : (
          <>
            <Button label="Apply" onPress={apply} style={styles.applyButton} />
            <Pressable accessibilityRole="button" onPress={() => setStep(2)} style={styles.backLink}>
              <Text style={styles.backLinkText}>Back to step 2</Text>
            </Pressable>
          </>
        )}
      </View>

      <Sheet visible={timeSheet} title="When do you want to start?" onClose={() => setTimeSheet(false)}>
        <ChipRow
          options={[
            { value: 'now', label: 'Now' },
            { value: '8', label: 'in 8h' },
            { value: '16', label: 'in 16h' },
            { value: '24', label: 'in 24h' },
          ]}
          selected={startAt === null ? 'now' : String(Math.round((startAt - now) / 3600000))}
          onSelect={(v) => {
            if (v === 'now') setStartAt(null);
            else setStartAt(Date.now() + Number(v) * 3600000);
            setTimeSheet(false);
          }}
        />
        <Text style={styles.pickerHeading}>Pick a day and time</Text>
        <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
          {days.map((day) => {
            const selected = day.ts === pickDay;
            return (
              <Pressable
                key={day.ts}
                accessibilityRole="radio"
                onPress={() => setPickDay(day.ts)}
                style={[styles.dayRow, selected && styles.dayRowSelected]}
              >
                <Text style={[styles.dayLabel, selected && styles.dayLabelSelected]}>{day.label}</Text>
                <Text style={[styles.dayHour, selected && styles.dayLabelSelected]}>
                  {String(pickHour).padStart(2, '0')}
                </Text>
                <Text style={[styles.dayMinute, selected && styles.dayLabelSelected]}>
                  {String(pickMinute).padStart(2, '0')}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.pickerFooter}>
          <Button label="Apply" onPress={applyTime} style={styles.sheetButton} />
        </View>
      </Sheet>

      <Sheet visible={durationSheet} title="How many days?" onClose={applyDuration}>
        <ChipRow
          options={[
            { value: false, label: 'Days amount' },
            { value: true, label: 'Constantly' },
          ]}
          selected={constantly}
          onSelect={setConstantly}
        />
        {!constantly && (
          <View style={styles.stepperRow}>
            <Pressable
              accessibilityRole="button"
              style={styles.stepperButton}
              onPress={() => setDaysAmount((d) => Math.max(1, d - 1))}
            >
              <Text style={styles.stepperSymbol}>−</Text>
            </Pressable>
            <Text style={styles.stepperValue}>{daysAmount}</Text>
            <Pressable
              accessibilityRole="button"
              style={[styles.stepperButton, styles.stepperPrimary]}
              onPress={() => setDaysAmount((d) => Math.min(60, d + 1))}
            >
              <Text style={[styles.stepperSymbol, { color: '#FFFFFF' }]}>+</Text>
            </Pressable>
          </View>
        )}
        <View style={styles.pickerFooter}>
          <Button label="Apply" onPress={applyDuration} style={styles.sheetButton} />
        </View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  back: { width: 36, alignItems: 'flex-start' },
  placeholder: { width: 36 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  stepWrap: { alignItems: 'center', marginTop: 14 },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.lavender,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 20, marginBottom: 8 },
  fieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  fieldValue: { fontSize: 14.5, color: colors.text, fontWeight: '500' },
  fieldAction: { fontSize: 13.5, fontWeight: '700', color: colors.primary },
  weekRow: { flexDirection: 'row', gap: 8 },
  weekChip: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  weekChipOn: { backgroundColor: colors.lavender },
  weekLabel: { fontSize: 13, fontWeight: '600', color: colors.muted },
  weekLabelOn: { color: colors.text },
  weekCheck: { position: 'absolute', top: 5, right: 5 },
  methodRow: { flexDirection: 'row', gap: 8 },
  methodChip: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  methodChipOn: { backgroundColor: colors.primary },
  methodLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  methodLabelOn: { color: '#FFFFFF' },
  footer: { paddingHorizontal: 20, paddingBottom: 20, gap: 10 },
  applyButton: {},
  backLink: { alignItems: 'center', paddingVertical: 4 },
  backLinkText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  pickerHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 18,
    marginBottom: 8,
  },
  pickerScroll: { maxHeight: 240 },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  dayRowSelected: { backgroundColor: colors.lavender },
  dayLabel: { fontSize: 14, color: colors.muted, flex: 1 },
  dayLabelSelected: { color: colors.text, fontWeight: '700' },
  dayHour: { fontSize: 14, color: colors.muted, width: 40, textAlign: 'center' },
  dayMinute: { fontSize: 14, color: colors.muted, width: 40, textAlign: 'center' },
  pickerFooter: { marginTop: 16 },
  sheetButton: {},
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginTop: 22,
  },
  stepperButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperPrimary: { backgroundColor: colors.primary },
  stepperSymbol: { fontSize: 22, fontWeight: '700', color: colors.primary },
  stepperValue: { fontSize: 34, fontWeight: '700', color: colors.text, minWidth: 56, textAlign: 'center' },
});
