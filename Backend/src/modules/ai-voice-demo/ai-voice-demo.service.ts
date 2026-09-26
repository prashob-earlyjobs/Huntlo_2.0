import { getLogger } from '../../config/logger.js';
import { isHunarConfigured } from '../../providers/hunar/hunar.config.js';
import { createHunarVoiceAgent } from '../../providers/hunar/hunar.client.js';
import { sendHunarCallViaGateway } from '../../providers/hunar/hunar.gateway.js';
import { sendZyastraCallViaGateway } from '../../providers/zyastra/zyastra.gateway.js';
import { AppError } from '../../shared/errors/app-error.js';
import { normalizePhone } from '../../shared/validation/phone.js';
import { AiVoiceDemoCallModel } from './ai-voice-demo.model.js';
import {
  AI_VOICE_DEMO_LIMIT,
  buildDemoAgentInput,
  demoQuestionsFor,
  type AiVoiceDemoJob,
} from './ai-voice-demo.jobs.js';
import type { StartAiVoiceDemoInput } from './ai-voice-demo.validation.js';

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function log() {
  return getLogger().child({ component: 'ai-voice-demo' });
}

export function companyKey(company: string): string {
  return company.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Midnight IST for the current day, as a UTC Date. */
export function startOfTodayIst(now = new Date()): Date {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  const midnightUtc = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());
  return new Date(midnightUtc - IST_OFFSET_MS);
}

/** E.164 mobile from the demo form, including the selected country code. */
export function toDemoMobile(phone: string): string | null {
  try {
    const normalized = normalizePhone(phone);
    const digits = normalized.replace(/\D/g, '');
    if (!normalized.startsWith('+') || digits.length < 8 || digits.length > 15) return null;
    return normalized;
  } catch {
    return null;
  }
}

/** Hunar dials Indian mobiles: +91 and 10 digits starting 6–9. */
export function isIndianDemoMobile(phone: string): boolean {
  return /^\+91[6-9]\d{9}$/.test(phone);
}

async function usedToday(company: string, phoneDigits: string): Promise<number> {
  const since = startOfTodayIst();
  const [byCompany, byPhone] = await Promise.all([
    AiVoiceDemoCallModel.countDocuments({
      companyKey: companyKey(company),
      status: 'dialed',
      createdAt: { $gte: since },
    }),
    AiVoiceDemoCallModel.countDocuments({
      phoneDigits,
      status: 'dialed',
      createdAt: { $gte: since },
    }),
  ]);
  return Math.max(byCompany, byPhone);
}

function hunarFailure(error: unknown, fallback: string): AppError {
  const statusCode = Number((error as { statusCode?: number })?.statusCode);
  const message = error instanceof Error && error.message ? error.message : fallback;
  return new AppError(
    statusCode >= 400 && statusCode < 600 ? statusCode : 502,
    'HUNAR_API_ERROR',
    message,
    { cause: error }
  );
}

export async function startAiVoiceDemo(input: StartAiVoiceDemoInput) {
  const phone = toDemoMobile(input.phone);
  if (!phone) {
    throw AppError.badRequest('Enter a mobile number the AI Recruiter can call.');
  }

  const indian = isIndianDemoMobile(phone);
  if (indian && !isHunarConfigured()) {
    throw new AppError(
      503,
      'HUNAR_API_KEY_MISSING',
      'Hunar voice API key is not configured. Set HUNAR_VOICE_API_KEY.'
    );
  }

  const phoneDigits = phone.replace(/\D/g, '');
  const used = await usedToday(input.company, phoneDigits);
  if (used >= AI_VOICE_DEMO_LIMIT) {
    throw new AppError(
      429,
      'QUOTA_EXCEEDED',
      "You've used both complimentary demo calls for today."
    );
  }

  const company = input.company.trim();
  const job = input.job as AiVoiceDemoJob;
  const agentInput = buildDemoAgentInput(job, company);
  let agentId = '';
  if (indian) {
    try {
      const created = await createHunarVoiceAgent(agentInput);
      agentId = created.agentId;
    } catch (error) {
      log().error({ err: error, job }, 'Hunar demo agent creation failed');
      throw hunarFailure(error, 'Unable to create the AI recruiter for this job.');
    }
  }

  const record = await AiVoiceDemoCallModel.create({
    company,
    companyKey: companyKey(company),
    email: input.email.trim().toLowerCase(),
    phone,
    phoneDigits,
    job,
    agentId: agentId || null,
    status: 'failed',
    dialedCount: 0,
  });

  try {
    const callee = {
      callee_name: company,
      mobile_number: phone,
      custom_data: {
        company_name: company,
        company,
        job_title: job,
        job,
        email: input.email.trim().toLowerCase(),
        firstMessage: agentInput.introduction || '',
      },
    };
    const dial = indian
      ? await sendHunarCallViaGateway({
          agentId,
          campaignId: String(record._id),
          questions: demoQuestionsFor(job),
          data: [callee],
        })
      : await sendZyastraCallViaGateway({
          campaignId: String(record._id),
          prompt: agentInput.agentPrompt,
          questions: demoQuestionsFor(job),
          data: [callee],
        });

    if (!dial.dialedCount) {
      record.errorMessage = 'The call provider accepted the request but created 0 calls.';
      await record.save();
      throw new AppError(502, 'HUNAR_BULK_EMPTY', record.errorMessage);
    }

    record.status = 'dialed';
    record.dialedCount = dial.dialedCount;
    record.requestId = dial.requestId || null;
    record.errorMessage = null;
    await record.save();

    const remaining = Math.max(0, AI_VOICE_DEMO_LIMIT - (used + 1));
    log().info({ agentId, demoId: String(record._id), job }, 'AI voice demo call queued');

    return {
      id: String(record._id),
      phone,
      job,
      agentId,
      remaining,
      limit: AI_VOICE_DEMO_LIMIT,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    const wrapped = hunarFailure(error, 'Unable to start the demo call.');
    record.errorMessage = wrapped.message.slice(0, 500);
    await record.save();
    log().error({ err: error, agentId, demoId: String(record._id) }, 'Hunar demo dial failed');
    throw wrapped;
  }
}
