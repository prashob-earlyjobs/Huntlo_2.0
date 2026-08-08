# AI Voice (Zyastra) — non-Indian numbers

Indian E.164 numbers (`+91…`) continue to use **Hunar**. All other E.164 numbers dial via **Zyastra** (`POST /voice/trigger`).

See also [AI_VOICE_HUNAR.md](./AI_VOICE_HUNAR.md) for the Indian path.

## Routing

| Phone | Provider |
|-------|----------|
| Starts with `+91` | Hunar (agent + bulk dial) |
| Any other valid E.164 | Zyastra (one `POST /voice/trigger` per contact) |

Applies to **screening** launch and **outreach** (`launch-voice` + sequence `ai_voice`).

## Env

```bash
ZYASTRA_API_KEY=
ZYASTRA_API_SECRET=
ZYASTRA_WEBHOOK_SECRET=         # required in staging/production
PUBLIC_API_BASE_URL=https://api.example.com   # public HTTPS base (no trailing slash)
```

Auth on trigger: `x-api-key` + `x-api-secret`.
Webhook auth: `X-Zyastra-Signature: t=<unix>,v1=<hmac_sha256_hex>` over `{timestamp}.{rawBody}`.

## Callback URL

`{PUBLIC_API_BASE_URL}/api/integrations/voice/zyastra`

Aliases:

- `/api/v1/webhooks/zyastra`
- `/api/v1/public/webhooks/zyastra`

Payload defaults for non-IN dials:

- `voiceConfiguration.engine`: `global-std`
- `agent.preferredLanguage`: `en-US` (unless campaign/screening sets another)
- `agent.prompt` / `firstMessage`: same Roshni / campaign text used for Hunar
- `metadata`: `screeningId` or `campaignId`, plus `candidateId` / `enrollmentId` / `organizationId` / `source`

## Credits

Same `ai_voice_minutes` metric as Hunar: reserve 1 minute per dial, commit on terminal webhook.

## Minimal test plan

1. Unit: `isIndianE164`, Zyastra signature verify
2. Mock Zyastra trigger + webhook for a non-`+91` outreach contact and a screening candidate
3. Assert Hunar bulk is not called for those phones; `+91` still hits Hunar
