import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { Button } from '../../components/Button';
import { CheckIcon } from '../../components/icons';
import { useTheme, Theme } from '../../config/theme';
import { spacing, radii } from '../../config/theme/shared';
import { useConfigAction } from '../../config/actions';
import { conditionTone } from '../../utils/valuation';
import { healthReportContent } from '../../config/content/screens/valuation.healthReport';
import { useInspectionResult } from '../../state/InspectionResultContext';
import type { CapturedShotSummary, Finding, Severity } from '../../types/inspection';
import type { CaptureCategory } from '../../config/content/screens/capture.angles';

interface CategoryGroup {
  category: CaptureCategory;
  shots: CapturedShotSummary[];
}

/** Groups shots by category, preserving each category's first-appearance order in `shots` (which already follows the guided-capture script order) rather than imposing a separate fixed ordering. */
function groupShotsByCategory(shots: CapturedShotSummary[]): CategoryGroup[] {
  const order: CaptureCategory[] = [];
  const byCategory = new Map<CaptureCategory, CapturedShotSummary[]>();
  shots.forEach((shot) => {
    if (!byCategory.has(shot.category)) {
      order.push(shot.category);
      byCategory.set(shot.category, []);
    }
    byCategory.get(shot.category)!.push(shot);
  });
  return order.map((category) => ({ category, shots: byCategory.get(category) ?? [] }));
}

/** Minor/Moderate read as "worth noting", Severe reads as "worth attention" — same 2-tone split `Chip`'s tone system already uses elsewhere in this app. */
function markerColor(severity: Severity, theme: Theme['colors']) {
  return severity === 'Severe' ? theme.danger : theme.warning;
}

/**
 * Small numbered pins over the exact spot on the photo each finding was
 * detected — the point of asking Gemini for a `location` at all. Numbers
 * match each finding's position in the list rendered underneath, so a pin
 * and its description are always cross-referenceable at a glance.
 */
function FindingMarkers({ findings, theme }: { findings: Finding[]; theme: Theme }) {
  return (
    <>
      {findings.map((f, i) =>
        f.location ? (
          <View
            key={f.id}
            pointerEvents="none"
            style={[
              styles.marker,
              {
                left: `${f.location.x * 100}%`,
                top: `${f.location.y * 100}%`,
                backgroundColor: markerColor(f.severity, theme.colors),
                borderColor: theme.colors.surface,
              },
            ]}
          >
            <Text style={styles.markerText}>{i + 1}</Text>
          </View>
        ) : null
      )}
    </>
  );
}

