import type { Server } from 'node:http';
import type { IncomingMessage } from 'node:http';
import type { Duplex } from 'node:stream';

import { WebSocket, WebSocketServer } from 'ws';

import { getLogger } from '../config/logger.js';
import { getRealtimeConfig } from '../config/realtime.js';
import { setRealtimeBroadcaster } from './events.js';

export type RealtimeServer = {
  wss: WebSocketServer;
  close: () => Promise<void>;
};

export function attachWebSocketServer(httpServer: Server): RealtimeServer | null {
  const config = getRealtimeConfig();
  if (!config.enabled) {
    setRealtimeBroadcaster(null);
    return null;
  }

  const logger = getLogger().child({ component: 'realtime' });
  const wss = new WebSocketServer({ noServer: true });

  setRealtimeBroadcaster((event, data) => {
    const message = JSON.stringify({
      type: event,
      data,
      meta: { timestamp: new Date().toISOString() },
    });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });

  httpServer.on('upgrade', (request: IncomingMessage, socket: Duplex, head: Buffer) => {
    const url = request.url ?? '';
    if (!url.startsWith(config.wsPath)) {
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (ws, request) => {
    logger.info({ path: request.url }, 'WebSocket client connected');
    ws.send(
      JSON.stringify({
        type: 'connection.ack',
        data: { message: 'Connected to Huntlo realtime gateway' },
        meta: { timestamp: new Date().toISOString() },
      })
    );

    ws.on('close', () => {
      logger.debug('WebSocket client disconnected');
    });
  });

  logger.info({ wsPath: config.wsPath }, 'Realtime WebSocket server enabled');

  return {
    wss,
    close: () =>
      new Promise((resolve, reject) => {
        setRealtimeBroadcaster(null);
        wss.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      }),
  };
}
