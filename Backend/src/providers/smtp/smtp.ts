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

export async function verifySmtpCredentials(body: Record<string, unknown>): Promise<SmtpConfig> {
  const config = smtpConfigFromBody(body);
  assertSmtpConfig(config);
  const transport = createSmtpTransport(config);
  try {
    await transport.verify();
  } catch (error) {
    throw Object.assign(
      new Error(
        error instanceof Error
          ? error.message
          : 'Could not verify SMTP credentials. Check host, port, username, and password.'
      ),
      { statusCode: 400 }
    );
  } finally {
    transport.close();
  }
  return config;
}
