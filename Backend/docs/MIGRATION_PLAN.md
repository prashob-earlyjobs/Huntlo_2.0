# Migration & Compatibility Plan

**Version:** 0.1  
**Date:** 2026-07-16

---

## 1. Situation assessment

| Asset | Status | Action |
|-------|--------|--------|
| Huntlo backend in `Huntlo_2.0/Backend/` | Empty | Greenfield build |
| Huntlo frontend mocks | Complete product spec | **Primary contract source** |
| `Huntlo_2.0_UI_2.0` | UI-only sibling | Ignore for backend; optional UI pattern reference |
| `EarlyJobs_AI_Agent/backend` | Assessment/voice interview stack | **Selective pattern reuse** (see §4) |
| `earlyjobs-migration` | EarlyJobs HR data | **No migration** — different product domain |
| Provider webhook docs in repo | None | Implement from official provider docs |

**There is no Huntlo production database to migrate.** This plan covers compatibility between frontend mocks, future production data, and optional imports from related systems.

---

## 2. Reuse matrix

### 2.1 Reuse directly (frontend → backend DTOs)

| Source | Reuse as |
|--------|----------|
| `Frontend/lib/types.ts` | Shared enum definitions in API responses |
| `Frontend/lib/mock-*.ts` interfaces | Zod response schemas + Mongoose field guides |
| `Frontend/components/outreach/builder-types.ts` | `POST /campaigns` request validation |
| `Frontend/components/huntlo-360/workflow-builder.tsx` `WorkflowBuilderState` | `POST /huntlo-360/workflows` request validation |
| `Frontend/lib/mock-integrations.ts` provider IDs | Provider registry keys |
| `Frontend/lib/mock-admin.ts` `PLATFORM_SETTINGS` field labels | Platform config schema keys |
| `Frontend/lib/routes.ts` | REST resource naming alignment |

### 2.2 Reuse as patterns only (not code copy)

| Source | Reusable patterns |
|--------|-------------------|
| `EarlyJobs_AI_Agent/backend` | Mongoose model structure, interview session lifecycle, voice/SST service layout, webhook ingestion flow |
| Express + middleware organization | General Node patterns |
| `earlyjobs-migration` | Mongo connection scripts style |

### 2.3 Must rewrite (net new)

- Entire Huntlo domain layer (jobs, sourcing, campaigns, conversations, billing)
- Multi-tenant workspace authorization
- Canonical campaign execution engine
- All provider adapters (Gmail, Meta WA, Gupshup, Hunar, Calendly, Razorpay, Dodo, Future Jobs, Gemini)
- Webhook receivers and signature verification
- Worker/job queue with distributed leases
- WebSocket realtime gateway
- Usage metering and credit system
- Admin cross-tenant APIs
- Auth flows (login, register, onboarding — **no frontend pages exist yet**)

---

## 3. Frontend compatibility strategy

### 3.1 Response shape alignment

Backend response DTOs must match mock interfaces **field-for-field** on first integration pass. Differences to manage:

| Mock convention | Backend convention | Compatibility approach |
|-----------------|-------------------|------------------------|
| String IDs (`j1`, `camp-1`) | ObjectId hex | Seed script uses mock IDs; production uses ObjectIds; frontend accepts both |
| `createdDaysAgo: number` | `createdAt: ISO string` | Response mapper computes `createdDaysAgo` for outreach list during transition |
| `date: "16 Jul 2026, 9:42 AM"` | `createdAt` ISO | Response mapper formats display `date` field OR frontend updated to format ISO |
| `lastActivity: "2h ago"` | `lastActivityAt` ISO | Mapper provides relative string initially |
| `owner: "Ananya Sharma"` | `ownerId` + `ownerName` | Always include denormalized `owner` string in list DTOs |
| Session `state` lowercase | Internal enum | Keep lowercase in API per mock |
| Job `status` title case | Same | Preserve exact strings |

**Recommendation:** Phase 1 — backend adds computed display fields matching mocks. Phase 2 — frontend formats ISO dates client-side and drops computed fields.

### 3.2 Enum normalization

| Area | Mock values | API canonical | Notes |
|------|-------------|---------------|-------|
| Campaign source (admin) | `Outreach`, `Huntlo 360`, `Screening` | `outreach`, `huntlo360`, `screening` | Admin API accepts both; stores lowercase |
| Channels (admin) | `Voice` | `AI Voice` | Map in admin DTO mapper |
| Channel (types.ts) | `AI Voice` | `AI Voice` | Keep as-is |

### 3.3 Builder validation parity

Backend `POST /campaigns/validate` and create endpoints must implement the same rules as:

- `stepErrors()` and `launchWarnings()` in `builder-types.ts`
- `stepErrors()` in `workflow-builder.tsx`
- `stepErrors()` in `screening-builder.tsx`

This ensures frontend preview warnings match server rejection reasons.

---

## 4. Optional external data import (future)

When importing from external systems (not in current scope):

### 4.1 EarlyJobs assessment data

If Huntlo assessments module shares infrastructure with EarlyJobs:

| EarlyJobs entity | Huntlo target | Compatibility service |
|------------------|---------------|----------------------|
| `Assessment` | `Assessment` | `legacy-assessment-adapter` |
| `InterviewSession` | `ScreeningResult` | Field mapping + status translation |
| `AssessmentCandidates` | `Candidate` + enrollment | Dedup by email/phone |

