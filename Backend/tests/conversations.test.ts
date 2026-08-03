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

  it('binds email reply to the campaign that owns the Gmail threadId, not the latest enrollment', async () => {
    const auth = await registerAndAuth(agent);

    const candidate = await SavedCandidateModel.create({
      organizationId: auth.organizationId,
      name: 'Jane Multi',
      email: 'jane.multi@example.com',
      sourceType: 'manual',
      status: 'saved',
    });
    // Same sender email on a second candidate record reproduces the smoke-case
    // misroute: plain email lookup can pick the wrong candidate before threading.
    const duplicateCandidate = await SavedCandidateModel.create({
      organizationId: auth.organizationId,
      name: 'Jane Multi Duplicate',
      email: 'jane.multi@example.com',
      sourceType: 'manual',
      status: 'saved',
    });

    const emailCampaignFields = {
      organizationId: auth.organizationId,
      ownerUserId: auth.userId,
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
    };

    const campaignA = await OutreachCampaignModel.create({
      ...emailCampaignFields,
      name: 'Campaign A — Backend',
    });
    const campaignB = await OutreachCampaignModel.create({
      ...emailCampaignFields,
      name: 'Campaign B — Frontend',
    });

    const enrollmentA = await OutreachEnrollmentModel.create({
      organizationId: auth.organizationId,
      campaignId: campaignA._id,
      candidateId: candidate._id,
      currentStepIndex: 0,
      status: 'stopped',
      stopReason: 'candidate_replied',
      contactAvailability: { email: true, phone: false, optedOut: false },
      replyState: { hasReply: true, disposition: null, repliedAt: new Date(), channel: 'email' },
      updatedAt: new Date('2026-07-20T10:00:00.000Z'),
    });
    // Newer enrollment — loose updatedAt heuristic would wrongly pick this.
    const enrollmentB = await OutreachEnrollmentModel.create({
      organizationId: auth.organizationId,
      campaignId: campaignB._id,
      candidateId: duplicateCandidate._id,
      currentStepIndex: 0,
      status: 'active',
      contactAvailability: { email: true, phone: false, optedOut: false },
      replyState: { hasReply: false, disposition: null, repliedAt: null, channel: null },
      updatedAt: new Date('2026-07-25T10:00:00.000Z'),
    });

    // Simulate outbound for campaign A that stamped the Gmail thread id.
    const threadA = await ConversationThreadModel.create({
      organizationId: auth.organizationId,
      candidateId: candidate._id,
      campaignId: campaignA._id,
      enrollmentId: enrollmentA._id,
      channels: ['email'],
      status: 'closed',
      unreadCount: 0,
      qualificationStatus: 'pending',
      automationStatus: 'stopped',
      providerThreadIds: [{ provider: 'gmail', threadId: 'gmail-thread-campaign-a' }],
    });
    await ConversationMessageModel.create({
      organizationId: auth.organizationId,
      threadId: threadA._id,
      provider: 'gmail',
      channel: 'email',
      direction: 'outbound',
      sender: 'recruiter@example.com',
      recipient: 'jane.multi@example.com',
      subject: 'Backend role',
      bodyText: 'Interested in Backend?',
      providerMessageId: 'gmail-out-a',
      providerThreadId: 'gmail-thread-campaign-a',
      deliveryStatus: 'sent',
      messageType: 'message',
      aiGenerated: true,
      sentAt: new Date('2026-07-20T10:00:00.000Z'),
    });

    // Newer campaign B outbound with a different Gmail thread.
    const threadB = await ConversationThreadModel.create({
      organizationId: auth.organizationId,
      candidateId: duplicateCandidate._id,
      campaignId: campaignB._id,
      enrollmentId: enrollmentB._id,
      channels: ['email'],
      status: 'open',
      unreadCount: 0,
      qualificationStatus: 'pending',
      automationStatus: 'active',
      providerThreadIds: [{ provider: 'gmail', threadId: 'gmail-thread-campaign-b' }],
    });
    await ConversationMessageModel.create({
      organizationId: auth.organizationId,
      threadId: threadB._id,
      provider: 'gmail',
      channel: 'email',
      direction: 'outbound',
      sender: 'recruiter@example.com',
      recipient: 'jane.multi@example.com',
      subject: 'Frontend role',
      bodyText: 'Interested in Frontend?',
      providerMessageId: 'gmail-out-b',
      providerThreadId: 'gmail-thread-campaign-b',
      deliveryStatus: 'sent',
      messageType: 'message',
      aiGenerated: true,
      sentAt: new Date('2026-07-25T10:00:00.000Z'),
    });

    // Reply to campaign A's email — no campaignId/enrollmentId hints (like real push sync).
    const reply = await ingestInboundMessage({
      organizationId: auth.organizationId,
      provider: 'gmail',
      channel: 'email',
      providerMessageId: 'gmail-reply-to-a',
      providerThreadId: 'gmail-thread-campaign-a',
      from: 'jane.multi@example.com',
      subject: 'Re: Backend role',
      bodyText: 'Yes, interested in the Backend role.',
      skipClassify: true,
    });

    expect(reply.duplicate).toBe(false);
    expect(reply.threadId).toBe(String(threadA._id));

    const boundThread = await ConversationThreadModel.findById(reply.threadId);
    expect(String(boundThread!.campaignId)).toBe(String(campaignA._id));
    expect(String(boundThread!.enrollmentId)).toBe(String(enrollmentA._id));

    // Must not have attached the reply to the newer campaign B thread.
    const msg = await ConversationMessageModel.findById(reply.messageId);
    expect(String(msg!.threadId)).toBe(String(threadA._id));
  });

  it('binds WhatsApp reply to the campaign with the newest outbound across duplicate phone candidates', async () => {
    const auth = await registerAndAuth(agent);

    const waCampaignFields = (candidateId: string) => ({
      organizationId: auth.organizationId,
      ownerUserId: auth.userId,
      sourceModule: 'outreach',
      campaignType: 'multi_channel',
      status: 'running',
      candidateSource: {
        type: 'manual',
        listId: null,
        jobId: null,
        candidateIds: [candidateId],
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
          id: 'wa-1',
          order: 0,
          type: 'whatsapp',
          delayDays: 0,
          templateId: null,
          subject: null,
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

    // Two candidate records with the same phone — findCandidate picks the first,
    // which used to bind the reply to that candidate's old campaign.
    const oldCandidate = await SavedCandidateModel.create({
      organizationId: auth.organizationId,
      name: 'WA Gokul Old',
      email: 'wa.old@example.com',
      phone: '+918512349999',
      sourceType: 'manual',
      status: 'saved',
    });
    const newCandidate = await SavedCandidateModel.create({
      organizationId: auth.organizationId,
      name: 'WA Gokul New',
      email: 'wa.new@example.com',
      phone: '+918512349999',
      sourceType: 'manual',
      status: 'saved',
    });

    const oldCampaign = await OutreachCampaignModel.create({
      ...waCampaignFields(String(oldCandidate._id)),
      name: 'Old WA campaign',
    });
    const newCampaign = await OutreachCampaignModel.create({
      ...waCampaignFields(String(newCandidate._id)),
      name: 'New WA campaign',
    });

    const oldEnrollment = await OutreachEnrollmentModel.create({
      organizationId: auth.organizationId,
      campaignId: oldCampaign._id,
      candidateId: oldCandidate._id,
      status: 'stopped',
      stopReason: 'candidate_replied',
      contactAvailability: { email: false, phone: true, optedOut: false },
      replyState: { hasReply: true, disposition: null, repliedAt: new Date(), channel: 'whatsapp' },
    });
    const newEnrollment = await OutreachEnrollmentModel.create({
      organizationId: auth.organizationId,
      campaignId: newCampaign._id,
      candidateId: newCandidate._id,
      status: 'active',
      contactAvailability: { email: false, phone: true, optedOut: false },
    });

    const oldThread = await ConversationThreadModel.create({
      organizationId: auth.organizationId,
      candidateId: oldCandidate._id,
      campaignId: oldCampaign._id,
      enrollmentId: oldEnrollment._id,
      channels: ['whatsapp'],
      status: 'closed',
      unreadCount: 0,
      qualificationStatus: 'pending',
      automationStatus: 'stopped',
      providerThreadIds: [{ provider: 'meta-whatsapp', threadId: '918512349999' }],
    });
    await ConversationMessageModel.create({
      organizationId: auth.organizationId,
      threadId: oldThread._id,
      provider: 'meta-whatsapp',
      channel: 'whatsapp',
      direction: 'outbound',
      sender: 'business',
      recipient: '918512349999',
      bodyText: 'Old campaign outreach',
      providerMessageId: 'wamid.OUT-OLD',
      providerThreadId: '918512349999',
      deliveryStatus: 'sent',
      messageType: 'message',
      aiGenerated: true,
      sentAt: new Date('2026-07-20T10:00:00.000Z'),
    });

    const newThread = await ConversationThreadModel.create({
      organizationId: auth.organizationId,
      candidateId: newCandidate._id,
      campaignId: newCampaign._id,
      enrollmentId: newEnrollment._id,
      channels: ['whatsapp'],
      status: 'open',
      unreadCount: 0,
      qualificationStatus: 'pending',
      automationStatus: 'active',
      providerThreadIds: [{ provider: 'meta-whatsapp', threadId: '918512349999' }],
    });
    await ConversationMessageModel.create({
      organizationId: auth.organizationId,
      threadId: newThread._id,
      provider: 'meta-whatsapp',
      channel: 'whatsapp',
      direction: 'outbound',
      sender: 'business',
      recipient: '918512349999',
      bodyText: 'New campaign outreach',
      providerMessageId: 'wamid.OUT-NEW',
      providerThreadId: '918512349999',
      deliveryStatus: 'sent',
      messageType: 'message',
      aiGenerated: true,
      sentAt: new Date('2026-07-27T09:00:00.000Z'),
    });

    // Plain reply (no context) — must land on the campaign that messaged last.
    const reply = await ingestInboundMessage({
      organizationId: auth.organizationId,
      provider: 'meta-whatsapp',
      channel: 'whatsapp',
      providerMessageId: 'meta-whatsapp:wamid.IN-1',
      providerThreadId: '918512349999',
      from: '918512349999',
      bodyText: 'Interested',
      skipClassify: true,
    });

    expect(reply.duplicate).toBe(false);
    expect(reply.threadId).toBe(String(newThread._id));

    const boundThread = await ConversationThreadModel.findById(reply.threadId);
    expect(String(boundThread!.campaignId)).toBe(String(newCampaign._id));
    expect(String(boundThread!.candidateId)).toBe(String(newCandidate._id));

    // Quote-reply to the OLD campaign's message (Meta context.id) must bind to
    // the old thread even though a newer campaign messaged more recently.
    const contextReply = await ingestInboundMessage({
      organizationId: auth.organizationId,
      provider: 'meta-whatsapp',
      channel: 'whatsapp',
      providerMessageId: 'meta-whatsapp:wamid.IN-2',
      providerThreadId: '918512349999',
      contextProviderMessageId: 'wamid.OUT-OLD',
      from: '918512349999',
      bodyText: 'Replying about the old role',
      skipClassify: true,
    });

    expect(contextReply.duplicate).toBe(false);
    expect(contextReply.threadId).toBe(String(oldThread._id));
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
