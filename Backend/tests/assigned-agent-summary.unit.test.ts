import { describe, expect, it } from 'vitest';

import { assignedAgentSummaryFromRylo } from '../src/modules/vocallabs/assigned-agent-summary.js';

describe('assignedAgentSummaryFromRylo', () => {
  it('copies language, dates, status, and avatar from the Rylo record', () => {
    const summary = assignedAgentSummaryFromRylo(
      {
        id: 'agent-1',
        name: 'sample1',
        assignedAt: '2026-10-27T05:00:00.000Z',
        language: '',
        createdAt: '2026-10-27T05:00:00.000Z',
        updatedAt: null,
        status: 'Active',
        avatarUrl: null,
      },
      {
        id: 'agent-1',
        name: 'SAMPLE 1',
        contactId: '',
        welcomeMessage: '',
        agentPrompt: '',
        analyticsPrompt: '',
        language: 'ENGLISH',
        callTokenId: '',
        voiceId: '',
        record: {
          created_at: '2026-10-26T00:00:00.000Z',
          updated_at: '2026-10-27T00:00:00.000Z',
          status: 'active',
          voice: { image: 'https://cdn.example/voice.png' },
        },
      }
    );

    expect(summary).toMatchObject({
      name: 'SAMPLE 1',
      language: 'ENGLISH',
      createdAt: '2026-10-26T00:00:00.000Z',
      updatedAt: '2026-10-27T00:00:00.000Z',
      status: 'Active',
      avatarUrl: 'https://cdn.example/voice.png',
    });
  });
});
