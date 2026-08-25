import React, { useMemo } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Chip, ChipTone } from '../../components/Chip';
import { CheckIcon } from '../../components/icons';
import { useTheme, Theme } from '../../config/theme';
import { radii, spacing } from '../../config/theme/shared';
import { captureReviewContent } from '../../config/content/screens/capture.review';
import { CaptureSession, CapturedShot } from './hooks/useCaptureSession';
import type { PrecheckCheck, PrecheckStatus } from '../../state/usePhotoPrecheck';

/**
 * Unlike the rest of the capture module, this is a plain review grid (not
 * a live-camera overlay), so it uses the ordinary switchable app theme via
 * `useTheme()` — not the fixed `cameraColors` palette.
 *
 * This screen also appears mid-flow (a "peek" at the gallery via back-press
 * before all shots are taken — see CaptureFlowScreen) as well as at actual
 * completion. The photo-quality check itself (`usePhotoPrecheck`) is owned
 * by `CaptureFlowScreen`, not here — its cache needs to survive this
 * screen unmounting/remounting during a retake (see that file's comment) —
 * this component just renders whatever the parent's check state currently is.
 *
 * FIX (policy reversal from an earlier version): a photo with a CONFIRMED
 * precheck failure (`passed: false` from a completed check) now blocks
 * `Continue` from proceeding to AI analysis — the user must retake it
 * first. This deliberately does NOT extend to "couldn't verify" (no
 * backend, network/upstream error, etc.) — only a real, confirmed failure
 * blocks, so a transient AI-service hiccup (like a Gemini 503) can never
 * permanently trap someone in the capture flow with no way forward.
 */
