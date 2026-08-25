import React, { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';
import { cameraColors } from '../../../config/theme';
import { radii, spacing, type } from '../../../config/theme/shared';
import { SparkleIcon } from '../../../components/icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/** Persistent bottom tip strip, collapsible via the chevron — mirrors the prototype's capture-screen tip bar. */
export function CaptureTipBar({ tip }: { tip: string }) {
  const [expanded, setExpanded] = useState(true);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  return (
    <Pressable onPress={toggle} style={styles.bar}>
      <View style={styles.iconTile}>
        <SparkleIcon color={cameraColors.accentAmber} size={14} />
      </View>
      {expanded ? (
        <Text style={[type.bodySm, styles.text]} numberOfLines={2}>
          {tip}
        </Text>
      ) : (
        <Text style={[type.bodySm, styles.text]} numberOfLines={1}>
          Tip
        </Text>
      )}
      <Text style={styles.chevron}>{expanded ? '︿' : '﹀'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.lg,
    padding: spacing.sm,
  },
  iconTile: {
    width: 26,
    height: 26,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(242,197,114,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  text: { flex: 1, color: cameraColors.textDim },
  chevron: { color: cameraColors.textDim, fontSize: 12, marginTop: 2 },
});
