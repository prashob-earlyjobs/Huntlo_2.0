# Frontend-to-API Contract Map

**Version:** 0.1  
**Source:** `Frontend/lib/mock-*.ts`, `Frontend/app/**`, builder components  
**API base:** `/api/v1`

Legend: **P0** = required for MVP of module · **P1** = soon after · **P2** = later/stub page

---

## Global contracts

### Authentication (not yet in frontend UI)

| Method | Endpoint | Purpose | P |
|--------|----------|---------|---|
| POST | `/auth/register` | Create user + org | P0 |
| POST | `/auth/login` | Email/password → tokens | P0 |
| POST | `/auth/refresh` | Rotate access token | P0 |
| POST | `/auth/logout` | Invalidate refresh token | P0 |
| POST | `/auth/forgot-password` | Send reset email | P1 |
| POST | `/auth/reset-password` | Complete reset | P1 |
| GET | `/auth/me` | Current user + active workspace | P0 |

**Response `data` (me):**
```typescript
{
  user: { id, name, email, role, initials, plan },
  organization: { id, name, plan, initials },
  permissions: string[]
}
```

### Workspaces

| Method | Endpoint | Frontend | P |
|--------|----------|----------|---|
| GET | `/organizations` | `WORKSPACES` in header switcher | P0 |
| POST | `/organizations` | Onboarding (future) | P1 |
| PATCH | `/organizations/:id` | Settings workspace section | P0 |
| DELETE | `/organizations/:id` | Settings delete workspace | P2 |

### Notifications (header panel)

| Method | Endpoint | Frontend | P |
|--------|----------|----------|---|
| GET | `/notifications` | `NOTIFICATIONS` | P1 |
| PATCH | `/notifications/:id/read` | Mark read | P1 |
| POST | `/notifications/read-all` | Mark all read | P1 |

### Realtime (WebSocket)

| Event | Frontend consumer | P |
|-------|-------------------|---|
| `notification.created` | Header bell | P1 |
| `session.progress` | `/dashboard/sessions/[id]` progress bar | P0 |
| `conversation.message.created` | Conversations inbox | P0 |
| `campaign.stats.updated` | Campaign detail KPIs | P1 |
| `usage.updated` | Usage indicator | P1 |

---

## Dashboard home

**Route:** `/dashboard`  
**Mocks:** `mock-dashboard.ts`, `mock-data.ts`

| Method | Endpoint | Response `data` | P |
|--------|----------|-----------------|---|
| GET | `/analytics/dashboard` | Composite: metrics, pipeline, active jobs, priorities, interviews, campaign summary, channel comparison, usage groups | P1 |

**`OverviewMetric`:** `{ id, label, value, change, trend, comparison, tooltip }`  
**`PipelineStage`:** `{ id, label, count, conversion? }`  
**`ActiveJob`:** `{ id, title, department, candidates, qualified, status }`  
**`PriorityItem`:** `{ id, title, description, dueLabel, href, kind }`  
**`UpcomingInterview`:** subset of `Interview`  
**`CampaignSummaryStat`:** channel performance aggregates

---

## Jobs

**Routes:** `/dashboard/jobs`, `/dashboard/jobs/new`, `/dashboard/jobs/[id]`  
**Mocks:** `mock-jobs.ts`

| Method | Endpoint | Action | P |
|--------|----------|--------|---|
| GET | `/jobs/metrics` | List page metric strip | P0 |
| GET | `/jobs` | List with `?status&department&location&search&sort&page&limit` | P0 |
| POST | `/jobs` | Create (draft or publish) | P0 |
| GET | `/jobs/:id` | Detail aggregate | P0 |
| PATCH | `/jobs/:id` | Update sections | P0 |
| POST | `/jobs/:id/status` | Pause, close, archive | P0 |
| DELETE | `/jobs/:id` | Soft delete | P1 |

**`JobListItem`:**
```typescript
{
  id, title, department, location, experienceMin, experienceMax,
  openings, candidatesSourced, qualified, interviews,
  recruiter, hiringManager, createdAt, status
}
```

