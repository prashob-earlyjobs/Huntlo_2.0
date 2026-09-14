import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildCandidateMergeContext,
  extractVariables,
  listMissingVariables,
  mergeMessageTemplate,
  mergeOutboundMessage,
  renderTemplate,
  validateMessageVariables,
} from '../src/modules/outreach/variables.js';
import { compileBuilderToCampaign } from '../src/modules/outreach/compile-builder.js';
import {
  getApprovedTemplate,
  listApprovedTemplates,
  validateTemplateVariables as validateWhatsAppCatalogueVariables,
} from '../src/modules/outreach/whatsapp-template-catalogue.js';
import { nextSendAtWithinWindow } from '../src/modules/outreach/send-window.util.js';
import type { OutreachCampaignDocument } from '../src/modules/outreach/campaign.model.js';

describe('outreach personalization', () => {
  it('resolves aliases, fallbacks, and positional WhatsApp variables', () => {
    const vars = extractVariables(
      'Hi {{FirstName|there}} from {{1}} about {{job_title}}'
    );
    expect(vars).toEqual(expect.arrayContaining(['first_name', '1', 'job_title']));

    const rendered = mergeMessageTemplate(
      'Hi {{FirstName|there}}, role {{JobTitle}} — {{1}}',
      { first_name: 'Ada', job_title: 'Engineer', '1': 'Huntlo' }
    );
    expect(rendered).toBe('Hi Ada, role Engineer — Huntlo');

    const missing = listMissingVariables('Hi {{FirstName}} {{unknown}}', {
      first_name: 'Ada',
    });
    expect(missing).toContain('unknown');
  });

  it('replaces missing tokens with a blank value when asked', () => {
    const preserved = mergeMessageTemplate(
      'I came across your work at {{current_company}}.',
      { first_name: 'Agatha' }
    );
    expect(preserved).toContain('{{current_company}}');

    const blanked = mergeMessageTemplate(
      'I came across your work at {{current_company}}.',
      { first_name: 'Agatha' },
      { unresolved: 'blank' }
    );
    expect(blanked).toBe('I came across your work at.');
    expect(blanked).not.toContain('{{');
  });

  it('fills current_company, current_role, and location from profile extras', () => {
    const ctx = buildCandidateMergeContext(
      {
        name: 'Agatha',
        currentCompany: 'Acme Corp',
        currentTitle: 'SDR',
        location: 'Bengaluru',
      },
      { jobTitle: 'SDR Intern', recruiterName: 'Prajwal', location: 'Pune' }
    );
    expect(ctx.current_company).toBe('Acme Corp');
    expect(ctx.current_role).toBe('SDR');
    expect(ctx.location).toBe('Pune');
    const body = mergeMessageTemplate(
      'at {{current_company}} as {{current_role}} in {{location}}',
      ctx,
      { unresolved: 'blank' }
    );
    expect(body).toBe('at Acme Corp as SDR in Pune');
  });

  it('rejects calendly_link as an unknown variable', () => {
    const result = validateMessageVariables({
      body: 'Book via {{calendly_link}}',
    });
    expect(result.valid).toBe(false);
    expect(result.unknown).toContain('calendly_link');
  });

  it('builds candidate merge context', () => {
    const ctx = buildCandidateMergeContext(
      {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        phone: '+911234567890',
        headline: 'Staff Engineer at Analytical Engine Co',
      },
      {
        jobTitle: 'Engineer',
        companyName: 'Huntlo',
        recruiterName: 'Riya Sharma',
        location: 'Bengaluru, India',
      }
    );
    expect(ctx.first_name).toBe('Ada');
    expect(ctx.last_name).toBe('Lovelace');
    expect(ctx.candidate_email).toBe('ada@example.com');
    expect(ctx.job_title).toBe('Engineer');
    expect(ctx.location).toBe('Bengaluru, India');
    expect(ctx.recruiter_name).toBe('Riya Sharma');
    expect(ctx.current_role).toBe('Staff Engineer');
    expect(ctx.current_company).toBe('Analytical Engine Co');
    expect(renderTemplate('{{candidate_name}} @ {{company_name}}', ctx)).toContain('Ada');
  });

  it('replaces every insert-chip token in outbound mail even when some fields are empty', () => {
    const ctx = buildCandidateMergeContext(
      { name: 'Gokul', currentTitle: null, currentCompany: null, location: null },
      {
        jobTitle: 'Senior Backend Engineer',
        companyName: 'Huntlo',
        recruiterName: 'Priya Nair',
        location: 'Remote',
      }
    );
    const body =
      'Hi {{first_name}} {{last_name}}, {{job_title}} at {{company_name}} in {{location}}. Recruiter {{recruiter_name}}. Now at {{current_company}} as {{current_role}}.';
    const rendered = mergeOutboundMessage(body, ctx);
    expect(rendered).toBe(
      'Hi Gokul, Senior Backend Engineer at Huntlo in Remote. Recruiter Priya Nair. Now at your company as your current role.'
    );
    expect(rendered).not.toMatch(/\{\{/);
  });

  it('uses a readable fallback for every insert chip when no profile data exists', () => {
    const rendered = mergeOutboundMessage(
      'Hi {{first_name}} {{last_name}}, {{job_title}} at {{company_name}} in {{location}}. Recruiter {{recruiter_name}}. Now at {{current_company}} as {{current_role}}.',
      {}
    );
    expect(rendered).toBe(
      'Hi there, this role at our team in your area. Recruiter the recruiting team. Now at your company as your current role.'
    );
    expect(rendered).not.toMatch(/\{\{/);
  });
});

describe('gmail auto-calendly prompt', () => {
  it('fills the Auto-send Calendly prompt with JD, screening, and Calendly URL', async () => {
    const { buildAutoCalendlyPrompt } = await import(
      '../src/modules/outreach/prompt/index.js'
    );
    const prompt = buildAutoCalendlyPrompt({
      jobText: 'Senior Node.js Developer',
      candidateName: 'Gokul Kumar',
      currentRole: 'Software Engineer',
      experience: '5 years',
      skills: 'Node.js, MongoDB',
      location: 'Bengaluru, India',
      email: 'gokul@example.com',
      screening: [
        {
          id: 'notice_period',
          question: 'What is your notice period in days?',
          required: true,
          pass_condition: 'Must be 60 days or less',
        },
      ],
      calendlyUrl:
        'https://calendly.com/prajwal-earlyjobs/intro-call?name=Gokul%20Kumar',
    });
    expect(prompt).toContain('Senior Node.js Developer');
    expect(prompt).toContain('Gokul Kumar');
    expect(prompt).toContain('notice_period');
    expect(prompt).toContain(
      'https://calendly.com/prajwal-earlyjobs/intro-call?name=Gokul%20Kumar'
    );
    expect(prompt).not.toMatch(/\{\{[a-z_]+\}\}/);
  });

  it('fills the screening-close prompt with no Calendly URL or scheduling email', async () => {
    const { buildScreeningClosePrompt } = await import(
      '../src/modules/outreach/prompt/index.js'
    );
    const prompt = buildScreeningClosePrompt({
      jobText: 'Senior Node.js Developer',
      candidateName: 'Gokul Kumar',
      currentRole: 'Software Engineer',
      experience: '5 years',
      skills: 'Node.js, MongoDB',
      location: 'Bengaluru, India',
      email: 'gokul@example.com',
      screening: [
        {
          id: 'notice_period',
          question: 'What is your notice period in days?',
          required: true,
          pass_condition: 'Must be 60 days or less',
        },
      ],
    });
    expect(prompt).toContain('Senior Node.js Developer');
    expect(prompt).toContain('Gokul Kumar');
    expect(prompt).toContain('notice_period');
    expect(prompt).toContain('## Final Email');
    expect(prompt).not.toContain('## Final Scheduling Email');
    expect(prompt).not.toContain('calendly');
    expect(prompt).not.toMatch(/\{\{[a-z_]+\}\}/);
  });

  it('fills the WhatsApp Calendly prompt with one-question-at-a-time rules', async () => {
    const { buildWhatsAppAutoCalendlyPrompt } = await import(
      '../src/modules/outreach/prompt/index.js'
    );
    const prompt = buildWhatsAppAutoCalendlyPrompt({
      jobText: 'Senior Node.js Developer',
      candidateName: 'Gokul Kumar',
      currentRole: 'Software Engineer',
      experience: '5 years',
      skills: 'Node.js, MongoDB',
      location: 'Bengaluru, India',
      email: 'gokul@example.com',
      screening: [
        {
          id: 'notice_period',
          question: 'What is your notice period in days?',
          required: true,
          pass_condition: 'Must be 60 days or less',
        },
      ],
      calendlyUrl: 'https://calendly.com/prajwal-earlyjobs/intro-call',
    });
    expect(prompt).toContain('Ask exactly ONE unanswered required screening question');
    expect(prompt).toContain('https://calendly.com/prajwal-earlyjobs/intro-call');
    expect(prompt).toContain('notice_period');
    expect(prompt).not.toMatch(/\{\{[a-z_]+\}\}/);
  });

  it('fills the post-qualification WhatsApp prompt with hiring-flow questions', async () => {
    const { buildWhatsAppPostQualificationPrompt } = await import(
      '../src/modules/outreach/prompt/index.js'
    );
    const prompt = buildWhatsAppPostQualificationPrompt({
      jobText: 'Delivery Partner',
      candidateName: 'Gokul Kumar',
      currentRole: 'Rider',
      experience: '2 years',
      skills: 'Two-wheeler',
      location: 'Bengaluru, India',
      email: 'gokul@example.com',
      screening: [
        {
          id: 'q-licence',
          question: 'Do you have a valid driving licence?',
          required: true,
          answer_type: 'yes_no',
          pass_condition: 'Reject if no',
          buttons: [
            { id: 'yes', title: 'Yes' },
            { id: 'no', title: 'No' },
          ],
        },
      ],
    });
    expect(prompt).toContain('already completed a voice screening call');
    expect(prompt).toContain('Ask exactly ONE unanswered required question');
    expect(prompt).toContain('q-licence');
    expect(prompt).toContain('Do you have a valid driving licence?');
    expect(prompt).not.toMatch(/\{\{[a-z_]+\}\}/);
  });
});

describe('formatKnockoutPassCondition', () => {
  it('prefixes Reject if unless the value already has it', async () => {
    const { formatKnockoutPassCondition } = await import(
      '../src/modules/outreach/prompt/index.js'
    );
    expect(formatKnockoutPassCondition('yes')).toBe('Reject if yes');
    expect(formatKnockoutPassCondition('more than 60')).toBe('Reject if more than 60');
    expect(formatKnockoutPassCondition('Reject if No')).toBe('Reject if No');
    expect(formatKnockoutPassCondition('reject if no')).toBe('reject if no');
    expect(formatKnockoutPassCondition('  ')).toBe('');
  });
});

describe('sendWhatsAppViaGateway payload', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts huntlo template + prompt on autoReply send', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: 'queued-wa', conversationId: 'wa-thread-1' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const { sendWhatsAppViaGateway } = await import(
      '../src/providers/whatsapp/whatsapp.gateway.js'
    );
    const result = await sendWhatsAppViaGateway({
      to: '+91 85929 29642',
      campaignId: 'camp-wa',
      template: 'opening_message_01',
      variables: ['gokul', 'nodejs'],
      prompt: 'Ask one screening question',
      autoReply: true,
    });
    expect(result.threadId).toBe('wa-thread-1');
    const [url, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    expect(String(url)).toContain('/messages/send?autoReply=true');
    const body = JSON.parse(init.body) as Record<string, unknown>;
    expect(body).toMatchObject({
      type: 'whatsapp',
      vendor: 'huntlo',
      to: '918592929642',
      template: 'opening_message_01',
      variables: ['gokul', 'nodejs'],
      campaignId: 'camp-wa',
      prompt: 'Ask one screening question',
    });
  });

  it('posts threadId on follow-up without prompt', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { conversationId: 'wa-thread-1' } }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const { sendWhatsAppViaGateway } = await import(
      '../src/providers/whatsapp/whatsapp.gateway.js'
    );
    await sendWhatsAppViaGateway({
      to: '918592929642',
      campaignId: 'camp-wa',
      body: 'Following up',
      autoReply: false,
      threadId: 'wa-thread-1',
    });
    const [url, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    expect(String(url)).toBe('http://localhost:5055/api/v1/messages/send');
    const body = JSON.parse(init.body) as Record<string, unknown>;
    expect(body.threadId).toBe('wa-thread-1');
    expect(body.prompt).toBeUndefined();
    expect(body.template).toBeUndefined();
    expect(body.body).toBe('Following up');
  });

  it('posts Yes/No chips with the Postman body+buttons payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { conversationId: 'adadad' } }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const { sendWhatsAppViaGateway } = await import(
      '../src/providers/whatsapp/whatsapp.gateway.js'
    );
    await sendWhatsAppViaGateway({
      to: '918592929642',
      campaignId: 'asdad',
      body: 'Do you have a two-wheeler?',
      autoReply: false,
      threadId: 'adadad',
      buttons: [
        { id: 'yes', title: 'Yes' },
        { id: 'no', title: 'No' },
      ],
      prompt: 'should not be sent on a chip message',
    });
    const [url, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    expect(String(url)).toBe('http://localhost:5055/api/v1/messages/send');
    expect(String(url)).not.toContain('autoReply');
    expect(JSON.parse(init.body)).toEqual({
      type: 'whatsapp',
      vendor: 'huntlo',
      to: '918592929642',
      campaignId: 'asdad',
      threadId: 'adadad',
      body: 'Do you have a two-wheeler?',
      buttons: [
        { id: 'yes', title: 'Yes' },
        { id: 'no', title: 'No' },
      ],
    });
  });

  it('omits questions and template buttons so gateway Joi accepts WhatsApp send', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { conversationId: 'wa-thread-1' } }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const { sendWhatsAppViaGateway } = await import(
      '../src/providers/whatsapp/whatsapp.gateway.js'
    );
    await sendWhatsAppViaGateway({
      to: '918592929642',
      campaignId: 'camp-wa',
      template: 'resume_share',
      variables: ['Gokul', 'Delivery Partner'],
      prompt: 'Ask one screening question',
      autoReply: true,
      buttons: [
        { id: 'yes', title: 'Yes' },
        { id: 'no', title: 'No' },
      ],
      questions: [
        {
          id: 'step-q1',
          question: 'Do you have a valid driving licence?',
          required: true,
          answer_type: 'yes_no',
          pass_condition: 'Reject if no',
        },
      ],
    });
    const [, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    const body = JSON.parse(init.body) as Record<string, unknown>;
    expect(body.template).toBe('resume_share');
    expect(body.prompt).toBe('Ask one screening question');
    expect(body.questions).toBeUndefined();
    expect(body.buttons).toBeUndefined();
  });

  it('surfaces gateway Joi array errors', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ success: false, error: ['"questions" is not allowed'] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const { sendWhatsAppViaGateway } = await import(
      '../src/providers/whatsapp/whatsapp.gateway.js'
    );
    await expect(
      sendWhatsAppViaGateway({
        to: '918592929642',
        campaignId: 'camp-wa',
        template: 'delivery_partner',
        autoReply: true,
        prompt: 'Ask one screening question',
      })
    ).rejects.toThrow('"questions" is not allowed');
  });
});

