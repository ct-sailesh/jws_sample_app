import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ProgressSteps } from '../../components/ProgressSteps';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { Button } from '../../components/Button';
import { Divider } from '../../components/Divider';
import { mockVehicle } from '../../mocks/data';
import { useTheme, Theme } from '../../config/theme';
import { spacing } from '../../config/theme/shared';
import { useConfigAction } from '../../config/actions';
import { instantValuationContent } from '../../config/content/screens/valuation.instantValuation';
import type { RootStackParamList } from '../../navigation/types';

export function InstantValuationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);
  const handleCtaPress = useConfigAction(instantValuationContent.cta.action);

  const bandDotColor = {
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
    neutral: theme.colors.ink400,
    primary: theme.colors.ink400,
  };

  return (
    <Screen scroll>
      <ScreenHeader onBack={() => navigation.goBack()} />
      <ProgressSteps
        step={instantValuationContent.step}
        total={instantValuationContent.totalSteps}
        label={instantValuationContent.stepLabel}
      />

      <Card style={styles.vehicleRow}>
        <View style={{ flex: 1 }}>
          <Text style={theme.type.bodyStrong}>
            {mockVehicle.year} {mockVehicle.make} {mockVehicle.model} {mockVehicle.variant.split(' ')[0]}
          </Text>
          <Text style={[theme.type.bodySm, dynamic.muted]}>
            {mockVehicle.variant} · {mockVehicle.odometerKm.toLocaleString('en-IN')} km · {mockVehicle.city}
          </Text>
        </View>
        <Text style={[theme.type.bodyStrong, dynamic.link]}>{instantValuationContent.editLink.label}</Text>
      </Card>

      <Card>
        <Chip label={instantValuationContent.indicativeChip.label} tone={instantValuationContent.indicativeChip.tone} />
        <Text style={[theme.type.eyebrowSm, dynamic.sectionLabel]}>
          {instantValuationContent.bandsSectionLabel}
        </Text>
        {instantValuationContent.bands.map((b, i) => (
          <View key={b.label}>
            <View style={styles.bandRow}>
              <View style={styles.bandLeft}>
                <View style={[styles.dot, { backgroundColor: bandDotColor[b.tone] }]} />
                <Text style={theme.type.body}>{b.label}</Text>
              </View>
              <Text style={theme.type.bodyStrong}>{b.range}</Text>
            </View>
            {i < instantValuationContent.bands.length - 1 ? <Divider style={{ marginVertical: 2 }} /> : null}
          </View>
        ))}
        <Text style={[theme.type.caption, dynamic.footnote]}>{instantValuationContent.validityFootnote}</Text>
      </Card>

      <Card>
        <Text style={theme.type.bodyStrong}>{instantValuationContent.whyRangeTitle}</Text>
        <Text style={[theme.type.body, dynamic.muted, { marginTop: 4 }]}>
          {instantValuationContent.whyRangeBody}
        </Text>
      </Card>

      <Button label={instantValuationContent.cta.label} onPress={handleCtaPress} />
      <Text style={[theme.type.bodyStrong, dynamic.linkCentered]}>{instantValuationContent.downloadLink.label}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  vehicleRow: { flexDirection: 'row', alignItems: 'center' },
  bandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  bandLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
});

function dynamicStyles(theme: Theme) {
  return {
    muted: { color: theme.colors.ink500 },
    sectionLabel: { color: theme.colors.ink500, marginTop: spacing.sm, marginBottom: spacing.xs },
    footnote: { color: theme.colors.ink500, marginTop: spacing.sm },
    link: { color: theme.colors.primary },
    linkCentered: { color: theme.colors.primary, textAlign: 'center' as const },
  };
}
