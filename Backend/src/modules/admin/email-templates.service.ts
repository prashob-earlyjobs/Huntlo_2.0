import mongoose from 'mongoose';

import { createChildLogger } from '../../config/logger.js';
import { AppError } from '../../shared/errors/app-error.js';
import {
  isSystemMailConfigured,
  sendSystemMail,
} from '../../providers/system-mail/system-mail.js';
import { wrapHuntloEmailHtml } from '../../providers/system-mail/email-layout.js';
import { SourcingSessionModel } from '../sourcing/sourcing-session.model.js';
import { PeopleScoutLookupModel } from '../people-scout/lookup.model.js';
import {
  EmailSequenceEnrollmentModel,
  type EmailSequenceEnrollmentDocument,
} from './email-sequence-enrollment.model.js';
import {
  EmailTemplateModel,
  EMAIL_TEMPLATE_TYPES,
  POST_SIGNUP_STEP_COUNT,
  POST_SIGNUP_TEMPLATE_DEFAULTS,
  ALL_EMAIL_TEMPLATE_DEFAULTS,
  toPublicEmailTemplate,
  type EmailSequenceType,
  type EmailTemplateDocument,
  type PublicEmailTemplate,
} from './email-template.model.js';
import { EmailLifecycleSendModel } from './email-lifecycle-send.model.js';
import { whatsappTemplatesService } from './whatsapp-templates.service.js';
import { UserModel } from '../auth/user.model.js';
import { RevealedContactModel } from '../candidates/revealed-contact.model.js';
import { CandidateActivityModel } from '../candidates/candidate-activity.model.js';
import { OutreachCampaignModel } from '../outreach/campaign.model.js';
import { OutreachEnrollmentModel } from '../outreach/enrollment.model.js';
import { VoiceCallModel } from '../voice/voice-call.model.js';

const log = () => createChildLogger({ component: 'email-templates' });

/** Activation V1 cool-offs / delays (lifecycle emails). */
export const LIFECYCLE_DELAYS_MS = {
  /** Event 03 — no search after first login */
  no_search: 2 * 60 * 60 * 1000, // 2 hours
  /** Event 04 — search completed → unlock nudge (instant) */
  first_search_completed: 0,
  /** Event 06 — campaign draft sitting */
  campaign_draft: 12 * 60 * 60 * 1000, // 12 hours
  /** Event 07 — campaign live confirmation (instant) */
  campaign_live: 0,
  /** Event 08 — live campaign with no replies */
  no_replies: 48 * 60 * 60 * 1000, // 48 hours
  /** Event 09 — first reply (instant) */
  first_reply: 0,
  /** Event 11 — try AI Voice after unlock */
  try_ai_voice: 24 * 60 * 60 * 1000, // 24 hours
} as const;

export const LIFECYCLE_TEMPLATE_KEYS = {
  no_search: 'event.no_search',
  first_search_completed: 'event.first_search_completed',
  campaign_draft: 'event.campaign_draft',
  campaign_live: 'event.campaign_live',
  no_replies: 'event.no_replies',
  first_reply: 'event.first_reply',
  try_ai_voice: 'event.try_ai_voice',
} as const;

const ENGAGEMENT_ACTIVITY_ACTIONS = [
  'email_revealed',
  'mobile_revealed',
  'bulk_reveal_queued',
  'bulk_reveal_completed',
  'enriched',
] as const;

const LAUNCHED_CAMPAIGN_STATUSES = [
  'scheduled',
  'running',
  'paused',
  'completed',
  'cancelled',
  'failed',
] as const;

/** Only send no-search nudge if the user has not started any AI search yet. */
async function userHasStartedSearch(userId: mongoose.Types.ObjectId): Promise<boolean> {
  const existing = await SourcingSessionModel.exists({
    $or: [{ userId }, { ownerUserId: userId }],
  });
  return Boolean(existing);
}

/** Day 2 drip: only send if the user has not used People Scout yet. */
async function userHasUsedPeopleScout(userId: mongoose.Types.ObjectId): Promise<boolean> {
  const existing = await PeopleScoutLookupModel.exists({
    userId,
    deletedAt: null,
  });
  return Boolean(existing);
}

async function userHasLaunchedCampaign(userId: mongoose.Types.ObjectId): Promise<boolean> {
  const existing = await OutreachCampaignModel.exists({
    ownerUserId: userId,
    status: { $in: [...LAUNCHED_CAMPAIGN_STATUSES] },
    deletedAt: null,
  });
  return Boolean(existing);
}

