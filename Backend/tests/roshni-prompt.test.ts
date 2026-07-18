import { describe, expect, it } from 'vitest';

import {
  DEFAULT_ROSHNI_QUESTIONS,
  getBundledRoshniPromptTemplate,
  getRoshniPromptTemplate,
  missingRoshniPlaceholders,
  resolveVoiceTokens,
} from '../src/modules/voice/index.js';
import { buildRoshniJdTokens } from '../src/modules/voice/roshni-prompt.js';

describe('Roshni prompt', () => {
  it('loads the Roshni template with callee_name left for the provider', () => {
    const template = getRoshniPromptTemplate();
    expect(template).toContain('You are Roshni');
    expect(template).toContain('{callee_name}');
    expect(template).toContain('{jd_role_screening_label}');
    expect(template).toBe(getBundledRoshniPromptTemplate());
    expect(DEFAULT_ROSHNI_QUESTIONS).toHaveLength(8);
    expect(missingRoshniPlaceholders(template)).toEqual([]);
  });

  it('renders JD tokens into the agent prompt', async () => {
    const tokens = await buildRoshniJdTokens({
      jobId: null,
      organizationId: null,
      campaignName: 'Senior Backend Engineer',
      questions: ['How many years of Node experience do you have?'],
    });
    expect(tokens.jd_role_screening_label).toBe('Senior Backend Engineer');
    expect(tokens.jd_screening_questions_list).toContain('Node experience');
    expect(tokens.jd_screening_questions_list.split('\n')).toHaveLength(1);

    const rendered = resolveVoiceTokens(getRoshniPromptTemplate(), tokens);
    expect(rendered).toContain('You are Roshni');
    expect(rendered).toContain('Senior Backend Engineer');
    expect(rendered).toContain('{callee_name}');
    expect(rendered).not.toContain('{jd_role_screening_label}');
  });

  it('prefers qualification questions over Roshni defaults', async () => {
    const tokens = await buildRoshniJdTokens({
      campaignName: 'QA Lead',
      questions: [
        { prompt: 'What is your notice period?' },
        { prompt: 'Are you open to hybrid?' },
      ],
    });
    expect(tokens.jd_screening_questions_list).toBe(
      '1. What is your notice period?\n2. Are you open to hybrid?'
    );
    expect(tokens.jd_screening_questions_list).not.toContain('current CTC');
  });

  it('attaches silent knockout notes for voice', async () => {
    const { qualificationQuestionsForRoshni } = await import(
      '../src/modules/voice/roshni-prompt.js'
    );
    const qs = qualificationQuestionsForRoshni({
      questions: [
        {
          prompt: 'Notice period in days?',
          knockout: true,
          knockoutCondition: 'Reject if more than 60',
        },
      ],
    });
    expect(qs[0]?.prompt).toContain('Notice period in days?');
    expect(qs[0]?.prompt).toContain('Internal knockout');
    expect(qs[0]?.prompt).toContain('Reject if more than 60');
  });

  it('does not leave Hunar-invalid braces from {{job_title}}', () => {
    const rendered = resolveVoiceTokens(
      'Calling about {{job_title}} with {callee_name}',
      { job_title: 'MERN Stack Developer' }
    );
    expect(rendered).toBe('Calling about MERN Stack Developer with {callee_name}');
    expect(rendered).not.toContain('{MERN Stack Developer}');
  });
});
