import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme, Theme } from '../config/theme';
import { radii, spacing } from '../config/theme/shared';

export interface ProgressStepsProps {
  step: number; // 1-indexed
  total: number;
  label: string; // e.g. "INSPECTION" — shown after "STEP X OF Y ·"
}

/** Segmented horizontal progress bar + eyebrow label, exactly as seen across the multi-step flows. */
export function ProgressSteps({ step, total, label }: ProgressStepsProps) {
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);

  return (
    <View>
      <View style={styles.track}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[styles.segment, i < step ? dynamic.segmentFilled : dynamic.segmentEmpty]}
          />
        ))}
      </View>
      <Text style={[theme.type.eyebrow, styles.label, dynamic.label]}>
        STEP {step} OF {total} · {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', gap: 6 },
  segment: { flex: 1, height: 4, borderRadius: radii.pill },
  label: { marginTop: spacing.sm },
});

function dynamicStyles(theme: Theme) {
  return {
    segmentFilled: { backgroundColor: theme.colors.primary },
    segmentEmpty: { backgroundColor: theme.colors.border },
    label: { color: theme.colors.primary },
  };
}
