/**
 * Shared Huntlo system-email chrome (header + footer).
 * HTML 4 / table layout + inline styles only — keep SMTP-client friendly.
 * Keep in sync with Frontend/lib/email-layout.ts.
 */

export const HUNTLO_BRAND_BLUE = '#0866fc';
export const HUNTLO_LOGO_URL = 'https://www.huntlo.ai/logo_3.png';
export const HUNTLO_SITE_URL = 'https://www.huntlo.ai';

/** Build an Outlook-friendly solid CTA button (table + bgcolor). */
export function buildSolidCtaButton(href: string, label: string): string {
  const safeHref = String(href || HUNTLO_SITE_URL).replace(/"/g, '&quot;');
  const safeLabel = String(label || 'Continue')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return [
    '<table border="0" cellpadding="0" cellspacing="0" style="margin:16px 0;">',
    '<tr>',
    `<td bgcolor="${HUNTLO_BRAND_BLUE}" style="background-color:${HUNTLO_BRAND_BLUE};">`,
    `<a href="${safeHref}" target="_blank" style="display:inline-block;padding:12px 20px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">${safeLabel}</a>`,
    '</td>',
    '</tr>',
    '</table>',
  ].join('');
}

/**
 * Turn CTA / solid-styled anchors into table buttons for SMTP clients.
 * Matches Huntlo blue background links or "Start Exploring Huntlo" copy.
 */
export function enhanceEmailCtaButtons(html: string): string {
  return String(html || '').replace(
    /<a\b([^>]*?)>([\s\S]*?)<\/a>/gi,
    (match, attrs: string, inner: string) => {
      const hrefMatch = attrs.match(/\bhref\s*=\s*("([^"]*)"|'([^']*)')/i);
      const href = hrefMatch?.[2] || hrefMatch?.[3] || '';
      if (!href) return match;

      const label = inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      const hasSolidStyle =
        /background(-color)?\s*:\s*#0866fc/i.test(attrs) ||
        /background(-color)?\s*:\s*rgb\(\s*8\s*,\s*102\s*,\s*252\s*\)/i.test(attrs);
      const isCtaCopy =
        /start exploring huntlo/i.test(label) ||
        /start hiring/i.test(label) ||
        /start ai search/i.test(label) ||
        /unlock candidate/i.test(label) ||
        /start your first search/i.test(label) ||
        /try people scout/i.test(label) ||
        /^upgrade\b/i.test(label) ||
        /launch campaign/i.test(label) ||
        /continue exploring/i.test(label) ||
        /get started/i.test(label);
      if (!hasSolidStyle && !isCtaCopy) return match;

      return buildSolidCtaButton(href, label || 'Continue');
    }
  );
}

/**
 * Wrap inner HTML body content in the Huntlo-branded email shell.
 * Inner content should already be personalized HTML (not escaped).
 */
export function wrapHuntloEmailHtml(bodyHtml: string): string {
  const enhanced = enhanceEmailCtaButtons(String(bodyHtml || '').trim());
  const inner =
    enhanced ||
    '<p style="margin:0 0 14px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#141b2b;">&nbsp;</p>';

  return [
    '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">',
    '<html>',
    '<head>',
    '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<title>Huntlo</title>',
    '<!--[if mso]>',
    '<style type="text/css">',
    'table, td { font-family: Arial, Helvetica, sans-serif !important; }',
    '</style>',
    '<![endif]-->',
    '</head>',
    '<body bgcolor="#f4f6fb" style="margin:0;padding:0;background-color:#f4f6fb;">',
    '<table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f4f6fb" style="margin:0;padding:0;background-color:#f4f6fb;">',
    '<tr>',
    '<td align="center" style="padding:24px 12px;">',
    '<table border="0" cellpadding="0" cellspacing="0" width="560" style="width:560px;max-width:560px;background-color:#ffffff;border:1px solid #e5e7eb;">',
    '<tr>',
    `<td bgcolor="${HUNTLO_BRAND_BLUE}" height="4" style="background-color:${HUNTLO_BRAND_BLUE};font-size:0;line-height:0;">&nbsp;</td>`,
    '</tr>',
    '<tr>',
    '<td bgcolor="#ffffff" align="left" style="background-color:#ffffff;padding:20px 24px 16px 24px;border-bottom:1px solid #e5e7eb;">',
    `<a href="${HUNTLO_SITE_URL}" target="_blank" style="text-decoration:none;border:0;">`,
    `<img src="${HUNTLO_LOGO_URL}" alt="Huntlo" width="140" height="32" border="0" style="display:block;border:0;outline:none;text-decoration:none;width:140px;height:32px;" />`,
    '</a>',
    '</td>',
    '</tr>',
    '<tr>',
    '<td bgcolor="#ffffff" align="left" style="background-color:#ffffff;padding:28px 24px 12px 24px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#141b2b;">',
    inner,
    '</td>',
    '</tr>',
    '<tr>',
    '<td bgcolor="#ffffff" align="left" style="background-color:#ffffff;padding:8px 24px 28px 24px;font-family:Arial, Helvetica, sans-serif;">',
    '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="width:100%;border-top:1px solid #e5e7eb;">',
    '<tr>',
    '<td style="padding-top:20px;">',
    '<p style="margin:0 0 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:13px;line-height:1.5;color:#6b7280;">Huntlo &mdash; AI hiring OS for sourcing, outreach, and screening.</p>',
    `<p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;line-height:1.5;color:#9ca3af;"><a href="${HUNTLO_SITE_URL}" target="_blank" style="color:${HUNTLO_BRAND_BLUE};text-decoration:underline;">huntlo.ai</a>&nbsp;&middot;&nbsp;You received this because you signed up for Huntlo.</p>`,
    '</td>',
    '</tr>',
    '</table>',
    '</td>',
    '</tr>',
    '</table>',
    '</td>',
    '</tr>',
    '</table>',
    '</body>',
    '</html>',
  ].join('');
}
