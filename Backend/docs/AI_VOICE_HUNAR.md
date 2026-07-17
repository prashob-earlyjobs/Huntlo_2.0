# AI Voice (Hunar) — Huntlo

## Env

```bash
HUNAR_VOICE_API_KEY=          # required
HUNAR_VOICE_PERSONA=NEHA
HUNAR_VOICE_LANGUAGE=ENGLISH
HUNAR_WEBHOOK_SECRET=         # required in staging/production
PUBLIC_API_BASE_URL=https://api.example.com   # public HTTPS base (no trailing slash)
```

## Callback URLs (provider)

Built as:

`{PUBLIC_API_BASE_URL}/api/integrations/voice/hunar/{call-status|call-recording|call-result|call-summary}?campaignId=|screeningId=`

Legacy aliases also accepted:

- `/api/v1/webhooks/hunar/...`
- `/api/v1/public/webhooks/hunar/...`

## Authenticated APIs

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/outreach/campaigns/:id/voice-agent` | Validate + create/update Hunar agent, persist `voiceAgentConfig` |
| POST | `/api/v1/outreach/campaigns/:id/launch-voice` | Bulk dial dialable enrollments |
| GET | `/api/v1/outreach/campaigns/:id/voice-calls` | Paginated VoiceCall rows |

Sequence `ai_voice` steps reuse the same dialer (pending VoiceCall stubs + webhooks).

Screening launch remains on `POST /api/v1/screenings/:id/launch` and uses the same Hunar client + webhook stack.

## Agent prompt (Roshni)

Screening launches and outreach AI voice (default) use the **Roshni** recruitment screening agent prompt (`src/modules/voice/roshni-prompt.md`), filled with JD tokens (`job_title`, company from org name, eight screening questions, call-flow steps, etc.). `{callee_name}` is left for Hunar.

- Screening: always Roshni (+ optional consent/closing append). Default intro: `Hello, am I speaking with {callee_name}?`
- Outreach `POST .../voice-agent`: omit `agentPrompt` (or set `useRoshni: true`) to sync Roshni; pass a custom `agentPrompt` with `useRoshni: false` to override.
- Sequence `ai_voice` steps: Roshni by default; sequence body is appended as campaign notes. A stored non-Roshni `voiceAgentConfig.agentPrompt` is respected as a custom override.
- **Qualification questions** from `campaign.qualificationConfig.questions` are injected into the Roshni prompt (`jd_screening_questions_list` / call-flow steps) at dial and voice-agent sync. Knockout rules are included as silent internal notes (not spoken). If none are configured, Roshni’s default eight questions are used.

Post-call extraction uses the Roshni result schema (`experience`, `ctc`, `notice_period`, etc.).

## Credits

Uses plan metric `ai_voice_minutes`:

1. Reserve 1 minute per dialable contact on bulk accept
2. Seed pending `VoiceCall` rows (`callId = pending:{requestId}:{phoneDigits}`)
3. Webhook replaces stub with real `call_id` and commits minutes (extra minutes if duration > 1)

Over quota → `403 VOICE_CALL_CREDITS_EXCEEDED`

## Minimal test plan

1. Mock Hunar agent create + bulk dial
2. `launch-voice` / sequence voice step seeds pending VoiceCalls and reserves quota
3. POST call-status webhook with `campaignId` promotes pending → real callId
4. Terminal status commits quota; campaign auto-completes when enrollments + calls are terminal
5. Missing `HUNAR_VOICE_API_KEY` / `PUBLIC_API_BASE_URL` returns clear 503
