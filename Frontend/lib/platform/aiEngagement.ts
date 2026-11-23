import type { PlatformModuleConfig } from "@/lib/platform/moduleTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const PLATFORM_AI_ENGAGEMENT_PATH = "/platform/ai-engagement";

export const PLATFORM_AI_ENGAGEMENT_SEO = {
  title: "AI Candidate Engagement & Outreach | Huntlo",
  description:
    "See how Huntlo connects candidate outreach, follow-ups, replies and recruiter handoffs.",
} as const;

export const PLATFORM_AI_ENGAGEMENT: PlatformModuleConfig = {
  path: PLATFORM_AI_ENGAGEMENT_PATH,
  seo: PLATFORM_AI_ENGAGEMENT_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Platform", href: "/platform" },
    { name: "AI Engagement", href: PLATFORM_AI_ENGAGEMENT_PATH },
  ],
  eyebrow: "Huntlo · AI Engagement",
  h1: "A candidate found is not a conversation started.",
  heroBody:
    "A strong shortlist means little without a reply. Coordinate relevant outreach, follow-ups and candidate responses so recruiters can act with context.",
  heroPills: [
    { icon: "users", label: "Audience" },
    { icon: "clipboard", label: "Message" },
    { icon: "userCheck", label: "Reply" },
  ],
  problemBody:
    "When outreach drafts, channel replies and follow-up ownership sit in different tools, recruiting teams spend more time reconstructing who was contacted and what they said than moving the conversation forward. A clearer engagement workflow keeps the permitted audience, the response captured, and the next responsible action visible — without inventing performance metrics.",
  answerH2: "What is AI Engagement?",
  answerBody:
    "AI Engagement is presented here as a coordinated candidate outreach and response workflow. Exact operational capabilities must match the live product and be confirmed before publishing.",
  answerNote:
    "Verified first-party outreach context remains available on the Candidate Outreach capability page. This module page focuses on coordinating outreach, replies and recruiter handoffs.",
  howStages: [
    {
      title: "Permitted audience",
      source: "Shortlist or campaign audience rules",
      captured: "Who may be contacted and why",
      owner: "Recruiter confirms audience scope",
    },
    {
      title: "Message",
      source: "Role context and outreach intent",
      captured: "Relevant message draft for review",
      owner: "Recruiter owns message framing",
    },
    {
      title: "Supported channel",
      source: "Email, WhatsApp or voice-labelled path",
      captured: "Channel selection and send status",
      owner: "Recruiter chooses the channel",
    },
    {
      title: "Response",
      source: "Candidate reply or no-response signal",
      captured: "Reply content and outcome status",
      owner: "Recruiter reviews the response",
    },
    {
      title: "Opt-out handling",
      source: "Candidate preference or stop request",
      captured: "Contact preference recorded",
      owner: "System surfaces; recruiter respects",
    },
    {
      title: "Human follow-up",
      source: "Reply context ready for action",
      captured: "Assigned next step with owner",
      owner: "Recruiter owns consequential follow-up",
    },
  ],
  productVariant: "engagement",
  whoCards: [
    {
      icon: "building",
      title: "Recruitment agencies",
      body: "Keep desk outreach, replies and client-ready handoffs organised so recruiters act with clearer conversation context.",
      href: "/ai-recruiting-staffing-agencies",
      linkLabel: "Staffing agency workflows",
    },
    {
      icon: "users",
      title: "Talent acquisition teams",
      body: "Connect shortlists to outreach and follow-ups without inventing reply rates or unverified deployment claims.",
      href: "/candidate-outreach",
      linkLabel: "Candidate Outreach capability",
    },
    {
      icon: "headphones",
      title: "BPO hiring teams",
      body: "Coordinate high-volume candidate follow-ups where channel replies and next owners need to stay visible.",
      href: "/in/ai-voice-bpo-recruitment",
      linkLabel: "BPO recruitment page",
    },
  ],
  trustStatement: "“I can interview Thursday afternoon, but evenings are not possible.”",
  trustSuggestion: "Suggested next step: offer Thursday slots and pause evening outreach for this candidate.",
  trustDecision: "Recruiter confirms the interview slot and sends the calendar invite.",
  faqs: [
    {
      question: "What is AI Engagement?",
      answer:
        "A strong shortlist means little without a reply. Coordinate relevant outreach, follow-ups and candidate responses so recruiters can act with context.",
    },
    {
      question: "Does the website include a live voice demo?",
      answer:
        "No. The website shows visual workflows and offers a way to request a product demonstration.",
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
    "Share your outreach volume, channel mix or follow-up workflow and review verified product capabilities with the Huntlo team.",
  related: [
    { label: "Candidate Outreach (verified)", href: "/candidate-outreach" },
    { label: "AI Sourcing", href: "/platform/ai-sourcing" },
    { label: "Conversation Intelligence", href: "/platform/conversation-intelligence" },
  ],
  aboutName: "Huntlo AI Engagement",
};

export function platformAiEngagementMetadata() {
  return buildPageMetadata({
    title: PLATFORM_AI_ENGAGEMENT_SEO.title,
    description: PLATFORM_AI_ENGAGEMENT_SEO.description,
    path: PLATFORM_AI_ENGAGEMENT_PATH,
    ogImage: OG_IMAGES.platform,
  });
}

export function platformAiEngagementPageUrl() {
  return absoluteUrl(PLATFORM_AI_ENGAGEMENT_PATH);
}
