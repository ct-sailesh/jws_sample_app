import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { OwnerVehicleIllustration } from '../../components/Illustrations';
import { IconTile } from '../../components/IconTile';
import { CheckIcon, ExchangeIcon, RupeeIcon, SparkleIcon } from '../../components/icons';
import { useTheme, Theme } from '../../config/theme';
import { spacing } from '../../config/theme/shared';
import { useConfigAction } from '../../config/actions';
import { welcomeContent } from '../../config/content/screens/home.welcome';

/** `iconKey` -> component. Icons aren't serializable, so only the *choice* of icon lives in config; the registry stays in code. */
const FEATURE_ICONS = {
  rupee: RupeeIcon,
  sparkle: SparkleIcon,
  check: CheckIcon,
  exchange: ExchangeIcon,
} as const;

/**
 * Canonical example of a converted screen: all copy/list content/button
 * action comes from `config/content/screens/home.welcome.ts`, colours from
 * `useTheme()`, and the CTA's `onPress` is resolved via `useConfigAction()`
 * instead of an inline `navigation.navigate(...)` call.
 */
export function WelcomeScreen() {
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);
  const handleCtaPress = useConfigAction(welcomeContent.cta.action);

  return (
    <Screen scroll>
      <OwnerVehicleIllustration />

      <Text style={theme.type.h1}>{welcomeContent.heroTitle}</Text>
      <Text style={[theme.type.body, dynamic.subtitle]}>{welcomeContent.heroSubtitle}</Text>

      <View style={styles.features}>
        {welcomeContent.features.map((f) => {
          const Icon = FEATURE_ICONS[f.iconKey];
          return (
            <View key={f.label} style={styles.featureRow}>
              <IconTile>
                <Icon />
              </IconTile>
              <Text style={theme.type.bodyStrong}>{f.label}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.ctaBlock}>
        <Button label={welcomeContent.cta.label} onPress={handleCtaPress} />
        <Text style={[theme.type.caption, dynamic.footnote]}>{welcomeContent.footnote}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  features: { gap: spacing.md, marginTop: spacing.xs },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ctaBlock: { marginTop: spacing.md, gap: spacing.sm, alignItems: 'center' },
});

function dynamicStyles(theme: Theme) {
  return {
    subtitle: { color: theme.colors.ink500 },
    footnote: { color: theme.colors.ink500 },
  };
}
