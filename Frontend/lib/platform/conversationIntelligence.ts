import type { PlatformModuleConfig } from "@/lib/platform/moduleTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const PLATFORM_CONVERSATION_INTELLIGENCE_PATH = "/platform/conversation-intelligence";

export const PLATFORM_CONVERSATION_INTELLIGENCE_SEO = {
  title: "Conversation Intelligence for Recruiting | Huntlo",
  description:
    "Explore structured workforce conversation insights, reviewable summaries and follow-up actions.",
} as const;

export const PLATFORM_CONVERSATION_INTELLIGENCE: PlatformModuleConfig = {
  path: PLATFORM_CONVERSATION_INTELLIGENCE_PATH,
  seo: PLATFORM_CONVERSATION_INTELLIGENCE_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Platform", href: "/platform" },
    { name: "Conversation Intelligence", href: PLATFORM_CONVERSATION_INTELLIGENCE_PATH },
  ],
  eyebrow: "Huntlo · Conversation Intelligence",
  h1: "When the conversation ends, the information shouldn't disappear.",
  heroBody:
    "A candidate shares availability; a new hire raises a question; an employee reports a concern. Organise relevant statements into reviewable fields, summaries and next actions.",
  heroPills: [
    { icon: "headphones", label: "Statement" },
    { icon: "clipboard", label: "Fields" },
    { icon: "userCheck", label: "Confirm" },
  ],
  problemBody:
    "When conversation notes, extracted fields and follow-up owners sit in different tools, people teams spend more time reconstructing what was said than deciding what happens next. A clearer conversation-intelligence workflow keeps the source statement, the reviewable fields and the next responsible action visible — without inventing performance metrics.",
  answerH2: "What is Conversation Intelligence?",
  answerBody:
    "Conversation Intelligence is presented here as a structured way to review information from workforce conversations. Exact operational capabilities must match the live product and be confirmed before publishing.",
  answerNote:
    "This module page focuses on reviewable fields, summaries and human confirmation. It does not claim automated decisions or unverified analytics outcomes.",
  howStages: [
    {
      title: "Source statement",
      source: "Candidate, new-hire or employee conversation text",
      captured: "Relevant statement marked for review",
      owner: "System surfaces; human reads source",
    },
    {
      title: "Extracted field",
      source: "Statement marked as potentially structured",
      captured: "Suggested field value for confirmation",
      owner: "Reviewer checks accuracy",
    },
    {
      title: "Reviewer confirmation",
      source: "Said vs inferred distinction",
      captured: "Confirmed fields and open questions",
      owner: "Human confirms what is reliable",
    },
    {
      title: "Assigned next action",
      source: "Confirmed summary ready for handoff",
      captured: "Next step with named owner",
      owner: "Recruiter or HR owns follow-up",
    },
  ],
  productVariant: "conversation",
  whoCards: [
    {
      icon: "building",
      title: "Recruitment agencies",
      body: "Turn screening and outreach conversations into reviewable fields so desk recruiters can hand off clearer context.",
      href: "/ai-recruiting-staffing-agencies",
      linkLabel: "Staffing agency workflows",
    },
    {
      icon: "users",
      title: "Talent acquisition teams",
      body: "Organise availability, preference and concern statements into fields that support accountable human review.",
      href: "/ai-voice-recruiter",
      linkLabel: "AI Voice Recruiter page",
    },
    {
      icon: "clipboard",
      title: "HR operations",
      body: "Support joining and early-tenure conversations where source statements, suggestions and decisions must stay distinct.",
      href: "/solutions/ai-onboarding-agents",
      linkLabel: "Onboarding agents overview",
    },
  ],
  trustStatement: "“The commute is longer than expected, but the shift timing works.”",
  trustSuggestion: "Suggested field: commute concern · Suggested next step: manager review.",
  trustDecision: "People manager confirms the concern note and schedules a check-in.",
  faqs: [
    {
      question: "What is Conversation Intelligence?",
      answer:
        "A candidate shares availability; a new hire raises a question; an employee reports a concern. Organise relevant statements into reviewable fields, summaries and next actions.",
    },
    {
      question: "Does the website include a live voice demo?",
      answer:
        "No. The website shows illustrative visual workflows and offers a way to request a product demonstration.",
    },
    {
      question: "Can this replace a human recruiter or HR team?",
      answer:
        "Huntlo is positioned to support routine workflows and information organisation; consequential decisions and sensitive follow-ups require appropriate human oversight.",
    },
    {
      question: "How do we evaluate this for our team?",
      answer:
        "Use the Book a Demo form to share your workflow, hiring volume or workforce context and discuss verified product capabilities.",
    },
  ],
  finalCtaBody:
    "Share your conversation review, screening summary or follow-up workflow and discuss verified product capabilities with the Huntlo team.",
  related: [
    { label: "Huntlo VoiceAI", href: "/platform/voice-ai" },
    { label: "AI Engagement", href: "/platform/ai-engagement" },
    { label: "AI Voice Recruiter", href: "/ai-voice-recruiter" },
  ],
  aboutName: "Huntlo Conversation Intelligence",
};

export function platformConversationIntelligenceMetadata() {
  return buildPageMetadata({
    title: PLATFORM_CONVERSATION_INTELLIGENCE_SEO.title,
    description: PLATFORM_CONVERSATION_INTELLIGENCE_SEO.description,
    path: PLATFORM_CONVERSATION_INTELLIGENCE_PATH,
    ogImage: OG_IMAGES.platform,
  });
}

export function platformConversationIntelligencePageUrl() {
  return absoluteUrl(PLATFORM_CONVERSATION_INTELLIGENCE_PATH);
}
