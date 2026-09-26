import { describe, expect, it } from 'vitest';

import {
  AI_VOICE_DEMO_JOBS,
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
      expect(agent.introduction).toContain(job);
      expect(agent.introduction).toContain('Innostax');
      expect(agent.agentPrompt).toContain('hiring company is Innostax');
      expect(agent.agentPrompt).toContain(job);
      expect(Array.isArray(agent.questions)).toBe(true);
      expect((agent.questions as unknown[]).length).toBeGreaterThan(0);
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
});
