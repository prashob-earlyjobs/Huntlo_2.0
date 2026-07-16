import type { Request, Response } from 'express';

import {
  calendlyApiGet,
  fetchCalendlyEventInvitees,
  getCalendlyWebhookSigningKey,
  verifyCalendlySignature,
} from '../../providers/calendly/calendly.client.js';
import { getLogger } from '../../config/logger.js';
import { getOrgCalendlyCredentials } from './calendly-credentials.js';
import { CalendlyWebhookEventModel } from './calendly-webhook-event.model.js';
import { InterviewModel } from './interview.model.js';
import { interviewsService } from './interview.service.js';
import { ScheduleCandidateModel } from './scheduling.facade.js';
import { applyWorkflowTransition } from '../huntlo-360/transitions.js';

/**
 * Process Calendly webhook using EJ field mapping only:
 * body.payload || body → scheduled_event / invitee / email / event
 */
export async function processCalendlyWebhook(req: Request, res: Response): Promise<void> {
  const signingKey = getCalendlyWebhookSigningKey();
  const rawBody = req.rawBody
    ? req.rawBody.toString('utf8')
    : Buffer.isBuffer(req.body)
      ? req.body.toString('utf8')
      : JSON.stringify(req.body || {});

  const signature = req.headers['calendly-webhook-signature'];
  if (signingKey && !verifyCalendlySignature(rawBody, signature, signingKey)) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_SIGNATURE', message: 'Invalid Calendly webhook signature' },
    });
    return;
  }

  let body: Record<string, unknown>;
  try {
    body = Buffer.isBuffer(req.body)
      ? (JSON.parse(rawBody) as Record<string, unknown>)
      : ((req.body || {}) as Record<string, unknown>);
  } catch {
    res.status(400).json({
      success: false,
      error: { code: 'INVALID_JSON', message: 'Invalid JSON body' },
    });
    return;
  }

  const payload = (body.payload && typeof body.payload === 'object'
    ? body.payload
    : body) as Record<string, unknown>;

  try {
    const result = await processCalendlyWebhookPayload(payload);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    getLogger().error({ err }, 'Calendly webhook processing failed');
    res.status(500).json({
      success: false,
      error: { code: 'WEBHOOK_PROCESSING_FAILED', message: 'Failed to process webhook.' },
    });
  }
}