**`JobDetail` extends list +**
```typescript
{
  employmentType, workplaceType, seniority,
  requiredSkills[], preferredSkills[],
  compensation: { minSalary, maxSalary, currency, visibility },
  screening: {
    objective, knockoutQuestions[], aiScreeningEnabled, requiredEvaluationFields[]
  },
  hiringTarget: { openingsFilled, targetHires, daysOpen, targetDays },
  pipeline: PipelineStage[],
  sourcingSessions: { id, name, resultCount, date, state }[],
  outreachCampaigns: { id, name, status, candidates }[],
  screeningBatches: { id, name, status, candidates }[]
}
```

**POST `/jobs` body** mirrors `JobFormState` from `job-form.tsx`:
```typescript
{
  title, department, location, experienceMin, experienceMax, openings,
  recruiter, hiringManager, employmentType, workplaceType, seniority,
  requiredSkills, preferredSkills, compensation, screening, tags, status
}
```

---

## AI candidate search (sourcing)

**Routes:** `/dashboard/search`, `/dashboard/search/history`, `/dashboard/sessions/[id]`  
**Mocks:** `mock-search.ts`, `mock-sessions.ts`

| Method | Endpoint | Action | P |
|--------|----------|--------|---|
| POST | `/sourcing/interpret` | NL query → `InterpretedCriterion[]` | P0 |
| POST | `/sourcing/sessions` | Start search (returns session id) | P0 |
| GET | `/sourcing/sessions/:id` | Session metadata + state | P0 |
| GET | `/sourcing/sessions/:id/candidates` | Paginated candidates; supports `?sort&filter` | P0 |
| GET | `/sourcing/sessions/:id/stream` | SSE alternative to WS for progress | P1 |
| GET | `/sourcing/history` | Search history table | P0 |
| DELETE | `/sourcing/history/:id` | Delete history entry | P1 |
| POST | `/sourcing/sessions/:id/save-search` | Save to saved searches | P1 |

**`SourcingSession`:**
```typescript
{
  id, name, query, resultCount, date, relatedJobId, relatedJobTitle,
  owner, quotaUsed, state: "completed"|"running"|"partial"|"failed"|"empty",
  candidateIds[], coverage?, failureReason?
}
```

**`SessionCandidate`:** full profile shape in `mock-sessions.ts` (matchBreakdown, contact reveal flags, experience, education, signals, activity, similar[]).

**Search filter state** (`SearchFilterState`): send as optional body on session create or PATCH.

---

## Candidates

**Routes:** `/dashboard/candidates`, `/dashboard/candidates/[id]`, `/dashboard/saved`  
**Mocks:** `mock-candidates.ts`, `mock-sessions.ts`

| Method | Endpoint | Action | P |
|--------|----------|--------|---|
| GET | `/candidates/metrics` | Pool metric strip | P0 |
| GET | `/candidates` | Pool list `?pipelineStatus&owner&source&search&page` | P0 |
| GET | `/candidates/:id` | Full `PoolCandidate` profile | P0 |
| PATCH | `/candidates/:id` | Status, owner, notes | P0 |
| POST | `/candidates/import` | CSV import preview + commit | P1 |
| DELETE | `/candidates/:id` | Remove from pool | P1 |
| GET | `/candidates/lists` | Saved lists | P0 |
| POST | `/candidates/lists` | Create list | P0 |
| PATCH | `/candidates/lists/:id` | Update list | P0 |
| DELETE | `/candidates/lists/:id` | Delete/archive list | P0 |
| POST | `/candidates/lists/:id/members` | Add candidates | P0 |
| DELETE | `/candidates/lists/:id/members` | Remove candidates | P0 |
| POST | `/candidates/:id/reveal` | Email or phone reveal (**idempotent**) | P0 |

**`PoolCandidate`** extends `SessionCandidate` with:
```typescript
{
  pipelineStatus, lists[], owner, source, lastActivity,
  relatedJobId, outreachHistory[], screeningResults[], interviews[], notes[]
}
```

**POST `/candidates/:id/reveal` body:** `{ type: "email" | "mobile" }`  
**Response:** updated contact fields + `creditsCharged`

---

## People Scout

**Route:** `/dashboard/people-scout`  
**Mocks:** `mock-scout.ts`

