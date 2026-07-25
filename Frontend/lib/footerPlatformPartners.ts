import {
  aiPlatformAskLabel,
  buildAiPlatformAskUrl,
  type AiPlatformId,
} from "@/lib/aiPlatformAskUrls";

export type FooterPlatformPartner = {
  name: string;
  platformId: AiPlatformId;
  href: string;
  logoSrc: string;
  /** Shown on hover (title) and for screen readers. */
  description: string;
};

const FOOTER_PLATFORM_DEFS: {
  name: string;
  platformId: AiPlatformId;
  logoSrc: string;
  labelName: string;
}[] = [
  {
    name: "ChatGPT",
    platformId: "chatgpt",
    logoSrc: "/ai_platform_logo/7ud8D03WW4Xz07m1QMs2FDOfTsI.avif",
    labelName: "ChatGPT",
  },
  {
    name: "Grok",
    platformId: "grok",
    logoSrc: "/ai_platform_logo/DOvioIjyXLpNCXgY4C5nNa27mZw.avif",
    labelName: "Grok",
  },
  {
    name: "Claude",
    platformId: "claude",
    logoSrc: "/ai_platform_logo/VvjO4WL1ltvgOoqHT1CkwK1ux7U.avif",
    labelName: "Claude",
  },
  {
    name: "Gemini",
    platformId: "gemini",
    logoSrc: "/ai_platform_logo/jEoZsXXHmUeMCBMhNKQ2cCLGO5U.avif",
    labelName: "Gemini",
  },
  {
    name: "Perplexity",
    platformId: "perplexity",
    logoSrc: "/ai_platform_logo/tY3GhsAA7ImzHjzp9QP55Rs9Ng.avif",
    labelName: "Perplexity",
  },
  {
    name: "Bing AI",
    platformId: "bing",
    logoSrc: "/ai_platform_logo/zeHXnTcYIt76cdHGqVTEKVCB5bc.avif",
    labelName: "Microsoft Copilot",
  },
];

/** Build footer AI-platform links with an optional page-specific GEO prompt/topic. */
export function buildFooterPlatformPartners(options?: {
  prompt?: string;
  topic?: string;
}): FooterPlatformPartner[] {
  const topic = options?.topic ?? "Huntlo";
  return FOOTER_PLATFORM_DEFS.map((def) => ({
    name: def.name,
    platformId: def.platformId,
    href: buildAiPlatformAskUrl(def.platformId, options?.prompt),
    logoSrc: def.logoSrc,
    description: aiPlatformAskLabel(def.labelName, topic),
  }));
}

/** Footer AI platforms — each opens a pre-filled prompt about Huntlo on that assistant. */
export const FOOTER_PLATFORM_PARTNERS: FooterPlatformPartner[] =
  buildFooterPlatformPartners();
