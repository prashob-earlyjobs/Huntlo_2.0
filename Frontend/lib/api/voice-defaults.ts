import { apiClient } from "./client";
import { createDomainService, simulateMockLatency } from "./service";
import {
  ROSHNI_AGENT_PROMPT_TEMPLATE,
  ROSHNI_INTRODUCTION,
} from "@/lib/roshni-agent-prompt";

export type VoiceDefaults = {
  introduction: string;
  agentPrompt: string;
  version: number;
  source: "db" | "file" | "mixed";
  introductionSource?: "db" | "file";
  agentPromptSource?: "db" | "file";
};

export type VoiceDefaultsApi = {
  getDefaults(): Promise<VoiceDefaults>;
};

const bundledDefaults = (): VoiceDefaults => ({
  introduction: ROSHNI_INTRODUCTION,
  agentPrompt: ROSHNI_AGENT_PROMPT_TEMPLATE,
  version: 0,
  source: "file",
  introductionSource: "file",
  agentPromptSource: "file",
});

const liveVoiceDefaultsApi: VoiceDefaultsApi = {
  async getDefaults() {
    const result = await apiClient.get<VoiceDefaults>("/voice/defaults");
    return result.data;
  },
};

const mockVoiceDefaultsApi: VoiceDefaultsApi = {
  async getDefaults() {
    await simulateMockLatency();
    return bundledDefaults();
  },
};

export const voiceDefaultsApi = createDomainService({
  live: liveVoiceDefaultsApi,
  mock: mockVoiceDefaultsApi,
});

/**
 * Load effective Roshni defaults for builders.
 * Falls back to the bundled static template when the endpoint is unavailable.
 */
export async function loadVoiceDefaultsSafe(): Promise<VoiceDefaults> {
  try {
    const defaults = await voiceDefaultsApi.getDefaults();
    const introduction = String(defaults.introduction || "").trim();
    const agentPrompt = String(defaults.agentPrompt || "").trim();
    if (!introduction || !agentPrompt) return bundledDefaults();
    return {
      ...defaults,
      introduction,
      agentPrompt,
    };
  } catch {
    return bundledDefaults();
  }
}
