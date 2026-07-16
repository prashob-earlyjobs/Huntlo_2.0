# Risk Register

**Version:** 0.1  
**Date:** 2026-07-16  
**Review cadence:** Each phase gate

| ID | Risk | Category | Likelihood | Impact | Mitigation | Owner phase |
|----|------|----------|------------|--------|------------|-------------|
| R01 | **No existing backend** — greenfield underestimation | Project | High | High | Phased execution order; foundation first; no big-bang | All |
| R02 | **Frontend has no API client or auth** — integration gap | Integration | Certain | High | Phase 1 delivers auth API + minimal login page; API client lib before module wiring | 1 |
| R03 | **Mock data uses display strings for dates** — contract drift | Integration | High | Medium | Phase 1 DTO mappers with computed fields; document in migration plan; frontend adopts ISO later | 2 |
| R04 | **No provider webhook schemas in repo** — wrong payload parsing | Technical | High | High | Never invent payloads; adapter layer per official docs; fixture tests from provider examples | 5–8 |
| R05 | **Campaign engine complexity** — sequence runner bugs | Technical | High | High | Canonical single system; exhaustive state machine tests; idempotent step execution | 6 |
| R06 | **Huntlo 360 compiler** — workflow → campaign mapping errors | Technical | Medium | High | Compiler unit tests per builder step; explicit mapping doc; launch validation endpoint | 10 |
| R07 | **Credit metering race conditions** — double spend | Technical | Medium | High | Mongo transactions for debit+action; idempotency keys; unique index on usage idempotency | 3 |
| R08 | **Multi-tenant data leak** — missing orgId filter | Security | Medium | Critical | Repository base class enforces orgId; integration tests per module; security review at Phase 2 gate | 1–2 |
| R09 | **JWT/session security** — token theft, weak secrets | Security | Medium | High | Short access TTL, refresh rotation, httpOnly cookie option, rate limit auth, secret rotation runbook | 1 |
| R10 | **Provider OAuth token expiry** — send failures mid-campaign | Operational | High | Medium | `Needs Attention` status in integrations API; pre-launch validation (`launchWarnings`); token refresh jobs | 5–7 |
| R11 | **Future Jobs API unknown/undocumented** — sourcing blocked | External | Medium | High | Early spike in Phase 4; abstract behind `providers/future-jobs`; mock provider for dev | 4 |
| R12 | **Gemini rate limits / latency** — slow search & classification | External | Medium | Medium | Queue classification jobs; cache interpretations; timeout with `failed` session state | 4, 6 |
| R13 | **Hunar voice reliability** — dropped calls, bad transcripts | External | Medium | High | Retry policy per screening config; webhook idempotency; partial result handling | 8 |
| R14 | **WhatsApp template approval delays** — campaign launch blocked | External | Medium | Medium | Template status in integration config; validate before launch; session vs template message paths | 5–7 |
| R15 | **Calendly event type mapping** — wrong booking link | Integration | Medium | Medium | Store `eventTypeUri` internally; display label separate; validate on connect | 9 |
| R16 | **Razorpay webhook replay / signature failures** — billing inconsistency | Security | Low | High | Signature verify; idempotent webhook processing; reconcile job | 11 |
| R17 | **Worker lease bugs** — duplicate job execution | Technical | Medium | High | Atomic lease acquire; heartbeat; lease TTL > max step duration; dead job admin view | 0, 6 |
| R18 | **Single worker bottleneck** — campaign backlog | Scalability | Medium | Medium | Horizontal worker scaling with lease locks; monitor queue depth; priority queues later | 6+ |
| R19 | **WebSocket scale** — connection fan-out | Scalability | Low | Medium | Start in-process broker; add Redis pub/sub when >1 API instance; connection limits per org | 4 |
| R20 | **Enum inconsistency** — `Voice` vs `AI Voice`, admin vs app | Integration | High | Low | Normalization layer in admin DTOs; document in migration plan; Zod enums at API boundary | 2 |
| R21 | **Repo layout drift** — duplicate root vs Frontend/ files | Project | High | Medium | Normalize to `Frontend/` before backend commit; single source in git | 0 |
| R22 | **PII / consent compliance** — outreach without consent | Legal | Medium | Critical | Consent flags on candidate; block channel send; retention TTL job; audit log | 3, 6 |
| R23 | **Admin platform secrets in DB** — breach amplification | Security | Low | Critical | Encrypt at rest; masked API responses; separate admin audit; least-privilege admin role | 12 |
| R24 | **Assessments scope creep** — EarlyJobs parity pressure | Project | Medium | Medium | Defer to Phase 13; stub API only; no frontend page exists | 13 |
| R25 | **Express 5 middleware breaking changes** — subtle bugs | Technical | Low | Medium | Pin Express 5.x; integration test suite from Phase 0; async handler wrapper | 0 |
| R26 | **Sourcing streaming UX** — frontend expects progressive load | Integration | Medium | Medium | WS `session.progress` + paginated candidates; match `loadedCount`/`totalCount` semantics | 4 |
| R27 | **Duplicate campaign systems** — 360/outreach/screening diverge | Architecture | Medium | High | Architecture rule: one canonical system; code review gate; no `Campaign` model outside outreach module | 6 |
| R28 | **Idempotency header adoption** — frontend may not send keys | Integration | Medium | Medium | API client auto-generates keys for sensitive POSTs; document in conventions | 1 |
| R29 | **Dodo Payments undocumented** — international billing blocked | External | Medium | Low | Razorpay first; Dodo adapter stub; implement when docs available | 11 |
| R30 | **No CI/CD** — regression risk grows with modules | Operational | High | Medium | Add GitHub Actions after Phase 0: lint, test, typecheck on every PR | 0 |

