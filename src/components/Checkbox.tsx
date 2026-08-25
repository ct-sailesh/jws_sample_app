import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, Theme } from '../config/theme';
import { radii, spacing } from '../config/theme/shared';
import { CheckIcon } from './icons';

export function Checkbox({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);

  return (
    <Pressable onPress={onToggle} style={[styles.card, dynamic.card]}>
      <View style={[styles.box, dynamic.box, checked && dynamic.boxChecked]}>
        {checked ? <CheckIcon color={theme.colors.surface} size={14} /> : null}
      </View>
      <Text style={[theme.type.bodySm, styles.label, dynamic.label]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  label: { flex: 1 },
});

function dynamicStyles(theme: Theme) {
  return {
    card: {
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceAlt,
    },
    box: { borderColor: theme.colors.ink300 },
    boxChecked: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    label: { color: theme.colors.ink600 },
  };
}
