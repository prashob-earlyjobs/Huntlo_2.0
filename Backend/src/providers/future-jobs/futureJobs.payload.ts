/**
 * Future Jobs session payload builders and post-create wait config.
 * Re-exports mapper payload helpers; only this provider layer builds FJ bodies.
 */

export {
  SOURCING_PROMPT_MAX_LENGTH,
  baseSessionFromPrompt,
  buildSessionPayloadForApply,
  buildSessionPayloadFromPromptAndFilter,
  buildSourcingSessionPayloadFromPrompt,
  normalizePromptPlainText,
  promptForSourcingApi,
} from './futureJobs.mapper.js';

/**
 * Delay after a successful Future Jobs session create/update before the first
 * profiles request. Configurable via env override; default 20 seconds.
 */
export const POST_SESSION_CREATE_PROFILES_WAIT_MS_DEFAULT = 20_000;

export function getPostSessionCreateProfilesWaitMs(): number {
  const raw = process.env.POST_SESSION_CREATE_PROFILES_WAIT_MS;
  if (raw == null || raw === '') return POST_SESSION_CREATE_PROFILES_WAIT_MS_DEFAULT;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return POST_SESSION_CREATE_PROFILES_WAIT_MS_DEFAULT;
  return Math.floor(n);
}

/** Alias used by apply/poll services. */
export const POST_SESSION_CREATE_PROFILES_WAIT_MS = POST_SESSION_CREATE_PROFILES_WAIT_MS_DEFAULT;