| Method | Endpoint | Action | P |
|--------|----------|--------|---|
| GET | `/people-scout/quota` | Lookup + reveal quotas | P0 |
| POST | `/people-scout/lookup` | Lookup by URL/username/email | P0 |
| GET | `/people-scout/lookups` | Recent lookups table | P0 |
| GET | `/people-scout/profiles/:id` | `ScoutProfile` detail | P0 |
| POST | `/people-scout/profiles/:id/reveal` | Contact reveal (**idempotent**) | P0 |
| POST | `/people-scout/profiles/:id/save` | Add to list/pool | P0 |

**`ScoutProfile`:** LinkedIn-style profile + enrichment metadata  
**`RecentLookup`:** `{ id, input, type, result, contactRevealed, creditsUsed, date }`

---

## Outreach

**Routes:** `/dashboard/outreach`, `/dashboard/outreach/new`, `/dashboard/outreach/[id]`  
**Mocks:** `mock-outreach.ts`, `mock-campaign-detail.ts`, `builder-types.ts`

| Method | Endpoint | Action | P |
|--------|----------|--------|---|
| GET | `/outreach/metrics` | Workspace outreach KPIs | P0 |
| GET | `/campaigns` | List `?sourceModule=outreach&status&jobId` | P0 |
| POST | `/campaigns` | Create draft from `BuilderState` | P0 |
| GET | `/campaigns/:id` | Campaign + KPIs + funnel | P0 |
| PATCH | `/campaigns/:id` | Update draft config | P0 |
| POST | `/campaigns/:id/launch` | Launch (**idempotent**) | P0 |
| POST | `/campaigns/:id/pause` | Pause | P0 |
| POST | `/campaigns/:id/resume` | Resume | P0 |
| DELETE | `/campaigns/:id` | Delete draft / archive | P1 |
| GET | `/campaigns/:id/enrollments` | `EnrolledCandidate[]` | P0 |
| GET | `/campaigns/:id/sequence` | `CampaignSequenceStep[]` | P0 |
| PATCH | `/campaigns/:id/sequence` | Edit steps (draft/paused only) | P1 |
| GET | `/campaigns/:id/activity` | Activity log | P1 |
| POST | `/campaigns/validate` | Pre-launch warnings (mirrors `launchWarnings()`) | P0 |

**`BuilderState` POST body** (from `builder-types.ts`):
```typescript
{
  name, jobId, objective, owner, description, timezone, campaignType,
  source, sourceDetail, enabledChannels, connections,
  steps: SequenceStep[], classificationEnabled, questions,
  aiReplyEnabled, takeoverCondition, autoScreening, autoCalendly
}
```

**`OutreachCampaign` list item:**
```typescript
{
  id, name, relatedJobId, relatedJobTitle, channels[], candidates,
  sent, delivered, replies, interested, qualified,
  status, owner, lastActivity, createdAt
}
```

**`EnrolledCandidate`:** see `mock-campaign-detail.ts`

**Canonical models:** `OutreachCampaign`, `OutreachEnrollment`, `OutreachSequenceStep` with `sourceModule: "outreach"`

---

## Conversations

**Route:** `/dashboard/conversations`  
**Mocks:** `mock-conversations.ts`

| Method | Endpoint | Action | P |
|--------|----------|--------|---|
| GET | `/conversations` | Inbox list `?channel&status&search&page` | P0 |
| GET | `/conversations/:id` | Thread + `events[]` | P0 |
| POST | `/conversations/:id/messages` | Recruiter reply | P0 |
| POST | `/conversations/:id/ai-draft` | Generate AI draft `?tone=` | P1 |
| PATCH | `/conversations/:id/read` | Mark read | P0 |
| PATCH | `/conversations/:id/qualification` | Manual qualification override | P1 |

**`Conversation`:**
```typescript
{
  id, candidateId, candidateName, headline, location, channels[],
  campaignId, campaignName, jobId, jobTitle,
  lastMessage, lastTime, unread, replyStatus, qualification,
  screeningStatus, sequenceStep, nextAction, email?, phone?, notes[], events[]
}
```

