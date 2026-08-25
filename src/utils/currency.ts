/** Indian-numbering-system rupee formatting, matching "₹8,45,000" style seen throughout the prototype. */
export function formatRupees(value: number): string {
  const rounded = Math.round(value);
  const isNegative = rounded < 0;
  const digits = Math.abs(rounded).toString();

  let formatted: string;
  if (digits.length <= 3) {
    formatted = digits;
  } else {
    const last3 = digits.slice(-3);
    const rest = digits.slice(0, -3);
    const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    formatted = `${grouped},${last3}`;
  }
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

/** Compact "₹8.45L" style used for indicative-range labels. */
export function formatLakhs(value: number): string {
  const lakhs = value / 100000;
  const text = lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(2);
  return `₹${text}L`;
}
