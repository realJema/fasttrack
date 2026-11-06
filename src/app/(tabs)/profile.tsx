import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sheet, Switch } from '../../components/Sheet';
import { Button, Card } from '../../components/ui';
import { colors, radii } from '../../constants/theme';
import { useFasting } from '../../context/FastingProvider';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, saveProfile, history, resetAllData } = useFasting();
  const [nameSheet, setNameSheet] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile.displayName);
  const [reminders, setReminders] = useState(false);

  const totalHours = history.reduce((acc, r) => acc + r.durationMs / 3600000, 0);

  const exportData = () => {
    void Share.share({
      message: JSON.stringify({ profile, history, exportedAt: new Date().toISOString() }, null, 2),
      title: 'My fasting data',
    });
  };

  const confirmReset = () => {
    Alert.alert('Reset all data?', 'Fasts, plan and checklist will be deleted from this device.', [
      { text: 'Keep data', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void resetAllData();
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>Profile</Text>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.displayName.trim().charAt(0).toUpperCase() || 'F'}
            </Text>
          </View>
          <View style={styles.heroBody}>
            <Text style={styles.heroName}>{profile.displayName}</Text>
            <Text style={styles.heroDetail}>
              {history.length} fasts · {totalHours.toFixed(0)}h total
            </Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => setNameSheet(true)} hitSlop={10}>
            <Ionicons name="pencil" size={17} color={colors.primary} />
          </Pressable>
        </Card>

        <Card style={styles.menuCard}>
          <View style={styles.menuRow}>
            <View style={[styles.menuIcon, { backgroundColor: colors.blueSoft }]}>
              <Text style={styles.menuEmoji}>️</Text>
            </View>
            <Text style={styles.menuLabel}>Goal weight</Text>
            <Text style={styles.menuValue}>
              {profile.goalWeightKg ? `${profile.goalWeightKg} kg` : 'Not set'}
            </Text>
          </View>
          <View style={styles.menuRow}>
            <View style={[styles.menuIcon, { backgroundColor: colors.amberSoft }]}>
              <Text style={styles.menuEmoji}>🔔</Text>
            </View>
            <View style={styles.menuBody}>
              <Text style={styles.menuLabel}>Fast end reminder</Text>
              <Text style={styles.menuHint}>Device notification when a fast finishes</Text>
            </View>
            <Switch value={reminders} onValueChange={setReminders} />
          </View>
          <Pressable accessibilityRole="button" style={styles.menuRow} onPress={exportData}>
            <View style={[styles.menuIcon, { backgroundColor: colors.greenSoft }]}>
              <Text style={styles.menuEmoji}>📤</Text>
            </View>
            <Text style={styles.menuLabel}>Export my data</Text>
            <Ionicons name="chevron-forward" size={17} color={colors.faint} />
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.menuRow} onPress={confirmReset}>
            <View style={[styles.menuIcon, { backgroundColor: colors.redSoft }]}>
              <Text style={styles.menuEmoji}>🗑️</Text>
            </View>
            <Text style={[styles.menuLabel, { color: colors.red }]}>Reset all data</Text>
            <Ionicons name="chevron-forward" size={17} color={colors.faint} />
          </Pressable>
        </Card>

        <View style={styles.offlineCard}>
          <Ionicons name="cloud-offline-outline" size={18} color={colors.primary} />
          <Text style={styles.offlineText}>
            100% offline. Your data never leaves this device — no account, no servers.
          </Text>
        </View>
      </ScrollView>

      <Sheet visible={nameSheet} title="Your name" onClose={() => setNameSheet(false)}>
        <TextInput
          style={styles.nameInput}
          value={nameDraft}
          onChangeText={setNameDraft}
          placeholder="Enter your name"
          placeholderTextColor={colors.faint}
          autoCapitalize="words"
        />
        <Button
          label="Save"
          onPress={async () => {
            await saveProfile({ ...profile, displayName: nameDraft.trim() || 'Faster' });
            setNameSheet(false);
          }}
        />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 18 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 12 },
  scroll: { paddingBottom: 32 },
  heroCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  heroBody: { flex: 1 },
  heroName: { fontSize: 17, fontWeight: '800', color: colors.text },
  heroDetail: { fontSize: 12.5, color: colors.muted, marginTop: 3 },
  menuCard: { paddingVertical: 8 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuEmoji: { fontSize: 17 },
  menuBody: { flex: 1 },
  menuLabel: { fontSize: 14.5, fontWeight: '600', color: colors.text, flex: 0 },
  menuHint: { fontSize: 11.5, color: colors.muted, marginTop: 2 },
  menuValue: { fontSize: 13.5, fontWeight: '700', color: colors.primary, marginLeft: 'auto' },
  offlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.lavender,
    borderRadius: radii.card,
    padding: 16,
    marginTop: 14,
  },
  offlineText: { flex: 1, fontSize: 12.5, color: colors.textSecondary, lineHeight: 18 },
  nameInput: {
    backgroundColor: colors.chip,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    marginBottom: 16,
  },
});
