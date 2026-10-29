import { describe, expect, it } from 'vitest';

import {
  AI_VOICE_DEMO_JOBS,
  aiVoiceDemoLimit,
  buildDemoAgentInput,
} from '../src/modules/ai-voice-demo/ai-voice-demo.jobs.js';
import {
  isIndianDemoMobile,
  toDemoMobile,
} from '../src/modules/ai-voice-demo/ai-voice-demo.service.js';

describe('AI voice demo jobs', () => {
  it('builds a Hunar agent payload for every demo job', () => {
    for (const job of AI_VOICE_DEMO_JOBS) {
      const agent = buildDemoAgentInput(job, 'Innostax');
      expect(agent.name).toContain(job);
      if (job !== 'Real Estate DMX Urban Greens Call' && job !== 'KYC Incomplete Follow-up') {
        expect(agent.introduction).toContain(job);
      }
      expect(agent.introduction).toContain('Innostax');
      expect(agent.agentPrompt).toContain('company is Innostax');
      expect(agent.agentPrompt).toContain(job);
      // Hunar treats `{token}` as required custom_data — must be baked in.
      expect(agent.agentPrompt).not.toContain('{company}');
      expect(agent.introduction).not.toContain('{company}');
      expect(agent.objective).not.toContain('{company}');
      expect(Array.isArray(agent.questions)).toBe(true);
      expect((agent.questions as unknown[]).length).toBeGreaterThan(0);
      const asked = (agent.questions as { question: string }[]).map((row) => row.question).join(' ');
      if (job === 'Real Estate Alice Greens Call' || job === 'Real Estate DMX Urban Greens Call') {
        expect(asked).not.toContain('Innostax');
        expect(asked).not.toContain('{company}');
      } else if (job.startsWith('Real Estate') || job === 'KYC Incomplete Follow-up') {
        expect(asked).toContain('Innostax');
        expect(asked).not.toContain('{company}');
      }
    }
  });

  it('keeps the selected country code and only treats Indian mobiles as Hunar numbers', () => {
    expect(toDemoMobile('9876543210')).toBe('+919876543210');
    expect(toDemoMobile('+91 98765 43210')).toBe('+919876543210');
    expect(toDemoMobile('+14155552671')).toBe('+14155552671');
    expect(toDemoMobile('123')).toBeNull();
    expect(isIndianDemoMobile('+919876543210')).toBe(true);
    expect(isIndianDemoMobile('+14155552671')).toBe(false);
  });

  it('allows 20 demo calls in development and 5 elsewhere', () => {
    const prevEnv = process.env.APP_ENV;
    const prevLimit = process.env.AI_VOICE_DEMO_DAILY_LIMIT;
    try {
      delete process.env.AI_VOICE_DEMO_DAILY_LIMIT;
      process.env.APP_ENV = 'development';
      expect(aiVoiceDemoLimit()).toBe(20);
      process.env.APP_ENV = 'production';
      expect(aiVoiceDemoLimit()).toBe(5);
      process.env.AI_VOICE_DEMO_DAILY_LIMIT = '8';
      expect(aiVoiceDemoLimit()).toBe(8);
    } finally {
      process.env.APP_ENV = prevEnv;
      if (prevLimit === undefined) delete process.env.AI_VOICE_DEMO_DAILY_LIMIT;
      else process.env.AI_VOICE_DEMO_DAILY_LIMIT = prevLimit;
    }
  });
});
