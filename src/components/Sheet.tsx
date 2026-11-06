import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '../constants/theme';

interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

/** Simple centered dialog card, matching the reference pickers. */
export function Sheet({ visible, title, onClose, children }: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable accessibilityRole="button" onPress={onClose} hitSlop={12}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

interface ChipRowProps<T extends string | number | boolean> {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
}

export function ChipRow<T extends string | number | boolean>({ options, selected, onSelect }: ChipRowProps<T>) {
  return (
    <View style={styles.chipRow}>
      {options.map((option, i) => {
        const active = option.value === selected;
        return (
          <Pressable
            key={String(option.value) + i}
            accessibilityRole="radio"
            onPress={() => onSelect(option.value)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

interface SwitchProps {
  value: boolean;
  onValueChange: (v: boolean) => void;
}

export function Switch({ value, onValueChange }: SwitchProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={[styles.switch, value && styles.switchOn]}
    >
      <View style={[styles.switchKnob, value && styles.switchKnobOn]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(23,20,50,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  close: {
    fontSize: 16,
    color: colors.muted,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.lavender,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipLabelActive: {
    color: '#FFFFFF',
  },
  switch: {
    width: 52,
    height: 30,
    borderRadius: radii.pill,
    backgroundColor: colors.track,
    padding: 3,
    justifyContent: 'center',
  },
  switchOn: {
    backgroundColor: colors.primary,
  },
  switchKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  switchKnobOn: {
    alignSelf: 'flex-end',
  },
});
