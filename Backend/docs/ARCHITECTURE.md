# Huntlo Backend Architecture

**Version:** 0.1 (planning)  
**Date:** 2026-07-16  
**Stack:** Node.js · Express 5 · TypeScript · MongoDB · Mongoose · Zod · JWT · ws

---

## 1. Executive summary

Huntlo is an agentic AI recruiting platform. The existing Next.js frontend (`Frontend/`) is a **UI prototype** backed entirely by mock TypeScript data — no API client, auth, or persistence exists today. The `Backend/` folder is **greenfield**.

This document defines a **modular monolith** with three runtime processes:

| Process | Entry | Responsibility |
|---------|-------|----------------|
| **API** | `src/server.ts` → `src/app.ts` | REST `/api/v1`, webhooks, WebSocket upgrade |
| **Worker** | `src/worker.ts` | Background jobs, campaign execution, retries |
| **Shared library** | `src/shared/*`, `src/modules/*` | Domain logic used by both processes |

MongoDB is the system of record. Provider integrations are isolated under `src/providers/`.

---

## 2. Discovery findings

### 2.1 Frontend state

- **42 implemented routes** under `Frontend/app/` (dashboard + admin)
- **22 mock data modules** under `Frontend/lib/mock-*.ts`
- **No** `fetch`, axios, React Query, `app/api/`, or env-based API URLs
- **No** Zod/react-hook-form in app code — forms use `useState` + inline validation
- **3 nav-only stubs:** analytics, reports, assessments (no `page.tsx` yet)
- **No auth pages** — profile/settings simulate sessions

### 2.2 Legacy backend state

| Location | Finding |
|----------|---------|
| `Huntlo_2.0/Backend/` | Empty (this repo) |
| `Huntlo_2.0_UI_2.0/` | UI-only sibling; no backend source |
| `EarlyJobs_AI_Agent/backend/` | Separate assessment/interview stack (Mongoose, voice/SST) — **patterns only**, not Huntlo domain |
| `earlyjobs-migration/` | EarlyJobs HR onboarding models — **different product**, no campaign/outreach reuse |

**Conclusion:** No Huntlo backend to migrate. Frontend mocks are the **product specification**.

### 2.3 Provider documentation

No webhook payload schemas exist in-repo. Admin `PLATFORM_SETTINGS` and integration mocks define **Huntlo config key names** only. Webhook handlers must be implemented against **official provider docs** with adapter layers — never invent provider field names.

---

## 3. High-level architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Next.js Frontend (existing)                      │
│  Server Components + Client Workspaces → API client (to be added)         │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ REST /api/v1  +  WSS /realtime/v1
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           API Process (server.ts)                          │
│  Express 5 · JWT auth · Zod validation · request ID · error envelope      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────────────┐ │
│  │ Middleware  │  │ Module routes│  │ Webhook routes (public module)  │ │
│  └─────────────┘  └──────────────┘  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ WebSocket server (ws) — subscriptions, inbox, job progress          │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
   ┌─────────────┐      ┌─────────────┐      ┌─────────────────┐
   │   MongoDB   │      │   Worker    │      │ External APIs   │
   │  (Mongoose) │◄────►│  (worker.ts)│─────►│ Gmail, Meta WA, │
   │             │      │  job queue  │      │ Hunar, Calendly,│
   └─────────────┘      └─────────────┘      │ Razorpay, etc.  │
                                             └─────────────────┘
```

---

## 4. Modular monolith layout

```
Backend/
  src/
    app.ts              # Express app factory (no listen)
    server.ts           # API + WS bootstrap
    worker.ts           # Worker bootstrap

    config/
      env.ts            # Zod-validated environment
      database.ts       # Mongoose connection
      cors.ts
      logger.ts
      realtime.ts

    modules/            # One folder per domain (see §5)
    providers/          # External service adapters (see §8)
    middleware/         # auth, tenancy, requestId, idempotency
    realtime/           # WS protocol, rooms, fan-out
    workers/            # Job type handlers registered by worker.ts
    shared/             # Cross-cutting utilities
    types/              # Global TS types

  tests/
  scripts/              # Migrations, seed, ops
  docs/                 # This documentation set
