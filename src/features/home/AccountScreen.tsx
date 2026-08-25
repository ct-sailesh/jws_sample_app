import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { ListRow } from '../../components/ListRow';
import { Divider } from '../../components/Divider';
import { mockOwner } from '../../mocks/data';
import { useTheme, Theme } from '../../config/theme';
import { radii, spacing } from '../../config/theme/shared';
import { useConfigAction } from '../../config/actions';
import type { RowConfig } from '../../config/content/types';
import { accountContent } from '../../config/content/screens/home.account';

/** One `RowConfig` rendered as a `ListRow`; a small wrapper so `useConfigAction` can be called once per row inside a `.map()`. */
function AccountListRow({ row }: { row: RowConfig }) {
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

export function AccountScreen() {
  const { theme, themeName, setThemeName } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={theme.type.h1}>{accountContent.title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <View style={[styles.avatar, dynamic.avatar]}>
            <Text style={[theme.type.h3, dynamic.avatarText]}>{mockOwner.name[0]}</Text>
          </View>
          <View>
            <Text style={theme.type.bodyStrong}>{mockOwner.name}</Text>
            <Text style={[theme.type.mono, dynamic.muted]}>{mockOwner.phone}</Text>
          </View>
        </Card>

        <Card style={styles.appearanceCard}>
          <Text style={theme.type.bodyStrong}>{accountContent.appearanceLabel}</Text>
          <Switch
            value={themeName === 'dark'}
            onValueChange={(v) => setThemeName(v ? 'dark' : 'light')}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </Card>

        <Card padded={false}>
          {accountContent.preferenceRows.map((row, i) => (
            <React.Fragment key={row.title}>
              {i > 0 ? <Divider /> : null}
              <AccountListRow row={row} />
            </React.Fragment>
          ))}
        </Card>

        <Card padded={false}>
          {accountContent.supportRows.map((row, i) => (
            <React.Fragment key={row.title}>
              {i > 0 ? <Divider /> : null}
              <AccountListRow row={row} />
            </React.Fragment>
          ))}
          <Divider />
          <AccountListRow row={accountContent.aboutRow} />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appearanceCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});

function dynamicStyles(theme: Theme) {
  return {
    muted: { color: theme.colors.ink500 },
    avatar: { backgroundColor: theme.colors.primarySoft },
    avatarText: { color: theme.colors.primary },
  };
}
