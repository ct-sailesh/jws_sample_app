import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';
import { cameraColors } from '../../../config/theme';
import { SkeletonVariant } from '../../../config/content/screens/capture.angles';
import { AlignmentStatus } from '../hooks/useDeviceAlignment';

export interface PoseOverlayProps {
  variant: SkeletonVariant;
  status: AlignmentStatus;
  confidence: number; // 0-1
  size?: number;
}

function colorForStatus(status: AlignmentStatus) {
  switch (status) {
    case 'aligned':
      return cameraColors.skeletonAligned;
    case 'aligning':
      return cameraColors.skeletonAligning;
    default:
      return cameraColors.skeletonIdle;
  }
}

/** Side-profile car wireframe, optionally sheared to fake a 3/4 perspective. */
function CarSilhouette({ mirrored = false, shear = 0 }: { mirrored?: boolean; shear?: number }) {
  const scaleX = mirrored ? -1 : 1;
  return (
    <G transform={`matrix(${scaleX} 0 ${shear} 1 ${mirrored ? 220 : 0} 0)`}>
      <Path
        d="M18 150
           L34 150 L46 118 Q60 96 92 92 L150 88 Q176 88 190 106 L206 132
           L206 150
           L18 150 Z"
        fill="none"
      />
      {/* greenhouse / roofline glass, sitting above the beltline crease */}
      <Path d="M76 112 Q92 66 122 62 Q150 60 166 100" fill="none" />
      {/* side mirror hint near the front of the roofline */}
      <Path d="M164 98 Q172 92 180 97" fill="none" />
      {/* wheel-arch cutouts above the wheels */}
      <Path d="M38 150 A24 24 0 0 1 86 150" fill="none" />
      <Path d="M148 150 A24 24 0 0 1 196 150" fill="none" />
      <Circle cx={62} cy={150} r={20} />
      <Circle cx={172} cy={150} r={20} />
      <Line x1={70} y1={112} x2={150} y2={100} />
      {/* ground-contact line the car should sit on */}
      <Path d="M10 182 Q112 198 214 182 Q112 190 10 182 Z" fill="none" />
    </G>
  );
}

function FrontRearSilhouette({ rear = false }: { rear?: boolean }) {
  return (
    <G>
      {/* roofline / windshield arc with a flatter crown for a more realistic taper */}
      <Path d="M40 150 Q42 100 84 90 Q110 84 136 90 Q178 100 180 150" fill="none" />
      <Line x1={40} y1={150} x2={180} y2={150} />
      <Circle cx={62} cy={150} r={16} />
      <Circle cx={158} cy={150} r={16} />
      <Rect x={48} y={112} width={26} height={12} rx={6} />
      <Rect x={146} y={112} width={26} height={12} rx={6} />
      <Line x1={80} y1={98} x2={140} y2={98} />
      {/* subtle grille / bumper detail */}
      <Rect x={96} y={132} width={28} height={8} rx={2} />
      {!rear ? (
        <>
          {/* side mirror hints at the base corners of the roofline */}
          <Path d="M40 132 Q30 128 26 134" fill="none" />
          <Path d="M180 132 Q190 128 194 134" fill="none" />
        </>
      ) : null}
      {rear ? <Rect x={92} y={140} width={36} height={10} rx={2} /> : null}
      {/* ground-contact line the car should sit on */}
      <Path d="M14 182 Q110 196 206 182 Q110 190 14 182 Z" fill="none" />
    </G>
  );
}

function DashboardSilhouette() {
  return (
    <G>
      <Path d="M20 160 Q20 100 110 96 Q200 100 200 160" fill="none" />
      {/* instrument-cluster hood shading the main gauge */}
      <Path d="M40 140 Q40 104 70 104 Q100 104 100 140" fill="none" />
      <Circle cx={70} cy={140} r={26} />
      <Circle cx={70} cy={140} r={4} />
      <Line x1={70} y1={140} x2={70} y2={118} />
      {/* secondary smaller gauge */}
      <Circle cx={112} cy={146} r={12} />
      <Rect x={130} y={110} width={54} height={30} rx={6} />
      <Line x1={140} y1={125} x2={174} y2={125} />
    </G>
  );
}

function OdometerSilhouette() {
  return (
    <G>
      <Rect x={40} y={90} width={140} height={80} rx={14} />
      <Rect x={70} y={118} width={80} height={26} rx={4} />
      {/* digit dividers inside the display */}
      <Line x1={90} y1={118} x2={90} y2={144} />
      <Line x1={110} y1={118} x2={110} y2={144} />
      <Line x1={130} y1={118} x2={130} y2={144} />
      <Line x1={60} y1={158} x2={160} y2={158} />
      {/* bezel corner ticks for a more realistic cluster edge */}
      <Line x1={52} y1={102} x2={62} y2={102} />
      <Line x1={178} y1={102} x2={168} y2={102} />
    </G>
  );
}

