import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../constants/theme';

interface TabBarProps {
  state: { routes: { key: string; name: string }[]; index: number };
  navigation?: any;
}

const TABS = [
  { name: 'index', label: 'Home', href: '/(tabs)', active: 'home', inactive: 'home-outline' },
  { name: 'analytics', label: 'Analytics', href: '/analytics', active: 'stats-chart', inactive: 'stats-chart-outline' },
  { name: 'explore', label: 'Explore', href: '/explore', active: 'book', inactive: 'book-outline' },
  { name: 'profile', label: 'Profile', href: '/profile', active: 'person', inactive: 'person-outline' },
] as const;

function isTabActive(pathname: string, tab: (typeof TABS)[number]) {
  if (tab.name === 'index') {
    return pathname === '/(tabs)' || pathname === '/' || pathname === '';
  }
  return pathname === tab.href || pathname.startsWith(tab.href + '/');
}

export function TabBar({ state }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 8 }]} pointerEvents="box-none">
      {TABS.map((tab) => {
        const focused = isTabActive(pathname, tab);
        const onPress = () => {
          if (!focused) router.push(tab.href);
        };
        return (
          <Pressable
            key={tab.name}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            onPress={onPress}
            style={styles.item}
          >
            <Ionicons
              name={focused ? tab.active : tab.inactive}
              size={22}
              color={focused ? colors.primary : colors.faint}
            />
            <Text style={[styles.label, focused && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.lavender,
    flexDirection: 'row',
    paddingTop: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.faint,
  },
  labelActive: {
    color: colors.primary,
  },
});