export function HealthReportScreen() {
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);
  const handleCtaPress = useConfigAction(healthReportContent.cta.action);
  const { findings, conditionScore, shots } = useInspectionResult();
  const condition = conditionTone(conditionScore);
  const categoryGroups = useMemo(() => groupShotsByCategory(shots), [shots]);

  return (
    <Screen scroll>
      <Text style={[theme.type.eyebrowSm, dynamic.muted]}>{healthReportContent.overallLabel}</Text>
      <View style={styles.scoreRow}>
        <Text style={theme.type.displayLg}>{conditionScore}</Text>
        <Text style={[theme.type.body, dynamic.muted]}>/ 100</Text>
        <Chip label={condition.label} tone={condition.tone} />
      </View>

      {shots.length === 0 ? (
        // Idle/mock-fallback state (no real inspection has run, e.g. a
        // deep link straight into this screen) — `shots` is empty and
        // `findings` is the flat mock list with no `shotId`s to group by
        // photo, so this degrades to the original findings-only list
        // rather than rendering an empty/broken gallery.
        findings.length === 0 ? (
          <Text style={[theme.type.caption, dynamic.muted]}>{healthReportContent.noFindingsCaption}</Text>
        ) : (
          <>
            <Text style={theme.type.h2}>{findings.length} findings</Text>
            <View style={styles.findingsList}>
              {findings.map((f) => (
                <Card key={f.id} style={styles.findingRow}>
                  <View style={[styles.photoPlaceholder, dynamic.photoPlaceholder]}>
                    <Text style={[theme.type.caption, dynamic.photoPlaceholderText]}>
                      {healthReportContent.photoPlaceholderLabel}
                    </Text>
                  </View>
                  <View style={styles.findingBody}>
                    <View style={styles.findingTitleRow}>
                      <View style={[styles.severityDot, { backgroundColor: markerColor(f.severity, theme.colors) }]} />
                      <Text style={theme.type.bodyStrong}>
                        {f.panel} — {f.issue}
                      </Text>
                    </View>
                    <Text style={[theme.type.bodySm, dynamic.muted]}>
                      {f.severity} · confidence {Math.round(f.confidence * 100)}%
                    </Text>
                    <Text style={[theme.type.caption, dynamic.muted]}>{healthReportContent.unconfirmedCaption}</Text>
                  </View>
                </Card>
              ))}
            </View>
          </>
        )
      ) : (
        <View style={styles.gallery}>
          {categoryGroups.map(({ category, shots: categoryShots }) => (
            <View key={category} style={styles.categorySection}>
              <Text style={[theme.type.eyebrowSm, dynamic.sectionLabel]}>{category}</Text>
              <View style={styles.grid}>
                {categoryShots.map((shot) => {
                  const shotFindings = findings.filter((f) => f.shotId === shot.id);
                  return (
                    <View key={shot.id} style={styles.tile}>
                      <View style={styles.thumbWrap}>
                        {shot.uri ? (
                          <Image source={{ uri: shot.uri }} style={[styles.thumb, dynamic.photoThumb]} />
                        ) : (
                          <View style={[styles.thumb, dynamic.photoPlaceholder]}>
                            <Text style={[theme.type.caption, dynamic.photoPlaceholderText]}>
                              {healthReportContent.photoPlaceholderLabel}
                            </Text>
                          </View>
                        )}
                        <FindingMarkers findings={shotFindings} theme={theme} />
                      </View>
                      <Text style={[theme.type.caption, dynamic.tileLabel]} numberOfLines={1}>
                        {shot.title}
                      </Text>
                      {shotFindings.length === 0 ? (
                        <View style={styles.cleanRow}>
                          <CheckIcon color={theme.colors.success} size={12} />
                          <Text style={[theme.type.caption, dynamic.cleanLabel]}>
                            {healthReportContent.photoCleanLabel}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.tileFindings}>
                          {shotFindings.map((f, i) => (
                            <View key={f.id} style={styles.tileFinding}>
                              <View style={styles.findingTitleRow}>
                                <View
                                  style={[
                                    styles.severityDot,
                                    { backgroundColor: markerColor(f.severity, theme.colors) },
                                  ]}
                                />
                                <Text style={theme.type.bodySmStrong}>
                                  {f.location ? `${i + 1}. ` : ''}
                                  {f.panel} — {f.issue}
                                </Text>
                              </View>
                              <Text style={[theme.type.caption, dynamic.muted]}>
                                {f.severity} · confidence {Math.round(f.confidence * 100)}%
                              </Text>
                              <Text style={[theme.type.caption, dynamic.muted]}>
                                {healthReportContent.unconfirmedCaption}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}

      <Button label={healthReportContent.cta.label} onPress={handleCtaPress} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  findingsList: { gap: spacing.sm },
  findingRow: { flexDirection: 'row', gap: spacing.sm },
  photoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findingBody: { flex: 1 },
  findingTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  severityDot: { width: 8, height: 8, borderRadius: 4 },
  gallery: { gap: spacing.lg },
  categorySection: { gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  // 2 columns, matching CaptureReviewScreen's gallery — more room for the
  // marker pins to actually be legible than the previous 3-column layout.
  tile: { width: '48%', gap: 4 },
  thumbWrap: { position: 'relative' },
  thumb: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    position: 'absolute',
    width: 20,
    height: 20,
    marginLeft: -10,
    marginTop: -10,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cleanRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tileFindings: { gap: spacing.xs },
  tileFinding: { gap: 2 },
});

function dynamicStyles(theme: Theme) {
  return {
    muted: { color: theme.colors.ink500 },
    photoPlaceholder: { backgroundColor: theme.colors.surfaceAlt },
    photoThumb: { backgroundColor: theme.colors.surfaceAlt },
    photoPlaceholderText: { color: theme.colors.ink400 },
    sectionLabel: { color: theme.colors.ink500 },
    tileLabel: { color: theme.colors.ink500, textAlign: 'center' as const },
    cleanLabel: { color: theme.colors.success },
  };
}
