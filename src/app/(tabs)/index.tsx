import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TimerRing } from '../../components/TimerRing';
import { Button, Card, CardHeader } from '../../components/ui';
import { BEGINNER_TIPS, MOODS, bodyPhaseAt } from '../../constants/content';
import { colors, radii } from '../../constants/theme';
import { useFasting } from '../../context/FastingProvider';
import type { CheckIn } from '../../types';
import { formatDayTime, formatElapsed, formatRemaining, peopleFastingNow, uid } from '../../utils/time';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const fasting = useFasting();
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [note, setNote] = useState('');

  const active = fasting.isActive;
  const phase = bodyPhaseAt(fasting.elapsedMs);
  const endAt = fasting.session ? fasting.session.startAt + fasting.session.targetMs : 0;
  const doneCount = fasting.checklist.filter((c) => c.done).length;

  const handleStart = () => {
    const startAt = fasting.plan.startAt && fasting.plan.startAt > fasting.now ? fasting.plan.startAt : undefined;
    fasting.startFast(undefined, startAt);
    const item = fasting.checklist.find((c) => c.id === 'first');
    if (item && !item.done) fasting.toggleChecklistItem('first');
  };

  const handleEnd = () => {
    fasting.endFast(fasting.isGoalReached ? 'completed' : 'stopped');
    setCheckIn(null);
    setNote('');
  };

  const handleCheckIn = (mood: CheckIn['mood']) => {
    setCheckIn({ id: uid(), at: fasting.now, mood, note: note.trim() || undefined });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.logo}>
          <Ionicons name="flash" size={16} color={colors.primary} />
          <View style={styles.logoDot} />
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{active ? "You're fasting!" : "Let's get started!"}</Text>
          {active && (
            <Text style={styles.subtitle}>{peopleFastingNow(fasting.now)}k people are fasting now</Text>
          )}
        </View>
        <Pressable
          accessibilityRole="button"
          style={styles.planButton}
          onPress={() => router.push('/plan')}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {fasting.isScheduled && fasting.session && (
          <View style={styles.scheduledBanner}>
            <Ionicons name="time-outline" size={18} color={colors.primary} />
            <View style={styles.scheduledText}>
              <Text style={styles.scheduledTitle}>Fast scheduled</Text>
              <Text style={styles.scheduledDetail}>Starts {formatDayTime(fasting.session.startAt)}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={fasting.cancelScheduled} hitSlop={10}>
              <Text style={styles.scheduledCancel}>Cancel</Text>
            </Pressable>
          </View>
        )}

        {active && fasting.session ? (
          <>
            <View style={styles.methodRow}>
              <Text style={styles.methodLabel}>Current fasting: {fasting.session.method}</Text>
              <Pressable accessibilityRole="button" onPress={() => router.push('/plan')} hitSlop={10}>
                <Ionicons name="options-outline" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <TimerRing size={280} progress={fasting.progress} style={styles.ring}>
              <Text style={styles.ringCaption}>Fasting time</Text>
              <Text style={styles.ringTime}>{formatElapsed(fasting.elapsedMs)}</Text>
              <Text style={styles.ringPercent}>{Math.round(fasting.progress * 100)}%</Text>
              <Button
                label={fasting.isGoalReached ? 'Continue fasting' : 'End fasting'}
                variant={fasting.isGoalReached ? 'outline' : 'dark'}
                onPress={handleEnd}
                style={styles.endButton}
              />
            </TimerRing>

            <View style={styles.timesRow}>
              <View style={styles.timeCol}>
                <Text style={styles.timeLabel}>Start fasting</Text>
                <Text style={styles.timeValue}>{formatDayTime(fasting.session.startAt)}</Text>
              </View>
              <View style={styles.timeDivider} />
              <View style={styles.timeCol}>
                <Text style={styles.timeLabel}>End fasting</Text>
                <Text style={styles.timeValue}>
                  {fasting.elapsedMs >= fasting.session.targetMs
                    ? `Overrun ${formatRemaining(fasting.elapsedMs - fasting.session.targetMs)}`
                    : formatDayTime(endAt)}
                </Text>
              </View>
            </View>

            <Card style={styles.statusCard}>
              <View style={styles.statusIcon}>
                <Text style={styles.statusEmoji}>🔥</Text>
              </View>
              <View style={styles.statusBody}>
                <Text style={styles.statusTitle}>Body status</Text>
                <View style={styles.levelRow}>
                  <View style={styles.levelChip}>
                    <Text style={styles.levelText}>Lv1</Text>
                  </View>
                  <Text style={styles.statusDetail}>{phase.title}: {phase.detail}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.faint} />
            </Card>

            <Card style={styles.checkInCard}>
              <CardHeader title="😊 Check in" />
              {checkIn ? (
                <View style={styles.checkInDone}>
                  <Text style={styles.checkInDoneText}>
                    {checkIn.mood === 'great' ? '😎' : checkIn.mood === 'okay' ? '🙂' : '😩'} Thanks for checking
                    in — {checkIn.note ? `“${checkIn.note}”` : 'keep it up!'}
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.checkInQuestion}>How are you feeling?</Text>
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Add a note (optional)"
                    placeholderTextColor={colors.faint}
                    value={note}
                    onChangeText={setNote}
                  />
                  <View style={styles.moodRow}>
                    {MOODS.map((mood) => (
                      <Pressable
                        key={mood.value}
                        accessibilityRole="button"
                        style={styles.moodChip}
                        onPress={() => handleCheckIn(mood.value)}
                      >
                        <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                        <Text style={styles.moodLabel}>{mood.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}
            </Card>
          </>
        ) : (
          <>
            <View style={styles.idleRing}>
              <Pressable
                accessibilityRole="button"
                style={styles.startButton}
                onPress={handleStart}
              >
                <Ionicons name="add" size={30} color="#FFFFFF" />
              </Pressable>
            </View>
            <Text style={styles.tapHint}>Tap to create a fast</Text>

            <Card style={styles.tipsCard}>
              <CardHeader title="Tips for fasting beginners" />
              {BEGINNER_TIPS.map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                  <Text style={styles.tipText}>{tip.text}</Text>
                </View>
              ))}
              <Button label="Got it" variant="dark" onPress={() => router.push('/explore')} style={styles.gotIt} />
            </Card>

            <Card style={styles.checklistCard}>
              <CardHeader
                title="Quick-start checklist"
                right={
                  <Text style={styles.checklistCount}>
                    {doneCount}/{fasting.checklist.length}
                  </Text>
                }
              />
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(doneCount / fasting.checklist.length) * 100}%` },
                  ]}
                />
              </View>
              {fasting.checklist.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: item.done }}
                  style={styles.checkRow}
                  onPress={() => fasting.toggleChecklistItem(item.id)}
                >
                  <Text style={styles.checkLabel}>{item.label}</Text>
                  <View style={[styles.checkbox, item.done && styles.checkboxDone]}>
                    {item.done && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                  </View>
                </Pressable>
              ))}
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.pink,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  planButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 18,
    paddingBottom: 32,
    alignItems: 'stretch',
  },
  scheduledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lavender,
    borderRadius: radii.card,
    padding: 14,
    marginBottom: 14,
    gap: 10,
  },
  scheduledText: { flex: 1 },
  scheduledTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  scheduledDetail: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  scheduledCancel: { fontSize: 13, fontWeight: '700', color: colors.primary },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 18,
    alignSelf: 'center',
  },
  methodLabel: { fontSize: 13, fontWeight: '600', color: colors.text },
  ring: { alignSelf: 'center', marginVertical: 6 },
  ringCaption: { fontSize: 13, color: colors.muted, marginBottom: 2 },
  ringTime: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  ringPercent: { fontSize: 15, fontWeight: '600', color: colors.textSecondary, marginTop: 2 },
  endButton: { marginTop: 14, height: 44, paddingHorizontal: 22 },
  timesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginTop: 22,
  },
  timeCol: { alignItems: 'center' },
  timeLabel: { fontSize: 12, color: colors.muted },
  timeValue: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 4 },
  timeDivider: { width: 1, height: 30, backgroundColor: colors.border },
  statusCard: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.amberSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusEmoji: { fontSize: 20 },
  statusBody: { flex: 1 },
  statusTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  levelChip: {
    backgroundColor: colors.lavenderAlt,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  levelText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  statusDetail: { fontSize: 12, color: colors.textSecondary, flex: 1 },
  checkInCard: { marginTop: 14 },
  checkInQuestion: { fontSize: 13, color: colors.textSecondary, marginBottom: 10 },
  noteInput: {
    backgroundColor: colors.chip,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  moodRow: { flexDirection: 'row', gap: 10 },
  moodChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.lavender,
    borderRadius: 14,
    paddingVertical: 12,
    gap: 4,
  },
  moodEmoji: { fontSize: 22 },
  moodLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  checkInDone: { paddingVertical: 6 },
  checkInDoneText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  idleRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  startButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  tapHint: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 22,
  },
  tipsCard: { marginBottom: 14 },
  tipRow: { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'flex-start' },
  tipEmoji: { fontSize: 16 },
  tipText: { flex: 1, fontSize: 13.5, color: colors.textSecondary, lineHeight: 19 },
  gotIt: { alignSelf: 'center', height: 42, paddingHorizontal: 30, marginTop: 4 },
  checklistCard: {},
  checklistCount: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.track,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: colors.primarySoft },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checkLabel: { fontSize: 14, color: colors.text, flex: 1 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.track,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
