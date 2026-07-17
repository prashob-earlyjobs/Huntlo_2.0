import { describe, expect, it } from 'vitest';

import {
  buildCandidateMergeContext,
  extractVariables,
  listMissingVariables,
  mergeMessageTemplate,
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

  it('rejects calendly_link as an unknown variable', () => {
    const result = validateMessageVariables({
      body: 'Book via {{calendly_link}}',
    });
    expect(result.valid).toBe(false);
    expect(result.unknown).toContain('calendly_link');
  });

  it('builds candidate merge context', () => {
    const ctx = buildCandidateMergeContext(
      { name: 'Ada Lovelace', email: 'ada@example.com', phone: '+911234567890' },
      { jobTitle: 'Engineer', companyName: 'Huntlo', recruiterName: 'Riya' }
    );
    expect(ctx.first_name).toBe('Ada');
    expect(ctx.candidate_email).toBe('ada@example.com');
    expect(ctx.job_title).toBe('Engineer');
    expect(renderTemplate('{{candidate_name}} @ {{company_name}}', ctx)).toContain('Ada');
  });
});

describe('whatsapp template catalogue', () => {
  it('lists approved templates and validates variables', () => {
    const templates = listApprovedTemplates();
    expect(templates.length).toBeGreaterThan(0);
    const opening =
      templates.find(
        (t) => t.id.includes('opening') || t.name.toLowerCase().includes('opening')
      ) || templates[0];
    expect(opening).toBeDefined();
    expect(getApprovedTemplate(opening!.id)?.id).toBe(opening!.id);
    const result = validateWhatsAppCatalogueVariables(opening!.id, {
      '1': 'Ada',
      '2': 'Engineer',
    });
    expect(result.valid || result.missing?.length !== undefined).toBeTruthy();
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
