# Huntlo Backend Security, Testing, Performance & Observability Audit

**Date:** 16 Jul 2026  
**Scope:** `Backend/` API, workers, webhooks, auth, quotas, admin  
**Goal:** Identify and remediate critical/high findings; strengthen observability, indexes, and tests. No unrelated product features.

---

## Executive summary

The backend already had solid foundations (org scoping, AES-GCM encryption, refresh rotation, Zod validation, worker leases, webhook sanitization). This audit found **1 critical** and several **high** issues; all critical/high items below are **fixed** in this change set. Medium items are documented for follow-up.

---

## Security findings

| ID | Severity | Area | Status | Fix |
|----|----------|------|--------|-----|
| S1 | **Critical** | Calendly webhook | **Fixed** | `verifyCalendlySignature` failed open when header/key/body missing → now fails closed |
| S2 | **High** | JWT access after logout | **Fixed** | `requireAuth` / `optionalAuth` validate `sessionId` against `UserSession` (revoked/expired rejected); HS256 algorithm pinned |
| S3 | **High** | Cross-tenant reveal cache | **Fixed** | Same-org teammate reuses free; cross-org shared ciphertext still **charges quota** |
| S4 | **High** | Export permission | **Fixed** | Bulk export requires `candidates:export` only (not `candidates:view`) |
| S5 | **High** | Hunar webhook secret | **Fixed** | Missing `HUNAR_WEBHOOK_SECRET` rejected in production/staging |
| S6 | **High** | Membership auto-backfill | **Fixed** | Only home-org / recorded owner can be backfilled; deactivated members stay denied |
| S7 | Medium | Password policy | **Fixed** | Require upper + lower + digit (min 8) via `passwordSchema` |
| S8 | Medium | Upload MIME | **Fixed** | Extension **and** MIME allowlist enforced |
| S9 | Medium | Campaign job duplicates | **Fixed** | Partial unique index on `{campaignId, enrollmentId, stepId}` for active statuses |
| S10 | Medium | Unescaped `$regex` | **Mitigated** | Added `escapeRegex` / `caseInsensitiveContains`; adopt across search paths over time |
| S11 | Medium | In-memory rate limits | Open | Documented; needs Redis/shared store for multi-instance |
| S12 | Low | CSRF | OK | Refresh cookie `SameSite=lax` + Bearer access; no cookie-auth mutations |
| S13 | Low | SSRF / open redirect | OK | Fixed provider URLs; OAuth redirect allowlisted |
| S14 | Low | Credential encryption | OK | AES-256-GCM with required 64-hex key |

### Review checklist (requested areas)

| Area | Verdict |
|------|---------|
| JWT | OK after alg pin + session binding |
| Refresh rotation | OK (opaque hash, reuse revoke-all) |
| CORS | OK (allowlist + credentials) |
| Cookies / CSRF | OK for current design |
| Password policies | Strengthened |
| Rate limits | Functional but process-local (medium residual) |
| IDOR / org scoping | Strong; membership backfill tightened |
| Admin authorization | OK (`platformAdmin` / allowlist, not org role) |
| Input validation | Zod on critical paths |
| NoSQL injection | No `$where`; use `escapeRegex` for user search |
| File-upload safety | Ext + MIME + size |
| Webhook verification | Calendly/Hunar hardened; Meta/Gupshup fail-closed in prod when secret set |
| OAuth state | OK (TTL consume + PKCE where used) |
| Credential encryption | OK |
| PII logging | Redact list expanded |
| Contact reveal access | Org-scoped + quota rules fixed |
| Export permissions | Export-only permission |
| Quota bypass | Concurrent reserve/commit OK; cross-org free ride closed |
| Campaign duplicate sends | Unique active job index |
| SSRF / open redirect | OK |

---

## Observability

| Capability | Status |
|------------|--------|
| Structured JSON logs (Pino) | Present; redact expanded (passwords, tokens, email/phone, message bodies) |
| Request IDs | Present (`X-Request-Id`) |
| User / org correlation | **Added** to request timing + error handler |
| DB query timing / slow warnings | Present (`SLOW_QUERY_MS=250`) |
| External provider timing | **Added** `withProviderTiming` helper |
| Worker job metrics | Present (in-process) |
| Webhook metrics | **Added** counters (received/accepted/duplicate/rejected/processed/failed) |
| Campaign delivery metrics | **Added** in-process counters on send paths |
| Error classification | Present (`AppError` codes + Zod/CORS) |
| Health / readiness | **Extended** with webhook/job backlog + metrics snapshot |

**Never log (enforced via redact + webhook sanitize):** passwords, JWTs, OAuth/SMTP secrets, full emails/phones when logged as fields, message bodies.

---

## Performance

### Indexes added / tightened
- Campaign jobs: partial unique `{campaignId, enrollmentId, stepId}` (active)
- Enrollments: `{organizationId, status, nextActionAt}`
- Conversation messages: `{threadId, messageType, createdAt}`
- Webhook events: `{provider, payloadHash, processingStatus}`
- Interviews: `{organizationId, deletedAt, startAt, status}`
- Saved candidates: `{organizationId, name}`

### Pagination / caps
- Interview calendar: max 120-day range, hard limit 500 (+ `truncated` flag)
- Large list endpoints already paginated for pool/jobs/campaigns/conversations/admin; remaining soft caps (notifications, reports) documented as follow-up

### Known residual (medium)
- Conversation list N+1 enrichment (batch-enrich recommended)
- Interview `display()` N+1 (batch lookups recommended)
- Multi-instance rate limiting

---

## Testing added

| Suite | Coverage |
|-------|----------|
| `tests/security-hardening.test.ts` | Weak passwords, logout invalidates access JWT, deactivated membership, export permission, Calendly fail-closed, Hunar prod secret gate, regex escape, cross-org reveal charges |
| Existing suites retained | Auth, org isolation, quota concurrency, worker leases, webhooks, admin authz, reveal, etc. |

### Recommended ongoing matrix
- Unit: crypto, JWT, password, regex, permissions  
- Controller/service: auth flows, pool export, reveal  
- Provider mocks: Future Jobs, Calendly, Hunar (already present)  
- Webhook fixtures: Meta/Gupshup/Razorpay/Dodo (already present)  
- Authorization + org isolation: expand per new module  
- Quota concurrency + worker lease + idempotency: keep green on CI  

---

## Changes shipped in this audit

**Security:** Calendly fail-closed, JWT alg + session check, reveal cross-org charge, export permission, Hunar prod secret, membership backfill restriction, password policy, upload MIME, campaign job unique index.

**Observability:** Logger redact, request user/org correlation, provider timing helper, webhook/campaign metrics, readiness backlog signals.

**Performance:** Indexes listed above; calendar caps.

**Tests:** `security-hardening.test.ts` (8 cases).

---

## Residual risk / follow-ups (not blocking)

1. Shared Redis (or similar) for rate limits across API replicas  
2. Batch enrichment for conversations/interviews to cut N+1  
3. Roll `escapeRegex` through all `$regex` user-query builders  
4. Optional OpenTelemetry export for provider/worker/webhook histograms  
5. Stream large CSV exports beyond soft 5k cap  

---

## Local verification

```bash
cd Backend
npx vitest run tests/security-hardening.test.ts tests/candidates.reveal.test.ts tests/auth.unit.test.ts tests/health.test.ts tests/admin-console.test.ts
```
