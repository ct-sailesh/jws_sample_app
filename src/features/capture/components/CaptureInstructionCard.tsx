import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cameraColors } from '../../../config/theme';
import { radii, spacing, type } from '../../../config/theme/shared';

export interface CaptureInstructionCardProps {
  title: string;
  instruction: string;
  eyebrow?: string;
}

/** Semi-transparent instruction card overlaid on the viewfinder ("NEXT PHOTO / Front / Stand about..."). */
export function CaptureInstructionCard({
  title,
  instruction,
  eyebrow = 'NEXT PHOTO',
}: CaptureInstructionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={[type.eyebrowSm, styles.eyebrow]}>{eyebrow}</Text>
      <Text style={[type.h2, styles.title]}>{title}</Text>
      <Text style={[type.body, styles.instruction]}>{instruction}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: cameraColors.panel,
    borderRadius: radii.huge,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: 6,
  },
  eyebrow: { color: cameraColors.textDim },
  title: { color: cameraColors.text, textAlign: 'center' },
  instruction: { color: cameraColors.textDim, textAlign: 'center' },
});
