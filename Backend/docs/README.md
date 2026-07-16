# Huntlo Backend — Planning & Architecture

This directory contains the pre-implementation planning artifacts for the Huntlo production backend.

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, processes, data model, campaign architecture, realtime |
| [FRONTEND_API_CONTRACT_MAP.md](./FRONTEND_API_CONTRACT_MAP.md) | Frontend route → API endpoint mapping with request/response contracts |
| [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) | Reuse vs rewrite, legacy compatibility, data migration |
| [CONVENTIONS.md](./CONVENTIONS.md) | Shared engineering standards (API, errors, modules, testing) |
| [MODULE_EXECUTION_ORDER.md](./MODULE_EXECUTION_ORDER.md) | Phased implementation sequence with dependencies |
| [RISK_REGISTER.md](./RISK_REGISTER.md) | Technical and product risks with mitigations |

**Status:** Planning complete. No application modules implemented yet.

**Frontend contract source of truth:** `Frontend/lib/mock-*.ts`, `Frontend/components/**/builder-types.ts`, `Frontend/lib/types.ts`.

**External provider payloads:** Must follow official provider documentation. UI config field names in mocks are Huntlo-internal keys only — not provider webhook schemas.
