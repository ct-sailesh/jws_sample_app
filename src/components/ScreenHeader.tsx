import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, Theme } from '../config/theme';
import { spacing } from '../config/theme/shared';
import { ChevronLeftIcon } from './icons';

export interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

/** Plain white header with an optional back chevron — used on most non-tab screens. */
export function ScreenHeader({ title, subtitle, onBack, right }: ScreenHeaderProps) {
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.backButton} hitSlop={10}>
          <ChevronLeftIcon />
        </Pressable>
      ) : (
        <View style={styles.backSpacer} />
      )}
      {title ? (
        <View style={styles.titleCol}>
          <Text style={theme.type.h3} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[theme.type.bodySm, styles.subtitle, dynamic.subtitle]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : (
        <View style={{ flex: 1 }} />
      )}
      {right ?? <View style={styles.backSpacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  backButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'flex-start' },
  backSpacer: { width: 32 },
  titleCol: { flex: 1 },
  subtitle: { marginTop: 1 },
});

function dynamicStyles(theme: Theme) {
  return {
    subtitle: { color: theme.colors.ink500 },
  };
}
