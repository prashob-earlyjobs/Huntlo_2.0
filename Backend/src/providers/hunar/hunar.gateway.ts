/** Indian (+91) Hunar calls go through the communication gateway. */

import { formatKnockoutPassCondition } from '../../modules/outreach/prompt/index.js';

export type HunarGatewayCallee = {
  callee_name: string;
  mobile_number: string;
  custom_data?: Record<string, string>;
};

export type HunarQuestionJsonInput = {
  id?: string;
  prompt?: string;
  question?: string;
  title?: string | null;
  required?: boolean;
  knockout?: boolean;
  knockoutCondition?: string | null;
};

/** Gateway expects screening questions as a JSON string, not an object. */
export function stringifyHunarQuestionsJson(questions?: unknown): string {
  if (typeof questions === 'string') {
    const trimmed = questions.trim();
    if (!trimmed) return '[]';
    try {
      JSON.parse(trimmed);
      return trimmed;
    } catch {
      return JSON.stringify(trimmed);
    }
  }

  if (!Array.isArray(questions)) return '[]';

  const rows = questions
    .map((raw, index) => {
      const q = raw && typeof raw === 'object' ? (raw as HunarQuestionJsonInput) : {};
      return {
        id: String(q.id || `q-${index + 1}`).trim() || `q-${index + 1}`,
        question: String(q.question || q.prompt || q.title || '').trim(),
        required: q.required !== false,
        pass_condition:
          q.knockout && q.knockoutCondition
            ? formatKnockoutPassCondition(q.knockoutCondition)
            : 'Informational only; any reasonable answer is acceptable',
      };
    })
    .filter((row) => row.question);

  return JSON.stringify(rows);
}

export async function sendHunarCallViaGateway(input: {
  agentId: string;
  campaignId: string;
  data: HunarGatewayCallee[];
  questions?: unknown;
}): Promise<{ requestId?: string; dialedCount: number; response: unknown }> {
  const base = String(process.env.COMMUNICATION_GATEWAY_URL || 'http://localhost:5055/api/v1')
    .trim()
    .replace(/\/$/, '');
  const url = `${base}/messages/send`;
  const agentId = String(input.agentId || '').trim();
  const campaignId = String(input.campaignId || '').trim();
  const data = Array.isArray(input.data) ? input.data : [];
  const questions = stringifyHunarQuestionsJson(input.questions);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'call',
      vendor: 'hunar',
      agent_id: agentId,
      campaign_id: campaignId,
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
      `Hunar gateway call failed (${res.status})`;
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