**`ConversationEvent`:** `{ id, channel, author, authorName, subject?, text, time, delivery?, attachments?, voiceSummary? }`

**Canonical models:** `ConversationThread`, `ConversationMessage`

---

## Templates

**Route:** `/dashboard/templates`  
**Mocks:** `mock-templates.ts`

| Method | Endpoint | Action | P |
|--------|----------|--------|---|
| GET | `/templates` | List `?type&archived` | P1 |
| POST | `/templates` | Create | P1 |
| GET | `/templates/:id` | Detail | P1 |
| PATCH | `/templates/:id` | Update | P1 |
| POST | `/templates/:id/archive` | Archive | P1 |
| GET | `/templates/variables` | `PERSONALIZATION_VARIABLES` | P1 |

**Variables (from mocks):** `{{first_name}}`, `{{current_company}}`, `{{current_role}}`, `{{job_title}}`, `{{recruiter_name}}`, `{{company_name}}`, `{{calendly_link}}`

---

## Huntlo 360

**Routes:** `/dashboard/huntlo-360`, `/dashboard/huntlo-360/new`, `/dashboard/huntlo-360/[id]`  
**Mocks:** `mock-360.ts`, `workflow-builder.tsx`

| Method | Endpoint | Action | P |
|--------|----------|--------|---|
| GET | `/huntlo-360/metrics` | Workflow metrics strip | P0 |
| GET | `/huntlo-360/workflows` | List workflows | P0 |
| POST | `/huntlo-360/workflows` | Create from `WorkflowBuilderState` | P0 |
| GET | `/huntlo-360/workflows/:id` | Detail + candidates + exceptions | P0 |
| PATCH | `/huntlo-360/workflows/:id` | Update (draft/paused) | P0 |
| POST | `/huntlo-360/workflows/:id/launch` | Compile + launch (**idempotent**) | P0 |
| POST | `/huntlo-360/workflows/:id/pause` | Pause | P0 |
| DELETE | `/huntlo-360/workflows/:id` | Delete | P1 |
| GET | `/huntlo-360/workflows/:id/candidates` | `WorkflowCandidate[]` | P0 |
| GET | `/huntlo-360/workflows/:id/journey` | `JourneyStage[]` funnel | P0 |

**`WorkflowBuilderState` POST body** compiles to campaign + screening + scheduling config.

**`Workflow360` list:**
```typescript
{
  id, name, jobId, jobTitle, candidates, channels[],
  replied, interested, qualified, scheduled, status, owner
}
```

**Backend:** `OutreachCampaign` with `sourceModule: "huntlo360"` + linked `ScreeningBatch` + scheduling config document.

---

## Screening

**Routes:** `/dashboard/screening`, `/dashboard/screening/new`, `/dashboard/screening/[id]`, `/dashboard/screening/results`, `/dashboard/screening/results/[id]`  
**Mocks:** `mock-screening.ts`

| Method | Endpoint | Action | P |
|--------|----------|--------|---|
| GET | `/screening/metrics` | Batch metrics | P0 |
| GET | `/screening/batches` | List batches | P0 |
| POST | `/screening/batches` | Create from screening builder | P0 |
| GET | `/screening/batches/:id` | Batch detail + candidates | P0 |
| POST | `/screening/batches/:id/launch` | Start calls (**idempotent**) | P0 |
| POST | `/screening/batches/:id/pause` | Pause | P0 |
| POST | `/screening/batches/:id/candidates` | Add candidates | P0 |
| GET | `/screening/results` | Results list `?jobId&decision&page` | P0 |
| GET | `/screening/results/:id` | `ScreeningResultDetail` | P0 |
| PATCH | `/screening/results/:id/decision` | Shortlist/reject | P0 |

**`ScreeningBatch`:** `{ id, name, jobId, jobTitle, candidates, language, attempts, completed, averageScore, shortlisted, status, owner, objective }`

**`ScreeningResultDetail`:** transcript, recording URL, score categories, knockouts, extracted fields

Voice calls via `providers/hunar`. Optional campaign link: `sourceModule: "screening"`.

---

## Scheduling

