import { Tabs } from 'expo-router';

import { TabBar } from '../../components/TabBar';
import { colors } from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'home' }} />
      <Tabs.Screen name="analytics" options={{ title: 'analytics' }} />
      <Tabs.Screen name="explore" options={{ title: 'explore' }} />
      <Tabs.Screen name="profile" options={{ title: 'profile' }} />
    </Tabs>
  );
}
