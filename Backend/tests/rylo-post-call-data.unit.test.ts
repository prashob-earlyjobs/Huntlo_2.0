import { describe, expect, it } from 'vitest';

import { readPostCallDataKeys } from '../src/providers/rylo/rylo.post-call-data.js';

describe('readPostCallDataKeys', () => {
  it('keeps the agent capture fields and drops internal keys', () => {
    expect(
      readPostCallDataKeys({
        data: {
          vocallabs_agent_post_data: [
            { key: 'driving_licence', prompt: 'Does the candidate have a licence?' },
            { key: 'work_preference', prompt: 'Full-time or part-time?' },
            { key: 'cut_the_call', prompt: 'internal' },
            { key: 'ai_processing_cost', prompt: 'cost' },
          ],
        },
      })
    ).toEqual(['driving_licence', 'work_preference']);
  });
});
