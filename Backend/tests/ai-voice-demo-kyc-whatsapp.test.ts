import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/providers/meta-whatsapp/meta.config.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/providers/meta-whatsapp/meta.config.js')>();
  return {
    ...actual,
    isHuntloWhatsAppConfigured: () => true,
    getHuntloWhatsAppCredentials: () => ({
      phoneNumberId: 'pn-kyc',
      accessToken: 'token-kyc',
      wabaId: 'waba-kyc',
    }),
  };
});

vi.mock('../src/providers/meta-whatsapp/meta.send.js', () => ({
  sendMetaWhatsAppTemplate: vi.fn().mockResolvedValue({ messageId: 'wamid.kyc-1' }),
}));

import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import {
  AI_VOICE_DEMO_KYC_JOB,
  KYC_ISSUE_MAP,
  buildDemoAgentInput,
} from '../src/modules/ai-voice-demo/ai-voice-demo.jobs.js';
import { AiVoiceDemoCallModel } from '../src/modules/ai-voice-demo/ai-voice-demo.model.js';
import {
  kycDemoWhatsAppMergeContext,
  shouldSendKycWhatsApp,
  tryProcessAiVoiceDemoFromHunarRecord,
  tryProcessAiVoiceDemoWebhook,
} from '../src/modules/ai-voice-demo/ai-voice-demo.webhook.js';
import { sendMetaWhatsAppTemplate } from '../src/providers/meta-whatsapp/meta.send.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

describe('KYC incomplete demo WhatsApp', () => {
  it('greets, asks for one minute, then maps why they quit KYC', () => {
    const agent = buildDemoAgentInput(AI_VOICE_DEMO_KYC_JOB, 'Paymint');
    expect(agent.personaName).toBe('Maya');
    expect(agent.introduction).toBe(
      'Hi, I am Maya, calling from Paymint regarding an unfinished KYC. Do you have one minute to talk about this?'
    );
    expect(agent.introduction).toContain('Maya');
    expect(agent.introduction).toMatch(/one minute/i);
    expect(agent.introduction).not.toMatch(/pending payment|getting back into your account/i);
    expect(agent.agentPrompt).toMatch(/left KYC unfinished|left it unfinished|unfinished/i);
    expect(agent.agentPrompt).toContain('Do not ask why they left KYC unfinished unless they agreed');
    expect(agent.agentPrompt).toContain('STOP and WAIT');
    expect(agent.agentPrompt).toContain('Silence is not an answer');
    expect(agent.agentPrompt).toContain('Never hang up');
    expect(agent.agentPrompt).toContain('after we hang up');
    expect(agent.agentPrompt).toContain('Company name = "Paymint"');
    expect(agent.agentPrompt).not.toContain('{company}');
    expect(agent.introduction).not.toContain('{company}');
    expect(agent.objective).not.toContain('{company}');
    const asked = (agent.questions as { question: string }[]).map((row) => row.question).join(' ');
    expect(asked).toMatch(/completing KYC|KYC link on WhatsApp/i);
    expect(asked).toContain('Paymint');
    expect(asked).not.toContain('{company}');
    expect(asked).not.toMatch(/document upload|Aadhaar|OTP|expired|bank verification/i);
    expect(agent.agentPrompt).toContain('NEVER list issues');
    expect(agent.agentPrompt).toContain('you MAY skip Question 2');
    expect(agent.agentPrompt).not.toContain('If we said a WhatsApp link is coming');
    for (const row of KYC_ISSUE_MAP) {
      expect(agent.agentPrompt).toContain(row.issue);
      expect(agent.agentPrompt).toContain(row.answer);
    }
    expect(agent.agentPrompt).toContain('ticket for this issue');
    expect(agent.agentPrompt).toContain('team members will call');
    expect(agent.resultSchema).toMatchObject({
      type: 'object',
      properties: expect.objectContaining({ kyc_issue: { type: 'string' } }),
    });
  });

  it('sends WhatsApp only after a completed KYC call, not other jobs or rings', () => {
    expect(
      shouldSendKycWhatsApp({
        job: AI_VOICE_DEMO_KYC_JOB,
        mappedStatus: 'completed',
        kind: 'call-status',
      })
    ).toBe(true);
    expect(
      shouldSendKycWhatsApp({
        job: AI_VOICE_DEMO_KYC_JOB,
        mappedStatus: 'ringing',
        kind: 'call-status',
      })
    ).toBe(false);
    expect(
      shouldSendKycWhatsApp({
        job: 'Customer Care Executive',
        mappedStatus: 'completed',
        kind: 'call-status',
      })
    ).toBe(false);
    expect(
      shouldSendKycWhatsApp({
        job: AI_VOICE_DEMO_KYC_JOB,
        mappedStatus: '',
        kind: 'call-result',
      })
    ).toBe(true);
  });

  it('uses the email local-part as the template first name', () => {
    expect(kycDemoWhatsAppMergeContext({ company: 'Paymint', email: 'rahul.sharma@paymint.test' })).toEqual(
      expect.objectContaining({ first_name: 'rahul', job_title: 'Paymint completion' })
    );
  });
});

