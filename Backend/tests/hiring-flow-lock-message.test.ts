import { describe, expect, it } from 'vitest';

import type { HiringFlowStep } from '../src/modules/outreach/hiring-flow.model.js';
import { ensureSingleLockedWhatsAppStep } from '../src/modules/outreach/hiring-flows.service.js';
import {
  isClosedOutreachEnrollmentStatus,
  isHiringFlowReplyAdvanceable,
  isYesNoAnswerType,
  resolveHiringFlowQuestionBody,
  resolveNextHiringFlowStep,
} from '../src/modules/outreach/hiring-flow-runtime.service.js';
import { buildMetaInteractiveButtonsPayload } from '../src/providers/meta-whatsapp/meta.send.js';

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

  it('drops a long stack of duplicate opening WhatsApp templates', () => {
    const steps = [
      wa('step-wa-first', 'delivery_partner', 'step-wa-first'),
      wa('step-wa-first', 'delivery_partner', 'step-wa-first'),
      wa('step-wa-first', 'delivery_partner', 'step-q1'),
      wa('step-wa-first', 'delivery_partner', 'step-q1'),
      wa('step-wa-first', 'delivery_partner', 'step-q1'),
      wa('step-wa-first', 'delivery_partner', 'step-q1'),
      wa('step-wa-first', 'delivery_partner', 'step-q1'),
      wa('step-wa-first', 'delivery_partner', 'step-q1'),
      question('step-q1'),
    ];

    const next = ensureSingleLockedWhatsAppStep(steps, steps[0]!);

    expect(next.map((step) => step.id)).toEqual(['step-wa-first', 'step-q1']);
    expect(next[0]?.type).toBe('send_whatsapp_template');
    expect(next[1]?.type).toBe('ask_question');
  });

  it('drops mongoose-style duplicates whose fields do not spread', () => {
    const hidden = (step: HiringFlowStep) => {
      const wrapper: HiringFlowStep & { toObject: () => HiringFlowStep } = {
        toObject: () => ({ ...step }),
      } as HiringFlowStep & { toObject: () => HiringFlowStep };
      return wrapper;
    };
    const steps = [
      hidden(wa('step-wa-first', 'delivery_partner', null)),
      hidden(wa('step-wa-first', 'delivery_partner', null)),
    ];

    const next = ensureSingleLockedWhatsAppStep(steps, steps[0]!);

    expect(next).toHaveLength(1);
    expect(next[0]?.id).toBe('step-wa-first');
    expect(next[0]?.type).toBe('send_whatsapp_template');
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

describe('Yes / No WhatsApp reply buttons', () => {
  it('treats hiring-flow Yes / No answer types as button questions', () => {
    expect(isYesNoAnswerType('Yes / No')).toBe(true);
    expect(isYesNoAnswerType('Short text')).toBe(false);
  });

  it('sends the step title when prompt is only Yes/No', () => {
    expect(
      resolveHiringFlowQuestionBody({
        id: 'step-q-shift',
        type: 'ask_question',
        label: 'Are you comfortable working in shifts if required?',
        prompt: 'Yes/No',
        answerType: 'Yes / No',
        branches: [],
      })
    ).toBe('Are you comfortable working in shifts if required?');
  });

  it('keeps a real prompt when the editor wrote a full question', () => {
    expect(
      resolveHiringFlowQuestionBody({
        id: 'step-q-bike',
        type: 'ask_question',
        label: 'Two-wheeler',
        prompt: 'Do you have your own two-wheeler?',
        answerType: 'Yes / No',
        branches: [],
      })
    ).toBe('Do you have your own two-wheeler?');
  });

  it('builds Meta Yes and No reply buttons', () => {
    const payload = buildMetaInteractiveButtonsPayload({
      to: '+917349199345',
      body: 'Do you have your own two-wheeler?',
      buttons: [
        { id: 'yes', title: 'Yes' },
        { id: 'no', title: 'No' },
      ],
    });

    expect(payload.type).toBe('interactive');
    expect(payload.interactive).toMatchObject({
      type: 'button',
      body: { text: 'Do you have your own two-wheeler?' },
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'yes', title: 'Yes' } },
          { type: 'reply', reply: { id: 'no', title: 'No' } },
        ],
      },
    });
  });
});

describe('stale hiring-flow enrollments', () => {
  it('does not advance hiring flows on completed or opted-out enrollments', () => {
    expect(isClosedOutreachEnrollmentStatus('completed')).toBe(true);
    expect(isClosedOutreachEnrollmentStatus('cancelled')).toBe(true);
    expect(isClosedOutreachEnrollmentStatus('opted_out')).toBe(true);
    expect(isClosedOutreachEnrollmentStatus('stopped')).toBe(false);
    expect(isClosedOutreachEnrollmentStatus('replied')).toBe(false);
  });

  it('does not treat an in-flight send as a new reply to consume', () => {
    expect(isHiringFlowReplyAdvanceable('waiting_reply')).toBe(true);
    expect(isHiringFlowReplyAdvanceable('completed')).toBe(true);
    expect(isHiringFlowReplyAdvanceable('failed')).toBe(true);
    expect(isHiringFlowReplyAdvanceable('active')).toBe(false);
    expect(isHiringFlowReplyAdvanceable('processing_reply')).toBe(false);
  });
});
