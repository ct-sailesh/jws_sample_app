import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Theme, cameraColors } from '../config/theme';

export interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  dark?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

/** Standard screen chrome: safe area + background colour + optional scroll/padding. */
export function Screen({
  children,
  scroll = false,
  padded = true,
  style,
  contentStyle,
  dark = false,
  edges,
}: ScreenProps) {
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);
  const bg = dark ? cameraColors.background : dynamic.bg.backgroundColor;

  if (scroll) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: bg }, style]} edges={edges}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[padded && styles.padded, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: bg }, style]} edges={edges}>
      <View style={[styles.flex, padded && styles.padded, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { padding: 20, gap: 16 },
});

function dynamicStyles(theme: Theme) {
  return {
    bg: { backgroundColor: theme.colors.background },
  };
}
