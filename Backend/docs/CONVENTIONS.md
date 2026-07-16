# Shared Engineering Conventions

**Version:** 0.1  
**Applies to:** All `Backend/src/**` code

---

## 1. TypeScript

- **Strict mode** enabled (`strict: true` in `tsconfig.json`)
- Prefer `interface` for object shapes; `type` for unions and utilities
- No `any` — use `unknown` + narrowing
- Path alias: `@/` → `src/`
- Barrel exports via each module's `index.ts` — avoid deep cross-module imports; use module public API only

---

## 2. Module structure

Every domain module follows:

```
modules/<name>/
  <name>.routes.ts       # Express Router, no business logic
  <name>.controller.ts   # HTTP in/out, calls service
  <name>.validation.ts   # Zod schemas (request + response)
  <name>.service.ts      # Business rules, orchestration
  <name>.repository.ts   # MongoDB queries only
  <name>.model.ts        # Mongoose schema + model
  <name>.types.ts        # Module-specific types
  index.ts               # export { router, service, ... }
  __tests__/
```

**Layer rules:**

| Layer | May call | Must not |
|-------|----------|----------|
| routes | controller | service, repository, mongoose |
| controller | service, validation | repository, mongoose |
| service | repository, providers, shared, other services | express req/res |
| repository | model | providers, express |

---

## 3. API design

### 3.1 Base path and versioning

- All REST routes mounted at `/api/v1`
- Breaking changes → `/api/v2` (never break v1 in place)
- Webhooks and OAuth at `/api/v1/public/*`

### 3.2 Response envelope

**Success (2xx):**
```typescript
{
  success: true,
  data: T,
  meta?: {
    requestId: string,
    pagination?: { page: number, limit: number, total: number, totalPages: number },
    [key: string]: unknown
  }
}
```

**Error (4xx/5xx):**
```typescript
{
  success: false,
  error: {
    code: string,        // SCREAMING_SNAKE_CASE
    message: string,     // Human-readable
    details?: Array<{ path?: string, message: string }>
  },
  requestId: string
}
```

Use `shared/http/response.ts` helpers: `ok(res, data, meta?)`, `fail(res, status, code, message, details?)`.

### 3.3 HTTP status codes

| Code | Usage |
|------|-------|
| 200 | GET, PATCH success, idempotent replay |
| 201 | POST create |
| 204 | DELETE success (no body) |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (wrong workspace/role) |
| 404 | Not found |
| 402 | Quota/credit exceeded |
| 409 | Conflict (state, duplicate) |
| 422 | Semantic validation (business rules) |
| 429 | Rate limited |
| 500 | Unexpected server error |
| 502 | Provider/upstream failure |

### 3.4 Dates

- **Store:** MongoDB `Date` (UTC)
- **API:** ISO 8601 strings (`2026-07-16T09:42:00.000Z`)
- **Never** store display strings like `"16 Jul 2026, 9:42 AM"` in DB
- Transition DTOs may include computed display fields per [MIGRATION_PLAN.md](./MIGRATION_PLAN.md)

### 3.5 Pagination

Query params: `page` (default 1), `limit` (default 20, max 100), `sort` (e.g. `-createdAt,name`)

Repository pattern:
```typescript
const { items, total } = await repo.findPaginated(filter, { page, limit, sort });
```

### 3.6 Filtering

Use explicit query params per resource — no generic Mongo query passthrough from client.

### 3.7 Idempotency

Header: `Idempotency-Key: <uuid v4>`

Required on:
- Contact reveal
- Campaign launch
- Message send
- Credit purchase
- Payment checkout create

Implementation: `shared/idempotency/` middleware + `IdempotencyRecord` collection, 24h TTL.

---

## 4. Validation

- **Zod** for all request bodies, query params, and env config
- Schemas live in `<module>.validation.ts`
- Export inferred types: `type CreateJobInput = z.infer<typeof createJobSchema>`
- Validation errors → `VALIDATION_ERROR` with `details` array from Zod `flatten()`

```typescript
// Controller pattern
const input = createJobSchema.parse(req.body);
```

---

## 5. Error handling

- Custom `AppError` in `shared/errors/app-error.ts` with `code`, `statusCode`, `details`
- Central error middleware in `middleware/error-handler.ts`:
  - `AppError` → structured response
  - `ZodError` → 400 `VALIDATION_ERROR`
  - Mongoose `ValidationError` → 400
  - Unknown → 500 `INTERNAL_ERROR` (log stack, hide from client)
- Never expose stack traces in production responses

---

## 6. Authentication & authorization

### 6.1 JWT

- Access token: 15 minutes, Bearer header
- Refresh token: 7 days, httpOnly cookie or body (document in API)
- Claims: `{ sub, orgId, role, permissions, iat, exp }`

### 6.2 Middleware chain

```
requestId → logger → cors → json → auth (optional) → workspace → permissions → route
```

### 6.3 Workspace scoping

- `X-Workspace-Id` header overrides JWT `orgId` when user is member of both
- Repository base class enforces `organizationId` filter on every query
- Controller receives `req.context = { userId, organizationId, role, permissions }`

### 6.4 Permissions