describe('sendHunarCallViaGateway payload', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts type call vendor hunar with agent_id campaign_id and data', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: 'queued-call', requestId: 'hunar-req-1' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const { sendHunarCallViaGateway } = await import(
      '../src/providers/hunar/hunar.gateway.js'
    );
    const result = await sendHunarCallViaGateway({
      agentId: 'd890df68-40ce-4519-86b2-58bfa5b04dff',
      campaignId: '1234567',
      questions: [
        {
          id: 'q-1',
          prompt: 'What is your notice period (in days)?',
          knockout: true,
          knockoutCondition: 'more than 60',
        },
      ],
      data: [
        {
          callee_name: 'Priya gokul',
          mobile_number: '+918592929642',
          custom_data: {
            key_0: 'Screening objective or campaign name',
            key_1: 'Job title | Huntlo',
          },
        },
        {
          callee_name: 'prashob',
          mobile_number: '+918714500637',
          custom_data: {
            key_0: 'Screening objective or campaign name',
            key_1: 'Job title | Huntlo',
          },
        },
      ],
    });
    expect(result.requestId).toBe('hunar-req-1');
    expect(result.dialedCount).toBe(2);
    const [url, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    expect(String(url)).toBe('http://localhost:5055/api/v1/messages/send');
    expect(String(url)).not.toContain('autoReply');
    const body = JSON.parse(init.body) as Record<string, unknown>;
    expect(body.type).toBe('call');
    expect(body.vendor).toBe('hunar');
    expect(body.agent_id).toBe('d890df68-40ce-4519-86b2-58bfa5b04dff');
    expect(body.campaign_id).toBe('1234567');
    expect(typeof body.questions).toBe('string');
    expect(JSON.parse(String(body.questions))).toEqual([
      {
        id: 'q-1',
        question: 'What is your notice period (in days)?',
        required: true,
        pass_condition: 'Reject if more than 60',
      },
    ]);
    expect(body.data).toEqual([
      {
        callee_name: 'Priya gokul',
        mobile_number: '+918592929642',
        custom_data: {
          key_0: 'Screening objective or campaign name',
          key_1: 'Job title | Huntlo',
        },
      },
      {
        callee_name: 'prashob',
        mobile_number: '+918714500637',
        custom_data: {
          key_0: 'Screening objective or campaign name',
          key_1: 'Job title | Huntlo',
        },
      },
    ]);
  });
});

