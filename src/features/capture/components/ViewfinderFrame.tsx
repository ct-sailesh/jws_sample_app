import React from 'react';
import { StyleSheet, View } from 'react-native';
import { cameraColors } from '../../../config/theme';

const BRACKET = 28;
const THICKNESS = 3;

/** The four corner brackets seen on the guided-capture screen, framing the shot area. */
export function ViewfinderFrame({ tint }: { tint?: string }) {
  const color = tint ?? cameraColors.bracket;
  return (
    <View style={styles.fill} pointerEvents="none">
      <View style={[styles.corner, styles.topLeft, { borderColor: color }]} />
      <View style={[styles.corner, styles.topRight, { borderColor: color }]} />
      <View style={[styles.corner, styles.bottomLeft, { borderColor: color }]} />
      <View style={[styles.corner, styles.bottomRight, { borderColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFill },
  corner: { position: 'absolute', width: BRACKET, height: BRACKET },
  topLeft: {
    top: 0,
    left: 0,
    borderLeftWidth: THICKNESS,
    borderTopWidth: THICKNESS,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderRightWidth: THICKNESS,
    borderTopWidth: THICKNESS,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderLeftWidth: THICKNESS,
    borderBottomWidth: THICKNESS,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderRightWidth: THICKNESS,
    borderBottomWidth: THICKNESS,
    borderBottomRightRadius: 8,
  },
});
