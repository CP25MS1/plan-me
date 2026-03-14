'use client';

import { useMemo, useState } from 'react';
import { useWebSocketPresence, WebSocketStatus } from '../hooks/use-web-socket-presence';

const statusMeta: Record<
  WebSocketStatus,
  { label: string; className: string }
> = {
  idle: {
    label: 'Idle',
    className: 'border-slate-200 bg-slate-50 text-slate-600',
  },
  connecting: {
    label: 'Connecting',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  open: {
    label: 'Connected',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  closed: {
    label: 'Closed',
    className: 'border-slate-200 bg-slate-50 text-slate-600',
  },
  error: {
    label: 'Error',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
  },
};

const formatTime = (iso: string | null) => {
  if (!iso) {
    return '--:--:--';
  }

  return new Date(iso).toLocaleTimeString();
};

const WsTestClient = () => {
  const {
    status,
    error,
    serverTime,
    presence,
    clientId,
    lastBroadcasts,
    sendBroadcast,
  } = useWebSocketPresence();
  const [message, setMessage] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);

  const currentStatus = statusMeta[status];
  const clientCount = presence?.clientCount ?? 0;
  const clients = presence?.clients ?? [];

  const lastTick = useMemo(() => formatTime(serverTime), [serverTime]);

  const handleSend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    const ok = sendBroadcast(trimmed);
    if (ok) {
      setMessage('');
      setSendError(null);
    } else {
      setSendError('Unable to send. Connection is not open.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <header className="rounded-3xl border border-emerald-100 bg-white/80 p-8 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
                WebSocket Production Check
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                Realtime Presence & Broadcast Test
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                This page connects directly to the ElysiaJS WebSocket service and
                visualizes connection status, presence changes, and broadcast
                events.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <span
                className={`inline-flex items-center justify-center rounded-full border px-3 py-1 font-medium ${currentStatus.className}`}
              >
                {currentStatus.label}
              </span>
              <span className="text-xs text-slate-500">
                Server tick: <span className="font-semibold">{lastTick}</span>
              </span>
              {clientId ? (
                <span className="text-xs text-slate-500">
                  Client ID: <span className="font-mono">{clientId}</span>
                </span>
              ) : null}
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Presence</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {clientCount} active
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Connected clients update in real-time when a tab joins or leaves.
            </p>
            <div className="mt-4 space-y-3">
              {clients.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">
                  No active clients yet.
                </div>
              ) : (
                clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                  >
                    <span className="font-mono text-xs text-slate-600">
                      {client.id}
                    </span>
                    <span className="text-xs text-slate-500">
                      Connected at {formatTime(client.connectedAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Broadcast Tester
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Send a broadcast event and watch it appear on all connected tabs.
            </p>
            <form onSubmit={handleSend} className="mt-4 flex flex-col gap-3">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Type a quick message..."
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
              >
                Send Broadcast
              </button>
              {sendError ? (
                <p className="text-xs font-semibold text-rose-600">{sendError}</p>
              ) : null}
              {error ? (
                <p className="text-xs font-semibold text-rose-600">{error}</p>
              ) : null}
            </form>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Broadcast Log</h2>
            <span className="text-xs text-slate-400">
              Latest {lastBroadcasts.length}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {lastBroadcasts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">
                No broadcasts yet.
              </div>
            ) : (
              lastBroadcasts.map((item, index) => (
                <div
                  key={`${item.at}-${index}`}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                >
                  <p className="text-sm font-semibold text-slate-800">
                    {item.message}
                  </p>
                  <div className="mt-2 text-xs text-slate-500">
                    <span className="font-mono">{item.fromClientId}</span>
                    <span className="mx-2">•</span>
                    <span>{formatTime(item.at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default WsTestClient;