**Do not** share databases without explicit migration project.

### 4.2 CSV candidate import

Frontend `import-dialog.tsx` expects preview rows:

```typescript
{ name, email, phone, currentRole, currentCompany, location, status, warnings[] }
```

`POST /candidates/import?dryRun=true` → preview  
`POST /candidates/import` → commit with `importBatchId`

### 4.3 Legacy campaign import (hypothetical)

If old Huntlo or third-party sequences are imported:

1. Normalize to `OutreachCampaign` + `OutreachSequenceStep` + `OutreachEnrollment`
2. Set `sourceModule` and `legacySourceId` for traceability
3. Read-only `GET /admin/campaigns/legacy/:legacySourceId` via compatibility service
4. **Do not** create parallel Campaign collection

---

## 5. Database migration approach

### 5.1 Greenfield start

1. `scripts/seed-dev.ts` — populate MongoDB with data equivalent to frontend mocks (linked IDs preserved for manual QA)
2. `scripts/migrate.ts` — forward-only migration runner (custom, versioned in `scripts/migrations/`)
3. No down migrations in production — forward fixes only

### 5.2 Seed data compatibility

Seed script maps mock graph:

```
Organization(ws-1) → Jobs(j1,j2,...) → Sessions(s1,...) → Candidates(cand-1,...)
  → Campaigns(camp-1,...) → Enrollments(en-1,...) → Conversations(conv-1,...)
  → Workflows(wf-1,...) → Screening(scr-1,...) → Interviews(int-1,...)
```

Allows frontend to work against real API with familiar IDs during development.

### 5.3 Index strategy (initial)

- `{ organizationId: 1, status: 1 }` on jobs, campaigns, candidates
- `{ organizationId: 1, createdAt: -1 }` on all list collections
- `{ campaignId: 1, candidateId: 1 }` unique on enrollments
- `{ idempotencyKey: 1 }` unique sparse on idempotency records
- `{ type: 1, status: 1, leaseExpiresAt: 1 }` on job records
- `{ threadId: 1, createdAt: 1 }` on messages

---

## 6. Repository layout migration

Current git `HEAD` tracks root-level `app/`, `lib/`, `components/` while working tree uses `Frontend/`. Before backend development:

1. Commit `Frontend/` as canonical frontend location
2. Remove or archive duplicate root-level frontend files
3. Establish `Backend/` as canonical server location
4. Update root `README.md` with monorepo structure:

```
Huntlo_2.0/
  Frontend/     # Next.js App Router
  Backend/      # Express API + Worker
```

---

## 7. Auth & onboarding gap

Frontend has **no login/register/onboarding pages**. Migration plan for auth UX:

| Phase | Backend | Frontend (minimal, not rebuild) |
|-------|---------|-----------------------------------|
| 1 | Auth API + JWT | Add `/login` page + API client + cookie storage |
| 2 | Workspace creation on register | Add `/onboarding` wizard (3 steps) |
| 3 | Invite acceptance flow | Add `/invite/[token]` page |
| 4 | `middleware.ts` | Protect `/dashboard/*` and `/admin/*` |

Backend must support auth before any dashboard endpoint is usable in production.

---

## 8. Compatibility services (deferred until needed)

| Service | Purpose | Trigger |
|---------|---------|---------|
| `legacy-campaign-adapter` | Read old campaign formats | External campaign import |
| `legacy-assessment-adapter` | EarlyJobs assessment import | Assessments module + import request |
| `display-dto-mapper` | Computed mock fields (`createdDaysAgo`, relative dates) | Phase 1 frontend integration |
| `admin-source-module-normalizer` | `Outreach` → `outreach` | Admin campaign list |

Build these **only when** import or dual-read requirements appear. Do not pre-build.

---

## 9. Rollout phases

### Phase A — Local dev parity
- Seed DB from mocks
- Auth + org + jobs + candidates API
- Frontend API client on 2–3 pages (jobs, candidates)

### Phase B — Core recruiting loop
- Sourcing sessions with WS progress
- Contact reveal + usage metering
- People Scout lookups

### Phase C — Campaign system
- Outreach campaigns end-to-end
- Conversations inbox
- Provider integrations (Gmail, Meta WA)

### Phase D — Automation
- Huntlo 360 compiler
- Screening + Hunar
- Scheduling + Calendly

### Phase E — Commercial
- Plans, billing, Razorpay
- Admin console
- Analytics/reports

### Phase F — Cleanup
- Remove display-field mappers as frontend adopts ISO dates
- Remove seed mock IDs from production config

---

## 10. Data retention & privacy

From `mock-settings.ts` `PrivacySettings`:

| Setting | Implementation |
|---------|----------------|
| `candidateRetention` | TTL job on candidate PII fields |
| `consentEmail/Whatsapp/Voice` | Consent flags on candidate + block send if false |
| Audit log | `AuditLogEntry` persisted on sensitive actions |

---

## 11. Checklist before first production deploy

- [ ] Auth flows complete (register, login, refresh, logout)
- [ ] All mutating routes workspace-scoped
- [ ] Secrets encrypted at rest
- [ ] Webhook signatures verified
- [ ] Idempotency on reveal, send, launch, billing
- [ ] Worker leases tested under multi-instance
- [ ] Rate limits on auth and reveal
- [ ] CORS locked to production frontend origin
- [ ] Seed/mock IDs disabled in production
- [ ] MongoDB backups configured
