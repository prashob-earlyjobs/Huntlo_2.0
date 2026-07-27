import { getEnv, isTest } from '../../config/env.js';
import { createChildLogger } from '../../config/logger.js';
import {
  normalizeSmtpSecurity,
  parseSmtpPort,
  sendSmtpMail,
  type SmtpConfig,
} from '../smtp/smtp.js';

const log = () => createChildLogger({ component: 'system-mail' });

export type SystemMailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export function isSystemMailConfigured(): boolean {
  if (isTest()) return false;
  const env = getEnv();
  return Boolean(
    env.SYSTEM_SMTP_HOST?.trim() &&
      env.SYSTEM_MAIL_FROM?.trim() &&
      env.SYSTEM_SMTP_USER?.trim() &&
      env.SYSTEM_SMTP_PASS
  );
}

export function getSystemSmtpConfig(): SmtpConfig | null {
  if (!isSystemMailConfigured()) return null;
  const env = getEnv();
  const security = normalizeSmtpSecurity(env.SYSTEM_SMTP_SECURITY);
  // Gmail app passwords are often pasted with spaces — strip for SMTP auth.
  const password = String(env.SYSTEM_SMTP_PASS ?? '').replace(/\s+/g, '');
  return {
    fromEmail: env.SYSTEM_MAIL_FROM!.trim(),
    smtpHost: env.SYSTEM_SMTP_HOST!.trim(),
    smtpPort: parseSmtpPort(env.SYSTEM_SMTP_PORT, security),
    security,
    username: env.SYSTEM_SMTP_USER!.trim(),
    password,
    senderName: (env.SYSTEM_MAIL_FROM_NAME || 'Huntlo').trim(),
  };
}

/**
 * Send a platform/system email (auth, invites, etc.) via SYSTEM_SMTP_* credentials.
 * Returns false when mail is not configured or send fails — callers should not leak that.
 */
export async function sendSystemMail(message: SystemMailMessage): Promise<boolean> {
  const config = getSystemSmtpConfig();
  if (!config) {
    log().warn(
      { to: message.to, subject: message.subject },
      'System mail skipped — SYSTEM_SMTP_* is not configured'
    );
    return false;
  }

  try {
    const result = await sendSmtpMail({
      config,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    log().info(
      { to: message.to, subject: message.subject, messageId: result.messageId ?? null },
      'System mail sent'
    );
    return true;
  } catch (error) {
    log().error(
      {
        to: message.to,
        subject: message.subject,
        err: error instanceof Error ? error.message : String(error),
      },
      'System mail send failed'
    );
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const HUNTLO_BRAND_BLUE = '#0866fc';
const HUNTLO_LOGO_URL = 'https://www.huntlo.ai/logo_3.png';

export async function sendPasswordResetEmail(input: {
  to: string;
  firstName?: string | null;
  resetUrl: string;
  expiresInMinutes?: number;
}): Promise<boolean> {
  const minutes = input.expiresInMinutes ?? 60;
  const name = (input.firstName || '').trim() || 'there';
  const subject = 'Reset your Huntlo password';
  const text = [
    `Hi ${name},`,
    '',
    'We received a request to reset your Huntlo password.',
    `Open this link to choose a new password (expires in ${minutes} minutes):`,
    input.resetUrl,
    '',
    'If you did not request this, you can ignore this email.',
    '',
    '— Huntlo',
  ].join('\n');

  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(input.resetUrl);
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; color: #141b2b; max-width: 560px; margin: 0 auto; text-align: left;">
      <p style="margin: 0 0 16px; text-align: left;">Hi ${safeName},</p>
      <p style="margin: 0 0 20px; text-align: left;">We received a request to reset your Huntlo password.</p>
      <p style="margin: 0 0 20px; text-align: left;">
        <a href="${safeUrl}" style="display:inline-block;padding:12px 20px;background:${HUNTLO_BRAND_BLUE};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
          Reset password
        </a>
      </p>
      <p style="margin: 0 0 8px; color:#555;font-size:14px; text-align: left;">This link expires in ${minutes} minutes.</p>
      <p style="margin: 0 0 8px; color:#555;font-size:14px; text-align: left;">If the button does not work, copy and paste this URL:</p>
      <p style="margin: 0 0 20px; word-break:break-all;font-size:13px; text-align: left;"><a href="${safeUrl}" style="color:${HUNTLO_BRAND_BLUE};">${safeUrl}</a></p>
      <p style="margin: 0 0 28px; color:#555;font-size:14px; text-align: left;">If you did not request this, you can ignore this email.</p>
      <div style="border-top:1px solid #e5e7eb; padding-top:20px; text-align: left;">
        <img src="${HUNTLO_LOGO_URL}" alt="Huntlo" width="140" height="32" style="display:block;height:32px;width:auto;max-width:148px;border:0;" />
      </div>
    </div>
  `.trim();

  return sendSystemMail({ to: input.to, subject, text, html });
}