**Routes:** `/dashboard/schedule`, `/dashboard/schedule/[id]`, `/dashboard/schedule/calendar`, `/dashboard/schedule/availability`  
**Mocks:** `mock-schedule.ts`  
**Client:** `lib/api/scheduling.ts`

Canonical paths (aliases under `/scheduling/*` also work):

| Method | Endpoint | Action | P |
|--------|----------|--------|---|
| GET | `/interviews` | List `?status&jobId&candidateId&campaignId&from&to&q&page&limit` | P0 |
| POST | `/interviews` | Create (Calendly link / manual / availability request) | P0 |
| GET | `/interviews/:id` | Interview detail | P0 |
| PATCH | `/interviews/:id` | Update fields | P0 |
| POST | `/interviews/:id/send-link` | Deliver Calendly link (email/WhatsApp) | P0 |
| POST | `/interviews/:id/reschedule` | Manual reschedule `{ startAt, endAt?, timezone? }` | P0 |
| POST | `/interviews/:id/cancel` | Cancel | P0 |
| POST | `/interviews/:id/remind` | Send reminder now | P0 |
| POST | `/interviews/:id/complete` | Mark completed | P0 |
| POST | `/interviews/:id/no-show` | Mark no-show | P0 |
| GET | `/interviews/calendar` | Calendar window `{ from, to, items }` | P0 |
| GET | `/availability` | Current user availability rule | P0 |
| PUT | `/availability` | Save weekly hours, overrides, buffers | P0 |
| GET | `/scheduling/event-types` | Connected Calendly event types | P0 |
| POST | `/scheduling/sync` | Pull Calendly bookings | P0 |
| POST | `/webhooks/calendly` | Calendly invitee webhook (raw body + signature) | P0 |

**`Interview`:**
```typescript
{
  id, candidateId, candidateName, candidateTitle, candidateCompany,
  jobId, jobTitle, interviewType, interviewers[], recruiter,
  dateKey, dateLabel, timeLabel, duration, timezone,
  platform, meetingLink?, location?, bookingSource,
  reminderStatus, status, round, instructions
}
```

**`AvailabilityRule`:** timezone, weeklyHours[], dateOverrides[], unavailableDates[], bufferBefore/After, minimumNotice, maximumBookingWindow, dailyLimit

Calendly payloads use validated fields only (`scheduled_event`, `invitee`, `location.join_url`, etc.). Signature header: `calendly-webhook-signature`.

---

## Integrations

**Route:** `/dashboard/integrations`  
**Mocks:** `mock-integrations.ts`

| Method | Endpoint | Action | P |
|--------|----------|--------|---|
| GET | `/integrations` | All providers + connection status | P0 |
| GET | `/integrations/:providerId` | Provider detail + config | P0 |
| POST | `/integrations/:providerId/connect` | Start OAuth or save credentials | P0 |
| POST | `/integrations/:providerId/disconnect` | Disconnect | P0 |
| PATCH | `/integrations/:providerId/config` | Update SMTP/WA/Calendly panel fields | P0 |
| GET | `/integrations/:providerId/usage` | Provider usage stats | P1 |

**Provider IDs:** `gmail`, `outlook`, `zoho-mail`, `smtp`, `meta-whatsapp`, `gupshup`, `hunar`, `calendly`, `future-jobs`, `razorpay`, `dodo`

OAuth callbacks: `GET /public/oauth/:provider/callback`

---

## Team

**Route:** `/dashboard/team`  
**Mocks:** `mock-team.ts`

| Method | Endpoint | Action | P |
|--------|----------|--------|---|
| GET | `/organizations/:id/team/metrics` | Team metric strip | P0 |
| GET | `/organizations/:id/members` | Member list | P0 |
| POST | `/organizations/:id/members/invite` | Invite by email | P0 |
| PATCH | `/organizations/:id/members/:memberId` | Role, module access | P0 |
| DELETE | `/organizations/:id/members/:memberId` | Remove/suspend | P0 |
| GET | `/organizations/:id/roles` | Role definitions | P1 |

**`TeamMember`:** `{ id, name, email, role, status, manager, assignedJobs[], usage, moduleAccess[], activity[] }`

---

