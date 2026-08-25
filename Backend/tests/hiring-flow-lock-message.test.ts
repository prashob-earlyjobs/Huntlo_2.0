import { describe, expect, it } from 'vitest';

import type { HiringFlowStep } from '../src/modules/outreach/hiring-flow.model.js';
import { ensureSingleLockedWhatsAppStep } from '../src/modules/outreach/hiring-flows.service.js';
import { resolveNextHiringFlowStep } from '../src/modules/outreach/hiring-flow-runtime.service.js';

function wa(id: string, templateId: string, nextStepId: string | null = null): HiringFlowStep {
  return {
    id,
    type: 'send_whatsapp_template',
    label: 'First WhatsApp message',
    whatsappTemplateId: templateId,
    nextStepId,
    branches: [],
  };
}

function question(id: string): HiringFlowStep {
  return {
    id,
    type: 'ask_question',
    label: 'Licence',
    prompt: 'Share the driver licence img',
    nextStepId: null,
    branches: [],
  };
}

describe('ensureSingleLockedWhatsAppStep', () => {
  it('drops a duplicate first WhatsApp template left by assign/sync id mismatch', () => {
    const locked = wa('step-platform-wa', 'delivery_partner', 'step-q1');
    const steps = [
      wa('step-platform-wa', 'delivery_partner', 'step-copy-wa'),
      wa('step-copy-wa', 'delivery_partner', 'step-q1'),
      question('step-q1'),
    ];

    const next = ensureSingleLockedWhatsAppStep(steps, locked);

    expect(next.map((step) => step.id)).toEqual(['step-platform-wa', 'step-q1']);
    expect(next[0]?.whatsappTemplateId).toBe('delivery_partner');
    expect(next[0]?.nextStepId).toBe('step-q1');
  });

  it('replaces the copy starter template with the platform locked step', () => {
    const locked = wa('step-platform-wa', 'delivery_partner', null);
    const steps = [wa('step-wa-first', 'resume_share', 'step-q1'), question('step-q1')];

    const next = ensureSingleLockedWhatsAppStep(steps, locked);

    expect(next.map((step) => step.id)).toEqual(['step-platform-wa', 'step-q1']);
    expect(next[0]?.whatsappTemplateId).toBe('delivery_partner');
    expect(next[0]?.nextStepId).toBe('step-q1');
  });
});

describe('resolveNextHiringFlowStep', () => {
  it('skips duplicate opening WhatsApp templates after Yes, continue', () => {
    const steps: HiringFlowStep[] = [
      wa('step-wa-first', 'delivery_partner', 'step-wa-first'),
      wa('step-wa-first', 'delivery_partner', 'step-q1'),
      wa('step-wa-first', 'delivery_partner', 'step-q1'),
      question('step-q1'),
    ];

    const next = resolveNextHiringFlowStep(steps, steps[0]!, 'Yes, continue');

    expect(next?.id).toBe('step-q1');
    expect(next?.type).toBe('ask_question');
  });

  it('walks sequential list when nextStepId is missing and templates are duplicated', () => {
    const steps: HiringFlowStep[] = [
      wa('step-wa-first', 'delivery_partner', null),
      wa('step-wa-first', 'delivery_partner', null),
      question('step-q1'),
    ];

    const next = resolveNextHiringFlowStep(steps, steps[0]!, 'Yes, continue');

    expect(next?.id).toBe('step-q1');
  });
});
