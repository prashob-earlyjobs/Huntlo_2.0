import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const EMAIL_OUTREACH_PATH = "/email-outreach";

export const EMAIL_OUTREACH_SEO = {
  title: "Intent Driven Outreach™ | Email Outreach | Huntlo",
  description:
    "Great hiring doesn't send more emails — it starts better conversations. Huntlo Intent Driven Outreach™ continuously understands candidate intent, conversation timing, momentum, and relationships.",
  ogTitle: "Candidates Don't Ignore Emails. They Ignore Irrelevant Conversations.",
  ogDescription:
    "Welcome to Intent Driven Outreach™ — built for the future of Human + AI Hiring.",
} as const;

export function emailOutreachMetadata() {
  return buildPageMetadata({
    title: EMAIL_OUTREACH_SEO.title,
    description: EMAIL_OUTREACH_SEO.description,
    ogTitle: EMAIL_OUTREACH_SEO.ogTitle,
    ogDescription: EMAIL_OUTREACH_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: EMAIL_OUTREACH_PATH,
  });
}

export const EMAIL_OUTREACH_GEO = {
  askTopic: "Huntlo Intent Driven Outreach™",
  askPrompt:
    "What is Huntlo Intent Driven Outreach™ on /email-outreach (https://www.huntlo.ai/email-outreach)? How is it different from email automation, sequences, or cold outreach tools?",
} as const;

