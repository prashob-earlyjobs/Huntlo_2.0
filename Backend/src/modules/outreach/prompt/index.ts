/**
 * Gateway auto-reply prompts for single-channel Gmail.
 * Each flow has its own file in this folder. Fill {{placeholders}} at send time.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROMPT_DIR = dirname(fileURLToPath(import.meta.url));
const cache = new Map<string, string>();

function loadPromptFile(name: string): string {
  const cached = cache.get(name);
  if (cached) return cached;
  const text = readFileSync(join(PROMPT_DIR, `${name}.md`), 'utf8');
  cache.set(name, text);
  return text;
}

function fillPrompt(template: string, vars: Record<string, string>): string {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{{${key}}}`, value);
  }
  return out;
}

const REJECT_IF_PREFIX = /^reject\s+if\s+/i;

/** Prefix knockout rules with "Reject if" unless the stored value already has it. */
export function formatKnockoutPassCondition(condition: string | null | undefined): string {
  const trimmed = String(condition || '').trim();
  if (!trimmed) return '';
  if (REJECT_IF_PREFIX.test(trimmed)) return trimmed;
  return `Reject if ${trimmed}`;
}

type ScreeningPromptQuestion = {
  id: string;
  question: string;
  required: boolean;
  pass_condition: string;
};

type ScreeningPromptBase = {
  jobText: string;
  candidateName: string;
  currentRole: string;
  experience: string;
  skills: string;
  location: string;
  email: string;
  screening: ScreeningPromptQuestion[];
};

function fillScreeningPrompt(file: string, input: ScreeningPromptBase, extra: Record<string, string> = {}): string {
  return fillPrompt(loadPromptFile(file), {
    job_description: input.jobText,
    candidate_name: input.candidateName,
    current_role: input.currentRole,
    experience: input.experience,
    skills: input.skills,
    location: input.location,
    email: input.email,
    screening_json: JSON.stringify(input.screening, null, 2),
    ...extra,
  });
}

/** Auto-send Calendly — email screening then the scheduling link after all questions pass. */
export function buildAutoCalendlyPrompt(input: ScreeningPromptBase & { calendlyUrl: string }): string {
  return fillScreeningPrompt('auto-calendly', input, { calendly_url: input.calendlyUrl });
}

/**
 * None of the after-qualification actions (WhatsApp, AI screening, Calendly).
 * Screen by email, then close with a normal follow-up — no scheduling link.
 */
export function buildScreeningClosePrompt(input: ScreeningPromptBase): string {
  return fillScreeningPrompt('screening-close', input);
}

/** WhatsApp Auto-send Calendly — one screening question per reply, then the scheduling link. */
export function buildWhatsAppAutoCalendlyPrompt(input: ScreeningPromptBase & { calendlyUrl: string }): string {
  return fillScreeningPrompt('whatsapp-auto-calendly', input, { calendly_url: input.calendlyUrl });
}

/**
 * WhatsApp screening with no after-qualification action.
 * One question per reply, then a normal close — no scheduling link.
 */
export function buildWhatsAppScreeningClosePrompt(input: ScreeningPromptBase): string {
  return fillScreeningPrompt('whatsapp-screening-close', input);
}

/**
 * After a Hunar/Zyvka qualify: opening WhatsApp template is sent with autoReply.
 * Gateway asks hiring-flow questions one per reply, then closes.
 */
export function buildWhatsAppPostQualificationPrompt(input: ScreeningPromptBase): string {
  return fillScreeningPrompt('whatsapp-post-qualification', input);
}
