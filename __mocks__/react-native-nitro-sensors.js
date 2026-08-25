/**
 * Manual Jest mock for `react-native-nitro-sensors` (auto-picked up by Jest
 * from this `__mocks__/` directory — see https://jestjs.io/docs/manual-mocks).
 * Real sensor access needs a native Nitro binding Jest's Node environment
 * doesn't have; this just gives `useDeviceAlignment.ts` something importable
 * so tests that pull in the file (even just for its pure helper exports)
 * don't crash at module-load time. Mirrors the shape of
 * `react-native-sensors/mock.js`, which this project used before switching
 * to Nitro sensors.
 */

function makeSensor(reading) {
  return {
    isAvailable: true,
    isObserving: false,
    startObserving: jest.fn((_options, onReading) => {
      onReading(reading ?? { x: 0, y: 0, z: 0, timestampMs: 0 });
    }),
    stopObserving: jest.fn(),
  };
}

const Sensors = {
  createAccelerometer: () => makeSensor({ x: 0, y: 0, z: 0, timestampMs: 0 }),
  createBarometer: () => makeSensor({ pressure: 0, timestampMs: 0 }),
  createDeviceMotion: () =>
    makeSensor({
      acceleration: { x: 0, y: 0, z: 0, timestampMs: 0 },
      accelerationIncludingGravity: { x: 0, y: 0, z: 9.8, timestampMs: 0 },
      rotationRate: { x: 0, y: 0, z: 0, timestampMs: 0 },
      attitude: { x: 0, y: 0, z: 0, timestampMs: 0 },
      magneticField: undefined,
      timestampMs: 0,
    }),
  createGyroscope: () => makeSensor({ x: 0, y: 0, z: 0, timestampMs: 0 }),
  createMagnetometer: () => makeSensor({ x: 0, y: 0, z: 0, timestampMs: 0 }),
  createLightSensor: () => makeSensor({ illuminance: 0, timestampMs: 0 }),
  createPedometer: () => makeSensor({ steps: 0, timestampMs: 0 }),
};

module.exports = { Sensors };
