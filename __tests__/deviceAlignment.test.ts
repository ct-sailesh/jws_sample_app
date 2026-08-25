import {
  computeTilt,
  computeConfidence,
  nextAlignmentStatus,
} from '../src/features/capture/hooks/useDeviceAlignment';

describe('computeTilt', () => {
  it('reads pitch=90 when gravity points along -y (phone edge-on to gravity)', () => {
    const { pitchDeg, rollDeg } = computeTilt(0, -1, 0);
    expect(pitchDeg).toBeCloseTo(90, 5);
    expect(rollDeg).toBeCloseTo(0, 5);
  });

  it('reads pitch=0, roll=0 when gravity points along +z (level reference)', () => {
    const { pitchDeg, rollDeg } = computeTilt(0, 0, 1);
    expect(pitchDeg).toBeCloseTo(0, 5);
    expect(rollDeg).toBeCloseTo(0, 5);
  });

  it('reads roll=90 when gravity points along +x', () => {
    const { rollDeg } = computeTilt(1, 0, 0);
    expect(rollDeg).toBeCloseTo(90, 5);
  });
});

describe('computeConfidence', () => {
  it('is 1 when pitch matches target exactly and roll is level', () => {
    expect(computeConfidence(0, 0, 0)).toBeCloseTo(1, 5);
    expect(computeConfidence(-25, 0, -25)).toBeCloseTo(1, 5);
  });

  it('falls to 0.45 (pitch fully off, roll perfect) at the pitch tolerance edge (35deg)', () => {
    expect(computeConfidence(35, 0, 0)).toBeCloseTo(0.45, 5);
  });

  it('falls to 0.55 (roll fully off, pitch perfect) at the roll tolerance edge (30deg)', () => {
    expect(computeConfidence(0, 30, 0)).toBeCloseTo(0.55, 5);
  });

  it('never goes negative even far past both tolerance bands', () => {
    expect(computeConfidence(200, 200, 0)).toBe(0);
  });
});

describe('nextAlignmentStatus', () => {
  it('starts a stability window the instant confidence crosses the aligned threshold', () => {
    const result = nextAlignmentStatus(0.9, 1000, null);
    expect(result.stableSince).toBe(1000);
    // Not held long enough yet -> "aligning", not "aligned".
    expect(result.status).toBe('aligning');
  });

  it('flips to "aligned" once the stability window has elapsed', () => {
    const result = nextAlignmentStatus(0.9, 1700, 1000); // 700ms >= 600ms window
    expect(result.status).toBe('aligned');
    expect(result.stableSince).toBe(1000);
  });

  it('does not flip to "aligned" just under the stability window', () => {
    const result = nextAlignmentStatus(0.9, 1599, 1000); // 599ms < 600ms window
    expect(result.status).toBe('aligning');
  });

  it('resets the stability window the moment confidence dips below the threshold', () => {
    const result = nextAlignmentStatus(0.5, 2000, 1000);
    expect(result.stableSince).toBeNull();
    expect(result.status).toBe('aligning'); // 0.5 > 0.35 aligning threshold
  });

  it('reports "idle" below the aligning threshold', () => {
    const result = nextAlignmentStatus(0.2, 1000, null);
    expect(result.status).toBe('idle');
    expect(result.stableSince).toBeNull();
  });
});
