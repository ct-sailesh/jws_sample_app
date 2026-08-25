import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { mockVehicle } from '../mocks/data';

/**
 * The smallest possible context, mirroring `InspectionResultContext`'s
 * pattern — the missing link for a registration number entered on
 * `VehicleDetailsScreen` to reach `CaptureFlowScreen`/`useCaptureSession`
 * several screens later. There's no existing navigation-param or
 * global-state path for this today: every screen currently reads
 * `mockVehicle.registration` independently.
 */

interface VehicleSessionContextValue {
  registration: string;
  setRegistration: (registration: string) => void;
}

const VehicleSessionContext = createContext<VehicleSessionContextValue>({
  registration: mockVehicle.registration,
  setRegistration: () => {},
});

export function VehicleSessionProvider({ children }: { children: React.ReactNode }) {
  const [registration, setRegistrationState] = useState(mockVehicle.registration);

  const setRegistration = useCallback((next: string) => setRegistrationState(next), []);

  const value = useMemo(() => ({ registration, setRegistration }), [registration, setRegistration]);

  return <VehicleSessionContext.Provider value={value}>{children}</VehicleSessionContext.Provider>;
}

export function useVehicleSession(): VehicleSessionContextValue {
  return useContext(VehicleSessionContext);
}
