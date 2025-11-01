export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);
  return null;
};

export const setCookie = (
  name: string,
  value: string,
  options: { path?: string; expires?: Date; maxAge?: number } = {}
) => {
  if (typeof document === 'undefined') return;

  let cookieStr = `${name}=${encodeURIComponent(value)}`;

  if (options.path) cookieStr += `; path=${options.path}`;
  if (options.expires) cookieStr += `; expires=${options.expires.toUTCString()}`;
  if (options.maxAge) cookieStr += `; max-age=${options.maxAge}`;

  document.cookie = cookieStr;
};

export const deleteCookie = (name: string, path: string = '/') => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};
