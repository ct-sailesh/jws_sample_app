import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme, Theme } from '../config/theme';

export function Divider({ style }: { style?: ViewStyle }) {
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);

  return <View style={[styles.line, dynamic.line, style]} />;
}

const styles = StyleSheet.create({
  line: { height: 1 },
});

function dynamicStyles(theme: Theme) {
  return {
    line: { backgroundColor: theme.colors.border },
  };
}
