# Backend Folder Structure

**Version:** 0.1 — scaffold created, not implemented

```
Backend/
├── README.md
├── .gitignore
├── package.json                    # (Phase 0)
├── tsconfig.json                   # (Phase 0)
├── .env.example                    # (Phase 0)
│
├── docs/
│   ├── README.md                   # Documentation index
│   ├── ARCHITECTURE.md             # System design
│   ├── FRONTEND_API_CONTRACT_MAP.md
│   ├── MIGRATION_PLAN.md
│   ├── CONVENTIONS.md
│   ├── MODULE_EXECUTION_ORDER.md
│   └── RISK_REGISTER.md
│
├── scripts/
│   ├── .gitkeep
│   ├── seed-dev.ts                 # (Phase 2) Mock data → MongoDB
│   └── migrations/                 # (Phase 0+) Versioned migrations
│
├── tests/
│   ├── .gitkeep
│   ├── setup.ts
│   └── integration/                # Supertest HTTP tests
│
└── src/
    ├── app.ts                      # Express app factory
    ├── server.ts                   # API process entry
    ├── worker.ts                   # Worker process entry
    │
    ├── config/
    │   ├── env.ts                  # Zod-validated environment
    │   ├── database.ts             # Mongoose connection
    │   ├── cors.ts
    │   ├── logger.ts
    │   └── realtime.ts
    │
    ├── types/
    │   └── .gitkeep                # Global TS types
    │
    ├── middleware/
    │   ├── auth.ts
    │   ├── workspace.ts
    │   ├── request-id.ts
    │   ├── idempotency.ts
    │   ├── error-handler.ts
    │   └── require-permission.ts
    │
    ├── shared/
    │   ├── errors/
    │   │   └── app-error.ts
    │   ├── http/
    │   │   └── response.ts         # ok(), fail()
    │   ├── validation/
    │   │   └── common-schemas.ts   # objectId, pagination, isoDate
    │   ├── pagination/
    │   │   └── paginate.ts
    │   ├── encryption/
    │   │   └── cipher.ts
    │   ├── idempotency/
    │   │   ├── model.ts
    │   │   └── middleware.ts
    │   ├── audit/
    │   │   ├── model.ts
    │   │   └── audit.ts
    │   ├── usage/
    │   │   ├── model.ts
    │   │   └── usage-service.ts
    │   └── logging/
    │       └── request-logger.ts
    │
    ├── realtime/
    │   ├── server.ts               # ws attach to HTTP server
    │   ├── broker.ts               # publish to rooms
    │   ├── auth.ts                 # JWT on connect
    │   └── events.ts               # Event type constants
    │
    ├── workers/
    │   ├── registry.ts             # job type → handler map
    │   ├── job-types.ts
    │   ├── job-record.model.ts
    │   ├── lease.ts                # Distributed lease acquire/release
    │   └── handlers/
    │       ├── sourcing.run.ts
    │       ├── campaign.launch.ts
    │       ├── campaign.step.execute.ts
    │       ├── screening.place_call.ts
    │       └── ...
    │
    ├── providers/
    │   ├── types.ts                # ProviderAdapter interface
    │   ├── future-jobs/
    │   │   ├── index.ts
    │   │   ├── client.ts
    │   │   └── config.schema.ts
    │   ├── gemini/
    │   ├── gmail/
    │   │   ├── index.ts
    │   │   ├── client.ts
    │   │   ├── oauth.ts
    │   │   └── config.schema.ts
    │   ├── outlook/
    │   ├── zoho/
    │   ├── smtp/
    │   ├── meta-whatsapp/
    │   │   ├── webhook.ts          # Official Meta payload parser
    │   │   └── ...
    │   ├── gupshup/
    │   │   └── webhook.ts
    │   ├── hunar/
    │   │   └── webhook.ts
    │   ├── calendly/
    │   │   └── webhook.ts
    │   ├── razorpay/
    │   │   └── webhook.ts
    │   └── dodo/
    │       └── webhook.ts
    │
    └── modules/
        ├── auth/
        │   ├── auth.routes.ts
        │   ├── auth.controller.ts
        │   ├── auth.validation.ts
        │   ├── auth.service.ts
        │   ├── auth.repository.ts
        │   ├── auth.model.ts       # RefreshToken
        │   ├── auth.types.ts
        │   ├── index.ts
        │   └── __tests__/
        │
        ├── users/                  # Profile, preferences, sessions
        ├── organizations/          # Workspaces, team, settings, audit
        ├── jobs/
        ├── sourcing/
        ├── candidates/
        ├── people-scout/
        ├── integrations/
        │
        ├── outreach/               # Canonical campaign models live here
        │   ├── outreach.routes.ts
        │   ├── outreach.controller.ts
        │   ├── outreach.validation.ts
        │   ├── outreach.service.ts
        │   ├── outreach.repository.ts
        │   ├── outreach-campaign.model.ts
        │   ├── outreach-enrollment.model.ts
        │   ├── outreach-sequence-step.model.ts
        │   ├── campaign-runner.service.ts
        │   └── ...
        │
        ├── conversations/
        │   ├── conversation-thread.model.ts
        │   └── conversation-message.model.ts
        │
        ├── huntlo-360/
        │   ├── workflow.model.ts
        │   └── workflow-compiler.service.ts
        │
        ├── screening/
        ├── assessments/
        ├── scheduling/
        ├── plans/
        ├── billing/
        ├── analytics/
        ├── notifications/
        │
        ├── admin/
        │   └── platform-settings.service.ts
        │
        └── public/
            ├── health.routes.ts
            ├── webhook.routes.ts
            └── oauth.routes.ts
```

## Module file convention

Each `modules/<name>/` directory contains:

| File | Responsibility |
|------|----------------|
| `<name>.routes.ts` | Express Router, path registration |
| `<name>.controller.ts` | Parse request, call service, send response |
| `<name>.validation.ts` | Zod schemas |
| `<name>.service.ts` | Business logic |
| `<name>.repository.ts` | Database access |
| `<name>.model.ts` | Mongoose schema(s) |
| `<name>.types.ts` | Module TypeScript types |
| `index.ts` | Public exports |
| `__tests__/` | Unit + integration tests |

## Canonical campaign model location

All campaign persistence lives under `modules/outreach/`:

- `OutreachCampaign`
- `OutreachEnrollment`
- `OutreachSequenceStep`

`modules/huntlo-360/` and `modules/screening/` **reference** these models via services — they do not define parallel collections.

## Process entrypoints

| File | Runtime |
|------|---------|
| `src/server.ts` | `node dist/server.js` — REST + WebSocket, no job execution |
| `src/worker.ts` | `node dist/worker.js` — job poll loop only, no HTTP listen |
| `src/app.ts` | Imported by server.ts; exported for Supertest |
