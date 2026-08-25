import { conditionTone, confidenceFromScore, bandMarkerPercent } from '../src/utils/valuation';

describe('conditionTone', () => {
  it('bands at 85 and 60', () => {
    expect(conditionTone(100)).toEqual({ label: 'Good', tone: 'success' });
    expect(conditionTone(85)).toEqual({ label: 'Good', tone: 'success' });
    expect(conditionTone(84)).toEqual({ label: 'Average', tone: 'warning' });
    expect(conditionTone(60)).toEqual({ label: 'Average', tone: 'warning' });
    expect(conditionTone(59)).toEqual({ label: 'Needs attention', tone: 'danger' });
    expect(conditionTone(0)).toEqual({ label: 'Needs attention', tone: 'danger' });
  });
});

describe('confidenceFromScore', () => {
  it('derives confidence from the same bands as conditionTone', () => {
    expect(confidenceFromScore(90)).toEqual({ percent: 90, label: 'High confidence' });
    expect(confidenceFromScore(78)).toEqual({ percent: 66, label: 'Medium confidence' });
    expect(confidenceFromScore(40)).toEqual({ percent: 40, label: 'Low confidence' });
  });
});

describe('bandMarkerPercent', () => {
  it('positions a value within [low, high] as 0-100', () => {
    expect(bandMarkerPercent(845000, 810000, 880000)).toBeCloseTo(50, 0);
    expect(bandMarkerPercent(810000, 810000, 880000)).toBe(0);
    expect(bandMarkerPercent(880000, 810000, 880000)).toBe(100);
  });

  it('clamps outside the band', () => {
    expect(bandMarkerPercent(700000, 810000, 880000)).toBe(0);
    expect(bandMarkerPercent(900000, 810000, 880000)).toBe(100);
  });

  it('falls back to 50 when the band is degenerate', () => {
    expect(bandMarkerPercent(500, 100, 100)).toBe(50);
    expect(bandMarkerPercent(500, 200, 100)).toBe(50);
  });
});
