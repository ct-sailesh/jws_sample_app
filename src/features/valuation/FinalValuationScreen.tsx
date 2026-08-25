import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ProgressSteps } from '../../components/ProgressSteps';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { Button } from '../../components/Button';
import { SparkleIcon } from '../../components/icons';
import { mockValuation } from '../../mocks/data';
import { useInspectionResult } from '../../state/InspectionResultContext';
import { formatLakhs, formatRupees } from '../../utils/currency';
import { useTheme, Theme } from '../../config/theme';
import { spacing, radii } from '../../config/theme/shared';
import { useConfigAction } from '../../config/actions';
import { conditionTone, confidenceFromScore, bandMarkerPercent } from '../../utils/valuation';
import type { RootStackParamList } from '../../navigation/types';
import { finalValuationContent } from '../../config/content/screens/valuation.finalValuation';

export function FinalValuationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);
  const handleExplainPress = useConfigAction(finalValuationContent.explainAction);
  const handleCtaPress = useConfigAction(finalValuationContent.cta.action);
  const { conditionScore } = useInspectionResult();

  const midpoint = (mockValuation.rangeLow + mockValuation.rangeHigh) / 2;
  const diffFromMid = mockValuation.final - midpoint;
  const condition = conditionTone(conditionScore);
  const confidence = confidenceFromScore(conditionScore);
  const markerPercent = bandMarkerPercent(mockValuation.final, mockValuation.rangeLow, mockValuation.rangeHigh);

  return (
    <Screen scroll>
      <ScreenHeader onBack={() => navigation.goBack()} />
      <ProgressSteps
        step={finalValuationContent.step}
        total={finalValuationContent.totalSteps}
        label={finalValuationContent.stepLabel}
      />

      <Card>
        <Chip
          label={finalValuationContent.aiEstimateChipLabel}
          tone="primary"
          icon={<SparkleIcon size={14} />}
        />
        <Text style={[theme.type.displayLg, styles.price]}>{formatRupees(mockValuation.final)}</Text>
        <Text style={[theme.type.body, dynamic.muted]}>
          {finalValuationContent.rangeLabelPrefix} {formatLakhs(mockValuation.rangeLow)} –{' '}
          {formatLakhs(mockValuation.rangeHigh)}
        </Text>

        <View style={[styles.divider, dynamic.divider]} />

        <View style={styles.rowBetween}>
          <Text style={theme.type.body}>{finalValuationContent.assessedConditionLabel}</Text>
          <Chip label={condition.label} tone={condition.tone} />
        </View>
        <View style={[styles.confidenceTrack, dynamic.confidenceTrack]}>
          <View style={[styles.confidenceFill, dynamic.confidenceFill, { width: `${confidence.percent}%` }]} />
        </View>
        <Text style={[theme.type.bodyStrong, styles.confidenceLabel]}>
          {confidence.label} ·{' '}
          <Text style={dynamic.link} onPress={handleExplainPress}>
            {finalValuationContent.confidenceExplainLinkLabel}
          </Text>
        </Text>
      </Card>

      <Card>
        <Text style={[theme.type.eyebrowSm, dynamic.muted]}>{finalValuationContent.bandSectionLabel}</Text>
        <View style={[styles.bandTrack, dynamic.bandTrack]}>
          <View style={[styles.bandMarker, dynamic.bandMarker, { left: `${markerPercent}%` }]} />
        </View>
        <View style={styles.rowBetween}>
          <Text style={[theme.type.caption, dynamic.muted]}>{formatLakhs(mockValuation.rangeLow)}</Text>
          <Text style={[theme.type.caption, dynamic.muted]}>{finalValuationContent.indicativeRangeLabel}</Text>
          <Text style={[theme.type.caption, dynamic.muted]}>{formatLakhs(mockValuation.rangeHigh)}</Text>
        </View>
        <Text style={[theme.type.body, { marginTop: spacing.sm }]}>
          Your AI estimate sits inside the {condition.label} band, {formatRupees(Math.abs(diffFromMid))} above
          its midpoint — {Math.abs(diffFromMid).toLocaleString('en-IN')} rupees.
        </Text>
      </Card>

      <Pressable onPress={handleExplainPress}>
        <Card style={styles.explainRow}>
          <View style={styles.explainBody}>
            <Text style={theme.type.bodyStrong}>{finalValuationContent.explainCardTitle}</Text>
            <Text style={[theme.type.bodySm, dynamic.muted]} numberOfLines={1}>
              {finalValuationContent.explainCardSubtitle}
            </Text>
          </View>
        </Card>
      </Pressable>

      <Button label={finalValuationContent.cta.label} onPress={handleCtaPress} />
      <Text style={[theme.type.bodyStrong, dynamic.link, styles.linkCenter]}>
        {finalValuationContent.downloadLink.label}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  price: { marginTop: spacing.sm },
  divider: { height: 1, marginVertical: spacing.md },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  confidenceTrack: {
    height: 6,
    borderRadius: radii.pill,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  confidenceFill: { height: 6 },
  confidenceLabel: { marginTop: spacing.xs },
  bandTrack: {
    height: 6,
    borderRadius: radii.pill,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  bandMarker: {
    position: 'absolute',
    top: -4,
    width: 3,
    height: 14,
    borderRadius: 2,
  },
  explainRow: { flexDirection: 'row', alignItems: 'center' },
  explainBody: { flex: 1 },
  linkCenter: { textAlign: 'center' },
});

function dynamicStyles(theme: Theme) {
  return {
    muted: { color: theme.colors.ink500 },
    divider: { backgroundColor: theme.colors.border },
    confidenceTrack: { backgroundColor: theme.colors.border },
    confidenceFill: { backgroundColor: theme.colors.ink700 },
    bandTrack: { backgroundColor: theme.colors.border },
    bandMarker: { backgroundColor: theme.colors.primary },
    link: { color: theme.colors.primary },
  };
}