## Plans & billing

**Route:** `/dashboard/plans`  
**Mocks:** `mock-plans.ts`

| Method | Endpoint | Action | P |
|--------|----------|--------|---|
| GET | `/plans/current` | Current plan + renewal | P0 |
| GET | `/plans/usage` | `UsageQuota[]` with `usageState()` | P0 |
| GET | `/plans/tiers` | Available plan tiers + feature matrix | P0 |
| POST | `/plans/upgrade` | Initiate checkout | P1 |
| POST | `/plans/credits/purchase` | Buy credit top-up | P1 |
| GET | `/billing/invoices` | Invoice history | P1 |
| GET | `/billing/invoices/:id` | Invoice detail / PDF URL | P2 |

**`UsageQuota`:** `{ id, label, description, used, limit, unit?, resetDate }`  
**`Invoice`:** `{ id, invoiceNumber, plan, billingPeriod, amount, provider, status, paymentDate }`

Webhooks: `POST /public/webhooks/razorpay`, `POST /public/webhooks/dodo`

---

## Profile & settings

**Routes:** `/dashboard/profile`, `/dashboard/settings`  
**Mocks:** `mock-profile.ts`, `mock-settings.ts`

| Method | Endpoint | Action | P |
|--------|----------|--------|---|
| GET | `/users/me/profile` | `ProfilePersonal` | P0 |
| PATCH | `/users/me/profile` | Update personal info | P0 |
| PATCH | `/users/me/password` | Change password | P0 |
| GET | `/users/me/preferences` | Notifications + appearance | P0 |
| PATCH | `/users/me/preferences` | Update prefs | P0 |
| GET | `/users/me/sessions` | `ActiveSession[]` | P1 |
| DELETE | `/users/me/sessions/:id` | Revoke session | P1 |
| GET | `/organizations/:id/settings` | All settings sections | P0 |
| PATCH | `/organizations/:id/settings` | Partial update by section | P0 |
| GET | `/organizations/:id/audit-log` | `AuditLogEntry[]` | P1 |

Settings sections: `workspace`, `recruiting`, `outreach`, `screening`, `scheduling`, `privacy`

---

## Analytics & reports (stub pages)

**Routes:** `/dashboard/analytics`, `/dashboard/reports` (no page yet)  
**Mocks:** `mock-modules.ts` placeholders

| Method | Endpoint | P |
|--------|----------|---|
| GET | `/analytics/overview` | P2 |
| GET | `/analytics/pipeline` | P2 |
| GET | `/analytics/channels` | P2 |
| GET | `/reports` | P2 |
| POST | `/reports/generate` | P2 |

---

## Assessments

**Route:** `/dashboard/assessments`  
**Module:** `Backend/src/modules/assessments`  
**Provider:** `ASSESSMENT_PROVIDER=mock|external` (`providers/assessments`)

| Method | Endpoint | P |
|--------|----------|---|
| GET | `/assessments` | P1 |
| GET/POST | `/assessments/templates` | P1 |
| GET/PATCH/DELETE | `/assessments/templates/:id` | P1 |
| GET/POST | `/assessments/campaigns` | P1 |
| GET | `/assessments/campaigns/:id` | P1 |
| POST | `/assessments/campaigns/:id/launch` | P1 |
| POST | `/assessments/campaigns/:id/remind` | P1 |
| POST | `/assessments/campaigns/:id/cancel` | P1 |
| GET | `/assessments/results` | P1 |
| GET | `/assessments/results/:id` | P1 |
| POST | `/webhooks/assessments` | P1 |

---

## Admin console

**Routes:** `/admin/*`  
**Mocks:** `mock-admin.ts`, `admin-routes.ts`