function EngineBaySilhouette() {
  return (
    <G>
      <Rect x={24} y={70} width={172} height={110} rx={10} />
      <Circle cx={70} cy={120} r={22} />
      <Circle cx={70} cy={120} r={8} />
      <Rect x={116} y={98} width={60} height={44} rx={6} />
      {/* battery box and fluid reservoir for a busier, more realistic bay */}
      <Rect x={36} y={150} width={30} height={22} rx={4} />
      <Rect x={150} y={90} width={30} height={20} rx={4} />
      <Line x1={96} y1={110} x2={116} y2={110} />
      <Line x1={24} y1={150} x2={196} y2={150} />
    </G>
  );
}

function SeatSilhouette() {
  return (
    <G>
      {/* headrests */}
      <Rect x={54} y={68} width={30} height={20} rx={8} />
      <Rect x={142} y={68} width={30} height={20} rx={8} />
      <Path d="M40 170 L40 100 Q40 84 60 84 L96 84 Q112 84 112 100 L112 170" fill="none" />
      <Path d="M128 170 L128 100 Q128 84 148 84 L184 84 Q200 84 200 100 L200 170" fill="none" />
      {/* bolster / cushion seams */}
      <Path d="M48 160 Q76 150 104 160" fill="none" />
      <Path d="M136 160 Q164 150 192 160" fill="none" />
      <Line x1={40} y1={170} x2={200} y2={170} />
    </G>
  );
}

function BootSilhouette() {
  return (
    <G>
      <Path d="M30 165 L46 95 L194 95 L210 165 Z" fill="none" />
      <Line x1={46} y1={95} x2={46} y2={72} />
      <Line x1={194} y1={95} x2={194} y2={72} />
      <Line x1={46} y1={72} x2={194} y2={72} />
      {/* inward taper suggesting the trunk floor lip */}
      <Path d="M42 165 L52 150 L188 150 L198 165" fill="none" />
      {/* lid seam hints */}
      <Line x1={70} y1={95} x2={70} y2={84} />
      <Line x1={170} y1={95} x2={170} y2={84} />
    </G>
  );
}

function TyreSilhouette() {
  return (
    <G>
      <Circle cx={120} cy={130} r={54} />
      {/* rim bead separating tire sidewall from the wheel rim */}
      <Circle cx={120} cy={130} r={40} />
      <Circle cx={120} cy={130} r={24} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 120 + Math.cos(rad) * 30;
        const y1 = 130 + Math.sin(rad) * 30;
        const x2 = 120 + Math.cos(rad) * 38;
        const y2 = 130 + Math.sin(rad) * 38;
        return <Line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
      {/* valve stem nub */}
      <Line x1={120} y1={90} x2={120} y2={80} />
    </G>
  );
}

function Variant({ variant }: { variant: SkeletonVariant }) {
  switch (variant) {
    case 'car-front':
      return <FrontRearSilhouette />;
    case 'car-rear':
      return <FrontRearSilhouette rear />;
    case 'car-side-left':
      return <CarSilhouette />;
    case 'car-side-right':
      return <CarSilhouette mirrored />;
    case 'car-3q-front-left':
      return <CarSilhouette shear={-0.22} />;
    case 'car-3q-rear-left':
      return <CarSilhouette shear={0.22} />;
    case 'car-3q-front-right':
      return <CarSilhouette mirrored shear={-0.22} />;
    case 'car-3q-rear-right':
      return <CarSilhouette mirrored shear={0.22} />;
    case 'dashboard':
      return <DashboardSilhouette />;
    case 'odometer':
      return <OdometerSilhouette />;
    case 'engine-bay':
      return <EngineBaySilhouette />;
    case 'seat':
      return <SeatSilhouette />;
    case 'boot':
      return <BootSilhouette />;
    case 'tyre':
      return <TyreSilhouette />;
    default:
      return null;
  }
}

/**
 * The pose-angle overlay: a wireframe "skeleton" of the shot the guide
 * wants, drawn over the live camera preview. Colour and opacity respond to
 * `useDeviceAlignment`'s confidence signal so the guide visibly comes alive
 * as the phone settles into a good position.
 */
export function PoseOverlay({ variant, status, confidence, size = 240 }: PoseOverlayProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status !== 'aligning') {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [status, pulse]);

  const strokeColor = colorForStatus(status);
  const baseOpacity = 0.5 + confidence * 0.5;

  return (
    <View pointerEvents="none" style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View
        style={{
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [baseOpacity, Math.min(1, baseOpacity + 0.25)] }),
        }}
      >
        <Svg width={size} height={size} viewBox="0 0 240 240">
          <G stroke={strokeColor} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Variant variant={variant} />
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