async function userHasReceivedReply(userId: mongoose.Types.ObjectId): Promise<boolean> {
  const campaigns = await OutreachCampaignModel.find({
    ownerUserId: userId,
    deletedAt: null,
  })
    .select('_id')
    .lean();
  if (campaigns.length === 0) return false;
  const existing = await OutreachEnrollmentModel.exists({
    campaignId: { $in: campaigns.map((c) => c._id) },
    $or: [{ 'replyState.hasReply': true }, { hasReply: true }],
  });
  return Boolean(existing);
}

async function userHasUsedAiVoice(userId: mongoose.Types.ObjectId): Promise<boolean> {
  const user = await UserModel.findById(userId).select('organizationId').lean();
  if (!user?.organizationId) return false;
  const existing = await VoiceCallModel.exists({
    organizationId: user.organizationId,
  });
  return Boolean(existing);
}

/**
 * Conditional gates for post_signup steps.
 * Returns a skip reason when the step must NOT be sent; null means send is allowed.
 */
async function getPostSignupSkipReason(
  stepIndex: number,
  userId: mongoose.Types.ObjectId
): Promise<string | null> {
  // Day 1 — send only if user has NOT searched yet
  if (stepIndex === 1) {
    if (await userHasStartedSearch(userId)) {
      return 'condition_not_met:user_already_searched';
    }
    return null;
  }

  // Day 2 — send only if user has NOT used People Scout yet
  if (stepIndex === 2) {
    if (await userHasUsedPeopleScout(userId)) {
      return 'condition_not_met:user_already_used_people_scout';
    }
    return null;
  }

  return null;
}

let seedPromise: Promise<void> | null = null;

