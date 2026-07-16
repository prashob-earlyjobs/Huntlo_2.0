# Module Execution Order

**Version:** 0.1  
**Principle:** Each phase delivers a testable vertical slice. Do not start a phase until its dependencies are complete.

---

## Dependency graph

```
Phase 0: Foundation
    ↓
Phase 1: Auth + Organizations + Users
    ↓
Phase 2: Jobs + Candidates (CRUD)
    ↓
Phase 3: Plans + Usage metering
    ↓
Phase 4: Sourcing + People Scout + Reveal
    ↓
Phase 5: Integrations (email + WA connect)
    ↓
Phase 6: Campaign core + Conversations
    ↓
Phase 7: Outreach UI integration
    ↓
Phase 8: Screening + Hunar
    ↓
Phase 9: Scheduling + Calendly
    ↓
Phase 10: Huntlo 360 compiler
    ↓
Phase 11: Billing (Razorpay)
    ↓
Phase 12: Admin + Analytics + Notifications polish
    ↓
Phase 13: Assessments (when frontend page exists)
```

---

## Phase 0 — Foundation

**Goal:** Runnable API + worker skeleton, no domain logic.

| Deliverable | Paths |
|-------------|-------|
| Package setup (Express 5, TS, Mongoose, Zod, ws, vitest) | `package.json`, `tsconfig.json` |
| Env validation | `config/env.ts` |
| Logger, CORS, DB connection | `config/*` |
| App factory + server bootstrap | `app.ts`, `server.ts` |
| Worker bootstrap + job poll loop | `worker.ts`, `workers/` |
| Error envelope + request ID | `shared/http/`, `middleware/` |
| Health check | `modules/public/` |
| Folder scaffold | all `modules/`, `providers/`, `shared/` |

**Exit criteria:**
- `GET /api/v1/public/health` returns 200
- Worker polls empty queue without crash
- Tests pass for error handler and env validation

**Frontend impact:** None

---

## Phase 1 — Auth, Users, Organizations

**Goal:** Login works; workspace context on all protected routes.

| Module | Key endpoints |
|--------|---------------|
| `auth` | register, login, refresh, logout, me |
| `users` | profile, preferences, password |
| `organizations` | list, create, settings (read) |

| Shared | |
|--------|--|
| JWT middleware | `middleware/auth.ts` |
| Workspace middleware | `middleware/workspace.ts` |
| User + Organization models | |

**Exit criteria:**
- Register → login → `GET /auth/me` with workspace
- Protected route returns 401 without token
- Seed script creates org matching mock `WORKSPACES`

**Frontend impact:** Add `/login`, API client, auth context (minimal new pages — not rebuild)

---

## Phase 2 — Jobs + Candidates

**Goal:** Core ATS entities without AI.

| Module | Key endpoints |
|--------|---------------|
| `jobs` | CRUD, metrics, status transitions, detail aggregate |
| `candidates` | pool list, detail, lists CRUD, pipeline status |

**Exit criteria:**
- Job create matches `JobFormState` validation
- `GET /jobs/:id` returns pipeline + linked entity summaries
- Candidate pool filterable by pipeline status

**Frontend impact:** Wire `/dashboard/jobs/*`, `/dashboard/candidates/*`, `/dashboard/saved`

---

## Phase 3 — Plans + Usage

**Goal:** Credit checks before any metered action.

| Module | Key endpoints |
|--------|---------------|
| `plans` | current plan, quotas, tiers |
| `shared/usage` | assertAndDebit, usage events, cycle reset job |

**Exit criteria:**
- `GET /plans/usage` returns `UsageQuota[]` with correct `usageState`
- Debit rejects with `QUOTA_EXCEEDED` when over limit
- Worker `usage.reset` job runs on schedule

**Frontend impact:** Wire `/dashboard/plans`, header usage indicator

---

## Phase 4 — Sourcing + People Scout

**Goal:** AI search sessions with progress; contact reveal.

| Module | Providers | Key endpoints |
|--------|-----------|---------------|
| `sourcing` | `gemini`, `future-jobs` | interpret, sessions, candidates, history |
| `people-scout` | `future-jobs` | lookup, reveal, recent |
| `candidates` (extend) | | `POST /candidates/:id/reveal` |

| Infrastructure | |
|----------------|--|
| Worker `sourcing.run` | |
| WS `session.progress` | |

**Exit criteria:**
- Session states: `running` → `partial` → `completed` with WS events
- Failed session returns `failureReason`, no quota charge
- Reveal debits correct credits (email: 2, mobile: 5)

**Frontend impact:** Wire `/dashboard/search/*`, `/dashboard/sessions/[id]`, `/dashboard/people-scout`

---

## Phase 5 — Integrations

**Goal:** Connect email and WhatsApp providers per workspace.

| Module | Providers |
|--------|-----------|
| `integrations` | `gmail`, `outlook`, `zoho`, `smtp`, `meta-whatsapp`, `gupshup` |

| Public | |
|--------|--|
| OAuth callbacks | |
| WA webhook verify + receive (enqueue only) | |

**Exit criteria:**
- `GET /integrations` matches mock provider list shape
- Gmail OAuth connect flow stores encrypted tokens
- Meta webhook verification succeeds

**Frontend impact:** Wire `/dashboard/integrations`

---

## Phase 6 — Campaign core + Conversations

**Goal:** Canonical campaign system — no outreach UI yet, but engine complete.

