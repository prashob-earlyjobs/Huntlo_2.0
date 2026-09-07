import { describe, expect, it } from 'vitest';

import {
  compileCampaignSequence,
  rewriteWhatsAppPositionalTokens,
} from '../src/modules/huntlo-360/compiler.js';
import type { Huntlo360WorkflowDocument } from '../src/modules/huntlo-360/workflow.model.js';

function workflow(
  outreachConfig: Partial<Huntlo360WorkflowDocument['outreachConfig']>
): Huntlo360WorkflowDocument {
  return {
    outreachConfig: {
      emailEnabled: false,
      whatsappEnabled: false,
      aiVoiceEnabled: false,
      campaignType: 'multi_channel',
      channelOrder: 'email_first',
      openingMessage: 'Hi {{first_name}}',
      openingWhatsAppTemplateId: 'opening_message_01',
      followUps: [],
      stopOnReply: true,
      ...outreachConfig,
    },
  } as Huntlo360WorkflowDocument;
}

describe('Huntlo 360 sequence compiler', () => {
  it('rewrites Meta {{1}} / {{2}} into named Huntlo tokens', () => {
    expect(rewriteWhatsAppPositionalTokens('Hi {{1}}, role {{2}}.')).toBe(
      'Hi {{first_name}}, role {{job_title}}.'
    );
  });

  it('does not leave positional WhatsApp tokens on voice-first follow-ups', () => {
    const steps = compileCampaignSequence(
      workflow({
        emailEnabled: true,
        whatsappEnabled: true,
        aiVoiceEnabled: true,
        channelOrder: 'voice_first',
        followUps: [
          {
            body: 'Hi {{1}},\nYour profile was shortlisted for the {{2}} position.',
            delayDays: 2,
            delayUnit: 'days',
            templateId: 'opening_message_01',
          },
        ],
      })
    );

    expect(steps.some((step) => step.id === 'step-2')).toBe(true);
    for (const step of steps) {
      expect(String(step.body || '')).not.toMatch(/\{\{\s*\d+\s*\}\}/);
    }
  });
});
