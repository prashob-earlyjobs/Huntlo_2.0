import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { resetEnvCache } from '../src/config/env.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo';

describe('Health endpoints', () => {
  beforeAll(async () => {
    await startMemoryMongo();
    resetEnvCache();
    await connectDatabase();
  }, 30_000);

  afterAll(async () => {
    await disconnectDatabase();
    await stopMemoryMongo();
  });

  const app = createApp();

  it('GET /api/health returns liveness payload', async () => {
    const response = await request(app).get('/api/health').expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.requestId).toBeDefined();
    expect(response.headers['x-request-id']).toBeDefined();
  });

  it('GET /api/v1/health returns success envelope', async () => {
    const response = await request(app).get('/api/v1/health').expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
    expect(response.body.meta.requestId).toBeDefined();
  });

  it('GET /api/v1/health/ready returns ready when database is connected', async () => {
    const response = await request(app).get('/api/v1/health/ready').expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ready');
    expect(response.body.data.checks.database).toBe('up');
  });

  it('GET /api/v1/version returns version metadata', async () => {
    const response = await request(app).get('/api/v1/version').expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.version).toBe('0.1.0');
    expect(response.body.data.appEnv).toBe('test');
  });
});

describe('OpenAPI scaffolding', () => {
  const app = createApp();

  it('GET /api/v1/openapi.json returns OpenAPI document', async () => {
    const response = await request(app).get('/api/v1/openapi.json').expect(200);

    expect(response.body.openapi).toBe('3.1.0');
    expect(response.body.info.title).toBe('Huntlo API');
  });

  it('GET /api/v1/docs returns Swagger UI HTML', async () => {
    const response = await request(app).get('/api/v1/docs').expect(200);

    expect(response.text).toContain('swagger-ui');
    expect(response.text).toContain('/api/v1/openapi.json');
  });
});

describe('Webhook raw body support', () => {
  const app = createApp();

  it('POST /api/v1/public/webhooks/_probe preserves raw body', async () => {
    const payload = { event: 'test', value: 123 };
    const response = await request(app)
      .post('/api/v1/public/webhooks/_probe')
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(200);

    expect(response.body.received).toBe(true);
    expect(response.body.hasRawBody).toBe(true);
  });
});

describe('Route not found', () => {
  const app = createApp();

  it('returns structured 404 envelope', async () => {
    const response = await request(app).get('/api/v1/unknown-route').expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NOT_FOUND');
    expect(response.body.requestId).toBeDefined();
  });
});
