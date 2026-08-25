import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme, Theme } from '../config/theme';
import { radii, spacing } from '../config/theme/shared';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps {
  label: string;
  onPress?: (e: GestureResponderEvent) => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

/**
 * Primary/secondary/ghost buttons matching the prototype's pill-ish, bold,
 * high-contrast blue CTA and the outlined secondary style seen throughout
 * (e.g. "Check My Car Value", "Find a dealer", "Download report").
 *
 * Canonical example for the styles/dynamic-styles split used to make every
 * component theme-aware: `styles` stays a static, module-scope
 * `StyleSheet.create()` for pure-layout keys (height, padding, flex, gap —
 * the majority here); `dynamicStyles(theme)` is a plain function (NOT
 * wrapped in `StyleSheet.create`) for the colour-bearing subset only,
 * recomputed via `useMemo` when the theme changes. JSX just picks from
 * both objects.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  fullWidth = true,
  icon,
  style,
  testID,
}: ButtonProps) {
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);

  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isGhost = variant === 'ghost';
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      testID={testID}
      onPress={disabled || loading ? undefined : onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        isPrimary && dynamic.primary,
        isSecondary && dynamic.secondary,
        isGhost && dynamic.ghost,
        isDanger && dynamic.danger,
        pressed && !disabled && dynamic.pressed,
        disabled && dynamic.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary || isDanger ? theme.colors.surface : theme.colors.primary} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text
            style={[
              theme.type.button,
              isPrimary && dynamic.primaryText,
              isSecondary && dynamic.secondaryText,
              isGhost && dynamic.ghostText,
              isDanger && dynamic.dangerText,
              disabled && dynamic.disabledText,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  fullWidth: { width: '100%' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});

function dynamicStyles(theme: Theme) {
  return {
    primary: { backgroundColor: theme.colors.primary },
    primaryText: { color: theme.colors.surface },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    secondaryText: { color: theme.colors.primary },
    ghost: { backgroundColor: 'transparent' },
    ghostText: { color: theme.colors.primary },
    danger: { backgroundColor: theme.colors.danger },
    dangerText: { color: theme.colors.surface },
    pressed: { opacity: 0.85, transform: [{ scale: 0.995 }] },
    disabled: { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border },
    disabledText: { color: theme.colors.ink400 },
  };
}