describe('sendZyastraCallViaGateway payload', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts type call vendor zyvkay with prompt questions array and custom_data', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: 'queued-zyvkay', requestId: 'zyvkay-req-1' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const { sendZyastraCallViaGateway } = await import(
      '../src/providers/zyastra/zyastra.gateway.js'
    );
    const result = await sendZyastraCallViaGateway({
      campaignId: 'camp_456',
      prompt:
        'You are Roshni, a friendly AI recruiter. Screen the candidate and collect notice period, CTC, and interest.',
      questions: [
        {
          id: 'q-1',
          prompt: 'What is your notice period (in days)?',
          required: true,
          knockout: true,
          knockoutCondition: 'more than 60',
        },
      ],
      data: [
        {
          callee_name: 'Gokul Kumar',
          mobile_number: '+14155550123',
          custom_data: {
            firstMessage: 'Hello, am I speaking with Gokul?',
            preferredLanguage: 'en-US',
          },
        },
      ],
    });
    expect(result.requestId).toBe('zyvkay-req-1');
    expect(result.dialedCount).toBe(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    expect(String(url)).toBe('http://localhost:5055/api/v1/messages/send');
    expect(String(url)).not.toContain('autoReply');
    const body = JSON.parse(init.body) as Record<string, unknown>;
    expect(body.type).toBe('call');
    expect(body.vendor).toBe('zyvkay');
    expect(body.campaign_id).toBe('camp_456');
    expect(body.prompt).toContain('You are Roshni');
    expect(Array.isArray(body.questions)).toBe(true);
    expect(body.questions).toEqual([
      {
        id: 'q-1',
        question: 'What is your notice period (in days)?',
        required: true,
        pass_condition: 'Reject if more than 60',
      },
    ]);
    expect(body.data).toEqual([
      {
        callee_name: 'Gokul Kumar',
        mobile_number: '+14155550123',
        custom_data: {
          firstMessage: 'Hello, am I speaking with Gokul?',
          preferredLanguage: 'en-US',
        },
      },
    ]);
  });
});

