import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ProgressSteps } from '../../components/ProgressSteps';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { Button } from '../../components/Button';
import { useTheme, Theme } from '../../config/theme';
import { radii, spacing } from '../../config/theme/shared';
import { useConfigAction } from '../../config/actions';
import { inspectionIntroContent } from '../../config/content/screens/valuation.inspectionIntro';
import type { RootStackParamList } from '../../navigation/types';
import { CAPTURE_ANGLES } from '../../config/content/screens/capture.angles';

function WalkaroundDiagram() {
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);

  return (
    <View style={[styles.diagramPanel, dynamic.diagramPanel]}>
      <Svg width={160} height={110} viewBox="0 0 160 110">
        <Ellipse
          cx={80}
          cy={55}
          rx={62}
          ry={38}
          stroke={theme.colors.ink300}
          strokeWidth={2}
          strokeDasharray="6 6"
          fill="none"
        />
        <Rect80 />
        <Circle cx={80} cy={17} r={4} fill={theme.colors.primary} />
      </Svg>
      <Text style={[theme.type.caption, dynamic.diagramCaption]}>
        {inspectionIntroContent.diagramCaption}
      </Text>
    </View>
  );
}

function Rect80() {
  const { theme } = useTheme();
  return (
    <Path
      d="M64 47h32a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H64a4 4 0 0 1-4-4V51a4 4 0 0 1 4-4z"
      fill={theme.colors.primary}
    />
  );
}

export function InspectionIntroScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);
  const handleCtaPress = useConfigAction(inspectionIntroContent.cta.action);

  return (
    <Screen scroll>
      <ScreenHeader onBack={() => navigation.goBack()} />
      <ProgressSteps
        step={inspectionIntroContent.step}
        total={inspectionIntroContent.totalSteps}
        label={inspectionIntroContent.stepLabel}
      />

      <WalkaroundDiagram />

      <Text style={theme.type.h1}>{inspectionIntroContent.heading}</Text>

      <View style={styles.statsRow}>
        {inspectionIntroContent.stats.map((stat, i) => {
          const value = 'key' in stat ? CAPTURE_ANGLES.length : stat.value;
          return (
            <Card key={i} style={styles.statCard} padded>
              <Text style={theme.type.h2}>{value}</Text>
              <Text style={[theme.type.caption, dynamic.muted]}>{stat.unit}</Text>
            </Card>
          );
        })}
      </View>

      <View style={styles.tagRow}>
        {inspectionIntroContent.categories.map((c) => (
          <Chip key={c} label={c} tone="neutral" />
        ))}
      </View>

      <Card>
        <Text style={theme.type.bodyStrong}>{inspectionIntroContent.beforeYouStartTitle}</Text>
        <View style={{ gap: 6, marginTop: 8 }}>
          {inspectionIntroContent.rules.map((r) => (
            <Text key={r} style={[theme.type.body, dynamic.muted]}>
              · {r}
            </Text>
          ))}
        </View>
      </Card>

      <Text style={[theme.type.caption, dynamic.muted, { textAlign: 'center' }]}>
        {inspectionIntroContent.footer}
      </Text>

      <Button label={inspectionIntroContent.cta.label} onPress={handleCtaPress} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  diagramPanel: {
    borderRadius: radii.huge,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, alignItems: 'center', gap: 2 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});

function dynamicStyles(theme: Theme) {
  return {
    diagramPanel: {
      backgroundColor: theme.colors.surfaceAlt,
      borderColor: theme.colors.border,
    },
    diagramCaption: { color: theme.colors.ink500 },
    muted: { color: theme.colors.ink500 },
  };
}
