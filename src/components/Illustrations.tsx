import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { useTheme, Theme } from '../config/theme';
import { radii, spacing } from '../config/theme/shared';

/**
 * Flat geometric illustrations in the prototype's style: a soft blue-tinted
 * rounded panel containing one or two simple shapes (never photographic),
 * always paired with a small caption underneath describing the placeholder.
 */

function Panel({ children, caption }: { children: React.ReactNode; caption?: string }) {
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);
  return (
    <View style={[styles.panel, dynamic.panel]}>
      <View style={styles.panelInner}>{children}</View>
      {caption ? (
        <Text style={[theme.type.caption, dynamic.caption]} numberOfLines={1}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

/** Owner + vehicle geometric mark used on the Welcome screen hero. */
export function OwnerVehicleIllustration() {
  const { theme } = useTheme();
  return (
    <Panel caption="Flat geometric owner-and-vehicle illustration">
      <Svg width={140} height={110} viewBox="0 0 140 110">
        <Rect x={22} y={18} width={96} height={40} rx={18} fill={theme.colors.primary} />
        <Circle cx={70} cy={78} r={20} fill={theme.colors.warningDark} opacity={0.85} />
      </Svg>
    </Panel>
  );
}

/** Sound-wave / activity mark used on the AI Analysis screen. */
export function AnalysingIllustration() {
  const { theme } = useTheme();
  const bars = [26, 46, 60, 40, 24];
  return (
    <Panel>
      <View style={styles.barsRow}>
        {bars.map((h, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              { height: h, backgroundColor: i === 2 ? theme.colors.primary : theme.colors.primaryHalo },
            ]}
          />
        ))}
      </View>
    </Panel>
  );
}

/** Generic vehicle-photo placeholder used inside cards (garage, dealer catalogue). */
export function VehiclePhotoPlaceholder({ label = 'vehicle photo' }: { label?: string }) {
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);
  return (
    <View style={[styles.photoPlaceholder, dynamic.photoPlaceholder]}>
      <Svg width={64} height={40} viewBox="0 0 64 40">
        <Rect x={4} y={16} width={56} height={16} rx={8} fill={theme.colors.ink300} />
        <Circle cx={18} cy={34} r={5} fill={theme.colors.ink400} />
        <Circle cx={46} cy={34} r={5} fill={theme.colors.ink400} />
      </Svg>
      <Text style={[theme.type.caption, { color: theme.colors.ink400, marginTop: 4 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: radii.huge,
    borderWidth: 1,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  panelInner: { alignItems: 'center', justifyContent: 'center' },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 60 },
  bar: { width: 10, borderRadius: radii.pill },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingVertical: spacing.lg,
  },
});

function dynamicStyles(theme: Theme) {
  return {
    panel: { backgroundColor: theme.colors.primarySofter, borderColor: theme.colors.primaryHalo },
    caption: { color: theme.colors.ink500 },
    photoPlaceholder: { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border },
  };
}
