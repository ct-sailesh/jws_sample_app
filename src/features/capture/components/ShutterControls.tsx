import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { cameraColors } from '../../../config/theme';
import { radii, type } from '../../../config/theme/shared';
import { AlignmentStatus } from '../hooks/useDeviceAlignment';
import { FlashIcon } from '../../../components/icons';

export interface ShutterControlsProps {
  takenCount: number;
  status: AlignmentStatus;
  autoCaptureProgress: number; // 0-1, only meaningful while counting down
  flashOn: boolean;
  onToggleFlash: () => void;
  onShutterPress: () => void;
}

const RING_SIZE = 78;
const RING_RADIUS = 33;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ringColor(status: AlignmentStatus) {
  if (status === 'aligned') return cameraColors.skeletonAligned;
  if (status === 'aligning') return cameraColors.skeletonAligning;
  return cameraColors.shutterRing;
}

export function ShutterControls({
  takenCount,
  status,
  autoCaptureProgress,
  flashOn,
  onToggleFlash,
  onShutterPress,
}: ShutterControlsProps) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: status === 'aligned' ? 1.06 : 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }, [status, scale]);

  const dashOffset = CIRCUMFERENCE * (1 - autoCaptureProgress);

  return (
    <View style={styles.row}>
      <View style={styles.counterBadge}>
        <Text style={[type.monoLg, styles.counterText]}>{takenCount}</Text>
      </View>

      <Pressable onPress={onShutterPress} hitSlop={16}>
        <Animated.View style={[styles.ringWrap, { transform: [{ scale }] }]}>
          <Svg width={RING_SIZE} height={RING_SIZE} style={StyleSheet.absoluteFill}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth={3}
              fill="none"
            />
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke={ringColor(status)}
              strokeWidth={3}
              fill="none"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </Svg>
          <View style={styles.shutterCore} />
        </Animated.View>
      </Pressable>

      <Pressable onPress={onToggleFlash} style={styles.flashButton} hitSlop={12}>
        <FlashIcon on={flashOn} color={flashOn ? cameraColors.accentAmber : cameraColors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  counterBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: { color: cameraColors.text },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterCore: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: cameraColors.shutterRing,
  },
  flashButton: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
