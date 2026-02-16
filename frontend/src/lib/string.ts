export const normalizePath = (p = '/') => {
  if (p === '') return '/';
  return p.endsWith('/') && p !== '/' ? p.slice(0, -1) : p;
};

export const normalizeIgnoringWhitespace = (value: string) =>
  value?.toLowerCase().trim().replaceAll(/\s+/g, '') ?? '';
