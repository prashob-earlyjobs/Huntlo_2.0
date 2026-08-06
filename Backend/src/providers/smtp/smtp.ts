/**
 * Custom SMTP helpers — ported from EJHunterLanding customMailSmtpService.js
 */

import nodemailer from 'nodemailer';

export type SmtpSecurity = 'tls' | 'ssl' | 'none';

export type SmtpConfig = {
  fromEmail: string;
  smtpHost: string;
  smtpPort: number;
  security: SmtpSecurity;
  username: string;
  password: string;
  senderName: string;
};

export function normalizeSmtpSecurity(raw: unknown): SmtpSecurity {
  const value = String(raw || 'tls').trim().toLowerCase();
  if (value === 'ssl' || value === 'none' || value === 'tls') return value;
  return 'tls';
}

export function parseSmtpPort(raw: unknown, security: SmtpSecurity): number {
  const portNum = Number(raw);
  if (Number.isFinite(portNum) && portNum >= 1 && portNum <= 65535) {
    return Math.floor(portNum);
  }
  return security === 'ssl' ? 465 : 587;
}

export function smtpConfigFromBody(body: Record<string, unknown>): SmtpConfig {
  const fromEmail = String(body.fromEmail || body.email || '').trim();
  const smtpHost = String(body.smtpHost || body.host || '').trim();
  const security = normalizeSmtpSecurity(body.security || body.smtpSecurity);
  const smtpPort = parseSmtpPort(body.smtpPort || body.port, security);
  const username = String(body.username || fromEmail).trim();
  const password = String(body.password || body.smtpPassword || '').trim();
  const senderName = String(body.displayName || body.senderName || '').trim();
  return { fromEmail, smtpHost, smtpPort, security, username, password, senderName };
}

export function assertSmtpConfig(config: SmtpConfig): void {
  if (!config.fromEmail.includes('@')) {
    throw Object.assign(new Error('A valid from email address is required.'), { statusCode: 400 });
  }
  if (!config.smtpHost) {
    throw Object.assign(new Error('SMTP host is required.'), { statusCode: 400 });
  }
  if (!config.username) {
    throw Object.assign(new Error('SMTP username is required.'), { statusCode: 400 });
  }
  if (!config.password) {
    throw Object.assign(new Error('SMTP password is required.'), { statusCode: 400 });
  }
}

export function createSmtpTransport(config: SmtpConfig) {
  const security = normalizeSmtpSecurity(config.security);
  const port = parseSmtpPort(config.smtpPort, security);
  const secure = security === 'ssl';
  return nodemailer.createTransport({
    host: config.smtpHost,
    port,
    secure,
    auth: { user: config.username, pass: config.password },
    ...(security === 'tls'
      ? { requireTLS: true }
      : security === 'none'
        ? { tls: { rejectUnauthorized: false } }
        : {}),
  });
}

/** Map nodemailer / server SMTP failures into clear UI-facing copy. */
export function formatSmtpError(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Could not verify SMTP credentials. Check host, port, username, and password.';
  const text = raw.replace(/\s+/g, ' ').trim();

  if (
    /smtpclientauthentication is disabled/i.test(text) ||
    /smtp_auth_disabled/i.test(text) ||
    /5\.7\.139/.test(text)
  ) {
    return [
      'SMTP AUTH is disabled for this Microsoft mailbox.',
      'A Microsoft 365 admin must enable Authenticated SMTP for this mailbox (or the organization).',
      'Guide: https://aka.ms/smtp_auth_disabled',
    ].join('\n');
  }

  if (/certificate|self[- ]signed|unable to verify the first certificate/i.test(text)) {
    return [
      'SMTP TLS certificate could not be verified.',
      'Check the host name, or try SSL on port 465 if your provider requires it.',
    ].join('\n');
  }

  if (/econnrefused|enotfound|getaddrinfo|etimedout|esocket|connection timed out/i.test(text)) {
    return [
      'Could not reach the SMTP server.',
      'Check the host, port, and security settings (TLS 587 / SSL 465).',
    ].join('\n');
  }

  if (
    /invalid login|authentication (failed|unsuccessful)|username and password not accepted|535|534|5\.7\.8/i.test(
      text
    )
  ) {
    return [
      'SMTP login failed.',
      'Check username and password. For Microsoft or Google, use an app password if required, and confirm SMTP AUTH is enabled.',
    ].join('\n');
  }

  if (/Invalid login:\s*/i.test(text)) {
    return text.replace(/^Invalid login:\s*/i, 'SMTP login failed: ');
  }

  return text;
}

export async function verifySmtpCredentials(body: Record<string, unknown>): Promise<SmtpConfig> {
  const config = smtpConfigFromBody(body);
  assertSmtpConfig(config);
  const transport = createSmtpTransport(config);
  try {
    await transport.verify();
  } catch (error) {
    throw Object.assign(new Error(formatSmtpError(error)), { statusCode: 400 });
  } finally {
    transport.close();
  }
  return config;
}

export async function sendSmtpMail(input: {
  config: SmtpConfig;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  inReplyTo?: string | null;
  references?: string | null;
}): Promise<{ messageId?: string }> {
  assertSmtpConfig(input.config);
  const transport = createSmtpTransport(input.config);
  try {
    const info = await transport.sendMail({
      from: input.config.senderName
        ? `"${input.config.senderName}" <${input.config.fromEmail}>`
        : input.config.fromEmail,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      inReplyTo: input.inReplyTo || undefined,
      references: input.references || undefined,
    });
    return { messageId: typeof info.messageId === 'string' ? info.messageId : undefined };
  } finally {
    transport.close();
  }
}
