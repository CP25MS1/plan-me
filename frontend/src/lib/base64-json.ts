function toBase64Url(base64: string): string {
  return base64.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function fromBase64Url(base64Url: string): string {
  let base64 = base64Url.replaceAll('-', '+').replaceAll('_', '/');

  // padding
  const pad = base64.length % 4;
  if (pad) {
    base64 += '='.repeat(4 - pad);
  }

  return base64;
}

export function encodeBase64Json<T extends object>(data: T): string {
  const json = JSON.stringify(data);

  if (globalThis.window === undefined) {
    return toBase64Url(Buffer.from(json, 'utf-8').toString('base64'));
  }

  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCodePoint(b)));

  return toBase64Url(btoa(binary));
}

export function decodeBase64Json<T>(base64Url: string): T {
  const base64 = fromBase64Url(base64Url);
  let json: string;

  if (globalThis.window === undefined) {
    json = Buffer.from(base64, 'base64').toString('utf-8');
  } else {
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    json = new TextDecoder().decode(bytes);
  }

  return JSON.parse(json) as T;
}
