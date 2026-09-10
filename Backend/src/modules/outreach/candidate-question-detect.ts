/**
 * Detect when a candidate is asking for role / JD details rather than
 * answering a screening question. Used so we share a JD brief even when
 * they do not type a question mark ("Yes share further details").
 */

const BARE_ACK =
  /^(yes|yeah|yep|yup|sure|ok|okay|interested|hi|hello|hey)[.!,]*$/i;

export function looksLikeJdDetailRequest(body: string): boolean {
  const t = body.trim().toLowerCase();
  if (!t) return false;
  if (BARE_ACK.test(t)) return false;

  return (
    /\b(more|further|full|complete)\s+(details?|info(?:rmation)?)\b/.test(t) ||
    /\b(share|send|tell|give|provide)\b[\s\S]{0,50}\b(details?|info(?:rmation)?|jd|job\s*description)\b/.test(
      t
    ) ||
    /\b(tell|let)\s+me\s+(know\s+)?more\b/.test(t) ||
    /\bmore\s+about\s+(the\s+)?(role|job|position|opening|opportunity)\b/.test(t) ||
    /\b(job\s*description|\bjd\b|role\s+details?)\b/.test(t) ||
    /\bdetails?\s+(please|pls)\b/.test(t) ||
    /\b(what\s+is|what's|whats)\s+(the\s+)?(role|job|jd|position)\b/.test(t)
  );
}

/** True when we should answer from the JD before starting or continuing screening. */
export function looksLikeCandidateQuestion(
  bodyText: string,
  intent?: string | null
): boolean {
  const text = bodyText.trim();
  if (!text) return false;
  if (intent === 'ask_question') return true;
  if (/\?/.test(text)) return true;
  return looksLikeJdDetailRequest(text);
}