---

## Risk heat map (Impact × Likelihood)

```
Impact →
        Low      Medium    High      Critical
High    R20      R04,R11   R01,R05   R08
Med     R29      R03,R10   R02,R06   R22
Low     —        R15,R19   R09,R16   R23
        R25               R12,R13   R17
```

---

## Phase gate checklist

Before closing each phase, verify:

| Gate | Risks addressed |
|------|-----------------|
| Phase 0 complete | R17, R25, R30 |
| Phase 1 complete | R02, R08, R09, R28 |
| Phase 3 complete | R07, R22 |
| Phase 4 complete | R11, R12, R26 |
| Phase 5 complete | R04, R10, R14 |
| Phase 6 complete | R05, R17, R27 |
| Phase 8 complete | R13 |
| Phase 10 complete | R06 |
| Phase 11 complete | R16 |
| Phase 12 complete | R23 |

---

## Open decisions (track to resolution)

| Decision | Options | Recommendation | Deadline |
|----------|---------|----------------|----------|
| Refresh token storage | httpOnly cookie vs localStorage | httpOnly cookie + SameSite strict | Phase 1 |
| Realtime broker | In-process vs Redis from start | In-process until 2+ API instances | Phase 4 |
| ID format in API | ObjectId only vs prefixed (`job_`) | ObjectId hex; seed uses mock aliases in dev | Phase 2 |
| Future Jobs contract | Real API vs stub for dev | Spike in week 1 of Phase 4 | Phase 4 |
| Admin auth | Separate admin users vs role flag | Role flag on User + `isPlatformAdmin` | Phase 12 |
| Soft delete strategy | `deletedAt` vs status Archived | `deletedAt` on candidates/jobs; status for campaigns | Phase 2 |

---

## Escalation triggers

Immediately escalate if:

1. Provider webhook cannot be verified against official documentation
2. Cross-tenant data appears in any integration test
3. Campaign step executes twice for same enrollment+step (idempotency failure)
4. Credit balance goes negative
5. PII logged in plaintext
