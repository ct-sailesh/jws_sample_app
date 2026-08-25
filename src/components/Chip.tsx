import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme, Theme } from '../config/theme';
import { radii, spacing } from '../config/theme/shared';

export type ChipTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

export interface ChipProps {
  label: string;
  tone?: ChipTone;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

/** Pill-shaped badge/chip — used for status labels, AI-estimate tags, checklist tags. */
export function Chip({ label, tone = 'neutral', icon, style }: ChipProps) {
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);
  const t = dynamic.toneStyles[tone];

  return (
    <View style={[styles.chip, { backgroundColor: t.bg }, style]}>
      {icon}
      <Text style={[theme.type.bodySmStrong, { color: t.text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
});

function dynamicStyles(theme: Theme) {
  const toneStyles: Record<ChipTone, { bg: string; text: string }> = {
    neutral: { bg: theme.colors.surfaceAlt, text: theme.colors.ink600 },
    primary: { bg: theme.colors.primarySoft, text: theme.colors.primary },
    success: { bg: theme.colors.successSoft, text: theme.colors.success },
    warning: { bg: theme.colors.warningSoft, text: theme.colors.warningDark },
    danger: { bg: theme.colors.dangerSoft, text: theme.colors.dangerStrong },
  };
  return { toneStyles };
}
