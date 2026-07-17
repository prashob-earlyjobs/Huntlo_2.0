import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { resetEnvCache } from '../src/config/env.js';
import { clearRateLimits } from '../src/middleware/rate-limit.js';
import { OnboardingModel } from '../src/modules/auth/onboarding.model.js';
import { UserSessionModel } from '../src/modules/auth/session.model.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { SavedCandidateModel } from '../src/modules/candidates/saved-candidate.model.js';
import { OrganizationMemberModel } from '../src/modules/organizations/member.model.js';
import { OrganizationModel } from '../src/modules/organizations/organization.model.js';
import { OutreachCampaignModel } from '../src/modules/outreach/campaign.model.js';
import { OutreachEnrollmentModel } from '../src/modules/outreach/enrollment.model.js';
import { ConversationThreadModel } from '../src/modules/conversations/conversation-thread.model.js';
import { ConversationMessageModel } from '../src/modules/conversations/conversation-message.model.js';
import { ReplyClassificationModel } from '../src/modules/conversations/reply-classification.model.js';
import { ingestInboundMessage } from '../src/modules/conversations/inbound-sync.service.js';
import { conversationsService } from '../src/modules/conversations/conversations.service.js';
import { AuditLogModel } from '../src/shared/audit/audit.service.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerAndAuth(agent: ReturnType<typeof request.agent>) {
  const response = await agent.post('/api/v1/auth/register').send({
    email: `conv-${Date.now()}@huntlo.ai`,
    password: 'Password123!',
    firstName: 'Conv',
    lastName: 'Tester',
    organizationName: `Conv Org ${Date.now()}`,
  });
  expect(response.status).toBe(201);
  return {
    token: response.body.data.accessToken as string,
    organizationId: response.body.data.organization.id as string,
    userId: response.body.data.user.id as string,
  };
}

