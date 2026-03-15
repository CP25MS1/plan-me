export function computeEqualSplitAmounts(
  total: number,
  participantIds: number[]
): Record<number, number> {
  const centsTotal = Math.round(total * 100);
  const count = participantIds.length || 1;
  const base = Math.floor(centsTotal / count);
  const remainder = centsTotal - base * count;

  const result: Record<number, number> = {};

  for (let i = 0; i < participantIds.length; i++) {
    const cents = base + (i < remainder ? 1 : 0);
    result[participantIds[i]] = +(cents / 100).toFixed(2);
  }

  return result;
}