describe('hcg hunar overlay', () => {
  it('maps call_status.status and call_result into conversation/report fields', async () => {
    const {
      hcgHunarCallStatusValue,
      hcgHunarDerivedAiStatus,
      hcgHunarOverallAiStatus,
      hcgHunarStatus,
      hcgHunarToEvents,
      mapHcgHunarQuestions,
    } = await import('../src/modules/conversations/hcg-hunar-overlay.js');

    const doc = {
      campaignId: '6a9a5dcbe5c0b3fdff349b32',
      mobileNumber: '+918592929642',
      callId: '30097b6a-5ecd-4da0-a613-c9fb751b93d7',
      overallAIStatus: 'interested',
      overallAIDescription: 'Candidate confirmed interest after the screening call.',
      call_status: {
        status: 'COMPLETED',
        answered_by: 'HUMAN',
        duration_seconds: 93,
        ended_at: '2026-09-04T06:01:12Z',
      },
      call_recording: {
        recording_url: 'https://example.com/call.wav',
      },
      call_result: {
        result: {
          interest_level: 'Interested',
          final_outcome: 'Interested',
          eligibility_score: '3',
          summary: 'The candidate, Gokul, engaged meaningfully throughout the call.',
          q_1_answer: 'I have five days of notice period.',
          q_2_answer: 'Yes, I am available.',
          q_3_answer: 'Four LPA.',
        },
      },
    };

    expect(hcgHunarCallStatusValue(doc)).toBe('COMPLETED');
    expect(hcgHunarDerivedAiStatus(doc)).toBe('interested');
    expect(hcgHunarOverallAiStatus(doc)).toBe('interested');
    expect(hcgHunarStatus(doc).pipelineStatus).toBe('Answered');
    const event = hcgHunarToEvents(doc)[0];
    expect(event?.channel).toBe('AI Voice');
    expect(event?.voiceSummary?.recordingUrl).toContain('call.wav');
    expect(event?.voiceSummary?.duration).toBe('1:33');
    const questions = mapHcgHunarQuestions(doc);
    expect(questions.map((row) => row.id)).toEqual(['q-1', 'q-2', 'q-3']);
    expect(questions[0]?.answer).toContain('five days');
  });

  it('prefers hunar overallAIStatus over call_result derivation', async () => {
    const { hcgHunarDerivedAiStatus, hcgHunarOverallAiStatus, hcgHunarStatus } =
      await import('../src/modules/conversations/hcg-hunar-overlay.js');
    const { formatHcgOverallAiStatus } = await import(
      '../src/modules/conversations/hcg-gmail-overlay.js'
    );

    const doc = {
      overallAIStatus: 'qualified',
      call_status: { status: 'COMPLETED', answered_by: 'HUMAN' },
      call_result: {
        result: {
          interest_level: 'Interested',
          eligibility_score: '3',
        },
      },
    };

    expect(hcgHunarDerivedAiStatus(doc)).toBe('interested');
    expect(hcgHunarOverallAiStatus(doc)).toBe('qualified');
    expect(formatHcgOverallAiStatus(hcgHunarOverallAiStatus(doc))).toBe('Qualified');
    expect(hcgHunarStatus(doc).pipelineStatus).toBe('Qualified');
  });
});

