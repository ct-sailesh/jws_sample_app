import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { ListRow } from '../../components/ListRow';
import { Divider } from '../../components/Divider';
import { VehiclePhotoPlaceholder } from '../../components/Illustrations';
import { mockVehicle, mockVehicles } from '../../mocks/data';
import { useTheme, Theme } from '../../config/theme';
import { spacing } from '../../config/theme/shared';
import { useConfigAction } from '../../config/actions';
import type { RowConfig } from '../../config/content/types';
import { garageContent } from '../../config/content/screens/home.garage';

/** One `RowConfig` rendered as a `ListRow`; a small wrapper so `useConfigAction` can be called once per row inside a `.map()`. */
function GarageListRow({ row }: { row: RowConfig }) {
  const handlePress = useConfigAction(row.action);
  const onPress = row.action ? handlePress : undefined;
  return (
    <ListRow
      title={row.title}
      subtitle={row.subtitle}
      trailingText={row.trailingText}
      destructive={row.destructive}
      showChevron={row.showChevron}
      onPress={onPress}
    />
  );
}

export function GarageScreen() {
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={theme.type.h1}>{garageContent.title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carRow}>
          {mockVehicles.map((v) => (
            <Card key={v.id} style={styles.vehicleCard}>
              <VehiclePhotoPlaceholder />
              <Text style={theme.type.bodyStrong}>
                {v.year} {v.model} {v.variant.split(' ')[0]}
              </Text>
              <Text style={[theme.type.bodySm, dynamic.muted]}>{v.registration}</Text>
              <Chip label={v.statusLabel} tone={v.statusTone} style={styles.chip} />
            </Card>
          ))}
        </ScrollView>

        <Text style={[theme.type.eyebrowSm, dynamic.sectionLabel]}>
          {mockVehicle.year} {mockVehicle.model.toUpperCase()} {mockVehicle.variant.toUpperCase()}
        </Text>
        <Card padded={false}>
          {garageContent.ownVehicleRows.map((row, i) => (
            <React.Fragment key={row.title}>
              {i > 0 ? <Divider /> : null}
              <GarageListRow row={row} />
            </React.Fragment>
          ))}
        </Card>

        <Text style={[theme.type.eyebrowSm, dynamic.sectionLabel]}>{garageContent.acrossAccountLabel}</Text>
        <Card padded={false}>
          {garageContent.acrossAccountRows.map((row, i) => (
            <React.Fragment key={row.title}>
              {i > 0 ? <Divider /> : null}
              <GarageListRow row={row} />
            </React.Fragment>
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  carRow: { gap: spacing.sm },
  vehicleCard: { width: 210, gap: 4 },
  chip: { marginTop: 4 },
});

function dynamicStyles(theme: Theme) {
  return {
    muted: { color: theme.colors.ink500 },
    sectionLabel: { color: theme.colors.ink500, marginTop: spacing.xs },
  };
}