export function CaptureReviewScreen({
  session,
  onContinue,
  onRetake,
  onDelete,
  precheckStatus,
  precheckAttempted,
  checksByShotId,
}: {
  session: CaptureSession;
  onContinue: () => void;
  onRetake: (index: number) => void;
  onDelete: (index: number) => void;
  precheckStatus: PrecheckStatus;
  precheckAttempted: boolean;
  checksByShotId: Record<string, PrecheckCheck>;
}) {
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);

  // Group shots by category, in the order each category first appears —
  // `session.shots` itself is never reordered, and each entry keeps its
  // original index so `onRetake` still targets the right shot.
  const groups = useMemo(() => {
    const order: string[] = [];
    const byCategory = new Map<string, { shot: CapturedShot; index: number }[]>();
    session.shots.forEach((shot, index) => {
      if (!byCategory.has(shot.category)) {
        order.push(shot.category);
        byCategory.set(shot.category, []);
      }
      byCategory.get(shot.category)!.push({ shot, index });
    });
    return order.map((category) => ({ category, items: byCategory.get(category)! }));
  }, [session.shots]);

  const flaggedCount = useMemo(
    () => session.shots.filter((shot) => checksByShotId[shot.id]?.passed === false).length,
    [session.shots, checksByShotId]
  );

  // FIX: a shot with no entry in `checksByShotId` used to be silently
  // treated as "passed" whenever the check didn't produce trustworthy
  // results — including a genuine request FAILURE (e.g. Gemini returning
  // 503 "high demand"), not just a never-attempted case (no backend, every
  // shot mock://, resize failure). The original condition only checked
  // `!precheckAttempted`, but `usePhotoPrecheck` sets `attempted = true` as
  // soon as a request is *sent*, regardless of whether it succeeds — so a
  // failed request still had `attempted === true`, and this screen wrongly
  // treated that as "nothing to flag", defaulting the whole summary to
  // "All photos captured" on an inspection that never actually ran.
  //
  // The only state where `checksByShotId` is genuinely trustworthy is
  // status `'done'` reached via a successful attempt — `status === 'error'`
  // must be treated exactly like "never checked", not like "checked, fine".
  const hasVerifiedResults = precheckStatus === 'done' && precheckAttempted;
  const notVerified = precheckStatus !== 'checking' && !hasVerifiedResults;

  // Only a CONFIRMED failure (a shot we actually verified and got
  // `passed: false` for) blocks proceeding — "couldn't verify" never does,
  // see the class-level doc comment for why.
  const hasConfirmedFailure = hasVerifiedResults && flaggedCount > 0;
  const blockContinue = session.isComplete && hasConfirmedFailure;

  const summary: { tone: ChipTone; label: string } =
    precheckStatus === 'checking'
      ? { tone: 'neutral', label: captureReviewContent.checkingLabel }
      : notVerified
        ? {
            tone: 'neutral',
            label:
              precheckStatus === 'error'
                ? captureReviewContent.checkFailedLabel
                : captureReviewContent.notVerifiedLabel,
          }
        : flaggedCount > 0
          ? { tone: 'warning', label: `${flaggedCount} ${captureReviewContent.needsAttentionSuffix}` }
          : { tone: 'success', label: captureReviewContent.allCapturedLabel };

  return (
    <Screen scroll>
      <ScreenHeader title={captureReviewContent.title} subtitle={`${session.takenCount} of ${session.total} captured`} />

      {groups.map((group) => (
        <View key={group.category} style={styles.section}>
          <Text style={[theme.type.eyebrowSm, dynamic.sectionLabel]}>{group.category}</Text>
          <View style={styles.grid}>
            {group.items.map(({ shot, index }) => {
              const hasPhoto = shot.uri !== null;
              const check = checksByShotId[shot.id];
              const failed = check?.passed === false;
              const isChecking = precheckStatus === 'checking' && !check;

              return (
                <Pressable key={shot.id} style={styles.tile} onPress={() => onRetake(index)}>
                  {hasPhoto ? (
                    <Card
                      padded={false}
                      style={{
                        ...styles.thumbCard,
                        ...dynamic.thumbCard,
                        ...(failed ? dynamic.thumbCardFailed : null),
                      }}
                    >
                      <Image
                        source={{ uri: shot.uri! }}
                        style={[styles.thumb, dynamic.thumb, failed && dynamic.thumbFailed]}
                      />

                      {isChecking ? (
                        <View style={[styles.badge, dynamic.badgeNeutral]}>
                          <ActivityIndicator size="small" color={theme.colors.ink500} />
                        </View>
                      ) : notVerified ? (
                        // Never actually checked — a plain dash, not a check
                        // mark. This must never look like "verified good".
                        <View style={[styles.badge, dynamic.badgeNeutral]}>
                          <Text style={[styles.badgeGlyph, dynamic.badgeNeutralText]}>–</Text>
                        </View>
                      ) : failed ? (
                        <View style={[styles.badge, dynamic.badgeWarning]}>
                          <Text style={[styles.badgeGlyph, dynamic.badgeWarningText]}>!</Text>
                        </View>
                      ) : check?.passed ? (
                        <View style={[styles.badge, dynamic.badgeSuccess]}>
                          <CheckIcon color={theme.colors.surface} size={11} />
                        </View>
                      ) : null}

                      <Pressable
                        style={[styles.deleteBadge, dynamic.deleteBadge]}
                        hitSlop={8}
                        onPress={() => onDelete(index)}
                      >
                        <Text style={[styles.badgeGlyph, dynamic.deleteBadgeText]}>×</Text>
                      </Pressable>
                    </Card>
                  ) : (
                    <View style={[styles.thumb, dynamic.thumb, styles.thumbEmpty, dynamic.thumbEmpty]} />
                  )}
                  <Text style={[theme.type.caption, dynamic.tileLabel]} numberOfLines={1}>
                    {shot.title}
                  </Text>
                  {hasPhoto && failed && check?.issue ? (
                    <Text style={[theme.type.caption, dynamic.issueText]} numberOfLines={2}>
                      {check.issue}
                    </Text>
                  ) : hasPhoto && notVerified ? (
                    <Text style={[theme.type.caption, dynamic.tileLabel]} numberOfLines={1}>
                      {captureReviewContent.notVerifiedTileLabel}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <Chip tone={summary.tone} label={summary.label} style={{ alignSelf: 'center' }} />

      {/*
        This button means one of two different things depending on
        context: "proceed to AI analysis" once every shot is taken, or
        "resume shooting" when this is a mid-flow gallery peek (back-
        pressed before completion) — the latter is always enabled, never
        a dead end. The former is disabled while there's a CONFIRMED
        precheck failure (see `blockContinue` above) — retaking the
        flagged photo(s) clears it automatically once they re-check clean.
      */}
      <Button
        label={session.isComplete ? captureReviewContent.continueCta.label : captureReviewContent.resumeCta.label}
        onPress={onContinue}
        disabled={blockContinue}
      />
      {blockContinue ? (
        <Text style={[theme.type.caption, dynamic.blockedCaption]}>
          {captureReviewContent.blockedByFlaggedLabel}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: { width: '48%', gap: 4 },
  // Wraps the photo in a `Card` (padded={false}, elevation from
  // `theme.shadows.card`) so each filled tile reads as a distinct raised
  // surface rather than a flat square. Deliberately NOT `overflow: 'hidden'`
  // — clipping would also clip the card's own shadow. Instead the `Image`
  // below shares this exact border radius so its corners line up with the
  // card's, giving a clean rounded rectangle without needing to clip
  // anything (and leaving the status badge / delete button, which are
  // absolutely positioned siblings of the image inside this card, free to
  // sit right at the rounded corners).
  thumbCard: {
    borderRadius: radii.lg,
  },
  thumb: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  thumbEmpty: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeGlyph: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
});

function dynamicStyles(theme: Theme) {
  return {
    sectionLabel: { color: theme.colors.ink500, marginTop: spacing.xs },
    thumbCard: { borderColor: theme.colors.border },
    thumbCardFailed: { borderColor: theme.colors.warning },
    thumb: { backgroundColor: theme.colors.surfaceAlt },
    thumbEmpty: { borderColor: theme.colors.border },
    thumbFailed: { borderColor: theme.colors.warning },
    tileLabel: { color: theme.colors.ink500, textAlign: 'center' as const },
    issueText: { color: theme.colors.warningDark, textAlign: 'center' as const },
    badgeSuccess: { backgroundColor: theme.colors.success },
    badgeWarning: { backgroundColor: theme.colors.warning },
    badgeWarningText: { color: theme.colors.surface },
    badgeNeutral: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
    badgeNeutralText: { color: theme.colors.ink500 },
    blockedCaption: { color: theme.colors.warningDark, textAlign: 'center' as const },
    deleteBadge: { backgroundColor: theme.colors.dangerStrong },
    deleteBadgeText: { color: theme.colors.surface },
  };
}
