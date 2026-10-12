import { apiClient } from "./client";

export type AiVoiceDemoResponse = {
  id: string;
  phone: string;
  job: string;
  agentId: string;
  remaining: number;
  limit: number;
};

export async function startAiVoiceDemo(input: {
  company: string;
  email: string;
  phone: string;
  job: string;
}): Promise<AiVoiceDemoResponse> {
  const result = await apiClient.post<AiVoiceDemoResponse>("/public/ai-voice-demo", input, {
    retry: false,
  });
  return result.data;
}

export async function getAiVoiceDemoLimit(): Promise<number> {
  const result = await apiClient.get<{ limit: number }>("/public/ai-voice-demo/limit", {
    retry: false,
  });
  return result.data.limit;
}
