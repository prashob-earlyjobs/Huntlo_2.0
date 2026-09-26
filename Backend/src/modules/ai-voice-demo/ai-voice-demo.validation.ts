import { z } from 'zod';

import { AI_VOICE_DEMO_JOBS } from './ai-voice-demo.jobs.js';

export const startAiVoiceDemoSchema = z.object({
  company: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(8).max(20),
  job: z.enum(AI_VOICE_DEMO_JOBS),
});

export type StartAiVoiceDemoInput = z.infer<typeof startAiVoiceDemoSchema>;
