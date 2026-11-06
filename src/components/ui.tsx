import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, shadow } from '../constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'dark' | 'ghost' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'primary', disabled, loading, style }: ButtonProps) {
  const bg =
    variant === 'primary' ? colors.primary : variant === 'dark' ? '#241C48' : variant === 'outline' ? colors.card : 'transparent';
  const fg =
    variant === 'primary' || variant === 'dark' ? '#FFFFFF' : variant === 'outline' ? colors.primary : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg },
        variant === 'outline' && styles.outline,
        variant !== 'primary' && variant !== 'dark' && variant !== 'outline' && styles.ghost,
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.label, { color: fg }]} numberOfLines={1}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export function Card({ children, style, onPress }: CardProps) {
  const content = (
    <View style={[styles.card, shadow, style]}>{children}</View>
  );
  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        {content}
      </Pressable>
    );
  }
  return content;
}

interface CardTitleProps {
  title: string;
  right?: React.ReactNode;
}

export function CardHeader({ title, right }: CardTitleProps) {
  return (
    <View style={styles.headerRow}>
      <Text style={styles.headerTitle}>{title}</Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.lavenderAlt,
  },
  ghost: {
    borderWidth: 0,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
});