| Method | Endpoint | Frontend page | P |
|--------|----------|---------------|---|
| GET | `/admin/metrics` | Dashboard | P1 |
| GET | `/admin/charts` | Dashboard charts | P1 |
| GET | `/admin/users` | Users workspace | P1 |
| PATCH | `/admin/users/:id` | Edit user, plan, suspend | P1 |
| GET | `/admin/plans` | Plans workspace | P1 |
| POST/PATCH | `/admin/plans` | Create/edit platform plans | P1 |
| GET | `/admin/usage` | Usage by action/provider/plan/user | P1 |
| GET | `/admin/candidates` | Platform candidate browse | P2 |
| GET | `/admin/campaigns` | Cross-workspace campaigns | P1 |
| GET | `/admin/settings/providers` | `PLATFORM_SETTINGS` | P1 |
| PATCH | `/admin/settings/providers/:id` | Save platform credentials | P1 |
| GET | `/admin/blog` | Blog articles | P2 |
| POST/PATCH | `/admin/blog` | CRUD articles | P2 |

**`AdminCampaign`:** includes `sourceModule` (`Outreach` | `Huntlo 360` | `Screening`) — API normalizes to lowercase.

---

## Public / webhooks

| Method | Endpoint | Provider | P |
|--------|----------|----------|---|
| GET | `/public/health` | Liveness | P0 |
| GET | `/public/webhooks/meta-whatsapp` | Meta verify challenge | P0 |
| POST | `/public/webhooks/meta-whatsapp` | Inbound WA events | P0 |
| POST | `/public/webhooks/gupshup` | Gupshup events | P0 |
| POST | `/public/webhooks/hunar` | Voice call events | P0 |
| POST | `/public/webhooks/calendly` | Booking events | P0 |
| POST | `/public/webhooks/razorpay` | Payment events | P1 |
| POST | `/public/webhooks/dodo` | Payment events | P2 |
| GET | `/public/oauth/gmail/callback` | Gmail OAuth | P0 |
| GET | `/public/oauth/outlook/callback` | Outlook OAuth | P1 |
| GET | `/public/oauth/zoho/callback` | Zoho OAuth | P1 |

**Important:** Implement parsers from official provider documentation. UI field names (e.g. `Phone number ID`, `WABA ID`) are Huntlo config keys, not webhook JSON keys.

---

## Pagination standard

All list endpoints accept:
```
?page=1&limit=20&sort=-createdAt
```

Response `meta.pagination`:
```json
{ "page": 1, "limit": 20, "total": 248, "totalPages": 13 }
```

Frontend currently does client-side filtering — backend pagination is **new capability**; frontend will adopt when API client is added.

---

## Error codes (frontend-facing)

| Code | HTTP | When |
|------|------|------|
| `VALIDATION_ERROR` | 400 | Zod failures |
| `UNAUTHORIZED` | 401 | Missing/invalid token |
| `FORBIDDEN` | 403 | Workspace/permission denied |
| `NOT_FOUND` | 404 | Entity missing |
| `QUOTA_EXCEEDED` | 402 | Plan/credit limit |
| `CONFLICT` | 409 | Duplicate, invalid state transition |
| `IDEMPOTENCY_REPLAY` | 200 | Cached idempotent response |
| `PROVIDER_ERROR` | 502 | External provider failure |
| `INTERNAL_ERROR` | 500 | Unexpected |

---

## Mock file index

| Mock file | Primary endpoints |
|-----------|-------------------|
| `mock-data.ts` | auth/me, notifications, workspaces |
| `mock-dashboard.ts` | analytics/dashboard |
| `mock-jobs.ts` | jobs/* |
| `mock-sessions.ts` | sourcing/*, candidates (SessionCandidate) |
| `mock-search.ts` | sourcing/interpret, filter metadata |
| `mock-candidates.ts` | candidates/*, lists |
| `mock-scout.ts` | people-scout/* |
| `mock-outreach.ts` | campaigns/* (outreach) |
| `mock-campaign-detail.ts` | campaigns/:id/enrollments |
| `mock-conversations.ts` | conversations/* |
| `mock-templates.ts` | templates/* |
| `mock-360.ts` | huntlo-360/* |
| `mock-screening.ts` | screening/* |
| `mock-schedule.ts` | scheduling/* |
| `mock-integrations.ts` | integrations/* |
| `mock-team.ts` | organizations/:id/members |
| `mock-plans.ts` | plans/*, billing/invoices |
| `mock-profile.ts` | users/me/* |
| `mock-settings.ts` | organizations/:id/settings |
| `mock-admin.ts` | admin/* |
