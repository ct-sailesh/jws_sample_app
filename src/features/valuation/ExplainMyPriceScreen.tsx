import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Chip } from '../../components/Chip';
import { SparkleIcon } from '../../components/icons';
import { mockValuation, mockVehicle } from '../../mocks/data';
import { useInspectionResult } from '../../state/InspectionResultContext';
import { formatRupees } from '../../utils/currency';
import { useTheme, Theme } from '../../config/theme';
import { spacing } from '../../config/theme/shared';
import type { RootStackParamList } from '../../navigation/types';
import { explainMyPriceContent } from '../../config/content/screens/valuation.explainMyPrice';

function Line({
  title,
  subtitle,
  amount,
  positive,
}: {
  title: string;
  subtitle?: string;
  amount: number;
  positive?: boolean;
}) {
  const { theme } = useTheme();
  const sign = amount === 0 ? '' : positive ? '+' : '−';
  const color = amount === 0 ? theme.colors.ink900 : positive ? theme.colors.success : theme.colors.ink900;
  return (
    <View style={styles.line}>
      <View style={styles.lineTitleCol}>
        <Text style={theme.type.bodyStrong}>{title}</Text>
        {subtitle ? <Text style={[theme.type.bodySm, { color: theme.colors.ink500 }]}>{subtitle}</Text> : null}
      </View>
      <Text style={[theme.type.bodyStrong, { color }]}>
        {sign}
        {formatRupees(Math.abs(amount)).slice(1)}
      </Text>
    </View>
  );
}

export function ExplainMyPriceScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);
  const { findings, conditionScore } = useInspectionResult();
  const ageYears = new Date().getFullYear() - mockVehicle.year;

  return (
    <Screen scroll>
      <ScreenHeader title={explainMyPriceContent.title} onBack={() => navigation.goBack()} />

      <Line
        title={explainMyPriceContent.baseValueLabel}
        subtitle={`${mockVehicle.year} ${mockVehicle.model} ${mockVehicle.variant}, ${mockVehicle.city}`}
        amount={mockValuation.baseValue}
      />
      <View style={[styles.divider, dynamic.divider]} />
      <Line
        title={explainMyPriceContent.ageLabel}
        subtitle={`${ageYears} ${explainMyPriceContent.ageSubtitleSuffix}`}
        amount={-mockValuation.ageDeduction}
      />
      <View style={[styles.divider, dynamic.divider]} />
      <Line
        title={explainMyPriceContent.mileageLabel}
        subtitle={`${mockVehicle.odometerKm.toLocaleString('en-IN')} km, ${explainMyPriceContent.mileageSubtitle}`}
        amount={-mockValuation.mileageDeduction}
      />
      <View style={[styles.divider, dynamic.divider]} />
      <Line
        title={explainMyPriceContent.conditionLabel}
        subtitle={`Overall score ${conditionScore} of 100`}
        amount={-mockValuation.conditionDeduction}
      />
      <View style={[styles.divider, dynamic.divider]} />

      <View style={styles.line}>
        <Text style={theme.type.bodyStrong}>{explainMyPriceContent.damageLabel}</Text>
        <Text style={theme.type.bodyStrong}>−{formatRupees(mockValuation.damageDeduction).slice(1)}</Text>
      </View>
      <View style={[styles.damageBox, dynamic.damageBox]}>
        {findings.map((f) => (
          <View key={f.id} style={styles.damageRow}>
            <Text style={theme.type.bodySm}>
              {f.panel} — {f.issue}, {f.severity}
            </Text>
            <Text style={theme.type.bodySm}>−{formatRupees(f.deduction).slice(1)}</Text>
          </View>
        ))}
      </View>
      <View style={[styles.divider, dynamic.divider]} />

      <Line
        title={explainMyPriceContent.marketLabel}
        subtitle={explainMyPriceContent.marketSubtitle}
        amount={mockValuation.marketAdjustment}
        positive
      />

      <View style={[styles.finalDivider, dynamic.finalDivider]} />
      <View style={styles.finalRow}>
        <View>
          <Chip
            label={explainMyPriceContent.aiEstimateChipLabel}
            tone="primary"
            icon={<SparkleIcon size={13} />}
          />
          <Text style={[theme.type.bodyStrong, { marginTop: spacing.xs }]}>
            {explainMyPriceContent.finalLabel}
          </Text>
        </View>
        <Text style={theme.type.h1}>{formatRupees(mockValuation.final)}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  line: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  lineTitleCol: { flex: 1 },
  divider: { height: 1 },
  damageBox: { borderRadius: 10, padding: spacing.sm, gap: 6 },
  damageRow: { flexDirection: 'row', justifyContent: 'space-between' },
  finalDivider: { height: 2 },
  finalRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
});

function dynamicStyles(theme: Theme) {
  return {
    divider: { backgroundColor: theme.colors.border },
    damageBox: { backgroundColor: theme.colors.surfaceAlt },
    finalDivider: { backgroundColor: theme.colors.ink900 },
  };
}
