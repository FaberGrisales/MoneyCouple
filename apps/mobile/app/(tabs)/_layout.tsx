import { Tabs } from 'expo-router';

import { BottomTabBar } from '../../components/shared/BottomTabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <BottomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="analytics" options={{ title: 'Análisis' }} />
      <Tabs.Screen name="add" options={{ title: '' }} />
      <Tabs.Screen name="wallets" options={{ title: 'Carteras' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
