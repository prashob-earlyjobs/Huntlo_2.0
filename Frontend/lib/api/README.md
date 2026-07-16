# Huntlo Frontend API Layer

Centralized API communication for the Next.js UI.

## Usage

Components and pages must **not** call `fetch` directly. Import domain services from `@/lib/api`:

```tsx
import { jobsApi } from "@/lib/api";

const jobs = await jobsApi.list();
```

For client components, prefer hooks from `@/hooks/api`:

```tsx
import { useApiQuery } from "@/hooks/api";
import { jobsApi } from "@/lib/api";

const { data, uiState, isLoading } = useApiQuery("jobs.list", () => jobsApi.list());
```

Auth and realtime context:

```tsx
import { useAuth, useRealtime } from "@/providers";
```

## Mock vs live

| `NEXT_PUBLIC_USE_MOCK_API` | Behaviour |
|----------------------------|-----------|
| `true` (default) | Domain services read from `lib/mock-*` |
| `false` | Domain services call Backend `/api/v1/*` via `apiClient` |

Set `NEXT_PUBLIC_API_URL` when using live mode.

## Contract strategy

1. **Envelopes** — `lib/api/contracts/envelopes.ts` mirrors Backend response shapes.
2. **Domain DTOs** — `lib/api/contracts/index.ts` re-exports existing frontend mock types as interim DTOs (no duplication).
3. **Future** — generate types from Backend OpenAPI into `lib/api/generated/` and replace re-exports module-by-module.

Mongoose document types never cross the frontend boundary.

## Error → UI state mapping

`mapApiErrorToUiState()` maps API failures to:

- `loading`
- `empty`
- `error`
- `permission-restricted`
- `disconnected-provider`
- `quota-exhausted`

## Retry policy

The HTTP client auto-retries **only** safe idempotent requests (`GET`, `HEAD`, `OPTIONS`) on transient 502/503/504 errors.

It **never** auto-retries reveals, sends, billing, launches, or other sensitive mutations.

## Files

| Path | Purpose |
|------|---------|
| `client.ts` | HTTP client, token storage, refresh |
| `errors.ts` | `ApiError`, UI state mapping |
| `types.ts` | Request/response helper types |
| `service.ts` | Mock/live service factory |
| `auth.ts`, `jobs.ts`, … | Domain services |
| `contracts/` | Shared DTO + envelope types |
| `../hooks/api/` | React query/mutation hooks |
| `../../providers/` | Auth + WebSocket providers |