| Module | Models |
|--------|--------|
| `outreach` | `OutreachCampaign`, `OutreachSequenceStep`, `OutreachEnrollment` |
| `conversations` | `ConversationThread`, `ConversationMessage` |

| Worker jobs | |
|-------------|--|
| `campaign.launch`, `campaign.step.execute`, `campaign.classify_reply` | |
| `integration.sync_inbox` | |

| Providers | |
|-----------|--|
| `gmail`, `meta-whatsapp`, `gupshup`, `gemini` | |

**Exit criteria:**
- Create draft campaign → launch → enrollment created
- Email step sends (sandbox) → message in thread
- Inbound reply stops sequence when configured
- `POST /campaigns/validate` matches `launchWarnings()` logic

**Frontend impact:** None yet (API-only QA via tests/Postman)

---

## Phase 7 — Outreach + Templates

**Goal:** Full outreach module UI connected.

| Module | Key endpoints |
|--------|---------------|
| `outreach` | list, builder create, detail, enrollments, pause/resume |
| `conversations` | inbox, reply, mark read |
| templates | CRUD (P1) |

**Exit criteria:**
- 6-step campaign builder saves and launches
- Campaign detail shows funnel + enrolled candidates
- Conversations inbox shows thread events

**Frontend impact:** Wire `/dashboard/outreach/*`, `/dashboard/conversations`, `/dashboard/templates`

---

## Phase 8 — Screening

**Goal:** AI voice screening batches and results.

| Module | Providers |
|--------|-----------|
| `screening` | `hunar`, `gemini` |
| Campaign link | `sourceModule: "screening"` where applicable |

| Worker | |
|--------|--|
| `screening.place_call`, `screening.process_result` | |
| Hunar webhook | |

**Exit criteria:**
- Screening builder creates batch → calls placed → result with transcript
- Results list + detail with recruiter decision

**Frontend impact:** Wire `/dashboard/screening/*`

---

## Phase 9 — Scheduling

**Goal:** Interviews, availability, Calendly sync.

| Module | Providers |
|--------|-----------|
| `scheduling` | `calendly` |

**Exit criteria:**
- Manual interview create from schedule flow
- Calendly webhook creates/updates interview
- Availability save/load matches mock shape

**Frontend impact:** Wire `/dashboard/schedule/*`

---

## Phase 10 — Huntlo 360

**Goal:** Workflow compiler uses campaign core.

| Module | Behavior |
|--------|----------|
| `huntlo-360` | Compile `WorkflowBuilderState` → campaign + screening + scheduling |

**Exit criteria:**
- 7-step workflow launches
- `sourceModule: "huntlo360"` in admin campaign list
- Journey funnel counts update via worker

**Frontend impact:** Wire `/dashboard/huntlo-360/*`

---

## Phase 11 — Billing

**Goal:** Paid plans and invoices.

| Module | Providers |
|--------|-----------|
| `billing` | `razorpay`, `dodo` |
| `plans` (extend) | upgrade, credit purchase |

**Exit criteria:**
- Upgrade initiates Razorpay checkout
- Webhook activates plan
- Invoice history matches mock shape

**Frontend impact:** Wire plans upgrade/buy credits dialogs

---

## Phase 12 — Admin + Dashboard analytics + Team

| Module | |
|--------|--|
| `admin` | users, plans, usage, campaigns, platform settings, blog |
| `analytics` | dashboard home aggregate |
| `organizations` (extend) | team, invites, permissions |
| `notifications` | in-app + WS |

**Exit criteria:**
- Admin routes require platform admin role
- Dashboard home single aggregate endpoint
- Team invite flow works

**Frontend impact:** Wire `/admin/*`, `/dashboard`, `/dashboard/team`, notification panel

---

## Phase 13 — Assessments + Analytics/Reports pages

**Blocked on:** Frontend `page.tsx` for assessments, analytics, reports

| Module | Notes |
|--------|-------|
| `assessments` | Borrow patterns from EarlyJobs_AI_Agent |
| `analytics` | Full reports beyond dashboard aggregate |

---

## Parallel workstreams (after Phase 0)

These can proceed alongside domain phases without blocking:

| Workstream | Owner phase |
|------------|-------------|
| `shared/encryption` | Phase 5 |
| `shared/idempotency` | Phase 3 |
| `shared/audit` | Phase 1 |
| `realtime/` broker | Phase 4 |
| Provider adapter stubs | Phase 5+ |
| `scripts/seed-dev.ts` | Phase 2 |
| Frontend API client library | Phase 1 |

---

## Estimated relative effort

| Phase | Relative size | Risk |
|-------|---------------|------|
| 0 | S | Low |
| 1 | M | Medium (auth security) |
| 2 | M | Low |
| 3 | S | Low |
| 4 | L | High (Future Jobs + streaming) |
| 5 | L | High (OAuth + webhooks) |
| 6 | XL | High (campaign engine) |
| 7 | M | Medium |
| 8 | L | High (Hunar voice) |
| 9 | M | Medium |
| 10 | L | High (compiler complexity) |
| 11 | M | Medium |
| 12 | L | Medium |
| 13 | M | Low |

**Critical path:** Phase 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7

---

## What NOT to do early

- Do not implement assessments before screening proves Hunar integration
- Do not build analytics warehouse before core events emit `UsageEvent` records
- Do not add Redis until second API instance or second worker is required
- Do not create duplicate campaign collections for Huntlo 360 or screening
- Do not implement provider webhooks before job queue exists (Phase 0 worker)
