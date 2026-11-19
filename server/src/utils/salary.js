// Turns salary text from emails into a range in lakhs per annum (LPA).
// Returns null when no usable number is found.
//
// Handled examples:
//   "₹6,00,000 - ₹9,00,000 a year"  -> 6 to 9
//   "6-10 Lacs PA"                  -> 6 to 10
//   "₹25,000 - ₹40,000 a month"     -> 3 to 4.8
// A bare rupee amount with no period is assumed monthly when under 2,00,000,
// and yearly otherwise.

const NUMBER = /\d[\d,]*(?:\.\d+)?/g;

export function parseSalary(text) {
  if (!text) return null;
  const s = String(text).toLowerCase();

  const nums = (s.match(NUMBER) || [])
    .map((n) => parseFloat(n.replace(/,/g, '')))
    .filter((n) => Number.isFinite(n));
  if (nums.length === 0) return null;

  const hasLakhUnit = /\b(lpa|lac|lacs|lakh|lakhs)\b/.test(s);
  const hasK = /\d\s*k\b/.test(s);
  const monthly = /(a|per|\/)\s*month|monthly|\bpm\b/.test(s);
  const yearly = /(a|per|\/)\s*(year|annum)|yearly|\bpa\b|p\.a/.test(s);

  const picked = nums.slice(0, 2);
  const toLpa = (n) => {
    if (hasLakhUnit) return n;
    const rupees = hasK ? n * 1000 : n;
    if (rupees < 1000) return null; // too small to be rupees without a unit
    if (monthly) return (rupees * 12) / 100000;
    if (yearly) return rupees / 100000;
    return rupees < 200000 ? (rupees * 12) / 100000 : rupees / 100000;
  };

  const values = picked.map(toLpa);
  if (values.some((v) => v === null)) return null;

  const round = (v) => Math.round(v * 100) / 100;
  const min = round(Math.min(...values));
  const max = round(Math.max(...values));
  return { minLpa: min, maxLpa: max };
}

export function looksLikeSalary(line) {
  return (
    /₹|\brs\.?\s*\d|\binr\b|\blpa\b|\blacs?\b|\blakhs?\b/i.test(line) ||
    /\d\s*(a|per)\s*(month|year)/i.test(line)
  );
}
