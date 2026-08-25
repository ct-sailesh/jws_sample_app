import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme, Theme } from '../config/theme';
import { radii, spacing } from '../config/theme/shared';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  elevated?: boolean;
}

/** White rounded surface on the app's light-grey background — the base unit of the prototype's UI. */
export function Card({ children, style, padded = true, elevated = false }: CardProps) {
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);

  return (
    <View
      style={[
        styles.card,
        dynamic.card,
        padded && styles.padded,
        elevated ? theme.shadows.raised : theme.shadows.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xxl,
    borderWidth: 1,
  },
  padded: { padding: spacing.lg },
});

function dynamicStyles(theme: Theme) {
  return {
    card: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
  };
}
