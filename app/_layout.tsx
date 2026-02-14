import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppTheme } from '@/theme/useAppTheme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { isDark, colors } = useAppTheme();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.header} />
      <Stack screenOptions={{ headerShown: false, statusBarStyle: isDark ? 'light' : 'dark', statusBarColor: colors.header }} />
    </GestureHandlerRootView>
  );
}
