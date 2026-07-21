import type { Server } from 'node:http';
import type { IncomingMessage } from 'node:http';
import type { Duplex } from 'node:stream';

import { WebSocket, WebSocketServer } from 'ws';

import { getLogger } from '../config/logger.js';
import { getRealtimeConfig } from '../config/realtime.js';
import { verifyRealtimeTicket } from '../shared/auth/jwt.js';
import { setRealtimeBroadcaster, type RealtimeBroadcaster, type RealtimeTarget } from './events.js';
import { startApiRealtimeRedisSubscriber } from './redis-bridge.js';
import { ConnectionRegistry } from './registry.js';

export type RealtimeServer = {
  wss: WebSocketServer;
  registry: ConnectionRegistry;
  close: () => Promise<void>;
};

const HEARTBEAT_INTERVAL_MS = 25_000;
const HEARTBEAT_TIMEOUT_MS = 60_000;

type TicketPayload = {
  sub: string;
  orgId: string;
  role: string;
  sessionId: string;
  jti: string;
};

function extractTicket(request: IncomingMessage): string | null {
  try {
    const host = request.headers.host ?? 'localhost';
    const url = new URL(request.url ?? '/', `http://${host}`);
    const fromQuery = url.searchParams.get('ticket');
    if (fromQuery) return fromQuery;

    const protocols = String(request.headers['sec-websocket-protocol'] ?? '')
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    const ticketProto = protocols.find((p) => p.startsWith('ticket.'));
    if (ticketProto) return ticketProto.slice('ticket.'.length);

    return null;
  } catch {
    return null;
  }
}

function envelope(type: string, data: unknown) {
  return JSON.stringify({
    type,
    data,
    meta: { timestamp: new Date().toISOString() },
  });
}

function resolveTarget(
  data: unknown,
  target?: RealtimeTarget
): RealtimeTarget | null {
  if (target?.organizationId) {
    return {
      organizationId: target.organizationId,
      userId: target.userId ?? null,
    };
  }
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const organizationId =
      typeof record.organizationId === 'string' ? record.organizationId : null;
    if (!organizationId) return null;
    const userId = typeof record.userId === 'string' ? record.userId : null;
    return { organizationId, userId };
  }
  return null;
}

export function attachWebSocketServer(httpServer: Server): RealtimeServer | null {
  const config = getRealtimeConfig();
  if (!config.enabled) {
    setRealtimeBroadcaster(null);
    return null;
  }

  const logger = getLogger().child({ component: 'realtime' });
  const wss = new WebSocketServer({ noServer: true });
  const registry = new ConnectionRegistry();

  const forwardToClients: RealtimeBroadcaster = (event, data, target) => {
    const resolved = resolveTarget(data, target);
    if (!resolved) {
      logger.warn({ event }, 'Realtime emit skipped — missing organization target');
      return;
    }

    const clients = registry.resolve(resolved);
    if (clients.length === 0) return;

    const message = envelope(event, data);
    for (const client of clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    }
  };

  setRealtimeBroadcaster(forwardToClients);
  startApiRealtimeRedisSubscriber(forwardToClients);

  const heartbeatTimer = setInterval(() => {
    for (const stale of registry.listStale(HEARTBEAT_TIMEOUT_MS)) {
      logger.debug(
        { connectionId: stale.connectionId, userId: stale.userId },
        'Closing stale WebSocket connection'
      );
      try {
        stale.ws.terminate();
      } catch {
        // ignore
      }
      registry.remove(stale.connectionId);
    }

    registry.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.ping();
          client.ws.send(envelope('realtime.ping', { ts: Date.now() }));
        } catch {
          // ignore
        }
      }
    });
  }, HEARTBEAT_INTERVAL_MS);
  heartbeatTimer.unref?.();

  httpServer.on('upgrade', (request: IncomingMessage, socket: Duplex, head: Buffer) => {
    const url = request.url ?? '';
    if (!url.startsWith(config.wsPath)) {
      return;
    }

    const ticket = extractTicket(request);
    if (!ticket) {
      socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n');
      socket.destroy();
      return;
    }

    let payload: TicketPayload;
    try {
      payload = verifyRealtimeTicket(ticket);
    } catch {
      socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request, payload);
    });
  });

  wss.on('connection', (ws: WebSocket, _request: IncomingMessage, payload: TicketPayload) => {
    const client = registry.add({
      userId: payload.sub,
      organizationId: payload.orgId,
      role: payload.role,
      sessionId: payload.sessionId,
      ws,
    });

    logger.info(
      {
        connectionId: client.connectionId,
        userId: client.userId,
        organizationId: client.organizationId,
        connections: registry.size(),
      },
      'WebSocket client connected'
    );

    ws.send(
      envelope('realtime.connected', {
        connectionId: client.connectionId,
        organizationId: client.organizationId,
        userId: client.userId,
        message: 'Connected to Huntlo realtime gateway',
      })
    );

    ws.on('pong', () => {
      registry.touchPong(client.connectionId);
    });

    ws.on('message', (raw) => {
      try {
        const parsed = JSON.parse(String(raw)) as {
          type?: string;
        };
        if (parsed.type === 'realtime.pong' || parsed.type === 'pong') {
          registry.touchPong(client.connectionId);
          return;
        }
        if (parsed.type === 'realtime.ping' || parsed.type === 'ping') {
          registry.touchPong(client.connectionId);
          ws.send(envelope('realtime.pong', { ts: Date.now() }));
        }
      } catch {
        // ignore malformed client frames
      }
    });

    ws.on('close', () => {
      registry.remove(client.connectionId);
      logger.debug(
        { connectionId: client.connectionId, connections: registry.size() },
        'WebSocket client disconnected'
      );
    });

    ws.on('error', (error) => {
      logger.warn(
        { err: error, connectionId: client.connectionId },
        'WebSocket client error'
      );
      registry.remove(client.connectionId);
    });
  });

  logger.info({ wsPath: config.wsPath }, 'Realtime WebSocket server enabled');

  return {
    wss,
    registry,
    close: () =>
      new Promise((resolve, reject) => {
        clearInterval(heartbeatTimer);
        setRealtimeBroadcaster(null);
        registry.clear();
        wss.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      }),
  };
}
