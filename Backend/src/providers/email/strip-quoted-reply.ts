/**
 * Strip quoted prior messages from an email body so UI / AI only see the new reply.
 * Handles Gmail ("On … wrote:"), Outlook ("-----Original Message-----"), and `>` lines.
 */

const QUOTE_HEADER_PATTERNS: RegExp[] = [
  // Gmail / Apple Mail: "On Sat, 18 Jul 2026 at 18:40, Name <email> wrote:"
  /\nOn\s+[^\n]{8,200}\bwrote:\s*(?:\n|$)/i,
  // Outlook / many clients
  /\n-{2,}\s*Original Message\s*-{2,}\s*(?:\n|$)/i,
  /\nFrom:\s[^\n]+\nSent:\s[^\n]+\n/i,
  /\nBegin forwarded message:\s*(?:\n|$)/i,
  // Horizontal rule separators often preceding quotes
  /\n_{5,}\s*(?:\n|$)/,
];

export function stripEmailQuotedReply(raw: string | null | undefined): string {
  if (!raw) return '';
  let text = String(raw).replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  let cutAt = text.length;
  for (const pattern of QUOTE_HEADER_PATTERNS) {
    const match = pattern.exec(text);
    if (match?.index != null && match.index < cutAt) {
      cutAt = match.index;
    }
  }
  text = text.slice(0, cutAt);

  // Drop trailing quoted lines (`>` / `>>`) left after the header cut.
  const lines = text.split('\n');
  while (lines.length > 0) {
    const last = lines[lines.length - 1] ?? '';
    if (!last.trim() || /^\s*>/.test(last)) {
      lines.pop();
      continue;
    }
    break;
  }

  return lines.join('\n').trim();
}