describe('Conversations — threading, duplicates, stop-on-reply, override', () => {
  const app = createApp();
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    await startMemoryMongo();
    resetEnvCache();
    await connectDatabase();
    agent = request.agent(app);
  }, 60_000);

  afterAll(async () => {
    await disconnectDatabase();
    await stopMemoryMongo();
  });

  beforeEach(async () => {
    clearRateLimits();
    await Promise.all([
      ReplyClassificationModel.deleteMany({}),
      ConversationMessageModel.deleteMany({}),
      ConversationThreadModel.deleteMany({}),
      OutreachEnrollmentModel.deleteMany({}),
      OutreachCampaignModel.deleteMany({}),
      SavedCandidateModel.deleteMany({}),
      AuditLogModel.deleteMany({}),
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      UserModel.deleteMany({}),
    ]);
  });

  it('threads inbound replies, rejects duplicate provider messages, and stops enrollment on reply', async () => {
    const auth = await registerAndAuth(agent);

    const candidate = await SavedCandidateModel.create({
      organizationId: auth.organizationId,
      name: 'Priya Nair',
      email: 'priya@example.com',
      phone: '+919845012345',
      sourceType: 'manual',
      status: 'saved',
    });

    const campaign = await OutreachCampaignModel.create({
      organizationId: auth.organizationId,
      ownerUserId: auth.userId,
      name: 'Backend Sequence',
      sourceModule: 'outreach',
      campaignType: 'multi_channel',
      status: 'running',
      candidateSource: {
        type: 'manual',
        listId: null,
        jobId: null,
        candidateIds: [String(candidate._id)],
        label: null,
      },
      channelConfig: {
        email: { enabled: true, integrationId: null, senderEmail: null },
        whatsapp: { enabled: false, integrationId: null },
        ai_voice: { enabled: false, integrationId: null },
        timezone: 'Asia/Kolkata',
        sendWindow: { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
      },
      sequenceSteps: [
        {
          id: 'step-1',
          order: 0,
          type: 'email',
          delayDays: 0,
          templateId: null,
          subject: 'Hello',
          body: 'Hi {{first_name}}',
          stopOnReply: true,
          note: null,
          sendWindow: null,
          config: {},
        },
      ],
      stats: {
        enrolled: 1,
        pending: 0,
        active: 1,
        sent: 1,
        delivered: 1,
        replies: 0,
        interested: 0,
        qualified: 0,
        stopped: 0,
        failed: 0,
        completed: 0,
      },
    });

    const enrollment = await OutreachEnrollmentModel.create({
      organizationId: auth.organizationId,
      campaignId: campaign._id,
      candidateId: candidate._id,
      currentStepIndex: 0,
      status: 'active',
      contactAvailability: { email: true, phone: true, optedOut: false },
      replyState: { hasReply: false, disposition: null, repliedAt: null },
    });

    const first = await ingestInboundMessage({
      organizationId: auth.organizationId,
      provider: 'gmail',
      channel: 'email',
      providerMessageId: 'gmail-msg-1',
      providerThreadId: 'gmail-thread-1',
      from: 'priya@example.com',
      subject: 'Re: Hello',
      bodyText: 'Yes, interested — 30 days notice.',
      campaignId: String(campaign._id),
      enrollmentId: String(enrollment._id),
    });
    expect(first.duplicate).toBe(false);
    expect(first.threadId).toBeTruthy();

    // From headers like `Name <email>` must still match the candidate.
    const angled = await ingestInboundMessage({
      organizationId: auth.organizationId,
      provider: 'gmail',
      channel: 'email',
      providerMessageId: 'gmail-msg-angled',
      providerThreadId: 'gmail-thread-1',
      from: 'Priya Sharma <priya@example.com>',
      subject: 'Re: Hello',
      bodyText: 'What is the notice period expected?',
      skipClassify: true,
    });
    expect(angled.duplicate).toBe(false);
    expect(angled.threadId).toBe(first.threadId);
    expect(angled.messageId).toBeTruthy();

    const dup = await ingestInboundMessage({
      organizationId: auth.organizationId,
      provider: 'gmail',
      channel: 'email',
      providerMessageId: 'gmail-msg-1',
      providerThreadId: 'gmail-thread-1',
      from: 'priya@example.com',
      bodyText: 'Yes, interested — 30 days notice.',
      campaignId: String(campaign._id),
      enrollmentId: String(enrollment._id),
    });
    expect(dup.duplicate).toBe(true);
    expect(dup.threadId).toBe(first.threadId);

    const messageCount = await ConversationMessageModel.countDocuments({
      threadId: first.threadId,
    });
    expect(messageCount).toBe(2);

    const refreshedEnrollment = await OutreachEnrollmentModel.findById(enrollment._id);
    expect(refreshedEnrollment!.replyState.hasReply).toBe(true);
    expect(['stopped', 'replied', 'opted_out']).toContain(refreshedEnrollment!.status);
    expect(refreshedEnrollment!.stopReason).toBe('candidate_replied');

    const thread = await ConversationThreadModel.findById(first.threadId);
    expect(thread!.unreadCount).toBeGreaterThan(0);
    expect(thread!.automationStatus).toBe('stopped');

    // Same provider thread id should match existing conversation
    const second = await ingestInboundMessage({
      organizationId: auth.organizationId,
      provider: 'gmail',
      channel: 'email',
      providerMessageId: 'gmail-msg-2',
      providerThreadId: 'gmail-thread-1',
      from: 'priya@example.com',
      bodyText: 'Also available Thursday.',
      skipClassify: true,
    });
    expect(second.duplicate).toBe(false);
    expect(second.threadId).toBe(first.threadId);

    const list = await agent
      .get('/api/v1/conversations')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(list.status).toBe(200);
    expect(list.body.data.length).toBe(1);
    expect(list.body.data[0].unread).toBe(true);

    const read = await agent
      .post(`/api/v1/conversations/${first.threadId}/read`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(read.status).toBe(200);
    expect(read.body.data.unread).toBe(false);

    const reply = await agent
      .post(`/api/v1/conversations/${first.threadId}/reply`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ text: 'Great — I will send a calendar link.' });
    expect(reply.status).toBe(200);
    expect(reply.body.data.events.some((e: { text: string }) => e.text.includes('calendar'))).toBe(
      true
    );
  });

  it('allows human override of AI classification without AI auto-qualifying', async () => {
    const auth = await registerAndAuth(agent);

    const candidate = await SavedCandidateModel.create({
      organizationId: auth.organizationId,
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      sourceType: 'manual',
      status: 'saved',
    });

    const campaign = await OutreachCampaignModel.create({
      organizationId: auth.organizationId,
      ownerUserId: auth.userId,
      name: 'Qual campaign',
      sourceModule: 'outreach',
      status: 'running',
      candidateSource: {
        type: 'manual',
        listId: null,
        jobId: null,
        candidateIds: [String(candidate._id)],
        label: null,
      },
      channelConfig: {
        email: { enabled: true, integrationId: null, senderEmail: null },
        whatsapp: { enabled: false, integrationId: null },
        ai_voice: { enabled: false, integrationId: null },
        timezone: 'Asia/Kolkata',
        sendWindow: { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
      },
      sequenceSteps: [
        {
          id: 's1',
          order: 0,
          type: 'email',
          delayDays: 0,
          templateId: null,
          subject: 'Hi',
          body: 'Hello',
          stopOnReply: true,
          note: null,
          sendWindow: null,
          config: {},
        },
      ],
      qualificationConfig: {
        enabled: true,
        questions: [{ id: 'q1', prompt: 'Notice period?', answerType: 'Number' }],
        aiReplyEnabled: true,
      },
      stats: {
        enrolled: 1,
        pending: 0,
        active: 1,
        sent: 0,
        delivered: 0,
        replies: 0,
        interested: 0,
        qualified: 0,
        stopped: 0,
        failed: 0,
        completed: 0,
      },
    });

    const enrollment = await OutreachEnrollmentModel.create({
      organizationId: auth.organizationId,
      campaignId: campaign._id,
      candidateId: candidate._id,
      status: 'active',
      contactAvailability: { email: true, phone: false, optedOut: false },
    });

    const ingested = await ingestInboundMessage({
      organizationId: auth.organizationId,
      provider: 'outlook',
      channel: 'email',
      providerMessageId: 'outlook-1',
      from: 'ada@example.com',
      bodyText: 'Yes interested, notice is 30 days.',
      campaignId: String(campaign._id),
      enrollmentId: String(enrollment._id),
    });

    const thread = await ConversationThreadModel.findById(ingested.threadId);
    // AI must not set final qualified/rejected
    expect(['pending', 'in_progress', 'handed_off']).toContain(thread!.qualificationStatus);
    expect(thread!.qualificationStatus).not.toBe('qualified');
    expect(thread!.qualificationStatus).not.toBe('rejected');

    const override = await agent
      .post(`/api/v1/conversations/${ingested.threadId}/classify`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        override: {
          interest: 'interested',
          intent: 'provide_info',
          qualificationStatus: 'qualified',
          note: 'Recruiter confirmed fit',
        },
      });
    expect(override.status).toBe(200);
    expect(override.body.data.classification.recruiterReviewedAt).toBeTruthy();
    expect(override.body.data.conversation.qualificationStatus).toBe('qualified');

    const classification = await ReplyClassificationModel.findOne({
      threadId: ingested.threadId,
    });
    expect(classification!.recruiterOverride?.qualificationStatus).toBe('qualified');
    expect(classification!.audit.some((a) => a.action === 'recruiter.override')).toBe(true);

    const draft = await agent
      .post(`/api/v1/conversations/${ingested.threadId}/ai-draft`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ tone: 'Professional' });
    expect(draft.status).toBe(200);
    expect(draft.body.data.isDraft).toBe(true);
    expect(draft.body.data.autoSend).toBe(false);
    expect(draft.body.data.guardrails.autoQualify).toBe(false);
  });

  it('handles Meta WhatsApp webhook duplicates and opt-out stop', async () => {
    const auth = await registerAndAuth(agent);

    const candidate = await SavedCandidateModel.create({
      organizationId: auth.organizationId,
      name: 'WA User',
      phone: '919876543210',
      email: null,
      sourceType: 'manual',
      status: 'saved',
    });

    const campaign = await OutreachCampaignModel.create({
      organizationId: auth.organizationId,
      ownerUserId: auth.userId,
      name: 'WA campaign',
      status: 'running',
      candidateSource: {
        type: 'manual',
        listId: null,
        jobId: null,
        candidateIds: [String(candidate._id)],
        label: null,
      },
      channelConfig: {
        email: { enabled: false, integrationId: null, senderEmail: null },
        whatsapp: { enabled: true, integrationId: null },
        ai_voice: { enabled: false, integrationId: null },
        timezone: 'Asia/Kolkata',
        sendWindow: { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
      },
      sequenceSteps: [
        {
          id: 'wa1',
          order: 0,
          type: 'whatsapp',
          delayDays: 0,
          templateId: null,
          subject: null,
          body: 'Hi',
          stopOnReply: true,
          note: null,
          sendWindow: null,
          config: {},
        },
      ],
      stats: {
        enrolled: 1,
        pending: 0,
        active: 1,
        sent: 0,
        delivered: 0,
        replies: 0,
        interested: 0,
        qualified: 0,
        stopped: 0,
        failed: 0,
        completed: 0,
      },
    });

    await OutreachEnrollmentModel.create({
      organizationId: auth.organizationId,
      campaignId: campaign._id,
      candidateId: candidate._id,
      status: 'active',
      contactAvailability: { email: false, phone: true, optedOut: false },
    });

    const payload = {
      entry: [
        {
          changes: [
            {
              value: {
                organizationId: auth.organizationId,
                messages: [
                  {
                    id: 'wamid.OPT1',
                    from: '919876543210',
                    timestamp: String(Math.floor(Date.now() / 1000)),
                    text: { body: 'STOP' },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const first = await agent
      .post('/api/v1/public/webhooks/meta-whatsapp')
      .set('X-Organization-Id', auth.organizationId)
      .send(payload);
    expect(first.status).toBe(200);
    expect(first.body.received).toBe(true);

    const second = await agent
      .post('/api/v1/public/webhooks/meta-whatsapp')
      .set('X-Organization-Id', auth.organizationId)
      .send(payload);
    expect(second.status).toBe(200);
    expect(second.body.duplicate).toBe(true);

    const enrollment = await OutreachEnrollmentModel.findOne({ candidateId: candidate._id });
    expect(enrollment!.stopReason).toBe('candidate_opted_out');
    expect(enrollment!.status).toBe('opted_out');
  });

  it('stop and resume automation updates enrollment', async () => {
    const auth = await registerAndAuth(agent);
    const candidate = await SavedCandidateModel.create({
      organizationId: auth.organizationId,
      name: 'Test',
      email: 't@example.com',
      sourceType: 'manual',
      status: 'saved',
    });
    const campaign = await OutreachCampaignModel.create({
      organizationId: auth.organizationId,
      ownerUserId: auth.userId,
      name: 'Auto',
      status: 'running',
      candidateSource: {
        type: 'manual',
        listId: null,
        jobId: null,
        candidateIds: [String(candidate._id)],
        label: null,
      },
      channelConfig: {
        email: { enabled: true, integrationId: null, senderEmail: null },
        whatsapp: { enabled: false, integrationId: null },
        ai_voice: { enabled: false, integrationId: null },
        timezone: 'Asia/Kolkata',
        sendWindow: { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
      },
      sequenceSteps: [],
      stats: {
        enrolled: 1,
        pending: 0,
        active: 1,
        sent: 0,
        delivered: 0,
        replies: 0,
        interested: 0,
        qualified: 0,
        stopped: 0,
        failed: 0,
        completed: 0,
      },
    });
    const enrollment = await OutreachEnrollmentModel.create({
      organizationId: auth.organizationId,
      campaignId: campaign._id,
      candidateId: candidate._id,
      status: 'active',
      contactAvailability: { email: true, phone: false, optedOut: false },
    });
    const thread = await ConversationThreadModel.create({
      organizationId: auth.organizationId,
      candidateId: candidate._id,
      campaignId: campaign._id,
      enrollmentId: enrollment._id,
      channels: ['email'],
      status: 'open',
      automationStatus: 'active',
    });

    const stopped = await conversationsService.stopAutomation(
      auth.organizationId,
      auth.userId,
      String(thread._id)
    );
    expect(stopped.automationStatus).toBe('stopped');
    const enr1 = await OutreachEnrollmentModel.findById(enrollment._id);
    expect(enr1!.stopReason).toBe('recruiter_stopped');

    const resumed = await conversationsService.resumeAutomation(
      auth.organizationId,
      auth.userId,
      String(thread._id)
    );
    expect(resumed.automationStatus).toBe('active');
    const enr2 = await OutreachEnrollmentModel.findById(enrollment._id);
    expect(enr2!.status).toBe('active');
    expect(enr2!.stopReason).toBeNull();
  });
});
