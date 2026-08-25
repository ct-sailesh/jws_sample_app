import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { AnalysingIllustration } from '../../components/Illustrations';
import { checklistTags } from '../../mocks/data';
import { useTheme, Theme } from '../../config/theme';
import { radii, spacing } from '../../config/theme/shared';
import { useConfigAction } from '../../config/actions';
import { aiAnalysisContent } from '../../config/content/screens/valuation.aiAnalysis';
import { useInspectionResult } from '../../state/InspectionResultContext';
import type { RootStackParamList } from '../../navigation/types';

// Stays a stable module-level constant, unchanged — the perceived-progress
// animation's own effect intentionally excludes it from its deps.
const ANALYSIS_DURATION_MS = aiAnalysisContent.durationMs;

export function AIAnalysisScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AIAnalysis'>>();
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);
  const progress = useRef(new Animated.Value(0)).current;
  const [animDone, setAnimDone] = useState(false);
  const mountedRef = useRef(true);
  const handleSecondaryCtaPress = useConfigAction(aiAnalysisContent.secondaryCta.action);
  const { status, error, runInspection, reset } = useInspectionResult();
  const { shots } = route.params;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Kick off the real inspection once, on mount.
  useEffect(() => {
    runInspection(shots);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Perceived-progress animation — the screen's original mount-only
  // effect, unchanged in spirit: climbs over the fixed duration regardless
  // of when the real request resolves. Now caps at 90% and only flags
  // `animDone` rather than navigating itself; the last 10% + navigation
  // is a separate effect gated on the real request's status below, so a
  // slow response doesn't leave the bar stuck and a fast one doesn't skip
  // the animation.
  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 0.9,
      duration: ANALYSIS_DURATION_MS,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished && mountedRef.current) setAnimDone(true);
    });
    return () => anim.stop();
  }, [progress]);

  // Only fills the last 10% and navigates once BOTH the perceived-progress
  // animation has finished AND the request is no longer in flight/errored.
  // Guarded against firing after the screen has unmounted (user backs out
  // mid-analysis).
  useEffect(() => {
    if (!animDone || status === 'loading' || status === 'error') return;
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished && mountedRef.current) navigation.replace('HealthReport');
    });
    return () => anim.stop();
  }, [animDone, status, navigation, progress]);

  const widthInterpolate = progress.interpolate({ inputRange: [0, 1], outputRange: ['4%', '100%'] });

  if (status === 'error' && error) {
    const copy =
      error.code === 'RATE_LIMITED'
        ? { title: aiAnalysisContent.errorRateLimitedTitle, body: aiAnalysisContent.errorRateLimitedBody }
        : error.code === 'SAFETY_BLOCKED'
          ? { title: aiAnalysisContent.errorSafetyBlockedTitle, body: aiAnalysisContent.errorSafetyBlockedBody }
          : { title: aiAnalysisContent.errorGenericTitle, body: aiAnalysisContent.errorGenericBody };

    return (
      <Screen scroll contentStyle={styles.errorContent}>
        <Text style={theme.type.h1}>{copy.title}</Text>
        <Text style={[theme.type.body, dynamic.muted]}>{copy.body}</Text>
        {/* Plain onPress, not useConfigAction/ConfigAction — these call context
            methods directly, matching this codebase's precedent (see
            capture.cameraScreen.ts's allowAccessCta comment) for anything
            that isn't navigate/openUrl/call/noop. */}
        <Button label={aiAnalysisContent.retryLabel} onPress={() => runInspection(shots)} />
        <Button label={aiAnalysisContent.continueWithEstimateLabel} variant="secondary" onPress={() => reset()} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <AnalysingIllustration />
      <Text style={theme.type.h1}>{aiAnalysisContent.heading}</Text>

      <View style={[styles.track, dynamic.track]}>
        <Animated.View style={[styles.fill, dynamic.fill, { width: widthInterpolate }]} />
      </View>
      <Text style={[theme.type.body, dynamic.muted]}>{aiAnalysisContent.body}</Text>

      <Card>
        <Text style={[theme.type.eyebrowSm, dynamic.sectionLabel]}>{aiAnalysisContent.checklistSectionLabel}</Text>
        <View style={styles.tagRow}>
          {checklistTags.map((t) => (
            <Chip key={t} label={t} tone="neutral" />
          ))}
        </View>
      </Card>

      <Button
        label={aiAnalysisContent.secondaryCta.label}
        variant={aiAnalysisContent.secondaryCta.variant}
        onPress={handleSecondaryCtaPress}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  fill: { height: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  errorContent: { gap: spacing.md },
});

function dynamicStyles(theme: Theme) {
  return {
    track: { backgroundColor: theme.colors.border },
    fill: { backgroundColor: theme.colors.primary },
    muted: { color: theme.colors.ink500 },
    sectionLabel: { color: theme.colors.ink500, marginBottom: spacing.sm },
  };
}
