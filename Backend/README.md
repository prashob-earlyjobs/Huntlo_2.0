# Huntlo Backend..

Production backend for the Huntlo agentic AI recruiting platform.

**Status:** Phase 0 foundation implemented.

## Quick start

```bash
cp .env.example .env
npm install
npm run dev:api      # API server on PORT (default 4000)
npm run dev:worker   # Mongo lease-backed background worker
npm test
npm run build
npm run start:api
npm run start:worker
```

## Documentation

See [`docs/README.md`](./docs/README.md) for architecture, API contract map, and implementation plan.

## Implemented (Phase 0)

- Express 5 app with security headers, CORS, JSON/urlencoded parsers
- Raw webhook body capture on `/api/v1/public/webhooks/*`
- Structured logging (Pino), request ID + timing middleware
- MongoDB connection with query timing instrumentation
- Mongoose plugins: timestamps, audit fields, soft delete
- Global error + not-found handlers
- Health, readiness, version, OpenAPI docs endpoints
- Mongo-backed `BackgroundJob` queue with atomic leases (no Redis)
- Worker concurrency, heartbeat, exponential backoff, graceful shutdown
- Optional WebSocket gateway when `REALTIME_ENABLED=true`
- Shared utilities: validation, encryption, pagination, idempotency

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Liveness (legacy, no envelope) |
| GET | `/api/v1/health` | Liveness with success envelope |
| GET | `/api/v1/health/ready` | Readiness (MongoDB check) |
| GET | `/api/v1/version` | Version metadata |
| GET | `/api/v1/openapi.json` | OpenAPI 3.1 spec |
| GET | `/api/v1/docs` | Swagger UI |
| GET | `/api/v1/admin/jobs` | List background jobs (owner/admin) |
| GET | `/api/v1/admin/jobs/:id` | Job detail |
| POST | `/api/v1/admin/jobs/:id/retry` | Re-queue failed/cancelled job |
| POST | `/api/v1/admin/jobs/:id/cancel` | Cancel pending/running job |

## Processes

| Command | Process |
|---------|---------|
| `npm run dev` / `npm run dev:api` | API server |
| `npm run dev:worker` / `npm run worker` | Background worker |
| `npm run start:api` | Production API |
| `npm run start:worker` | Production worker |
| `npm test` | Vitest + Supertest |