export async function ensureEmailTemplatesSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      for (const def of ALL_EMAIL_TEMPLATE_DEFAULTS) {
        await EmailTemplateModel.updateOne(
          { key: def.key },
          { $setOnInsert: def },
          { upsert: true }
        );
      }

      // Migrate day-0 content from previous seeded defaults only.
      const day0 = POST_SIGNUP_TEMPLATE_DEFAULTS.find((d) => d.key === 'post_signup.day_0');
      if (day0) {
        await EmailTemplateModel.updateOne(
          {
            key: 'post_signup.day_0',
            $or: [
              { subject: 'Welcome to Huntlo, {{firstName}}' },
              {
                bodyHtml:
                  '<p>Hi {{firstName}},</p><p>Welcome to Huntlo — we are glad you are here.</p><p>This is day 0 of your onboarding series. Explore the product and start sourcing candidates.</p><p>— The Huntlo Team</p>',
              },
              { bodyHtml: { $regex: '<a href="https://www\\.huntlo\\.ai">Start Exploring Huntlo' } },
              {
                bodyHtml: {
                  $regex:
                    '<a target="_blank" rel="noopener noreferrer" href="https://www\\.huntlo\\.ai">Start Exploring Huntlo',
                },
              },
              { bodyHtml: { $regex: 'Glad to have you here' } },
              { bodyHtml: { $regex: 'Start Exploring Huntlo' } },
              {
                bodyHtml: {
                  $regex: 'Hiring shouldn.?t start with filters',
                },
              },
            ],
          },
          {
            $set: {
              subject: day0.subject,
              bodyHtml: day0.bodyHtml,
              bodyText: day0.bodyText,
              name: day0.name,
            },
          }
        );
      }

      // Migrate day-1 from previous seeded defaults.
      const day1 = POST_SIGNUP_TEMPLATE_DEFAULTS.find((d) => d.key === 'post_signup.day_1');
      if (day1) {
        await EmailTemplateModel.updateOne(
          {
            key: 'post_signup.day_1',
            $or: [
              { subject: 'Find your first candidates on Huntlo' },
              {
                subject: "The best recruiters don't search. They describe.",
              },
              { name: 'Day 1 — First search' },
              { bodyHtml: { $regex: 'Ready for day 1' } },
              { bodyHtml: { $regex: 'The best recruiters don.?t search' } },
              { bodyHtml: { $regex: 'Try searching naturally' } },
              { bodyHtml: { $regex: 'Start your first search' } },
            ],
          },
          {
            $set: {
              name: day1.name,
              subject: day1.subject,
              bodyHtml: day1.bodyHtml,
              bodyText: day1.bodyText,
            },
          }
        );
      }

      // Migrate day-2 People Scout copy (force when not on latest subject).
      const day2 = POST_SIGNUP_TEMPLATE_DEFAULTS.find((d) => d.key === 'post_signup.day_2');
      if (day2) {
        await EmailTemplateModel.updateOne(
          {
            key: 'post_signup.day_2',
            subject: { $ne: day2.subject },
          },
          {
            $set: {
              name: day2.name,
              subject: day2.subject,
              bodyHtml: day2.bodyHtml,
              bodyText: day2.bodyText,
            },
          }
        );
        // Also refresh body if subject already matches but body is stale.
        await EmailTemplateModel.updateOne(
          {
            key: 'post_signup.day_2',
            subject: day2.subject,
            bodyHtml: { $ne: day2.bodyHtml },
          },
          {
            $set: {
              bodyHtml: day2.bodyHtml,
              bodyText: day2.bodyText,
              name: day2.name,
            },
          }
        );
      }

      // Migrate day-3 from screening placeholder → staffing social proof.
      const day3 = POST_SIGNUP_TEMPLATE_DEFAULTS.find((d) => d.key === 'post_signup.day_3');
      if (day3) {
        await EmailTemplateModel.updateOne(
          {
            key: 'post_signup.day_3',
            $or: [
              { subject: 'Screen candidates faster' },
              { name: 'Day 3 — Screening' },
              { bodyHtml: { $regex: 'explore voice screening' } },
            ],
          },
          {
            $set: {
              name: day3.name,
              subject: day3.subject,
              bodyHtml: day3.bodyHtml,
              bodyText: day3.bodyText,
            },
          }
        );
      }

      // Migrate day-4 from pipeline placeholder → campaigns copy.
      const day4 = POST_SIGNUP_TEMPLATE_DEFAULTS.find((d) => d.key === 'post_signup.day_4');
      if (day4) {
        await EmailTemplateModel.updateOne(
          {
            key: 'post_signup.day_4',
            $or: [
              { subject: 'Build a hiring pipeline that sticks' },
              { name: 'Day 4 — Pipeline' },
              { bodyHtml: { $regex: 'organize shortlisted candidates' } },
            ],
          },
          {
            $set: {
              name: day4.name,
              subject: day4.subject,
              bodyHtml: day4.bodyHtml,
              bodyText: day4.bodyText,
            },
          }
        );
      }

      // Migrate day-5 from team placeholder → AI magic moment.
      const day5 = POST_SIGNUP_TEMPLATE_DEFAULTS.find((d) => d.key === 'post_signup.day_5');
      if (day5) {
        await EmailTemplateModel.updateOne(
          {
            key: 'post_signup.day_5',
            $or: [
              { subject: 'Invite your hiring team' },
              { name: 'Day 5 — Team' },
              { bodyHtml: { $regex: 'invite teammates' } },
            ],
          },
          {
            $set: {
              name: day5.name,
              subject: day5.subject,
              bodyHtml: day5.bodyHtml,
              bodyText: day5.bodyText,
            },
          }
        );
      }

      // Disable drip steps outside activation V1 (replaced by event.* or unused).
      await EmailTemplateModel.updateMany(
        {
          key: {
            $in: [
              'post_signup.day_1',
              'post_signup.day_2',
              'post_signup.day_3',
              'post_signup.day_4',
              'post_signup.day_5',
            ],
          },
          enabled: true,
        },
        { $set: { enabled: false } }
      );

      // Migrate day-6 → V1 48h-left copy.
      const day6 = POST_SIGNUP_TEMPLATE_DEFAULTS.find((d) => d.key === 'post_signup.day_6');
      if (day6) {
        await EmailTemplateModel.updateOne(
          {
            key: 'post_signup.day_6',
            $or: [
              { subject: 'You are set up — here is what is next' },
              { subject: "You've got 48 hours left on your Huntlo trial" },
              { name: 'Day 6 — Next steps' },
              { name: 'Day 6 — Trial expiring' },
              { bodyHtml: { $regex: 'final note in your first week' } },
              { bodyHtml: { $regex: "You've got 48 hours left" } },
            ],
          },
          {
            $set: {
              name: day6.name,
              subject: day6.subject,
              bodyHtml: day6.bodyHtml,
              bodyText: day6.bodyText,
            },
          }
        );
      }

      // Migrate day-7 → V1 last-day copy.
      const day7 = POST_SIGNUP_TEMPLATE_DEFAULTS.find((d) => d.key === 'post_signup.day_7');
      if (day7) {
        await EmailTemplateModel.updateOne(
          {
            key: 'post_signup.day_7',
            $or: [
              { subject: 'Your Huntlo trial ends today' },
              { bodyHtml: { $regex: 'spent the last 7 days exploring' } },
            ],
          },
          {
            $set: {
              name: day7.name,
              subject: day7.subject,
              bodyHtml: day7.bodyHtml,
              bodyText: day7.bodyText,
            },
          }
        );
      }
    })().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  await seedPromise;
}

