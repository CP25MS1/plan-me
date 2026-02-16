export const normalizePath = (p = '/') => {
  if (p === '') return '/';
  return p.endsWith('/') && p !== '/' ? p.slice(0, -1) : p;
};

export const normalizeIgnoringWhitespace = (value: string) =>
  value?.toLowerCase().trim().replaceAll(/\s+/g, '') ?? '';

export const formatCurrencyTHB = (value: unknown, options?: { fallback?: string }): string => {
  const fallback = options?.fallback ?? '-';

  const num = Number(value);

  if (!Number.isFinite(num)) return fallback;

  return `THB ${num.toFixed(2)}`;
};