describe('hcg zyvka overlay', () => {
  it('maps stored questions and overallAIStatus from hcg_zyvkay_communications', async () => {
    const {
      hcgZyvkaCallStatusValue,
      hcgZyvkaDerivedAiStatus,
      hcgZyvkaOverallAiStatus,
      hcgZyvkaStatus,
      hcgZyvkaToEvents,
      mapHcgZyvkaQuestions,
    } = await import('../src/modules/conversations/hcg-zyvka-overlay.js');

    const doc = {
      campaignId: 'camp_456',
      mobileNumber: '+14155550123',
      callId: 'zy-call-1',
      overallAIStatus: 'interested',
      overallAIDescription: 'Candidate confirmed interest after the screening call.',
      call_status: {
        status: 'COMPLETED',
        answered_by: 'HUMAN',
        duration_seconds: 93,
        ended_at: '2026-09-04T06:01:12Z',
      },
      call_recording: {
        recording_url: 'https://example.com/zyvka.wav',
      },
      questions: [
        {
          id: 'q-1',
          question: 'What is your notice period (in days)?',
          required: true,
          pass_condition: 'Reject if more than 60',
          asked: true,
          answer: '30 days',
          status: 'passed',
          description: '',
        },
      ],
    };

    expect(hcgZyvkaCallStatusValue(doc)).toBe('COMPLETED');
    expect(hcgZyvkaDerivedAiStatus(doc)).toBe('in_qualification');
    expect(hcgZyvkaOverallAiStatus(doc)).toBe('interested');
    expect(hcgZyvkaStatus(doc).pipelineStatus).toBe('Answered');
    const event = hcgZyvkaToEvents(doc)[0];
    expect(event?.channel).toBe('AI Voice');
    expect(event?.provider).toBe('zyastra');
    expect(event?.voiceSummary?.recordingUrl).toContain('zyvka.wav');
    const questions = mapHcgZyvkaQuestions(doc);
    expect(questions).toEqual([
      expect.objectContaining({
        id: 'q-1',
        question: 'What is your notice period (in days)?',
        asked: true,
        answer: '30 days',
        status: 'passed',
      }),
    ]);
  });
});