function htmlToPlainText(html: string): string {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

export function personalizeEmailContent(
  template: string,
  vars: { firstName?: string | null; email?: string | null }
): string {
  const firstName = (vars.firstName || '').trim() || 'there';
  const email = (vars.email || '').trim();
  return String(template || '')
    .replace(/\{\{\s*firstName\s*\}\}/gi, firstName)
    .replace(/\{\{\s*email\s*\}\}/gi, email);
}

function toObjectId(
  value: string | mongoose.Types.ObjectId
): mongoose.Types.ObjectId {
  return typeof value === 'string' ? new mongoose.Types.ObjectId(value) : value;
}

/** True if the user unlocked or otherwise engaged with candidates after `since`. */
async function userEngagedWithCandidatesSince(
  userId: mongoose.Types.ObjectId,
  since: Date
): Promise<boolean> {
  const [reveal, activity] = await Promise.all([
    RevealedContactModel.exists({
      userId,
      revealedAt: { $gte: since },
    }),
    CandidateActivityModel.exists({
      userId,
      action: { $in: [...ENGAGEMENT_ACTIVITY_ACTIONS] },
      createdAt: { $gte: since },
    }),
  ]);
  return Boolean(reveal || activity);
}

function addCalendarDays(from: Date, days: number): Date {
  const d = new Date(from.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export const emailTemplatesService = {
  async list(query: { type?: string } = {}): Promise<{ items: PublicEmailTemplate[] }> {
    await ensureEmailTemplatesSeeded();
    const filter: Record<string, unknown> = {};
    if (query.type && (EMAIL_TEMPLATE_TYPES as readonly string[]).includes(query.type)) {
      filter.type = query.type;
    }
    // Hide legacy drip steps not in activation V1.
    // day_1 → event.no_search; day_2–5 are older nudges outside the V1 10.
    filter.key = {
      $nin: [
        'post_signup.day_1',
        'post_signup.day_2',
        'post_signup.day_3',
        'post_signup.day_4',
        'post_signup.day_5',
      ],
    };
    const docs = await EmailTemplateModel.find(filter).sort({ type: 1, dayOffset: 1 }).lean();
    return {
      items: docs.map((d) => toPublicEmailTemplate(d as EmailTemplateDocument)),
    };
  },

  async get(id: string): Promise<PublicEmailTemplate> {
    await ensureEmailTemplatesSeeded();
    const doc = await EmailTemplateModel.findById(id);
    if (!doc) throw AppError.notFound('Email template not found');
    return toPublicEmailTemplate(doc);
  },

  async update(
    id: string,
    input: {
      name?: string;
      subject?: string;
      bodyHtml?: string;
      bodyText?: string;
      enabled?: boolean;
    },
    actorUserId: string
  ): Promise<PublicEmailTemplate> {
    await ensureEmailTemplatesSeeded();
    const doc = await EmailTemplateModel.findById(id);
    if (!doc) throw AppError.notFound('Email template not found');

    if (input.name !== undefined) doc.name = input.name;
    if (input.subject !== undefined) doc.subject = input.subject;
    if (input.bodyHtml !== undefined) {
      doc.bodyHtml = input.bodyHtml;
      if (input.bodyText === undefined) {
        doc.bodyText = htmlToPlainText(input.bodyHtml);
      }
    }
    if (input.bodyText !== undefined) doc.bodyText = input.bodyText;
    if (input.enabled !== undefined) doc.enabled = input.enabled;
    doc.updatedByUserId = new mongoose.Types.ObjectId(actorUserId);
    await doc.save();
    return toPublicEmailTemplate(doc);
  },

  /**
   * Enroll a new user in the post-signup drip. Idempotent; never throws to callers
   * that should not fail signup — wrap with .catch when fire-and-forget.
   */
  async enrollPostSignupSequence(input: {
    userId: string;
    email: string;
    firstName?: string | null;
  }): Promise<EmailSequenceEnrollmentDocument | null> {
    await ensureEmailTemplatesSeeded();
    if (!mongoose.isValidObjectId(input.userId)) return null;

    const existing = await EmailSequenceEnrollmentModel.findOne({
      userId: input.userId,
      type: 'post_signup',
    });
    if (existing) return existing;

    const now = new Date();
    try {
      const enrollment = await EmailSequenceEnrollmentModel.create({
        userId: new mongoose.Types.ObjectId(input.userId),
        email: input.email.trim().toLowerCase(),
        firstName: (input.firstName || '').trim(),
        type: 'post_signup' satisfies EmailSequenceType,
        startedAt: now,
        nextStepIndex: 0,
        nextSendAt: now,
        status: 'active',
        sentSteps: [],
      });
      log().info({ userId: input.userId, enrollmentId: enrollment._id }, 'Enrolled post_signup sequence');

      // Day 0: send immediately via the same SYSTEM_SMTP path as forgot-password.
      // Later days are handled by the email.sequence_sweep worker.
      void this.processOneEnrollment(enrollment).catch((error) => {
        log().warn(
          {
            enrollmentId: enrollment._id,
            err: error instanceof Error ? error.message : String(error),
          },
          'Immediate day-0 sequence send failed — worker will retry'
        );
      });

      // Event 03 — cool-off no-search nudge (2h after first session / signup login).
      void this.onFirstLogin({ userId: input.userId }).catch(() => undefined);

      // Send/signup WhatsApp via approved Meta template (platform Huntlo WhatsApp).
      void whatsappTemplatesService.onSignup({ userId: input.userId }).catch((error) => {
        log().warn(
          {
            userId: input.userId,
            err: error instanceof Error ? error.message : String(error),
          },
          'Signup WhatsApp lifecycle send failed'
        );
      });

      return enrollment;
    } catch (error: unknown) {
      // Race: unique index — treat as already enrolled
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code?: number }).code === 11000
      ) {
        return EmailSequenceEnrollmentModel.findOne({
          userId: input.userId,
          type: 'post_signup',
        });
      }
      throw error;
    }
  },

  /** Process due sequence enrollments (worker sweep). */
  async processDueSequenceSends(limit = 50): Promise<{
    processed: number;
    sent: number;
    skipped: number;
    lifecycleProcessed?: number;
    lifecycleSent?: number;
    lifecycleSkipped?: number;
    whatsappProcessed?: number;
    whatsappSent?: number;
    whatsappSkipped?: number;
  }> {
    await ensureEmailTemplatesSeeded();
    const now = new Date();
    const due = await EmailSequenceEnrollmentModel.find({
      status: 'active',
      nextSendAt: { $lte: now },
    })
      .sort({ nextSendAt: 1 })
      .limit(Math.max(1, Math.min(200, limit)));

    let sent = 0;
    let skipped = 0;
    let processed = 0;

    for (const enrollment of due) {
      // Catch up overdue steps (including consecutive condition-skips) in one sweep.
      for (let guard = 0; guard < POST_SIGNUP_STEP_COUNT; guard += 1) {
        if (enrollment.status !== 'active') break;
        if (enrollment.nextSendAt.getTime() > Date.now()) break;

        const outcome = await this.processOneEnrollment(enrollment);
        processed += 1;
        if (outcome === 'sent') sent += 1;
        else if (outcome === 'skipped') skipped += 1;
        else break; // noop / completed — stop this enrollment for now
      }
    }

    const lifecycle = await this.processDueLifecycleSends(limit);
    const whatsapp = await whatsappTemplatesService.processDueLifecycleSends(limit);
    return {
      processed,
      sent,
      skipped,
      lifecycleProcessed: lifecycle.processed,
      lifecycleSent: lifecycle.sent,
      lifecycleSkipped: lifecycle.skipped,
      whatsappProcessed: whatsapp.processed,
      whatsappSent: whatsapp.sent,
      whatsappSkipped: whatsapp.skipped,
    };
  },

  async processOneEnrollment(
    enrollment: EmailSequenceEnrollmentDocument
  ): Promise<'sent' | 'skipped' | 'completed' | 'noop'> {
    if (enrollment.status !== 'active') return 'noop';

    const stepIndex = enrollment.nextStepIndex;
    if (stepIndex >= POST_SIGNUP_STEP_COUNT) {
      enrollment.status = 'completed';
      await enrollment.save();
      return 'completed';
    }

    const template = await EmailTemplateModel.findOne({
      type: enrollment.type,
      dayOffset: stepIndex,
    });

    const markAdvanced = async (opts: { skipped: boolean; templateKey: string }) => {
      enrollment.sentSteps.push({
        stepIndex,
        templateKey: opts.templateKey,
        sentAt: new Date(),
        skipped: opts.skipped,
      });
      const nextIndex = stepIndex + 1;
      enrollment.nextStepIndex = nextIndex;
      if (nextIndex >= POST_SIGNUP_STEP_COUNT) {
        enrollment.status = 'completed';
        enrollment.nextSendAt = new Date();
      } else {
        enrollment.nextSendAt = addCalendarDays(enrollment.startedAt, nextIndex);
      }
      await enrollment.save();
    };

    if (!template || !template.enabled) {
      await markAdvanced({
        skipped: true,
        templateKey: template?.key || `${enrollment.type}.day_${stepIndex}`,
      });
      return 'skipped';
    }

    // Conditional steps: skip (do not send) when the trigger condition is not met.
    if (enrollment.type === 'post_signup') {
      const skipReason = await getPostSignupSkipReason(stepIndex, enrollment.userId);
      if (skipReason) {
        await markAdvanced({ skipped: true, templateKey: template.key });
        log().info(
          {
            enrollmentId: enrollment._id,
            userId: enrollment.userId,
            stepIndex,
            templateKey: template.key,
            reason: skipReason,
          },
          'Skipped sequence step — condition not met'
        );
        return 'skipped';
      }
    }

    const vars = { firstName: enrollment.firstName, email: enrollment.email };
    const subject = personalizeEmailContent(template.subject, vars);
    const bodyHtml = personalizeEmailContent(template.bodyHtml || '', vars);
    const text =
      personalizeEmailContent(template.bodyText || '', vars) || htmlToPlainText(bodyHtml);
    const html = wrapHuntloEmailHtml(bodyHtml);

    const ok = await sendSystemMail({
      to: enrollment.email,
      subject,
      text,
      html,
    });

    if (!ok) {
      // Retry later without advancing step
      enrollment.nextSendAt = new Date(Date.now() + 15 * 60 * 1000);
      await enrollment.save();
      log().warn(
        { enrollmentId: enrollment._id, stepIndex, to: enrollment.email },
        'Sequence email send failed or mail not configured — will retry'
      );
      return 'noop';
    }

    await markAdvanced({ skipped: false, templateKey: template.key });
    log().info(
      { enrollmentId: enrollment._id, stepIndex, templateKey: template.key, to: enrollment.email },
      'Sequence email sent'
    );
    return 'sent';
  },

  /**
   * Admin test send — uses the same SYSTEM_SMTP / sendSystemMail path as
   * forgot-password and live drip delivery.
   */
  async sendTest(
    id: string,
    input: { to: string; firstName?: string }
  ): Promise<{ sent: boolean; to: string; subject: string; mailConfigured: boolean }> {
    await ensureEmailTemplatesSeeded();
    const template = await EmailTemplateModel.findById(id);
    if (!template) throw AppError.notFound('Email template not found');

    const mailConfigured = isSystemMailConfigured();
    const vars = {
      firstName: (input.firstName || 'Alex').trim() || 'Alex',
      email: input.to.trim().toLowerCase(),
    };
    const subject = personalizeEmailContent(template.subject, vars);
    const bodyHtml = personalizeEmailContent(template.bodyHtml || '', vars);
    const text =
      personalizeEmailContent(template.bodyText || '', vars) || htmlToPlainText(bodyHtml);
    const html = wrapHuntloEmailHtml(bodyHtml);

    if (!mailConfigured) {
      log().warn({ to: vars.email, subject }, 'Test send skipped — SYSTEM_SMTP_* not configured');
      return { sent: false, to: vars.email, subject, mailConfigured: false };
    }

    const sent = await sendSystemMail({
      to: vars.email,
      subject,
      text,
      html,
    });
    return { sent, to: vars.email, subject, mailConfigured: true };
  },

  /**
   * Schedule unlock nudge after first AI search (instant; skip if already unlocked).
   * Worker sends on next sweep only if the user has not unlocked / engaged.
   */
  async onFirstSearchCompleted(input: {
    userId: string | mongoose.Types.ObjectId;
    sessionId?: string | mongoose.Types.ObjectId | null;
  }): Promise<'scheduled' | 'skipped' | 'noop'> {
    // Completing a search cancels the no-search cool-off nudge.
    await this.cancelPendingLifecycle(
      input.userId,
      LIFECYCLE_TEMPLATE_KEYS.no_search,
      'user_completed_search'
    );

    return this.scheduleLifecycleEmail({
      userId: input.userId,
      templateKey: LIFECYCLE_TEMPLATE_KEYS.first_search_completed,
      delayMs: LIFECYCLE_DELAYS_MS.first_search_completed,
      sessionId: input.sessionId,
    });
  },

  /** Event 03 — schedule after first login; send in 2h if still no search. */
  async onFirstLogin(input: {
    userId: string | mongoose.Types.ObjectId;
  }): Promise<'scheduled' | 'skipped' | 'noop'> {
    void whatsappTemplatesService.onFirstLogin({ userId: input.userId }).catch(() => undefined);
    if (await userHasStartedSearch(toObjectId(input.userId))) {
      return 'skipped';
    }
    return this.scheduleLifecycleEmail({
      userId: input.userId,
      templateKey: LIFECYCLE_TEMPLATE_KEYS.no_search,
      delayMs: LIFECYCLE_DELAYS_MS.no_search,
    });
  },

  /** Event 06 — schedule when a draft campaign is created; send in 12h if not launched. */
  async onCampaignDraftCreated(input: {
    userId: string | mongoose.Types.ObjectId;
    campaignId?: string | mongoose.Types.ObjectId | null;
  }): Promise<'scheduled' | 'skipped' | 'noop'> {
    if (await userHasLaunchedCampaign(toObjectId(input.userId))) {
      return 'skipped';
    }
    return this.scheduleLifecycleEmail({
      userId: input.userId,
      templateKey: LIFECYCLE_TEMPLATE_KEYS.campaign_draft,
      delayMs: LIFECYCLE_DELAYS_MS.campaign_draft,
      sessionId: input.campaignId,
    });
  },

  /** Event 07 + 08 — confirm launch instantly; schedule no-replies for +48h. */
  async onCampaignLaunched(input: {
    userId: string | mongoose.Types.ObjectId;
    campaignId?: string | mongoose.Types.ObjectId | null;
  }): Promise<void> {
    await this.cancelPendingLifecycle(
      input.userId,
      LIFECYCLE_TEMPLATE_KEYS.campaign_draft,
      'user_launched_campaign'
    );

    await this.scheduleLifecycleEmail({
      userId: input.userId,
      templateKey: LIFECYCLE_TEMPLATE_KEYS.campaign_live,
      delayMs: LIFECYCLE_DELAYS_MS.campaign_live,
      sessionId: input.campaignId,
    });

    await this.scheduleLifecycleEmail({
      userId: input.userId,
      templateKey: LIFECYCLE_TEMPLATE_KEYS.no_replies,
      delayMs: LIFECYCLE_DELAYS_MS.no_replies,
      sessionId: input.campaignId,
    });
  },

  /** Event 09 — first candidate reply. */
  async onFirstReply(input: {
    userId: string | mongoose.Types.ObjectId;
  }): Promise<'scheduled' | 'skipped' | 'noop'> {
    void whatsappTemplatesService.onFirstReply({ userId: input.userId }).catch(() => undefined);
    await this.cancelPendingLifecycle(
      input.userId,
      LIFECYCLE_TEMPLATE_KEYS.no_replies,
      'user_received_reply'
    );

    return this.scheduleLifecycleEmail({
      userId: input.userId,
      templateKey: LIFECYCLE_TEMPLATE_KEYS.first_reply,
      delayMs: LIFECYCLE_DELAYS_MS.first_reply,
    });
  },

  /** Event 11 — schedule AI Voice nudge 24h after first unlock. */
  async onProfileUnlocked(input: {
    userId: string | mongoose.Types.ObjectId;
  }): Promise<'scheduled' | 'skipped' | 'noop'> {
    void whatsappTemplatesService.onProfileUnlocked({ userId: input.userId }).catch(() => undefined);
    // Unlock also cancels the search→unlock nudge.
    await this.cancelPendingLifecycle(
      input.userId,
      LIFECYCLE_TEMPLATE_KEYS.first_search_completed,
      'user_already_engaged'
    );

    if (await userHasUsedAiVoice(toObjectId(input.userId))) {
      return 'skipped';
    }

    return this.scheduleLifecycleEmail({
      userId: input.userId,
      templateKey: LIFECYCLE_TEMPLATE_KEYS.try_ai_voice,
      delayMs: LIFECYCLE_DELAYS_MS.try_ai_voice,
    });
  },

  /** Cancel AI Voice nudge when the user starts using voice. */
  async onAiVoiceUsed(input: {
    userId: string | mongoose.Types.ObjectId;
  }): Promise<void> {
    await this.cancelPendingLifecycle(
      input.userId,
      LIFECYCLE_TEMPLATE_KEYS.try_ai_voice,
      'user_already_used_ai_voice'
    );
  },

  /** Idempotent schedule of a one-shot lifecycle email. */
  async scheduleLifecycleEmail(input: {
    userId: string | mongoose.Types.ObjectId;
    templateKey: string;
    delayMs: number;
    sessionId?: string | mongoose.Types.ObjectId | null;
  }): Promise<'scheduled' | 'skipped' | 'noop'> {
    await ensureEmailTemplatesSeeded();

    const userId = toObjectId(input.userId);
    const template = await EmailTemplateModel.findOne({ key: input.templateKey });
    if (!template || !template.enabled) return 'skipped';

    const user = await UserModel.findById(userId).select('email').lean();
    if (!user?.email) {
      log().warn({ userId, templateKey: input.templateKey }, 'Lifecycle email skipped — no email');
      return 'noop';
    }

    const sendAt = new Date(Date.now() + Math.max(0, input.delayMs));
    const sessionId = input.sessionId ? toObjectId(input.sessionId) : null;

    try {
      await EmailLifecycleSendModel.create({
        userId,
        templateKey: input.templateKey,
        sessionId,
        status: 'pending',
        sendAt,
        sentAt: null,
        skippedAt: null,
        skipReason: null,
      });
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code?: number }).code === 11000
      ) {
        return 'skipped';
      }
      throw error;
    }

    log().info(
      {
        userId,
        templateKey: input.templateKey,
        sendAt: sendAt.toISOString(),
        delayMs: input.delayMs,
      },
      'Lifecycle email scheduled'
    );
    return 'scheduled';
  },

  async cancelPendingLifecycle(
    userId: string | mongoose.Types.ObjectId,
    templateKey: string,
    reason: string
  ): Promise<void> {
    const result = await EmailLifecycleSendModel.updateOne(
      {
        userId: toObjectId(userId),
        templateKey,
        status: 'pending',
      },
      {
        $set: {
          status: 'skipped',
          skippedAt: new Date(),
          skipReason: reason,
        },
      }
    );
    if (result.modifiedCount > 0) {
      log().info({ userId, templateKey, reason }, 'Pending lifecycle email cancelled');
    }
  },

  /** Process due pending lifecycle emails (worker sweep). */
  async processDueLifecycleSends(limit = 50): Promise<{
    processed: number;
    sent: number;
    skipped: number;
  }> {
    await ensureEmailTemplatesSeeded();
    const now = new Date();
    const due = await EmailLifecycleSendModel.find({
      status: 'pending',
      sendAt: { $lte: now },
    })
      .sort({ sendAt: 1 })
      .limit(Math.max(1, Math.min(200, limit)));

    let processed = 0;
    let sent = 0;
    let skipped = 0;

    for (const row of due) {
      processed += 1;
      const outcome = await this.processOneLifecycleSend(row);
      if (outcome === 'sent') sent += 1;
      else if (outcome === 'skipped') skipped += 1;
    }

    return { processed, sent, skipped };
  },

  async getLifecycleSkipReason(
    templateKey: string,
    userId: mongoose.Types.ObjectId,
    row: { createdAt?: Date; sendAt: Date }
  ): Promise<string | null> {
    switch (templateKey) {
      case LIFECYCLE_TEMPLATE_KEYS.no_search:
        if (await userHasStartedSearch(userId)) return 'user_already_searched';
        return null;
      case LIFECYCLE_TEMPLATE_KEYS.first_search_completed: {
        const since = row.createdAt || row.sendAt;
        if (await userEngagedWithCandidatesSince(userId, since)) {
          return 'user_already_engaged';
        }
        return null;
      }
      case LIFECYCLE_TEMPLATE_KEYS.campaign_draft:
        if (await userHasLaunchedCampaign(userId)) return 'user_already_launched_campaign';
        return null;
      case LIFECYCLE_TEMPLATE_KEYS.no_replies:
        if (await userHasReceivedReply(userId)) return 'user_already_has_reply';
        return null;
      case LIFECYCLE_TEMPLATE_KEYS.try_ai_voice:
        if (await userHasUsedAiVoice(userId)) return 'user_already_used_ai_voice';
        return null;
      case LIFECYCLE_TEMPLATE_KEYS.campaign_live:
      case LIFECYCLE_TEMPLATE_KEYS.first_reply:
      default:
        return null;
    }
  },

  async processOneLifecycleSend(
    row: InstanceType<typeof EmailLifecycleSendModel>
  ): Promise<'sent' | 'skipped' | 'noop'> {
    if (row.status !== 'pending') return 'noop';

    const template = await EmailTemplateModel.findOne({ key: row.templateKey });
    if (!template || !template.enabled) {
      row.status = 'skipped';
      row.skippedAt = new Date();
      row.skipReason = 'template_disabled';
      await row.save();
      return 'skipped';
    }

    const skipReason = await this.getLifecycleSkipReason(row.templateKey, row.userId, row);
    if (skipReason) {
      row.status = 'skipped';
      row.skippedAt = new Date();
      row.skipReason = skipReason;
      await row.save();
      log().info(
        { userId: row.userId, templateKey: row.templateKey, reason: skipReason },
        'Lifecycle email skipped — condition not met'
      );
      return 'skipped';
    }

    const user = await UserModel.findById(row.userId).select('email firstName').lean();
    if (!user?.email) {
      row.status = 'skipped';
      row.skippedAt = new Date();
      row.skipReason = 'missing_email';
      await row.save();
      return 'skipped';
    }

    const vars = {
      firstName: (user.firstName || '').trim() || 'there',
      email: String(user.email).trim().toLowerCase(),
    };
    const subject = personalizeEmailContent(template.subject, vars);
    const bodyHtml = personalizeEmailContent(template.bodyHtml || '', vars);
    const text =
      personalizeEmailContent(template.bodyText || '', vars) || htmlToPlainText(bodyHtml);
    const html = wrapHuntloEmailHtml(bodyHtml);

    const ok = await sendSystemMail({
      to: vars.email,
      subject,
      text,
      html,
    });
    if (!ok) {
      // Retry on next sweep without marking skipped.
      row.sendAt = new Date(Date.now() + 15 * 60 * 1000);
      await row.save();
      log().warn(
        { userId: row.userId, to: vars.email, templateKey: row.templateKey },
        'Lifecycle email send failed or mail not configured — will retry'
      );
      return 'noop';
    }

    row.status = 'sent';
    row.sentAt = new Date();
    await row.save();
    log().info(
      { userId: row.userId, to: vars.email, templateKey: row.templateKey },
      'Lifecycle email sent'
    );
    return 'sent';
  },
};
