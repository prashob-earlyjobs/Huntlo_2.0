import { describe, expect, it } from 'vitest';

import { readRyloCallLink } from '../src/providers/rylo/rylo.call-lookup.js';

describe('readRyloCallLink', () => {
  it('reads the campaign, phone, and status from call details', () => {
    const link = readRyloCallLink(
      {
        data: {
          vocallabs_calls: [
            {
              id: 'c6199a55-7841-4c15-b1be-4eb069a2fd16',
              call_queue_id: '9c636cb8-fec6-4c72-a8a1-a30a235556b4',
              call_status: 'completed',
              campaign_id: '32939a3f-f3ab-42d7-b5ce-f91687b0d1ed',
              phone_to: '918592929642',
              prospect: { phone: '+918592929642', name: 'Gokul' },
            },
          ],
        },
      },
      { callId: 'fallback-call', queueId: 'fallback-queue', status: 'completed' }
    );

    expect(link).toEqual({
      callId: 'c6199a55-7841-4c15-b1be-4eb069a2fd16',
      queueId: '9c636cb8-fec6-4c72-a8a1-a30a235556b4',
      status: 'completed',
      campaignId: '32939a3f-f3ab-42d7-b5ce-f91687b0d1ed',
      phone: '+918592929642',
      summary: '',
      durationSeconds: null,
      recordingUrl: '',
      answers: [],
      messages: [],
    });
  });

  it('keeps the summary, captured answers, and transcript', () => {
    const link = readRyloCallLink(
      {
        details: {
          id: 'call-1',
          call_status: 'completed',
          campaign_id: 'campaign-1',
          duration: 134,
          recording_url: 'https://cdn.example.com/call.wav',
          phone_to: '918592929642',
          prospect: { phone: '+918592929642' },
          call_data: [
            { key: 'ai_processing_cost_inr', type: 'internal', value: '0.02' },
            { key: 'driving_licence', type: 'external', value: 'Yes' },
          ],
        },
        conversation: {
          data: {
            vocallabs_call_message: [
              { role: 'assistant', content: 'Hello', created_at: '2026-10-28T04:58:49.000Z' },
              { role: 'user', content: 'Yes', created_at: '2026-10-28T04:58:55.000Z' },
            ],
          },
        },
        data: {
          data: {
            vocallabs_call_data: [
              { key: 'work_preference', value: 'Part-time', created_at: '2026-10-28T05:01:08.000Z' },
              { key: 'cut_the_call', value: '1', created_at: '2026-10-28T04:59:04.000Z' },
            ],
          },
        },
        status: { data: { vocallabs_calls: [{ call_status: 'completed' }] } },
        summary: {
          data: {
            vocallabs_calls: [{ summary: 'The candidate chose part-time work.' }],
          },
        },
      },
      { callId: 'call-1', queueId: '', status: 'completed' }
    );

    expect(link?.summary).toBe('The candidate chose part-time work.');
    expect(link?.durationSeconds).toBe(134);
    expect(link?.recordingUrl).toBe('https://cdn.example.com/call.wav');
    expect(link?.answers).toEqual([{ key: 'work_preference', value: 'Part-time' }]);
    expect(link?.messages.map((message) => message.content)).toEqual(['Hello', 'Yes']);
  });
});
