import { getEnv, isTest } from '../../config/env.js';
import { createChildLogger } from '../../config/logger.js';
import {
  normalizeSmtpSecurity,
  parseSmtpPort,
  sendSmtpMail,
  smtpErrorDetails,
  type SmtpConfig,
} from '../smtp/smtp.js';

const log = () => createChildLogger({ component: 'system-mail' });

export type SystemMailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

function maskEmail(value: string): string {
  const trimmed = value.trim().toLowerCase();
  const at = trimmed.indexOf('@');
  if (at <= 0) return '[invalid-email]';
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

function smtpConfigSummary(config: SmtpConfig) {
  return {
    host: config.smtpHost,
    port: config.smtpPort,
    security: config.security,
    username: config.username,
    fromEmail: config.fromEmail,
    senderName: config.senderName,
    passwordLength: config.password.length,
  };
}

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
  const toMasked = maskEmail(message.to);
  const config = getSystemSmtpConfig();
  if (!config) {
    const env = getEnv();
    log().warn(
      {
        event: 'system_mail.skipped',
        toMasked,
        subject: message.subject,
        reason: 'SYSTEM_SMTP_* not configured',
        configured: {
          host: Boolean(env.SYSTEM_SMTP_HOST?.trim()),
          from: Boolean(env.SYSTEM_MAIL_FROM?.trim()),
          user: Boolean(env.SYSTEM_SMTP_USER?.trim()),
          pass: Boolean(env.SYSTEM_SMTP_PASS),
          isTest: isTest(),
        },
      },
      'System mail skipped — SYSTEM_SMTP_* is not configured'
    );
    return false;
  }

  const startedAt = Date.now();
  log().info(
    {
      event: 'system_mail.send_start',
      toMasked,
      subject: message.subject,
      smtp: smtpConfigSummary(config),
      hasHtml: Boolean(message.html),
      textBytes: Buffer.byteLength(message.text, 'utf8'),
      htmlBytes: message.html ? Buffer.byteLength(message.html, 'utf8') : 0,
    },
    'System mail send starting'
  );

  try {
    const result = await sendSmtpMail({
      config,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    log().info(
      {
        event: 'system_mail.send_ok',
        toMasked,
        subject: message.subject,
        durationMs: Date.now() - startedAt,
        messageId: result.messageId ?? null,
        accepted: result.accepted ?? null,
        rejected: result.rejected ?? null,
        response: result.response ?? null,
        envelopeFrom: result.envelopeFrom ?? null,
        smtp: smtpConfigSummary(config),
      },
      'System mail sent'
    );
    return true;
  } catch (error) {
    const smtp =
      error && typeof error === 'object' && 'smtp' in error
        ? (error as { smtp: Record<string, unknown> }).smtp
        : smtpErrorDetails(error);
    log().error(
      {
        event: 'system_mail.send_failed',
        toMasked,
        subject: message.subject,
        durationMs: Date.now() - startedAt,
        smtp: smtpConfigSummary(config),
        err: smtp,
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
  log().info(
    {
      event: 'password_reset_email.compose',
      toMasked: maskEmail(input.to),
      expiresInMinutes: minutes,
      resetUrlHost: (() => {
        try {
          return new URL(input.resetUrl).host;
        } catch {
          return null;
        }
      })(),
    },
    'Composing password reset email'
  );
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

export async function sendSignupOtpEmail(input: {
  to: string;
  otp: string;
  expiresInMinutes?: number;
}): Promise<boolean> {
  const minutes = input.expiresInMinutes ?? 30;
  const subject = 'Your Huntlo verification code';
  const text = [
    'Hi,',
    '',
    `Your Huntlo verification code is: ${input.otp}`,
    `This code expires in ${minutes} minutes.`,
    '',
    'If you did not try to create a Huntlo account, you can ignore this email.',
    '',
    '— Huntlo',
  ].join('\n');

  const safeOtp = escapeHtml(input.otp);
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.5;color:#141b2b;max-width:560px;margin:0 auto;">
      <img src="${HUNTLO_LOGO_URL}" alt="Huntlo" width="120" height="28" style="display:block;height:28px;width:auto;max-width:128px;border:0;margin:0 0 24px;" />
      <p style="margin:0 0 12px;">Hi,</p>
      <p style="margin:0 0 20px;">Use this code to verify your email and finish creating your Huntlo account:</p>
      <p style="margin:0 0 20px;font-size:28px;font-weight:700;letter-spacing:0.28em;color:${HUNTLO_BRAND_BLUE};">${safeOtp}</p>
      <p style="margin:0 0 8px;color:#555;font-size:14px;">This code expires in ${minutes} minutes.</p>
      <p style="margin:0;color:#555;font-size:14px;">If you did not try to create a Huntlo account, you can ignore this email.</p>
    </div>
  `.trim();

  return sendSystemMail({ to: input.to, subject, text, html });
}
