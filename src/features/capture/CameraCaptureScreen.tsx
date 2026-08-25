import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import RNHapticFeedback from 'react-native-haptic-feedback';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { cameraColors } from '../../config/theme';
import { spacing, type } from '../../config/theme/shared';
import { cameraScreenContent } from '../../config/content/screens/capture.cameraScreen';
import type { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { CaptureHeader } from './components/CaptureHeader';
import { CaptureInstructionCard } from './components/CaptureInstructionCard';
import { ViewfinderFrame } from './components/ViewfinderFrame';
import { PoseOverlay } from './components/PoseOverlay';
import { ShutterControls } from './components/ShutterControls';
import { CaptureTipBar } from './components/CaptureTipBar';
import { useDeviceAlignment } from './hooks/useDeviceAlignment';
import { CaptureSession } from './hooks/useCaptureSession';

const AUTO_CAPTURE_MS = cameraScreenContent.autoCaptureMs;
const INSTRUCTION_VISIBLE_MS = cameraScreenContent.instructionVisibleMs;

export function CameraCaptureScreen({
  session,
  onShowGallery,
}: {
  session: CaptureSession;
  /** Called when the user presses back mid-shoot (not on the very first angle) — takes them to the review gallery instead of stepping back to re-shoot the previous angle one at a time. */
  onShowGallery: () => void;
}) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [showInstruction, setShowInstruction] = useState(true);
  const [autoCaptureProgress, setAutoCaptureProgress] = useState(0);
  const flashFx = useRef(new Animated.Value(0)).current;

  const { currentShot } = session;

  const alignment = useDeviceAlignment(currentShot.targetPitchDeg, !capturing);

  // Re-show the instruction card whenever the active angle changes.
  useEffect(() => {
    setShowInstruction(true);
    const t = setTimeout(() => setShowInstruction(false), INSTRUCTION_VISIBLE_MS);
    return () => clearTimeout(t);
  }, [currentShot.id]);

  const runCaptureFeedback = useCallback(() => {
    try {
      RNHapticFeedback.trigger('impactMedium');
    } catch {
      // Haptics unsupported on this device — never let feedback block capture.
    }
    flashFx.setValue(1);
    Animated.timing(flashFx, { toValue: 0, duration: 220, useNativeDriver: true }).start();
  }, [flashFx]);

  const handleCapture = useCallback(async () => {
    if (capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current?.takePhoto();
      runCaptureFeedback();
      if (photo?.path) {
        // VisionCamera returns a bare filesystem path — `Image`/`file://` consumers downstream
        // (review grid, health report) expect a URI, so normalize it once, here.
        session.recordCapture(`file://${photo.path}`);
      }
    } catch {
      // Camera not ready / no device (e.g. running in a simulator without a
      // camera) — allow the flow to continue in the prototype rather than
      // getting stuck.
      runCaptureFeedback();
      session.recordCapture(cameraScreenContent.fallbackCaptureUri);
    } finally {
      setCapturing(false);
      setAutoCaptureProgress(0);
    }
  }, [capturing, runCaptureFeedback, session]);

  // Auto-capture: once the guide reports a sustained "aligned" state, fill a
  // progress ring and fire the shutter automatically. Any manual tap always
  // works too — this is an assist, never a gate.
  useEffect(() => {
    if (alignment.status !== 'aligned' || capturing) {
      setAutoCaptureProgress(0);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / AUTO_CAPTURE_MS);
      setAutoCaptureProgress(progress);
      if (progress >= 1) {
        clearInterval(interval);
        handleCapture();
      }
    }, 40);
    return () => clearInterval(interval);
  }, [alignment.status, capturing, handleCapture]);

  if (!hasPermission) {
    return (
      <View style={[styles.dark, styles.permissionWrap]}>
        <Text style={[type.h2, styles.permissionTitle]}>{cameraScreenContent.permissionDeniedTitle}</Text>
        <Text style={[type.body, styles.permissionBody]}>{cameraScreenContent.permissionDeniedBody}</Text>
        <Button label={cameraScreenContent.allowAccessCta.label} onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.dark}>
      {device ? (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive
          photo
          torch={flashOn ? 'on' : 'off'}
        />
      ) : null}
      <Animated.View pointerEvents="none" style={[styles.flashOverlay, { opacity: flashFx }]} />

      <View style={styles.overlayColumn}>
        <CaptureHeader
          title={currentShot.title}
          index={currentShot.index}
          total={session.total}
          onBack={() => (session.currentIndex === 0 ? navigation.goBack() : onShowGallery())}
        />

        <View style={styles.viewfinder}>
          <ViewfinderFrame />
          <PoseOverlay variant={currentShot.skeleton} status={alignment.status} confidence={alignment.confidence} />
          {showInstruction ? (
            <View style={styles.instructionWrap}>
              <CaptureInstructionCard title={currentShot.title} instruction={currentShot.instruction} />
            </View>
          ) : null}
        </View>

        <View style={styles.bottomBlock}>
          <ShutterControls
            takenCount={session.shots.filter((s) => s.uri).length}
            status={alignment.status}
            autoCaptureProgress={autoCaptureProgress}
            flashOn={flashOn}
            onToggleFlash={() => setFlashOn((v) => !v)}
            onShutterPress={handleCapture}
          />
          <CaptureTipBar tip={currentShot.instruction} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dark: { flex: 1, backgroundColor: cameraColors.background },
  overlayColumn: { flex: 1, justifyContent: 'space-between' },
  viewfinder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  instructionWrap: { position: 'absolute', bottom: spacing.xl, left: spacing.lg, right: spacing.lg },
  bottomBlock: { padding: spacing.lg, gap: spacing.md },
  flashOverlay: { ...StyleSheet.absoluteFill, backgroundColor: '#fff' },
  permissionWrap: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  permissionTitle: { color: cameraColors.text, textAlign: 'center' },
  permissionBody: { color: cameraColors.textDim, textAlign: 'center' },
});
