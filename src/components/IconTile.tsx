import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme, Theme } from '../config/theme';
import { radii } from '../config/theme/shared';
import { ChipTone } from './Chip';

export interface IconTileProps {
  children: React.ReactNode;
  tone?: ChipTone;
  size?: number;
}

/** The small rounded-square icon swatch used next to feature rows (₹ / ✦ / ✓ / ⇄). */
export function IconTile({ children, tone = 'primary', size = 36 }: IconTileProps) {
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);

  return (
    <View
      style={[
        styles.tile,
        { backgroundColor: dynamic.toneBg[tone], width: size, height: size, borderRadius: radii.lg },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function dynamicStyles(theme: Theme) {
  const toneBg: Record<ChipTone, string> = {
    neutral: theme.colors.surfaceAlt,
    primary: theme.colors.primarySoft,
    success: theme.colors.successSoft,
    warning: theme.colors.warningSoft,
    danger: theme.colors.dangerSoft,
  };
  return { toneBg };
}