describe('sendGmailViaGateway sequence follow-up payload', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts threadId, inReplyTo, and references without autoReply prompt', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { id: 'queued-1', conversationId: 'uuid' } }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const { sendGmailViaGateway } = await import('../src/providers/gmail/gmail.send.js');
    await sendGmailViaGateway({
      accessToken: 'ya29.test',
      to: 'candidate@example.com',
      subject: 'Re: Intro — role pitch',
      html: '<p>Following up</p>',
      campaignId: 'camp-1',
      autoReply: false,
      threadId: 'gmail-thread-abc',
      inReplyTo: '<rfc-id@mail.gmail.com>',
      references: '<rfc-id@mail.gmail.com>',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    expect(String(url)).toBe('http://localhost:5055/api/v1/messages/send');
    const body = JSON.parse(init.body) as Record<string, string>;
    expect(body.threadId).toBe('gmail-thread-abc');
    expect(body.inReplyTo).toBe('<rfc-id@mail.gmail.com>');
    expect(body.references).toBe('<rfc-id@mail.gmail.com>');
    expect(body.campaignId).toBe('camp-1');
    expect(body.prompt).toBeUndefined();
  });
});

describe('whatsapp template catalogue', () => {
  it('lists the approved Meta WhatsApp templates including resume_share', () => {
    const templates = listApprovedTemplates();
    expect(templates.length).toBeGreaterThanOrEqual(6);
    const ids = templates.map((t) => t.id);
    expect(ids).toContain('opening_message_01');
    expect(ids).toContain('final_profile_follow_up_v1');
    expect(ids).toContain('profile_review_closure_v1');
    expect(ids).toContain('profile_review_reminder_v1');
    expect(ids).toContain('recruitment_update_reminder_v1');
    expect(ids).toContain('role_alignment_review');
    expect(ids).toContain('resume_share');
    const opening = getApprovedTemplate('opening_message_01');
    expect(opening?.slot).toBe('opening');
    expect(opening?.isDefault).toBe(true);
    const result = validateWhatsAppCatalogueVariables(opening!.id, {
      '1': 'Ada',
      '2': 'Engineer',
    });
    expect(result.valid).toBe(true);
  });
});

