import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import { VehicleDetailsScreen } from '../features/valuation/VehicleDetailsScreen';
import { InstantValuationScreen } from '../features/valuation/InstantValuationScreen';
import { InspectionIntroScreen } from '../features/valuation/InspectionIntroScreen';
import { CaptureFlowScreen } from '../features/capture/CaptureFlowScreen';
import { AIAnalysisScreen } from '../features/valuation/AIAnalysisScreen';
import { HealthReportScreen } from '../features/valuation/HealthReportScreen';
import { ExplainMyPriceScreen } from '../features/valuation/ExplainMyPriceScreen';
import { FinalValuationScreen } from '../features/valuation/FinalValuationScreen';
import { DealerSelectionScreen } from '../features/valuation/DealerSelectionScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root stack: the tabbed shell (Home / My Garage / Account) sits at the
 * base, with the linear valuation → inspection → dealer journey pushed on
 * top — matching "Journey mode" laid over "Relationship mode" in the
 * prototype's own navigation rail.
 */
export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="MainTabs" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
      <Stack.Screen name="InstantValuation" component={InstantValuationScreen} />
      <Stack.Screen name="InspectionIntro" component={InspectionIntroScreen} />
      <Stack.Screen
        name="CaptureFlow"
        component={CaptureFlowScreen}
        options={{ animation: 'fade', gestureEnabled: false }}
      />
      <Stack.Screen name="AIAnalysis" component={AIAnalysisScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="HealthReport" component={HealthReportScreen} />
      <Stack.Screen name="ExplainMyPrice" component={ExplainMyPriceScreen} />
      <Stack.Screen name="FinalValuation" component={FinalValuationScreen} />
      <Stack.Screen name="DealerSelection" component={DealerSelectionScreen} />
    </Stack.Navigator>
  );
}