```

Each module contains:

```
modules/<name>/
  <name>.routes.ts
  <name>.controller.ts
  <name>.validation.ts    # Zod schemas
  <name>.service.ts
  <name>.repository.ts
  <name>.model.ts         # Mongoose
  <name>.types.ts
  index.ts
  __tests__/
```

---

## 5. Domain modules

| Module | Scope |
|--------|-------|
| `auth` | Register, login, refresh, password reset, email verify, session management |
| `users` | Profile, preferences, appearance, notification prefs, active sessions |
| `organizations` | Workspaces, team, roles, module access, workspace settings, audit log |
| `jobs` | Job requirements CRUD, pipeline, hiring targets, screening config on job |
| `sourcing` | AI search sessions, interpreted criteria, streaming results, search history |
| `candidates` | Candidate graph, pool, saved lists, import, notes, pipeline status |
| `people-scout` | LinkedIn/email lookups, enrichment, reveal metering |
| `integrations` | Workspace provider connections (Gmail, WA, Calendly, etc.) |
| `outreach` | Campaign builder, launch, pause — uses canonical campaign models |
| `conversations` | Inbox threads, messages, AI reply, recruiter takeover |
| `huntlo-360` | Workflow builder → compiles into canonical campaign + screening + scheduling |
| `screening` | AI voice batches, results, transcripts — enrollments via campaign system |
| `assessments` | Async skills assessments (stub frontend; design now, implement later) |
| `scheduling` | Interviews, availability, calendar, Calendly sync |
| `plans` | Plan tiers, quotas, usage metering, credit costs |
| `billing` | Razorpay/Dodo checkout, invoices, webhooks |
| `analytics` | Dashboard metrics, funnel, channel comparison, reports |
| `notifications` | In-app notifications, delivery, read state |
| `admin` | Platform admin: users, workspaces, campaigns oversight, blog, platform settings |
| `public` | Health, OAuth callbacks, provider webhooks (unsigned ingress) |

---

## 6. Canonical campaign architecture

**One campaign system** serves outreach, Huntlo 360, and screening-triggered sequences. Do not create parallel Campaign collections.

### 6.1 Core entities

```
OutreachCampaign
  ├── sourceModule: "outreach" | "huntlo360" | "screening"
  ├── organizationId, jobId?, ownerId
  ├── status: Draft | Scheduled | Running | Paused | Completed | Failed
  ├── config: channels, timezone, qualification, AI reply settings
  └── metrics: enrolled, sent, delivered, replies, interested, qualified

OutreachSequenceStep[]
  ├── campaignId, order, type, delayDays, template refs, sendWindow, stopOnReply

OutreachEnrollment[]
  ├── campaignId, candidateId, channel, currentStepId
  ├── delivery, replyStatus, qualification, screening, interview states
  └── stopReason?

ConversationThread
  ├── enrollmentId?, candidateId, campaignId?, jobId?
  └── channels[], lastMessageAt, unread, qualification, screeningStatus

ConversationMessage[]
  ├── threadId, channel, author, text, delivery, providerMessageId?
  └── attachments?, voiceSummary?