Format: `<module>:<action>` e.g. `jobs:write`, `outreach:launch`, `admin:read`

Check in controller or `middleware/require-permission.ts`.

---

## 7. Logging

- **Pino** via `config/logger.ts`
- Every request gets `requestId` (UUID v4) in `X-Request-Id` response header
- Log: `requestId`, `method`, `path`, `userId`, `organizationId`, `durationMs`, `statusCode`
- Never log secrets, tokens, or full PII
- Provider errors: log `providerId`, `operation`, `statusCode` — not raw credentials

---

## 8. Database (Mongoose)

### 8.1 Schema conventions

- `_id`: ObjectId (default)
- `organizationId`: ObjectId, required on tenant data, indexed
- `createdAt`, `updatedAt`: timestamps enabled
- `deletedAt`: optional soft delete
- String enums match frontend mock values exactly in schema
- `legacySourceId`: optional string for import traceability

### 8.2 Repository conventions

```typescript
class JobRepository {
  constructor(private readonly organizationId: string) {}

  async findById(id: string): Promise<JobDoc | null> {
    return JobModel.findOne({ _id: id, organizationId: this.organizationId, deletedAt: null });
  }
}
```

- No static org-agnostic queries in tenant modules
- Use `lean()` for read-only list endpoints when not modifying
- Transactions for multi-document writes (campaign launch, enrollment + usage debit)

### 8.3 Naming

- Collections: plural lowercase (`jobs`, `outreach_campaigns`, `conversation_messages`)
- Model names: PascalCase singular (`Job`, `OutreachCampaign`)

---

## 9. Provider adapters

```
providers/<name>/
  index.ts       # implements ProviderAdapter
  client.ts
  webhook.ts     # verify signature → NormalizedEvent
  config.schema.ts
  types.ts       # internal only
```

- Webhook handlers: verify → normalize → enqueue job → return 200 fast
- Never pass raw provider payloads to services
- Config keys match UI mock labels mapped to camelCase internally:
  - `Phone number ID` → `phoneNumberId`
  - `WABA ID` → `wabaId`
  - `Webhook signing key` → `webhookSigningKey`

---

## 10. Background jobs

- Define job types as const union in `workers/job-types.ts`
- Handler registry in `workers/registry.ts`
- Each handler:
  - Idempotent (check `idempotencyKey` or business key)
  - Extends lease heartbeat for long work
  - Records failure with `lastError` + stack
  - Moves to `dead` after `maxAttempts`

```typescript
async function handleCampaignStepExecute(job: JobRecord): Promise<void> {
  // ...
}
```

- API enqueues; never execute campaign steps inline in request handler

---

## 11. Realtime

- Publish via `realtime/broker.ts` — not direct WS from services
- Event names: dot-separated `domain.entity.action` (e.g. `conversation.message.created`)
- Payload: domain DTO, not Mongoose document

---

## 12. Usage metering

Before credit-consuming operations:

```typescript
await usageService.assertAndDebit({
  organizationId,
  metric: 'email-reveals',
  amount: 2,
  idempotencyKey,
  metadata: { candidateId },
});
```

Debit and action in same Mongo transaction where possible.

---

## 13. Encryption

- Provider secrets, OAuth tokens: AES-256-GCM via `shared/encryption/`
- Encryption key from env `ENCRYPTION_KEY` (32 bytes)
- Never return decrypted secrets in API — masked values only (`••••••`)

---

## 14. Audit

Log to `audit_logs` collection on:

- Workspace settings change
- Member role change
- Campaign launch/pause
- Admin user/plan change
- Provider connect/disconnect
- Data export

Fields: `organizationId`, `userId`, `action`, `module`, `relatedEntity`, `ip`, `timestamp`, `metadata`

---

## 15. Testing

- **Vitest** for unit tests
- **Supertest** for HTTP integration tests
- Test file naming: `<name>.test.ts` in `__tests__/`
- Minimum per module:
  - Validation schema tests (valid + invalid cases)
  - Service unit tests with mocked repository
  - One integration test per route file (happy path + 401 + 403)
- Provider tests use recorded fixtures from **official** payload examples — never invent webhook shapes

---

## 16. Environment variables

Validated at boot with Zod in `config/env.ts`. Required minimum:

```
NODE_ENV
PORT
MONGODB_URI
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
ENCRYPTION_KEY
CORS_ORIGINS
```

Fail fast on missing/invalid — no silent defaults for secrets.

---

## 17. Git & code style

- ESLint + Prettier (match Frontend where sensible)
- No committed `.env` files
- Conventional commits: `feat(jobs): add pipeline endpoint`
- PR size: prefer one module per PR after foundation phase

---

## 18. Express 5 specifics

- Use `express.Router()` per module
- `app.set('trust proxy', 1)` behind load balancer
- Async route handlers wrapped to catch rejections:

```typescript
const asyncHandler = (fn: RequestHandler) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

---

## 19. Documentation

- Update `FRONTEND_API_CONTRACT_MAP.md` when adding/changing endpoints
- Provider webhook changes require comment linking to official doc version/URL
- Module `README.md` optional — only for non-obvious domain rules
