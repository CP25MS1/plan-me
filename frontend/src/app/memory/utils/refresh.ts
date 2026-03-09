export const needsRefresh = (expiresAt?: string | null): boolean => {
  if (!expiresAt) return true;

  const expiresMs = new Date(expiresAt).getTime();

  return expiresMs - Date.now() < 60000;
};
