/**
 * Compatibility re-export — Hunar webhooks are served by the shared voice router.
 * Prefer importing `hunarVoiceWebhookRouter` from `modules/voice`.
 */
export { hunarVoiceWebhookRouter as hunarWebhookRouter } from '../voice/hunar-voice-webhook.routes.js';
