import { Elysia } from 'elysia';
import { jwtVerify } from 'jose';

const PORT = Number(process.env.PORT ?? 3001);
const JWT_SECRET = process.env.JWT_SECRET ?? '';
const ALLOW_ANONYMOUS = !JWT_SECRET && process.env.NODE_ENV !== 'production';

type ConnectionData = {
  cookieHeader: string | null;
  clientId?: string;
};

type WsSendable = { send: (data: string) => void };

const clients = new Map<
  string,
  {
    id: string;
    connectedAt: string;
    ws: WsSendable;
  }
>();

const parseCookies = (cookieHeader: string | null): Record<string, string> => {
  const cookies: Record<string, string> = {};

  if (!cookieHeader) {
    return cookies;
  }

  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) {
      continue;
    }

    const [rawKey, ...rest] = trimmed.split('=');
    if (!rawKey) {
      continue;
    }

    cookies[rawKey] = decodeURIComponent(rest.join('='));
  }

  return cookies;
};

const getJwtKey = () => {
  if (!JWT_SECRET) {
    return null;
  }

  return new TextEncoder().encode(JWT_SECRET);
};

const verifyToken = async (token?: string): Promise<boolean> => {
  if (ALLOW_ANONYMOUS) {
    return true;
  }

  if (!token) {
    return false;
  }

  const key = getJwtKey();
  if (!key) {
    return false;
  }

  try {
    await jwtVerify(token, key);
    return true;
  } catch {
    return false;
  }
};

const nowIso = () => new Date().toISOString();

const buildPresencePayload = () => ({
  type: 'presence' as const,
  clientCount: clients.size,
  clients: Array.from(clients.values()).map(({ id, connectedAt }) => ({
    id,
    connectedAt,
  })),
});

const safeSend = (ws: WsSendable, payload: unknown) => {
  try {
    ws.send(JSON.stringify(payload));
  } catch {
    // Ignore failed sends to keep server healthy.
  }
};

const broadcast = (payload: unknown) => {
  const message = JSON.stringify(payload);
  for (const client of clients.values()) {
    try {
      client.ws.send(message);
    } catch {
      // Ignore individual failures.
    }
  }
};

const decodeMessage = (message: string | ArrayBuffer | Uint8Array) => {
  if (typeof message === 'string') {
    return message;
  }

  const decoder = new TextDecoder();

  if (message instanceof ArrayBuffer) {
    return decoder.decode(message);
  }

  return decoder.decode(message);
};

const parseClientMessage = (message: unknown): { type?: string; message?: string } | null => {
  if (typeof message === 'string') {
    try {
      return JSON.parse(message);
    } catch {
      return null;
    }
  }

  if (message instanceof ArrayBuffer || message instanceof Uint8Array) {
    try {
      return JSON.parse(decodeMessage(message));
    } catch {
      return null;
    }
  }

  if (message && typeof message === 'object') {
    return message as { type?: string; message?: string };
  }

  return null;
};

const app = new Elysia()
  .derive(({ request }) => ({
    cookieHeader: request.headers.get('cookie') ?? null,
  }))
  .ws('/ws', {
    open: async (ws) => {
      const connectionData = ws.data as ConnectionData;
      const cookieHeader = connectionData?.cookieHeader ?? null;
      const cookies = parseCookies(cookieHeader);
      const token = cookies.jwt;
      const valid = await verifyToken(token);

      if (!valid) {
        ws.close(1008, 'Unauthorized');
        return;
      }

      const clientId = crypto.randomUUID();
      const connectedAt = nowIso();

      if (connectionData) {
        connectionData.clientId = clientId;
      }
      clients.set(clientId, { id: clientId, connectedAt, ws });

      safeSend(ws, {
        type: 'hello',
        clientId,
        serverTime: nowIso(),
      });

      broadcast(buildPresencePayload());
    },
    message: (ws, message) => {
      const clientId = (ws.data as ConnectionData | undefined)?.clientId;
      if (!clientId) {
        ws.close(1008, 'Unauthorized');
        return;
      }

      const parsed = parseClientMessage(message);
      if (!parsed) {
        safeSend(ws, { type: 'error', message: 'Malformed JSON' });
        return;
      }

      if (parsed.type === 'broadcast' && typeof parsed.message === 'string') {
        broadcast({
          type: 'broadcast',
          fromClientId: clientId,
          message: parsed.message,
          at: nowIso(),
        });
        return;
      }

      safeSend(ws, { type: 'error', message: 'Unsupported message type' });
    },
    close: (ws) => {
      const clientId = (ws.data as ConnectionData | undefined)?.clientId;

      if (!clientId) {
        return;
      }

      clients.delete(clientId);
      broadcast(buildPresencePayload());
    },
  })
  .get('/healthz', () => 'ok');

setInterval(() => {
  if (clients.size === 0) {
    return;
  }

  broadcast({ type: 'tick', serverTime: nowIso() });
}, 1000);

if (ALLOW_ANONYMOUS) {
  console.warn('JWT_SECRET is missing; allowing anonymous WebSocket connections in non-production.');
}

app.listen(PORT);
console.log(`WebSocket server listening on :${PORT}`);
