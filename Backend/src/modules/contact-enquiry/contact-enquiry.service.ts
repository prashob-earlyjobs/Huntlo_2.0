import { createHash } from 'node:crypto';

import { getEnv } from '../../config/env.js';
import { getLogger } from '../../config/logger.js';
import { sendSystemMail } from '../../providers/system-mail/system-mail.js';
import { AppError } from '../../shared/errors/app-error.js';
import { ContactEnquiryModel } from './contact-enquiry.model.js';
import type { SubmitContactEnquiryInput } from './contact-enquiry.validation.js';

const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

function log() {
  return getLogger().child({ component: 'contact-enquiry' });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function contactEnquiryFingerprint(input: {
  workEmail: string;
  enquiryType: string;
  message: string;
}): string {
  const normalized = [
    input.workEmail.trim().toLowerCase(),
    input.enquiryType.trim(),
    input.message.trim().toLowerCase().replace(/\s+/g, ' '),
  ].join('|');
  return createHash('sha256').update(normalized).digest('hex');
}

function enquiryNotifyTo(): string {
  const configured = getEnv().CONTACT_ENQUIRY_TO?.trim();
  if (configured) return configured;
  return 'info@huntlo.ai';
}

async function notifyTeam(input: {
  id: string;
  fullName: string;
  workEmail: string;
  companyName?: string;
  enquiryType: string;
  message: string;
}): Promise<boolean> {
  const to = enquiryNotifyTo();
  const subject = `[Huntlo Contact] ${input.enquiryType} — ${input.fullName}`;
  const companyLine = input.companyName ? `Company: ${input.companyName}` : 'Company: (not provided)';
  const text = [
    'New contact enquiry received via huntlo.ai/contact',
    '',
    `Name: ${input.fullName}`,
    `Email: ${input.workEmail}`,
    companyLine,
    `Type: ${input.enquiryType}`,
    '',
    'Message:',
    input.message,
    '',
    `Enquiry ID: ${input.id}`,
  ].join('\n');

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.5;color:#141b2b;max-width:560px;">
      <p style="margin:0 0 12px;"><strong>New contact enquiry</strong></p>
      <p style="margin:0 0 8px;"><strong>Name:</strong> ${escapeHtml(input.fullName)}</p>
      <p style="margin:0 0 8px;"><strong>Email:</strong> ${escapeHtml(input.workEmail)}</p>
      <p style="margin:0 0 8px;"><strong>Company:</strong> ${escapeHtml(input.companyName || '(not provided)')}</p>
      <p style="margin:0 0 8px;"><strong>Type:</strong> ${escapeHtml(input.enquiryType)}</p>
      <p style="margin:16px 0 8px;"><strong>Message</strong></p>
      <p style="margin:0;white-space:pre-wrap;">${escapeHtml(input.message)}</p>
      <p style="margin:20px 0 0;color:#555;font-size:13px;">Enquiry ID: ${escapeHtml(input.id)}</p>
    </div>
  `.trim();

  return sendSystemMail({ to, subject, text, html });
}

export type SubmitContactEnquiryResult = {
  id: string;
  received: true;
  duplicate?: boolean;
};

/**
 * Persist a contact enquiry. Returns success only after Mongo confirms insert
 * (or an identical recent duplicate is found). Honeypot hits are discarded
 * without persistence and without a confirmed id — callers must treat that path
 * as a silent no-op at the route layer.
 */
export async function submitContactEnquiry(
  input: SubmitContactEnquiryInput,
  options: { ipHash?: string | null } = {}
): Promise<SubmitContactEnquiryResult | { honeypot: true }> {
  if (input.website && input.website.trim().length > 0) {
    log().info({ event: 'contact_enquiry.honeypot' }, 'Contact enquiry honeypot triggered');
    return { honeypot: true };
  }

  const fingerprint = contactEnquiryFingerprint({
    workEmail: input.workEmail,
    enquiryType: input.enquiryType,
    message: input.message,
  });

  const since = new Date(Date.now() - DUPLICATE_WINDOW_MS);
  const existing = await ContactEnquiryModel.findOne({
    fingerprint,
    createdAt: { $gte: since },
  })
    .select({ _id: 1 })
    .lean();

  if (existing?._id) {
    return {
      id: String(existing._id),
      received: true,
      duplicate: true,
    };
  }

  try {
    const doc = await ContactEnquiryModel.create({
      fullName: input.fullName,
      workEmail: input.workEmail.toLowerCase(),
      companyName: input.companyName ?? null,
      enquiryType: input.enquiryType,
      message: input.message,
      fingerprint,
      ipHash: options.ipHash ?? null,
      notified: false,
    });

    const id = doc._id.toHexString();
    const notified = await notifyTeam({
      id,
      fullName: input.fullName,
      workEmail: input.workEmail,
      companyName: input.companyName,
      enquiryType: input.enquiryType,
      message: input.message,
    });

    if (notified) {
      doc.notified = true;
      await doc.save();
    } else {
      log().warn(
        { event: 'contact_enquiry.notify_skipped', enquiryId: id },
        'Contact enquiry stored; team notification email was not sent'
      );
    }

    return { id, received: true };
  } catch (error) {
    log().error({ err: error, event: 'contact_enquiry.create_failed' }, 'Failed to store contact enquiry');
    throw new AppError(
      502,
      'CONTACT_ENQUIRY_FAILED',
      "We couldn't send your enquiry. Please try again.",
      { cause: error }
    );
  }
}
