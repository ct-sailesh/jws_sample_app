import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Button } from '../../components/Button';
import { mockDealers } from '../../mocks/data';
import { useTheme, Theme } from '../../config/theme';
import { spacing, radii } from '../../config/theme/shared';
import { useConfigAction } from '../../config/actions';
import type { RootStackParamList } from '../../navigation/types';
import { dealerSelectionContent } from '../../config/content/screens/valuation.dealerSelection';

export function DealerSelectionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);
  const handleCtaPress = useConfigAction(dealerSelectionContent.cta.action);
  const [selected, setSelected] = useState(mockDealers[0].id);

  return (
    <Screen padded={false}>
      <View style={styles.map}>
        <ScreenHeader onBack={() => navigation.goBack()} />
        <View style={[styles.pinCenter, dynamic.pinCenter]} />
      </View>

      <View style={[styles.sheet, dynamic.sheet]}>
        <Text style={theme.type.h2}>
          {mockDealers.length} {dealerSelectionContent.headingSuffix}
        </Text>
        <View style={styles.dealerList}>
          {mockDealers.map((d) => {
            const isSelected = d.id === selected;
            return (
              <Pressable key={d.id} onPress={() => setSelected(d.id)}>
                <View style={[styles.dealerCard, dynamic.dealerCard, isSelected && dynamic.dealerCardSelected]}>
                  <View style={[styles.radio, dynamic.radio, isSelected && dynamic.radioSelected]} />
                  <View style={styles.dealerBody}>
                    <Text style={theme.type.bodyStrong}>{d.name}</Text>
                    <Text style={[theme.type.bodySm, dynamic.muted]}>
                      {d.distanceKm} km · {d.hours}
                    </Text>
                    <Text style={[theme.type.bodySm, dynamic.muted]}>{d.address}</Text>
                    {isSelected ? (
                      <Text style={[theme.type.bodyStrong, dynamic.link]}>
                        {dealerSelectionContent.directionsLink.label}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
        <Button
          label={dealerSelectionContent.cta.label}
          style={{ marginTop: spacing.lg }}
          onPress={handleCtaPress}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 260,
    // Intentionally not a theme token — fixed placeholder-map tint, unrelated to colors.*.
    backgroundColor: '#E4E9F2',
    justifyContent: 'flex-start',
  },
  pinCenter: {
    position: 'absolute',
    top: '48%',
    left: '48%',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
  },
  sheet: {
    flex: 1,
    borderTopLeftRadius: radii.huge,
    borderTopRightRadius: radii.huge,
    marginTop: -radii.huge,
    padding: spacing.lg,
  },
  dealerList: { gap: spacing.sm, marginTop: spacing.sm },
  dealerCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1.5,
  },
  dealerBody: { flex: 1 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginTop: 2,
  },
  link: { marginTop: 4 },
});

function dynamicStyles(theme: Theme) {
  return {
    pinCenter: { backgroundColor: theme.colors.primary, borderColor: theme.colors.surface },
    sheet: { backgroundColor: theme.colors.surface },
    muted: { color: theme.colors.ink500 },
    dealerCard: { borderColor: theme.colors.border },
    dealerCardSelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySofter },
    radio: { borderColor: theme.colors.ink300 },
    radioSelected: { borderColor: theme.colors.primary, borderWidth: 6 },
    link: { color: theme.colors.primary },
  };
}
