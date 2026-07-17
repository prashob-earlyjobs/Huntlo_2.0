import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import WebSocket from 'ws';

import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { resetEnvCache } from '../src/config/env.js';
import { clearRateLimits } from '../src/middleware/rate-limit.js';
import { NotificationModel } from '../src/modules/notifications/notification.model.js';
import { notificationsService } from '../src/modules/notifications/notifications.service.js';
import { OnboardingModel } from '../src/modules/auth/onboarding.model.js';
import { UserSessionModel } from '../src/modules/auth/session.model.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { OrganizationMemberModel } from '../src/modules/organizations/member.model.js';
import { OrganizationModel } from '../src/modules/organizations/organization.model.js';
import { attachWebSocketServer, type RealtimeServer } from '../src/realtime/server.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerAndAuth(agent: ReturnType<typeof request.agent>) {
  const response = await agent.post('/api/v1/auth/register').send({
    email: `notify-${Date.now()}@huntlo.ai`,
    password: 'Password123!',
    firstName: 'Notify',
    lastName: 'Tester',
    organizationName: `Notify Org ${Date.now()}`,
  });
  expect(response.status).toBe(201);
  return {
    token: response.body.data.accessToken as string,
    organizationId: response.body.data.organization.id as string,
    userId: response.body.data.user.id as string,
  };
}

function waitForEvent(
  socket: WebSocket,
  type: string,
  timeoutMs = 5_000
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for ${type}`));
    }, timeoutMs);

    function onMessage(raw: WebSocket.RawData) {
      try {
        const event = JSON.parse(String(raw)) as {
          type?: string;
          data?: Record<string, unknown>;
        };
        if (event.type === type) {
          cleanup();
          resolve(event.data ?? {});
        }
      } catch {
        // ignore
      }
    }

    function cleanup() {
      clearTimeout(timer);
      socket.off('message', onMessage);
    }

    socket.on('message', onMessage);
  });
}

describe('Notifications + realtime', () => {
  const app = createApp();
  let agent: ReturnType<typeof request.agent>;
  let httpServer: Server;
  let realtime: RealtimeServer | null;
  let port: number;

  beforeAll(async () => {
    process.env.REALTIME_ENABLED = 'true';
    resetEnvCache();
    await startMemoryMongo();
    await connectDatabase();
    agent = request.agent(app);
    httpServer = createServer(app);
    realtime = attachWebSocketServer(httpServer);
    await new Promise<void>((resolve) => {
      httpServer.listen(0, '127.0.0.1', () => resolve());
    });
    port = (httpServer.address() as AddressInfo).port;
  }, 60_000);

  afterAll(async () => {
    if (realtime) await realtime.close();
    await new Promise<void>((resolve, reject) => {
      httpServer.close((error) => (error ? reject(error) : resolve()));
    });
    await disconnectDatabase();
    await stopMemoryMongo();
    process.env.REALTIME_ENABLED = 'false';
    resetEnvCache();
  });

  beforeEach(async () => {
    clearRateLimits();
    await Promise.all([
      NotificationModel.deleteMany({}),
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      UserModel.deleteMany({}),
    ]);
  });

  it(
    'lists, marks read, and isolates notifications by user/org',
    async () => {
    const auth = await registerAndAuth(agent);
    const other = await registerAndAuth(agent);

    await notificationsService.create({
      organizationId: auth.organizationId,
      userId: auth.userId,
      type: 'team_invitation',
      severity: 'info',
      title: 'Welcome',
      message: 'You joined Huntlo',
    });
    await notificationsService.create({
      organizationId: other.organizationId,
      userId: other.userId,
      type: 'billing_event',
      severity: 'info',
      title: 'Other org',
      message: 'Should not leak',
    });

    const list = await agent
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].title).toBe('Welcome');

    const unread = await agent
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(unread.status).toBe(200);
    expect(unread.body.data.count).toBe(1);

    const id = list.body.data[0].id as string;
    const marked = await agent
      .post(`/api/v1/notifications/${id}/read`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(marked.status).toBe(200);
    expect(marked.body.data.read).toBe(true);

    const blocked = await agent
      .post(`/api/v1/notifications/${id}/read`)
      .set('Authorization', `Bearer ${other.token}`);
    expect(blocked.status).toBe(404);

    const deleted = await agent
      .delete(`/api/v1/notifications/${id}`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(deleted.status).toBe(200);
    },
    20_000
  );

  it('requires auth for realtime ticket and rejects WS without ticket', async () => {
    const unauth = await agent.post('/api/v1/realtime/ticket');
    expect(unauth.status).toBe(401);

    const auth = await registerAndAuth(agent);
    const ticketRes = await agent
      .post('/api/v1/realtime/ticket')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(ticketRes.status).toBe(201);
    expect(ticketRes.body.data.ticket).toBeTruthy();
    expect(ticketRes.body.data.expiresInSeconds).toBe(60);

    await new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(`ws://127.0.0.1:${port}/realtime/v1`);
      socket.on('open', () => {
        socket.close();
        reject(new Error('Expected unauthorized upgrade to fail'));
      });
      socket.on('unexpected-response', (_req, res) => {
        expect(res.statusCode).toBe(401);
        res.resume();
        resolve();
      });
      socket.on('error', () => {
        // Some environments surface this as a generic error.
        resolve();
      });
    });
  });

  it('connects with ticket, receives targeted notification, and reconnects', async () => {
    const auth = await registerAndAuth(agent);
    const other = await registerAndAuth(agent);

    async function openSocket(token: string) {
      const ticketRes = await agent
        .post('/api/v1/realtime/ticket')
        .set('Authorization', `Bearer ${token}`);
      expect(ticketRes.status).toBe(201);
      const ticket = ticketRes.body.data.ticket as string;
      const socket = new WebSocket(
        `ws://127.0.0.1:${port}/realtime/v1?ticket=${encodeURIComponent(ticket)}`
      );
      await waitForEvent(socket, 'realtime.connected');
      return socket;
    }

    const socketA = await openSocket(auth.token);
    const socketB = await openSocket(other.token);

    const waitA = waitForEvent(socketA, 'notification.created');
    const waitB = waitForEvent(socketB, 'notification.created', 1500).then(
      () => {
        throw new Error('Cross-org notification leak');
      },
      () => null
    );

    await notificationsService.create({
      organizationId: auth.organizationId,
      userId: auth.userId,
      type: 'quota_warning',
      severity: 'warning',
      title: 'Low credits',
      message: 'Search credits are running low',
    });

    const payload = await waitA;
    expect(payload.userId).toBe(auth.userId);
    expect((payload.notification as { title?: string }).title).toBe('Low credits');
    await waitB;

    socketA.close();
    await new Promise((r) => setTimeout(r, 50));

    const reconnected = await openSocket(auth.token);
    const reconnectWait = waitForEvent(reconnected, 'notification.created');
    await notificationsService.create({
      organizationId: auth.organizationId,
      userId: auth.userId,
      type: 'billing_event',
      severity: 'info',
      title: 'Invoice ready',
      message: 'Your invoice is available',
    });
    const second = await reconnectWait;
    expect((second.notification as { title?: string }).title).toBe('Invoice ready');

    socketB.close();
    reconnected.close();
  });
});
