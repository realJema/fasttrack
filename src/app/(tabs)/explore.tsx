import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sheet } from '../../components/Sheet';
import { Button, Card } from '../../components/ui';
import { BEGINNER_TIPS, METHODS, type FastingMethod } from '../../constants/content';
import { colors, radii } from '../../constants/theme';
import { useFasting } from '../../context/FastingProvider';

const DIFFICULTY_COLORS: Record<FastingMethod['difficulty'], { bg: string; fg: string }> = {
  Easy: { bg: colors.greenSoft, fg: colors.green },
  Medium: { bg: colors.amberSoft, fg: colors.amber },
  Advanced: { bg: colors.pinkSoft, fg: colors.pink },
};

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { plan, savePlan, startFast } = useFasting();
  const [selected, setSelected] = useState<FastingMethod | null>(null);
  const [started, setStarted] = useState<string | null>(null);

  const choose = async (method: FastingMethod) => {
    setSelected(null);
    setStarted(method.name);
    await savePlan({ ...plan, method: method.name });
    startFast(method.name);
    router.navigate('/(tabs)');
    setTimeout(() => setStarted(null), 2500);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>Explore</Text>
      <Text style={styles.subtitle}>Pick a method that fits your lifestyle</Text>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {started && (
          <View style={styles.toast}>
            <Ionicons name="checkmark-circle" size={18} color={colors.green} />
            <Text style={styles.toastText}>Started a {started} fast — good luck!</Text>
          </View>
        )}

        {METHODS.map((method) => {
          const diff = DIFFICULTY_COLORS[method.difficulty];
          const isCurrent = plan.method === method.name;
          return (
            <Card
              key={method.name}
              onPress={() => setSelected(method)}
              style={styles.methodCard}
            >
              <View style={styles.methodRow}>
                <View style={styles.methodEmoji}>
                  <Text style={styles.emojiText}>{method.emoji}</Text>
                </View>
                <View style={styles.methodBody}>
                  <View style={styles.methodTitleRow}>
                    <Text style={styles.methodName}>{method.name}</Text>
                    {isCurrent && (
                      <View style={styles.currentChip}>
                        <Text style={styles.currentText}>Current goal</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.methodTagline}>{method.tagline}</Text>
                </View>
                <View style={[styles.diffChip, { backgroundColor: diff.bg }]}>
                  <Text style={[styles.diffText, { color: diff.fg }]}>{method.difficulty}</Text>
                </View>
              </View>
            </Card>
          );
        })}

        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Golden rules</Text>
          {BEGINNER_TIPS.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipEmoji}>{tip.emoji}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
          <View style={styles.tipRow}>
            <Text style={styles.tipEmoji}>☕</Text>
            <Text style={styles.tipText}>Black coffee and plain tea are fine during a fast — just skip the sugar.</Text>
          </View>
        </Card>
      </ScrollView>

      <Sheet
        visible={!!selected}
        title={selected ? `${selected.emoji} ${selected.name} — ${selected.tagline}` : ''}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <Text style={styles.sheetDescription}>{selected.description}</Text>
            <View style={styles.sheetStats}>
              <View style={styles.sheetStat}>
                <Text style={styles.sheetStatValue}>{selected.fastHours}h</Text>
                <Text style={styles.sheetStatLabel}>Fasting</Text>
              </View>
              <View style={styles.sheetStat}>
                <Text style={styles.sheetStatValue}>{selected.eatHours}h</Text>
                <Text style={styles.sheetStatLabel}>Eating window</Text>
              </View>
              <View style={styles.sheetStat}>
                <Text style={styles.sheetStatValue}>{selected.difficulty}</Text>
                <Text style={styles.sheetStatLabel}>Difficulty</Text>
              </View>
            </View>
            <Button label={`Start ${selected.name} now`} onPress={() => choose(selected)} style={styles.sheetButton} />
          </>
        )}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 18 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 4, marginBottom: 6 },
  scroll: { paddingBottom: 32 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.greenSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  toastText: { fontSize: 13.5, fontWeight: '600', color: colors.green },
  methodCard: { marginBottom: 12, padding: 14 },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  methodEmoji: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: { fontSize: 22 },
  methodBody: { flex: 1 },
  methodTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  methodName: { fontSize: 16, fontWeight: '800', color: colors.text },
  currentChip: {
    backgroundColor: colors.lavenderAlt,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  currentText: { fontSize: 10.5, fontWeight: '700', color: colors.primary },
  methodTagline: { fontSize: 12.5, color: colors.muted, marginTop: 2 },
  diffChip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  diffText: { fontSize: 11.5, fontWeight: '700' },
  tipsCard: { marginTop: 6, padding: 18 },
  tipsTitle: { fontSize: 15.5, fontWeight: '700', color: colors.text, marginBottom: 12 },
  tipRow: { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'flex-start' },
  tipEmoji: { fontSize: 15 },
  tipText: { flex: 1, fontSize: 13.5, color: colors.textSecondary, lineHeight: 19 },
  sheetDescription: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
  sheetStats: { flexDirection: 'row', gap: 10, marginVertical: 18 },
  sheetStat: {
    flex: 1,
    backgroundColor: colors.chip,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sheetStatValue: { fontSize: 17, fontWeight: '800', color: colors.primary },
  sheetStatLabel: { fontSize: 11, color: colors.muted, marginTop: 3 },
  sheetButton: {},
});
