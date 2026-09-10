/** Non-Indian Zyastra/Zyvka calls go through the communication gateway (`vendor: zyvkay`). */

import { stringifyHunarQuestionsJson } from '../hunar/hunar.gateway.js';

export type ZyastraGatewayCallee = {
  callee_name: string;
  mobile_number: string;
  custom_data?: Record<string, string>;
};

function questionsArray(questions?: unknown): Array<Record<string, unknown>> {
  const raw = stringifyHunarQuestionsJson(questions);
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function sendZyastraCallViaGateway(input: {
  campaignId: string;
  prompt: string;
  data: ZyastraGatewayCallee[];
  questions?: unknown;
}): Promise<{ requestId?: string; dialedCount: number; response: unknown }> {
  const base = String(process.env.COMMUNICATION_GATEWAY_URL || 'http://localhost:5055/api/v1')
    .trim()
    .replace(/\/$/, '');
  const url = `${base}/messages/send`;
  const campaignId = String(input.campaignId || '').trim();
  const prompt = String(input.prompt || '').trim();
  const data = Array.isArray(input.data) ? input.data : [];
  const questions = questionsArray(input.questions);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'call',
      vendor: 'zyvkay',
      campaign_id: campaignId,
      prompt,
      questions,
      data,
    }),
  });

  const body = (await res.json().catch(() => ({}))) as {
    id?: string;
    requestId?: string;
    messageId?: string;
    message?: string;
    error?: string | { message?: string };
    data?: {
      id?: string;
      requestId?: string;
      messageId?: string;
      dialedCount?: number;
      accepted_count?: number;
    };
  };

  if (!res.ok) {
    const errorMessage =
      (typeof body.error === 'string' && body.error) ||
      (typeof body.error === 'object' && body.error?.message) ||
      body.message ||
      `Zyastra gateway call failed (${res.status})`;
    throw Object.assign(new Error(errorMessage), {
      statusCode: res.status >= 400 && res.status < 600 ? res.status : 502,
    });
  }

  const nested = Array.isArray(body.data) ? body.data : null;
  const dialedCount = nested
    ? nested.length
    : Number(body.data?.dialedCount ?? body.data?.accepted_count ?? data.length);

  return {
    requestId:
      body.data?.requestId ||
      body.data?.id ||
      body.data?.messageId ||
      body.requestId ||
      body.id ||
      body.messageId,
    dialedCount: Number.isFinite(dialedCount) ? dialedCount : data.length,
    response: body,
  };
}
