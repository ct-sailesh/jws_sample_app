import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cameraColors } from '../../../config/theme';
import { spacing, type } from '../../../config/theme/shared';
import { BackArrowIcon } from '../../../components/icons';

export function CaptureHeader({
  title,
  index,
  total,
  onBack,
}: {
  title: string;
  index: number;
  total: number;
  onBack: () => void;
}) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack} style={styles.backButton} hitSlop={10}>
        <BackArrowIcon />
      </Pressable>
      <Text style={[type.bodyStrong, styles.title]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[type.mono, styles.counter]}>
        {index} of {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: cameraColors.textDim },
  counter: { color: cameraColors.textDim, minWidth: 56, textAlign: 'right' },
});