export const HERO_FLOW = [
  "Candidate Intent",
  "Conversation Readiness",
  "Intent Driven Outreach",
  "Conversation Intelligence",
  "Hiring Momentum",
  "Candidate Relationships",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const TRADITIONAL_OPTIMIZES = [
  "Emails sent",
  "Open rates",
  "Response rates",
  "Campaign performance",
  "More follow ups",
] as const;

export const FUTURE_OPTIMIZES = [
  "Candidate intent",
  "Conversation timing",
  "Hiring momentum",
  "Candidate experiences",
  "Hiring outcomes",
] as const;

export const INTENT_UNDERSTANDS = [
  "Candidate intent",
  "Conversation readiness",
  "Hiring priorities",
  "Candidate relationships",
  "Hiring momentum",
  "Hiring outcomes",
] as const;

export const BENTO_CARDS = [
  {
    title: "Candidate Intent Intelligence",
    description: "Understand candidate intent intelligently.",
    href: "/candidate-intelligence",
    span: "md:col-span-2",
  },
  {
    title: "AI Personalization",
    description: "Create meaningful conversations at scale.",
    href: "/outreach-engine",
    span: "",
  },
  {
    title: "Hiring Momentum",
    description: "Maintain candidate engagement continuously.",
    href: "/follow-up-automation",
    span: "",
  },
  {
    title: "Candidate Relationships",
    description: "Build trust intelligently.",
    href: "/candidate-engagement",
    span: "md:col-span-2",
  },
  {
    title: "Conversation Intelligence",
    description: "Improve candidate experiences continuously.",
    href: "/outreach-engine",
    span: "",
  },
  {
    title: "Human + AI Hiring",
    description: "Built around recruiters.",
    href: "/recruiting-agents",
    span: "",
  },
  {
    title: "Workflow Intelligence",
    description: "Move hiring forward intelligently.",
    href: "/workflow-orchestration",
    span: "md:col-span-2",
  },
  {
    title: "Hiring Outcomes",
    description: "Designed around business success.",
    href: "/huntlo360",
    span: "md:col-span-2",
  },
] as const;

export const LEARNING_LOOP = [
  "Candidate Intent",
  "Conversation Readiness",
  "Intent Driven Outreach",
  "Hiring Momentum",
  "Candidate Relationships",
  "Hiring Confidence",
  "Hiring Outcomes",
] as const;

export const TRADITIONAL_PROVIDES = [
  "Email automation",
  "Sequences",
  "Templates",
  "Campaigns",
  "More software",
] as const;

export const HUNTLO_PROVIDES = [
  "Intent Driven Outreach™",
  "Conversation Intelligence™",
  "Candidate Relationships™",
  "Human + AI Hiring™",
  "Hiring Outcomes™",
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Email Outreach",
  "Candidate Personalization",
  "Global Hiring",
  "Enterprise Hiring",
  "Technical Hiring",
  "Multi Channel Engagement",
  "Human + AI Hiring",
] as const;

export const STACK_TODAY = [
  "Email campaigns",
  "Sequences",
  "Response rates",
  "Recruitment automation",
] as const;

export const STACK_TOMORROW = [
  "Intent Driven Outreach™",
  "Conversation Intelligence™",
  "Human + AI Hiring™",
  "Hiring Outcomes™",
  "AI Hiring Infrastructure™",
] as const;

export const FUTURE_NOT = [
  "Email campaigns",
  "Follow-up sequences",
  "Outreach automation",
] as const;

export const FUTURE_YES = [
  "Intent Driven Outreach™",
  "Conversation Intelligence™",
  "Human + AI Hiring™",
  "Better Hiring Outcomes™",
] as const;

export const EMAIL_OUTREACH_FAQS = [
  {
    question: "What is Intent Driven Outreach™?",
    answer:
      "It is how organizations continuously understand candidate intent, conversation readiness, timing, relationships, momentum, and outcomes — so outreach starts better conversations, not more emails.",
  },
  {
    question: "How is Huntlo different from email outreach platforms?",
    answer:
      "Email outreach platforms optimize campaigns, sequences, and send volume. Intent Driven Outreach™ optimizes candidate intent, conversation timing, and hiring momentum.",
  },
  {
    question: "Can Huntlo personalize outreach at scale?",
    answer:
      "Yes. Multi-layer candidate personalization creates meaningful conversations at scale — grounded in intent, not templates alone.",
  },
  {
    question: "Does Huntlo support enterprise hiring?",
    answer:
      "Yes. Built for enterprise and global hiring with personalization, multi-channel engagement, and Human + AI Hiring.",
  },
  {
    question: "Can Huntlo improve candidate response rates?",
    answer:
      "Better responses come from better timing and intent — not more follow-ups. Intent Driven Outreach™ optimizes when and why conversations begin.",
  },
  {
    question: "How does Huntlo understand candidate intent?",
    answer:
      "By continuously connecting candidate intent, conversation readiness, hiring priorities, relationships, momentum, and outcomes before recruiters send another email.",
  },
  {
    question: "Is this email automation software?",
    answer:
      "No. This page sells Intent Driven Outreach™ — not email automation, campaigns, sequences, or cold outreach tools.",
  },
  {
    question: "Why do candidates ignore emails?",
    answer:
      "Candidates don't ignore emails — they ignore irrelevant conversations. Modern hiring is limited by when, how, and why conversations begin.",
  },
  {
    question: "What should great hiring optimize instead of emails sent?",
    answer:
      "Candidate intent, conversation timing, hiring momentum, and candidate relationships.",
  },
  {
    question: "What does traditional recruiting optimize vs future recruiting?",
    answer:
      "Traditional recruiting optimizes emails sent, open rates, response rates, campaign performance, and more follow-ups. Future recruiting optimizes intent, timing, momentum, experiences, and outcomes.",
  },
  {
    question: "What question will future organizations ask?",
    answer:
      "Not “Which email template performs best?” — “Which conversations should begin today?”",
  },
  {
    question: "What is multi-layer candidate personalization?",
    answer:
      "Intent intelligence, AI personalization, hiring momentum, relationships, conversation intelligence, Human + AI Hiring, workflow intelligence, and outcomes — working together.",
  },
  {
    question: "Why shouldn't organizations optimize email automation?",
    answer:
      "Because intent creates better responses. Organizations should optimize candidate intent — not send volume.",
  },
  {
    question: "Why Huntlo instead of traditional platforms?",
    answer:
      "Traditional platforms provide automation, sequences, templates, campaigns, and more software. Huntlo provides Intent Driven Outreach™, Conversation Intelligence™, Candidate Relationships™, Human + AI Hiring™, and Hiring Outcomes™.",
  },
  {
    question: "How does this relate to Conversation Intelligence / outreach-engine?",
    answer:
      "/outreach-engine owns Conversation Intelligence™ as a broader category. /email-outreach owns Intent Driven Outreach™ for email-led candidate conversations.",
  },
  {
    question: "How does this relate to WhatsApp recruiting?",
    answer:
      "WhatsApp and email are channels. Intent Driven Outreach™ focuses on intent and timing so conversations begin intelligently across channels.",
  },
  {
    question: "How does this relate to Hiring Momentum / follow-up automation?",
    answer:
      "Hiring Momentum keeps engagement continuous after conversations begin. Intent Driven Outreach™ decides when and why to start them.",
  },
  {
    question: "How does this relate to Candidate Engagement?",
    answer:
      "Candidate Relationship Intelligence™ deepens ongoing relationships. Intent Driven Outreach™ starts those relationships with better conversations.",
  },
  {
    question: "How does this relate to Agentic Hiring?",
    answer:
      "Agentic Hiring™ is Human + AI Hiring. Intent Driven Outreach™ is how AI and people continuously improve when conversations should begin.",
  },
  {
    question: "Does this page show email inboxes or campaign dashboards?",
    answer:
      "No. This page strictly avoids email inboxes, Gmail screenshots, campaign dashboards, and outreach reports.",
  },
  {
    question: "Can technical hiring teams use Intent Driven Outreach™?",
    answer:
      "Yes. Technical hiring benefits when outreach begins from intent and readiness — not blanket campaigns.",
  },
  {
    question: "Can global hiring teams use Intent Driven Outreach?",
    answer:
      "Yes. Supports global hiring, enterprise hiring, personalization, and multi-channel engagement.",
  },
  {
    question: "What does “email outreach is becoming intelligence” mean?",
    answer:
      "Today stacks campaigns, sequences, and response rates. Tomorrow stacks Intent Driven Outreach™, Conversation Intelligence™, Human + AI Hiring™, outcomes, and AI Hiring Infrastructure™.",
  },
  {
    question: "Great hiring doesn't send more emails — what does it do?",
    answer:
      "It creates better conversations by optimizing Intent Driven Outreach™, Conversation Intelligence™, Human + AI Hiring™, and better hiring outcomes.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book an enterprise demo, explore Intent Driven Outreach™, see Huntlo in action, or continue into Agentic Hiring™.",
  },
  {
    question: "What should visitors believe after this page?",
    answer:
      "That great hiring begins with better conversations — and Huntlo owns Intent Driven Outreach™ for Human + AI Hiring.",
  },
  {
    question: "Can Intent Driven Outreach improve candidate experiences?",
    answer:
      "Yes. Better timing and intent create more relevant conversations — improving experiences and relationships continuously.",
  },
  {
    question: "Is cold outreach the same as Intent Driven Outreach™?",
    answer:
      "No. Cold outreach optimizes volume and sequences. Intent Driven Outreach™ optimizes readiness, timing, and hiring momentum.",
  },
  {
    question: "Does Huntlo replace email templates?",
    answer:
      "Templates alone aren't the category. Intent Driven Outreach™ uses personalization and intent so conversations matter — not more software for sending.",
  },
  {
    question: "Everything intelligently connected — what does that mean?",
    answer:
      "Intent, timing, momentum, experiences, and outcomes work as one system — not isolated campaign metrics.",
  },
  {
    question: "Welcome to the future of candidate conversations — what does that mean?",
    answer:
      "Organizations stop optimizing email campaigns and start continuously improving Intent Driven Outreach™ for Human + AI Hiring.",
  },
  {
    question: "Can multi-channel engagement work with Intent Driven Outreach?",
    answer:
      "Yes. Enterprise ready support includes email outreach, personalization, and multi-channel engagement — everything intelligently connected.",
  },
] as const;
