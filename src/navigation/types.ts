import type { NavigatorScreenParams } from '@react-navigation/native';
import type { CapturedShotSummary } from '../types/inspection';

export type TabParamList = {
  Home: undefined;
  Garage: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  VehicleDetails: undefined;
  InstantValuation: undefined;
  InspectionIntro: undefined;
  CaptureFlow: undefined;
  // The only route carrying params today — the captured photos, so
  // AIAnalysisScreen can run a real inspection. Downstream screens read
  // the *result* from InspectionResultContext instead of threading it
  // through every route's params.
  AIAnalysis: { shots: CapturedShotSummary[] };
  HealthReport: undefined;
  ExplainMyPrice: undefined;
  FinalValuation: undefined;
  DealerSelection: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