export async function processCalendlyWebhookPayload(payload: Record<string, unknown>) {
  const eventUri = String(
    (payload.scheduled_event as { uri?: string } | undefined)?.uri || payload.event || ''
  ).trim();
  const inviteeUri = String(
    (payload.invitee as { uri?: string } | undefined)?.uri || payload.invitee || ''
  ).trim();

  if (!eventUri) return { handled: false, reason: 'missing_event' };

  const eventKey = `${inviteeUri || 'event'}:${eventUri}:${String(payload.created_at || Date.now())}`;
  const existing = await CalendlyWebhookEventModel.findOne({ eventKey }).lean();
  if (existing?.processedAt) {
    return { handled: true, duplicate: true };
  }

  await CalendlyWebhookEventModel.findOneAndUpdate(
    { eventKey },
    {
      $setOnInsert: {
        eventKey,
        inviteeUri: inviteeUri || null,
        eventUri,
        payload,
      },
    },
    { upsert: true }
  );

  let eventResource = payload.scheduled_event as Record<string, unknown> | undefined;
  let inviteeResource = payload.invitee as Record<string, unknown> | undefined;
  const eventTypeUri = String(eventResource?.event_type || '').trim();

  // Match pending interviews by event type URI
  const pending = await InterviewModel.find({
    deletedAt: null,
    status: { $in: ['link_sent', 'awaiting_booking', 'draft'] },
    $or: [
      { providerEventTypeId: eventTypeUri || '__none__' },
      { providerInviteeUri: inviteeUri || '__none__' },
      ...(inviteeResource?.email
        ? [{ inviteeEmail: String(inviteeResource.email).toLowerCase() }]
        : []),
    ],
  }).limit(50);

  const byOrg = new Map<string, typeof pending>();
  for (const row of pending) {
    const key = String(row.organizationId);
    const list = byOrg.get(key) || [];
    list.push(row);
    byOrg.set(key, list);
  }

  // Also match ScheduleCandidate by event type for Huntlo 360
  const scheduleCandidates = eventTypeUri
    ? await ScheduleCandidateModel.find({
        eventTypeUri,
        status: { $in: ['link_sent', 'link_pending'] },
      }).limit(50)
    : [];

  for (const sc of scheduleCandidates) {
    const key = String(sc.organizationId);
    if (!byOrg.has(key)) byOrg.set(key, []);
  }

  let synced = 0;

  for (const [organizationId, interviews] of byOrg) {
    const creds = await getOrgCalendlyCredentials(organizationId);

    if (!eventResource?.uri && creds) {
      const data = await calendlyApiGet(creds.personalAccessToken, eventUri);
      eventResource = (data.resource as Record<string, unknown>) || data;
    }
    if (!eventResource?.uri) {
      eventResource = (payload.scheduled_event as Record<string, unknown>) || eventResource;
    }

    let invitees: Array<Record<string, unknown>> = [];
    if (inviteeResource?.uri || inviteeResource?.email) {
      invitees = [inviteeResource!];
    } else if (creds) {
      invitees = await fetchCalendlyEventInvitees(creds.personalAccessToken, eventUri);
    }

    for (const invitee of invitees) {
      let inviteeRow = invitee;
      if (invitee?.uri && !invitee?.email && creds) {
        const data = await calendlyApiGet(creds.personalAccessToken, String(invitee.uri));
        inviteeRow = (data.resource as Record<string, unknown>) || data;
      }
      if (!inviteeRow?.email && !inviteeRow?.uri) continue;

      const doc = await interviewsService.upsertFromCalendlyInvitee({
        organizationId,
        event: eventResource!,
        invitee: inviteeRow,
        matchInterviewIds: interviews.map((i) => String(i._id)),
      });
      if (!doc) continue;
      synced += 1;

      // Update ScheduleCandidate + Huntlo 360 when linked
      if (doc.scheduleCandidateId || doc.workflowId) {
        const scId = doc.scheduleCandidateId;
        if (scId) {
          await ScheduleCandidateModel.findByIdAndUpdate(scId, {
            $set: {
              status: doc.status === 'cancelled' ? 'cancelled' : 'booked',
              bookedAt: doc.startAt || new Date(),
            },
          });
        }
        if (doc.workflowId && doc.candidateId && doc.status === 'scheduled') {
          try {
            await applyWorkflowTransition({
              organizationId,
              workflowId: String(doc.workflowId),
              candidateId: String(doc.candidateId),
              event: 'scheduling_booked',
              idempotencyKey: `calendly:${String(doc._id)}:${inviteeUri || eventUri}`,
            });
          } catch (err) {
            getLogger().warn({ err }, 'Huntlo 360 scheduling_booked transition skipped');
          }
        }
      }

      // Match schedule candidates by email when no interview yet
      for (const sc of scheduleCandidates.filter(
        (s) => String(s.organizationId) === organizationId
      )) {
        sc.status = 'booked';
        sc.bookedAt = new Date();
        await sc.save();
        if (sc.workflowId) {
          try {
            await applyWorkflowTransition({
              organizationId,
              workflowId: String(sc.workflowId),
              candidateId: String(sc.candidateId),
              event: 'scheduling_booked',
              idempotencyKey: `calendly-sc:${String(sc._id)}:${inviteeUri || eventUri}`,
            });
          } catch {
            // best-effort
          }
        }
      }
    }

    await CalendlyWebhookEventModel.updateOne(
      { eventKey },
      { $set: { organizationId, processedAt: new Date() } }
    );
  }

  if (synced === 0 && byOrg.size === 0) {
    await CalendlyWebhookEventModel.updateOne(
      { eventKey },
      { $set: { processedAt: new Date(), error: 'no_matching_interview' } }
    );
    return { handled: false, reason: 'no_matching_campaign_or_candidate' };
  }

  return { handled: true, synced };
}