describe('KYC incomplete demo webhook send', () => {
  beforeAll(async () => {
    await startMemoryMongo();
    await connectDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
    await stopMemoryMongo();
  });

  beforeEach(async () => {
    delete process.env.META_WHATSAPP_FORCE_TEST_TEMPLATE;
    delete process.env.AI_VOICE_DEMO_KYC_WA_TEMPLATE;
    await AiVoiceDemoCallModel.deleteMany({});
    vi.mocked(sendMetaWhatsAppTemplate).mockClear();
    vi.mocked(sendMetaWhatsAppTemplate).mockResolvedValue({ messageId: 'wamid.kyc-1' });
  });

  it('sends the approved opening template once when the KYC call completes', async () => {
    const demo = await AiVoiceDemoCallModel.create({
      company: 'Paymint',
      companyKey: 'paymint',
      email: 'rahul@paymint.test',
      phone: '+919876543210',
      phoneDigits: '919876543210',
      job: AI_VOICE_DEMO_KYC_JOB,
      agentId: 'agent-kyc',
      requestId: 'req-kyc',
      status: 'dialed',
      dialedCount: 1,
    });

    const first = await tryProcessAiVoiceDemoWebhook({
      campaignId: String(demo._id),
      kind: 'call-status',
      body: { call_id: 'call-kyc-1', status: 'COMPLETED', to_number: '+919876543210' },
    });
    const second = await tryProcessAiVoiceDemoWebhook({
      campaignId: String(demo._id),
      kind: 'call-status',
      body: { call_id: 'call-kyc-1', status: 'COMPLETED', to_number: '+919876543210' },
    });

    expect(first?.handled).toBe(true);
    expect(first?.whatsappSent).toBe(true);
    expect(second?.whatsappSent).toBe(false);
    expect(sendMetaWhatsAppTemplate).toHaveBeenCalledTimes(1);
    expect(sendMetaWhatsAppTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '+919876543210',
        templateName: 'hello_world',
        languageCode: 'en_US',
        bodyParameters: [],
      })
    );

    const stored = await AiVoiceDemoCallModel.findById(demo._id).lean();
    expect(stored?.whatsappStatus).toBe('sent');
    expect(stored?.whatsappMessageId).toBe('wamid.kyc-1');
  });

  it('sends WhatsApp when the communication server stores a completed Hunar call', async () => {
    const demo = await AiVoiceDemoCallModel.create({
      company: 'Paymint',
      companyKey: 'paymint',
      email: 'rahul@paymint.test',
      phone: '+919876543210',
      phoneDigits: '919876543210',
      job: AI_VOICE_DEMO_KYC_JOB,
      agentId: 'agent-kyc',
      requestId: 'req-kyc',
      status: 'dialed',
      dialedCount: 1,
    });

    const ringing = await tryProcessAiVoiceDemoFromHunarRecord({
      campaignId: String(demo._id),
      callStatus: { status: 'RINGING', to_number: '+919876543210' },
    });
    const completed = await tryProcessAiVoiceDemoFromHunarRecord({
      campaignId: String(demo._id),
      callStatus: { status: 'COMPLETED', to_number: '+919876543210', answered_by: 'human' },
    });
    const again = await tryProcessAiVoiceDemoFromHunarRecord({
      campaignId: String(demo._id),
      callStatus: { status: 'COMPLETED', to_number: '+919876543210' },
      callResult: { result: { kyc_issue: 'OTP issue' } },
    });

    expect(ringing?.handled).toBe(true);
    expect(ringing?.whatsappSent).toBe(false);
    expect(completed?.whatsappSent).toBe(true);
    expect(again?.whatsappSent).toBe(false);
    expect(sendMetaWhatsAppTemplate).toHaveBeenCalledTimes(1);

    const stored = await AiVoiceDemoCallModel.findById(demo._id).lean();
    expect(stored?.callStatus).toBe('completed');
    expect(stored?.whatsappStatus).toBe('sent');
  });

  it('sends WhatsApp from a stored call result when status never arrived', async () => {
    const demo = await AiVoiceDemoCallModel.create({
      company: 'Paymint',
      companyKey: 'paymint',
      email: 'rahul@paymint.test',
      phone: '+919876543210',
      phoneDigits: '919876543210',
      job: AI_VOICE_DEMO_KYC_JOB,
      agentId: 'agent-kyc',
      requestId: 'req-kyc',
      status: 'dialed',
      dialedCount: 1,
    });

    const result = await tryProcessAiVoiceDemoFromHunarRecord({
      campaignId: String(demo._id),
      callResult: { result: { summary: 'Caller explained the KYC issue' } },
    });

    expect(result?.whatsappSent).toBe(true);
    expect(sendMetaWhatsAppTemplate).toHaveBeenCalledTimes(1);
  });

  it('does not send WhatsApp for a missed Hunar call', async () => {
    const demo = await AiVoiceDemoCallModel.create({
      company: 'Paymint',
      companyKey: 'paymint',
      email: 'rahul@paymint.test',
      phone: '+919876543210',
      phoneDigits: '919876543210',
      job: AI_VOICE_DEMO_KYC_JOB,
      agentId: 'agent-kyc',
      requestId: 'req-kyc',
      status: 'dialed',
      dialedCount: 1,
    });

    const result = await tryProcessAiVoiceDemoFromHunarRecord({
      campaignId: String(demo._id),
      callStatus: { status: 'NO_ANSWER', to_number: '+919876543210' },
    });

    expect(result?.handled).toBe(true);
    expect(result?.whatsappSent).toBe(false);
    expect(sendMetaWhatsAppTemplate).not.toHaveBeenCalled();
  });

  it('does not send WhatsApp for other demo jobs', async () => {
    const demo = await AiVoiceDemoCallModel.create({
      company: 'Innostax',
      companyKey: 'innostax',
      email: 'demo@innostax.test',
      phone: '+919876543210',
      phoneDigits: '919876543210',
      job: 'Customer Care Executive',
      agentId: 'agent-care',
      requestId: 'req-care',
      status: 'dialed',
      dialedCount: 1,
    });

    const result = await tryProcessAiVoiceDemoWebhook({
      campaignId: String(demo._id),
      kind: 'call-status',
      body: { call_id: 'call-care-1', status: 'COMPLETED', to_number: '+919876543210' },
    });

    expect(result?.handled).toBe(true);
    expect(result?.whatsappSent).toBe(false);
    expect(sendMetaWhatsAppTemplate).not.toHaveBeenCalled();
  });
});