```

### 6.2 Module mapping

| Frontend surface | `sourceModule` | Backend behavior |
|------------------|----------------|------------------|
| `/dashboard/outreach/*` | `outreach` | Direct campaign CRUD + sequence runner |
| `/dashboard/huntlo-360/*` | `huntlo360` | Workflow compiler → campaign + screening config + scheduling hooks |
| `/dashboard/screening/*` (voice outreach leg) | `screening` | Screening batch links to campaign for notify/enroll steps |
| Admin `/admin/campaigns` | all | Read-only aggregate across modules |

### 6.3 Huntlo 360 compiler

`WorkflowBuilderState` (7-step wizard) compiles to:

1. `OutreachCampaign` with `sourceModule: "huntlo360"` + derived sequence steps
2. `ScreeningBatch` record (if `screeningEnabled`)
3. Scheduling defaults bound to Calendly integration
4. Qualification questions → campaign qualification config

No separate "Workflow execution engine" — the worker runs the same enrollment/sequence pipeline with module-specific post-step hooks.

### 6.4 Legacy compatibility

No legacy Huntlo campaign records exist. A `legacy-campaign-adapter` service is **deferred** until external data import is required. Admin `sourceModule: "Outreach"` maps to `outreach` (normalized lowercase in API).

---

## 7. Multi-tenancy model

```
Platform
  └── Organization (workspace)     ← Frontend WORKSPACES
        ├── members (TeamMember)   ← roles, moduleAccess
        ├── subscription / plan
        ├── usage quotas
        ├── integrations (per workspace)
        └── all domain data scoped by organizationId
```

- JWT claims: `sub` (userId), `orgId` (active workspace), `role`, `permissions[]`
- Middleware resolves workspace from header `X-Workspace-Id` or JWT default
- All repository queries **must** include `organizationId` (enforced in base repository)
- Platform admin uses separate `admin` role with cross-tenant read (audited)

---

## 8. Provider adapter layer

Each provider under `src/providers/<name>/`:

```
index.ts          # Factory implementing ProviderAdapter interface
client.ts         # HTTP/SDK calls
webhook.ts        # Signature verify + normalize to internal events
types.ts          # Internal normalized types only
config.ts         # Zod schema for workspace + platform config keys
```

| Provider ID | Category | Config keys (from UI mocks) | Webhook route |
|-------------|----------|----------------------------|---------------|
| `future-jobs` | Candidate data | API base URL, API key, Client ID, Environment | — |
| `gemini` | LLM | Project ID, API key, Model, Region | — |
| `gmail` | Email | Client ID, Client secret, Redirect URI, Scopes | OAuth callback |
| `outlook` | Email | Tenant ID, Client ID, Client secret | OAuth callback |
| `zoho` | Email | Client ID, Client secret, Data centre, Redirect URI | OAuth callback |
| `smtp` | Email | fromEmail, smtpHost, smtpPort, imapHost, etc. | — |
| `meta-whatsapp` | WhatsApp | Phone number ID, WABA ID, Access token, Verify token | `POST /api/v1/public/webhooks/meta-whatsapp` |
| `gupshup` | WhatsApp | App name, API key, Source number | `POST /api/v1/public/webhooks/gupshup` |
| `hunar` | AI Voice | Account ID, API token, Webhook secret, Default voice | `POST /api/v1/public/webhooks/hunar` |
| `calendly` | Scheduling | Organisation URI, PAT, Webhook signing key, Default event | `POST /api/v1/public/webhooks/calendly` |
| `razorpay` | Payments | Key ID, Key secret, Webhook secret, Mode | `POST /api/v1/public/webhooks/razorpay` |
| `dodo` | Payments | Merchant ID, API key, Webhook secret, Environment | `POST /api/v1/public/webhooks/dodo` |

**Rule:** Provider webhook handlers parse **official payloads**, map to internal `ProviderEvent` types, then emit domain events. Never expose raw provider shapes to frontend.

---

## 9. Background work architecture

### 9.1 Principles

- API process **enqueues** jobs; worker process **executes** them
- No cron/schedulers in API instances
- Mongo-backed `JobRecord` collection with lease locks
- Idempotent handlers keyed by `idempotencyKey`
- Dead-letter queue with admin visibility

### 9.2 JobRecord schema (conceptual)

```typescript
{
  _id, type, payload, status: queued|running|completed|failed|dead,
  leaseOwner?, leaseExpiresAt?, attempts, maxAttempts,
  idempotencyKey?, lastError?, createdAt, updatedAt
}
```

### 9.3 Distributed lease

Worker polls `queued` jobs where `leaseExpiresAt < now`, atomically sets `leaseOwner` + `leaseExpiresAt` (e.g. 60s). Heartbeat extends lease. On crash, job becomes available again.

### 9.4 Job types (initial)

| Type | Trigger |
|------|---------|
| `sourcing.run` | Search session started |
| `sourcing.enrich` | Candidate enrichment batch |
| `campaign.launch` | Campaign scheduled/running |
| `campaign.step.execute` | Per-enrollment step dispatch |
| `campaign.classify_reply` | Inbound message → Gemini qualification |
| `screening.place_call` | Hunar outbound |
| `screening.process_result` | Hunar webhook completion |
| `integration.sync_inbox` | Gmail/IMAP poll |
| `billing.webhook.process` | Payment event |
| `notification.dispatch` | Push to WS + persist |
| `usage.reset` | Billing cycle quota reset |

### 9.5 Sensitive operations + idempotency

HTTP `POST` endpoints that spend credits, send messages, or reveal contacts accept:

```
Idempotency-Key: <uuid>
```

Stored in `IdempotencyRecord` with 24h TTL. Duplicate requests return cached response.

---

## 10. Realtime architecture

WebSocket gateway at `wss://<host>/realtime/v1` (configurable).

### 10.1 Auth

JWT passed as query param or `Sec-WebSocket-Protocol` on connect. Validate same as REST.

### 10.2 Rooms

| Room pattern | Events |
|--------------|--------|
| `org:{orgId}` | usage updates, plan changes |
| `user:{userId}` | notifications |
| `thread:{threadId}` | new messages, delivery receipts |
| `session:{sessionId}` | sourcing progress (`running` → `partial` → `completed`) |
| `campaign:{campaignId}` | enrollment stats, funnel updates |
| `screening:{batchId}` | call progress, result ready |

### 10.3 Event envelope

```json
{
  "type": "conversation.message.created",
  "data": { },
  "meta": { "timestamp": "2026-07-16T09:42:00.000Z" }
}
```

Worker publishes via shared `realtime/broker.ts` (Mongo change streams or Redis pub/sub — start with in-process fan-out for single worker, add Redis when scaling).

---

## 11. Data model highlights

### 11.1 ID strategy

- MongoDB `ObjectId` internally
- API exposes string IDs (ObjectId hex or prefixed slugs during transition)
- Frontend mock IDs (`j1`, `camp-1`, `cand-1`) are **seed data only** — production uses ObjectIds

### 11.2 Status enums

Preserve **human-readable strings** matching frontend mocks in API responses:

- Job: `Draft`, `Active`, `Paused`, `On Hold`, `Closed`, `Archived`
- Campaign: `Draft`, `Scheduled`, `Running`, `Paused`, `Completed`, `Failed`
- Session: `completed`, `running`, `partial`, `failed`, `empty` (lowercase per mock)
- Channel: `Email`, `WhatsApp`, `AI Voice`, `LinkedIn`, `Calendly`

Normalize internally where needed; response DTO mappers enforce frontend contract.

### 11.3 Credit metering

From mocks:

| Action | Credits |
|--------|---------|
| Email reveal | 2 |
| Mobile reveal | 5 |
| Email send | 1 |
| WhatsApp message | 2 |
| AI Voice call | 6 |

Metered via `shared/usage/` before action; recorded in `UsageEvent` collection.

---

## 12. API conventions (summary)

Base path: `/api/v1`

**Success:**
```json
{
  "success": true,
  "data": {},
  "meta": { "requestId": "...", "pagination": { "page": 1, "limit": 20, "total": 100 } }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Campaign name is required.",
    "details": [{ "path": "name", "message": "Required" }]
  },
  "requestId": "..."
}
```

See [CONVENTIONS.md](./CONVENTIONS.md) for full standards.

---

## 13. Security

- JWT access (15m) + refresh (7d) rotation
- bcrypt password hashing
- Workspace-scoped authorization on every mutating route
- Provider secrets encrypted at rest (`shared/encryption/`)
- Webhook signature verification per provider
- Rate limiting on auth, reveal, and send endpoints
- Audit log for admin and sensitive workspace actions
- CORS restricted to frontend origin(s)

---

## 14. Deployment topology (target)

```
                    ┌──────────────┐
                    │   CDN / LB   │
                    └──────┬───────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │ API x N    │  │ Worker x M │  │  MongoDB   │
    │ (stateless)│  │ (lease)    │  │  Atlas     │
    └────────────┘  └────────────┘  └────────────┘
```

Environment variables validated at boot via Zod (`config/env.ts`). Fail fast on missing secrets.

---

## 15. Frontend integration (future, not in this phase)

When connecting frontend:

1. Add `Frontend/lib/api/` — typed client, auth interceptor, error normalizer
2. Add `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL`
3. Replace mock imports page-by-page per module execution order
4. Add auth pages (`/login`, `/register`, `/onboarding`) — not in current UI
5. Add middleware.ts for protected dashboard routes

**Do not rebuild frontend components** — only swap data sources.

---

## 16. Out of scope (this planning phase)

- Module implementation code
- Provider SDK integration
- Database migrations / seed scripts (designed, not written)
- CI/CD pipeline
- Infrastructure as code

See [MODULE_EXECUTION_ORDER.md](./MODULE_EXECUTION_ORDER.md) for implementation phasing.
