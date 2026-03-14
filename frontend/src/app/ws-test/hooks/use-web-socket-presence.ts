'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type PresenceClient = {
  id: string;
  connectedAt: string;
};

type PresencePayload = {
  type: 'presence';
  clientCount: number;
  clients: PresenceClient[];
};

type TickPayload = {
  type: 'tick';
  serverTime: string;
};

type HelloPayload = {
  type: 'hello';
  clientId: string;
  serverTime: string;
};

type BroadcastPayload = {
  type: 'broadcast';
  fromClientId: string;
  message: string;
  at: string;
};

type ErrorPayload = {
  type: 'error';
  message: string;
};

type ServerMessage =
  | PresencePayload
  | TickPayload
  | HelloPayload
  | BroadcastPayload
  | ErrorPayload;

export type WebSocketStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error';

type UseWebSocketPresenceState = {
  status: WebSocketStatus;
  error: string | null;
  serverTime: string | null;
  presence: PresencePayload | null;
  clientId: string | null;
  lastBroadcasts: BroadcastPayload[];
  sendBroadcast: (message: string) => boolean;
};

const buildWebSocketUrl = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const explicitUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
  if (explicitUrl) {
    return explicitUrl;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const { hostname, port, host } = window.location;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const fallbackPort = port && port !== '3000' ? port : '3001';
    return `${protocol}://${hostname}:${fallbackPort}/ws`;
  }

  return `${protocol}://${host}/ws`;
};

const parseServerMessage = (raw: string): ServerMessage | null => {
  try {
    return JSON.parse(raw) as ServerMessage;
  } catch {
    return null;
  }
};

export const useWebSocketPresence = (): UseWebSocketPresenceState => {
  const [status, setStatus] = useState<WebSocketStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [serverTime, setServerTime] = useState<string | null>(null);
  const [presence, setPresence] = useState<PresencePayload | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [lastBroadcasts, setLastBroadcasts] = useState<BroadcastPayload[]>([]);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = buildWebSocketUrl();
    if (!url) {
      return;
    }

    setStatus('connecting');
    setError(null);

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('open');
      setError(null);
    };

    ws.onclose = () => {
      setStatus('closed');
    };

    ws.onerror = () => {
      setStatus('error');
      setError('WebSocket connection error.');
    };

    ws.onmessage = (event) => {
      const parsed = parseServerMessage(String(event.data));

      if (!parsed) {
        setError('Malformed message from server.');
        return;
      }

      if (parsed.type === 'hello') {
        setClientId(parsed.clientId);
        setServerTime(parsed.serverTime);
        return;
      }

      if (parsed.type === 'tick') {
        setServerTime(parsed.serverTime);
        return;
      }

      if (parsed.type === 'presence') {
        setPresence(parsed);
        return;
      }

      if (parsed.type === 'broadcast') {
        setLastBroadcasts((prev) => [parsed, ...prev].slice(0, 20));
        return;
      }

      if (parsed.type === 'error') {
        setError(parsed.message);
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, []);

  const sendBroadcast = useCallback((message: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setError('WebSocket is not connected.');
      return false;
    }

    const payload = JSON.stringify({ type: 'broadcast', message });
    ws.send(payload);
    return true;
  }, []);

  return {
    status,
    error,
    serverTime,
    presence,
    clientId,
    lastBroadcasts,
    sendBroadcast,
  };
};