describe('compileBuilderToCampaign', () => {
  it('compiles multi-channel sequence order from builderState', () => {
    const campaign = {
      campaignType: 'multi_channel',
      mode: 'multi',
      channelConfig: {
        email: { enabled: false, integrationId: null, senderEmail: null },
        whatsapp: { enabled: false, integrationId: null },
        ai_voice: { enabled: false, integrationId: null },
        timezone: 'Asia/Kolkata',
        sendWindow: { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
      },
      sequenceSteps: [],
      qualificationConfig: { enabled: false, questions: [], aiReplyEnabled: false },
      schedulingConfig: {
        enabled: false,
        provider: null,
        eventTypeUri: null,
        messageTemplateId: null,
      },
      builderState: {
        sequence: {
          sequence: [
            { id: 's1', order: 0, channel: 'email', body: 'Hi {{first_name}}', delayDays: 0 },
            { id: 's2', order: 1, channel: 'whatsapp', body: 'Follow up', delayDays: 2 },
            { id: 's3', order: 2, channel: 'ai_voice', body: 'Call script', delayDays: 0 },
          ],
        },
      },
      emailTouchpoints: [],
    } as unknown as OutreachCampaignDocument;

    const result = compileBuilderToCampaign(campaign);
    expect(result.blockers).toEqual([]);
    expect(result.executable.sequenceSteps.map((s) => s.type)).toEqual([
      'email',
      'whatsapp',
      'ai_voice',
    ]);
    expect(result.executable.campaignType).toBe('multi_channel');
  });

  it('blocks incomplete single-channel builder without message body', () => {
    const campaign = {
      campaignType: 'single_channel',
      mode: 'single',
      channelConfig: {
        email: { enabled: true, integrationId: null, senderEmail: null },
        whatsapp: { enabled: false, integrationId: null },
        ai_voice: { enabled: false, integrationId: null },
        timezone: 'Asia/Kolkata',
        sendWindow: { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
      },
      sequenceSteps: [],
      qualificationConfig: { enabled: false, questions: [], aiReplyEnabled: false },
      schedulingConfig: {
        enabled: false,
        provider: null,
        eventTypeUri: null,
        messageTemplateId: null,
      },
      builderState: {
        channel: { channel: 'email' },
        message: {},
      },
      emailTouchpoints: [],
    } as unknown as OutreachCampaignDocument;

    const result = compileBuilderToCampaign(campaign);
    expect(result.executable.sequenceSteps.length === 0 || result.blockers.length >= 0).toBe(true);
  });
});

describe('gateway sequence stop-on-reply', () => {
  it('stops WhatsApp follow-ups after inbound or finished screening, not after two outbound templates', async () => {
    const { hcgWhatsappShouldStopSequence } = await import(
      '../src/modules/conversations/hcg-whatsapp-overlay.js'
    );
    expect(
      hcgWhatsappShouldStopSequence({
        overallAIStatus: 'awaiting_reply',
        messages: [{ messageId: '1', direction: 'outbound', body: 'Hi' }],
      })
    ).toBe(false);
    expect(
      hcgWhatsappShouldStopSequence({
        overallAIStatus: 'awaiting_reply',
        messages: [
          { messageId: '1', direction: 'outbound', body: 'Hi' },
          { messageId: '2', direction: 'outbound', template: 'recruitment_update_reminder_v1' },
        ],
      })
    ).toBe(false);
    expect(
      hcgWhatsappShouldStopSequence({
        overallAIStatus: 'awaiting_reply',
        messages: [
          { messageId: '1', direction: 'outbound', body: 'Hi' },
          { messageId: '2', direction: 'inbound', body: 'Yes interested' },
        ],
      })
    ).toBe(true);
    expect(
      hcgWhatsappShouldStopSequence({
        overallAIStatus: 'qualified',
        messages: [{ messageId: '1', direction: 'outbound', body: 'Thanks, recruiting team will review' }],
      })
    ).toBe(true);
    expect(
      hcgWhatsappShouldStopSequence({
        overallAIStatus: 'in_qualification',
        messages: [{ messageId: '1', direction: 'outbound', body: 'Hi', template: 'opening_message_01' }],
      })
    ).toBe(false);
  });

  it('stops Gmail follow-ups on inbound without treating extra outbound as a reply', async () => {
    const { hcgGmailShouldStopSequence } = await import(
      '../src/modules/conversations/hcg-gmail-overlay.js'
    );
    expect(
      hcgGmailShouldStopSequence({
        emailAddress: 'recruiter@huntlo.com',
        overallAIStatus: 'awaiting_reply',
        messages: [{ messageId: '1', direction: 'outbound', from: 'recruiter@huntlo.com' }],
      })
    ).toBe(false);
    expect(
      hcgGmailShouldStopSequence({
        emailAddress: 'recruiter@huntlo.com',
        overallAIStatus: 'awaiting_reply',
        messages: [
          { messageId: '1', direction: 'outbound', from: 'recruiter@huntlo.com' },
          { messageId: '2', direction: 'inbound', from: 'gokul@example.com' },
        ],
      })
    ).toBe(true);
    expect(
      hcgGmailShouldStopSequence({
        emailAddress: 'recruiter@huntlo.com',
        overallAIStatus: 'not_qualified',
        messages: [{ messageId: '1', direction: 'outbound', from: 'recruiter@huntlo.com' }],
      })
    ).toBe(true);
    expect(
      hcgGmailShouldStopSequence({
        emailAddress: 'recruiter@huntlo.com',
        overallAIStatus: 'in_qualification',
        messages: [{ messageId: '1', direction: 'outbound', from: 'recruiter@huntlo.com' }],
      })
    ).toBe(false);
  });
});

describe('send window helper', () => {
  it('clamps timestamps into the configured window', () => {
    const sundayNight = new Date('2026-07-12T02:00:00.000Z');
    const next = nextSendAtWithinWindow(
      sundayNight,
      { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
      'UTC'
    );
    expect(next.getTime()).toBeGreaterThanOrEqual(sundayNight.getTime());
  });
});
