import React, { useCallback, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SplashAnimation } from './src/components/SplashAnimation';
import { ThemeProvider } from './src/config/theme';
import { InspectionResultProvider } from './src/state/InspectionResultContext';
import { VehicleSessionProvider } from './src/state/VehicleSessionContext';

/**
 * Unlike the Expo original, there's no `useFonts()`/`expo-splash-screen`
 * dance here: bare RN fonts are native resources linked into the app at
 * build time (see `react-native.config.js` + the README), so they're
 * already available the moment this component renders — no async load
 * gate needed before showing real UI. `SplashAnimation` still plays once,
 * for the same brand moment, it just isn't blocking on anything.
 */
function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashFinish = useCallback(() => setShowSplash(false), []);

  if (showSplash) {
    return <SplashAnimation onFinish={handleSplashFinish} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <VehicleSessionProvider>
          <InspectionResultProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </InspectionResultProvider>
        </VehicleSessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
