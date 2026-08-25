import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme, Theme } from '../config/theme';
import { spacing } from '../config/theme/shared';
import { ChevronRightIcon } from './icons';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  trailingText?: string;
  onPress?: () => void;
  leading?: React.ReactNode;
  destructive?: boolean;
  showChevron?: boolean;
  style?: ViewStyle;
}

/** Title + subtitle row with trailing chevron — the workhorse list item across Garage/Account. */
export function ListRow({
  title,
  subtitle,
  trailingText,
  onPress,
  leading,
  destructive,
  showChevron = true,
  style,
}: ListRowProps) {
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, dynamic.row, pressed && onPress && dynamic.pressed, style]}
    >
      {leading}
      <View style={styles.textCol}>
        <Text style={[theme.type.bodyStrong, destructive && dynamic.destructive]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[theme.type.bodySm, dynamic.subtitle]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailingText ? (
        <Text style={[theme.type.bodySm, dynamic.subtitle]} numberOfLines={1}>
          {trailingText}
        </Text>
      ) : null}
      {showChevron && onPress ? <ChevronRightIcon /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
  },
  textCol: { flex: 1, gap: 2 },
});

function dynamicStyles(theme: Theme) {
  return {
    row: { backgroundColor: theme.colors.surface },
    pressed: { backgroundColor: theme.colors.surfaceAlt },
    subtitle: { color: theme.colors.ink500 },
    destructive: { color: theme.colors.danger },
  };
}
