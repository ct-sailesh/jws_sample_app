import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ProgressSteps } from '../../components/ProgressSteps';
import { Input } from '../../components/Input';
import { Checkbox } from '../../components/Checkbox';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { mockVehicle } from '../../mocks/data';
import { useTheme, Theme } from '../../config/theme';
import { spacing } from '../../config/theme/shared';
import { useConfigAction } from '../../config/actions';
import { vehicleDetailsContent } from '../../config/content/screens/valuation.vehicleDetails';
import { useVehicleSession } from '../../state/VehicleSessionContext';
import { loadDraft, deleteDraft, type CaptureDraft } from '../../state/captureDrafts';
import { CAPTURE_ANGLES } from '../../config/content/screens/capture.angles';
import type { RootStackParamList } from '../../navigation/types';

const totalAngles = CAPTURE_ANGLES.length;

// Light debounce so a draft lookup doesn't fire on every keystroke.
const DRAFT_LOOKUP_DEBOUNCE_MS = 400;

export function VehicleDetailsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const dynamic = useMemo(() => dynamicStyles(theme), [theme]);
  const [reg, setReg] = useState(mockVehicle.registration);
  const [consent, setConsent] = useState(false);
  const [draft, setDraft] = useState<CaptureDraft | null>(null);
  const { setRegistration } = useVehicleSession();
  const findMyCarAction = useConfigAction(vehicleDetailsContent.cta.action);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      loadDraft(reg).then((found) => {
        if (!cancelled) setDraft(found);
      });
    }, DRAFT_LOOKUP_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [reg]);

  const handleFindMyCar = () => {
    setRegistration(reg);
    findMyCarAction();
  };

  const handleResumeDraft = () => {
    setRegistration(reg);
    navigation.navigate('CaptureFlow');
  };

  const handleDiscardDraft = () => {
    deleteDraft(reg);
    setDraft(null);
  };

  return (
    <Screen scroll>
      <ScreenHeader onBack={() => navigation.goBack()} />
      <ProgressSteps
        step={vehicleDetailsContent.step}
        total={vehicleDetailsContent.totalSteps}
        label={vehicleDetailsContent.stepLabel}
      />
      <Text style={theme.type.h1}>{vehicleDetailsContent.heading}</Text>

      <Input
        label={vehicleDetailsContent.registrationLabel}
        mono
        autoCapitalize="characters"
        value={reg}
        onChangeText={setReg}
      />

      {draft ? (
        <Card style={styles.draftCard}>
          <Text style={theme.type.bodyStrong}>{vehicleDetailsContent.resumeDraftTitle}</Text>
          <Text style={[theme.type.bodySm, dynamic.muted]}>
            {`${Object.keys(draft.capturedUris).length} of ${totalAngles} ${vehicleDetailsContent.resumeDraftSuffix}`}
          </Text>
          <Button label={vehicleDetailsContent.resumeCta.label} onPress={handleResumeDraft} style={styles.resumeCta} />
          <Text style={[theme.type.bodyStrong, dynamic.link, styles.discardLink]} onPress={handleDiscardDraft}>
            {vehicleDetailsContent.discardDraftLabel}
          </Text>
        </Card>
      ) : null}

      <Checkbox
        checked={consent}
        onToggle={() => setConsent((v) => !v)}
        label={vehicleDetailsContent.consentLabel}
      />

      <Text style={[theme.type.bodyStrong, dynamic.link]}>
        {vehicleDetailsContent.manualEntryLink.label}
      </Text>

      <Button
        label={vehicleDetailsContent.cta.label}
        style={styles.cta}
        onPress={handleFindMyCar}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cta: { marginTop: spacing.xl },
  draftCard: { gap: spacing.xs },
  resumeCta: { marginTop: spacing.xs },
  discardLink: { textAlign: 'center', marginTop: spacing.xxs },
});

function dynamicStyles(theme: Theme) {
  return {
    link: { color: theme.colors.primary },
    muted: { color: theme.colors.ink500 },
  };
}
