import { formatRupees, formatLakhs } from '../src/utils/currency';

describe('formatRupees', () => {
  it('groups digits in the Indian style (last 3, then pairs)', () => {
    expect(formatRupees(845000)).toBe('₹8,45,000');
    expect(formatRupees(1060000)).toBe('₹10,60,000');
    expect(formatRupees(100)).toBe('₹100');
    expect(formatRupees(0)).toBe('₹0');
  });

  it('rounds non-integer values', () => {
    expect(formatRupees(845000.6)).toBe('₹8,45,001');
  });

  it('prefixes negative values with a minus sign before the ₹', () => {
    expect(formatRupees(-4000)).toBe('-₹4,000');
  });
});

describe('formatLakhs', () => {
  it('shows no decimals for whole-lakh values', () => {
    expect(formatLakhs(800000)).toBe('₹8L');
  });

  it('shows two decimals otherwise', () => {
    expect(formatLakhs(845000)).toBe('₹8.45L');
    expect(formatLakhs(810000)).toBe('₹8.10L');
  });
});
