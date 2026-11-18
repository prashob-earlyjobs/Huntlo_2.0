import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const CANDIDATE_OUTREACH_PATH = "/candidate-outreach";

export const CANDIDATE_OUTREACH_SEO = {
  title: "Automated Candidate Outreach & Engagement – Huntlo",
  description:
    "Automate your recruiting outreach with AI. Send personalized email and WhatsApp sequences and follow-ups, and track replies all in one place with Huntlo.",
} as const;

export function candidateOutreachMetadata() {
  return buildPageMetadata({
    title: CANDIDATE_OUTREACH_SEO.title,
    description: CANDIDATE_OUTREACH_SEO.description,
    ogImage: OG_IMAGES.platform,
    path: CANDIDATE_OUTREACH_PATH,
  });
}

export const CANDIDATE_OUTREACH_GEO = {
  askTopic: "Huntlo Automated Candidate Outreach",
  askPrompt:
    "What is Huntlo Automated Candidate Outreach on /candidate-outreach (https://www.huntlo.ai/candidate-outreach)? How do multi-channel Email and WhatsApp sequences, personalized follow-ups, and reply tracking work for recruiting teams?",
} as const;

export const CANDIDATE_OUTREACH_SOFTWARE = {
  name: "Huntlo Automated Candidate Outreach",
  description:
    "Multi-channel recruiting outreach across Email and WhatsApp with personalized sequences, automated follow-ups, reply tracking, and recruiter oversight in one workflow.",
  featureList: [
    "Email Campaigns",
    "WhatsApp Messaging",
    "Automated Follow-ups",
    "AI Personalization",
    "Unified Reply Tracking",
    "Campaign Analytics",
  ],
} as const;

export const CANDIDATE_OUTREACH_FEATURES = [
  {
    title: "Email Automation",
    description:
      "Design multi-step email sequences with dynamic templates that reference each candidate’s name, role context, and background.",
    icon: "mail",
  },
  {
    title: "WhatsApp Messaging",
    description:
      "Engage candidates on WhatsApp Business using Meta-approved templates for opening messages, follow-ups, and closing touches.",
    icon: "chat",
  },
  {
    title: "Automated Follow-ups",
    description:
      "Set timing rules and stop conditions. Huntlo continues the sequence until a reply, opt-out, or recruiter stop ends the campaign.",
    icon: "refresh",
  },
  {
    title: "AI Personalization",
    description:
      "Use placeholders and sourced profile context so messages feel 1:1 - not like a spreadsheet blast.",
    icon: "spark",
  },
  {
    title: "Unified Tracking",
    description:
      "See opens, replies, and conversation status in one place so recruiters can step in or let the sequence continue.",
    icon: "inbox",
  },
  {
    title: "Campaign Analytics",
    description:
      "Review reply rates, engagement, and pipeline progression to refine messaging over time.",
    icon: "chart",
  },
] as const;

export const CANDIDATE_OUTREACH_CAMPAIGN_FLOW = [
  {
    day: "Day 1",
    title: "Personalized email",
    description: "Opening message with candidate context and a clear next step.",
  },
  {
    day: "Day 3",
    title: "WhatsApp follow-up",
    description: "If there is no reply, a Meta-approved WhatsApp touch continues the conversation.",
  },
  {
    day: "Day 5",
    title: "Reminder email",
    description: "A final reminder or closing message runs on schedule unless a stop condition is met.",
  },
] as const;

export const CANDIDATE_OUTREACH_WORKFLOW = [
  {
    title: "Enroll candidates",
    description:
      "Pull talent from a sourcing session or pool and enroll them into a multi-channel sequence with profile context attached.",
  },
  {
    title: "Personalize & launch",
    description:
      "Review templates, timing, and stop rules. Huntlo sends Email and WhatsApp touches on the schedule you define.",
  },
  {
    title: "Track & hand off",
    description:
      "Replies land in one place. Interested candidates move toward screening and scheduling while recruiters stay in control.",
  },
] as const;

export const CANDIDATE_OUTREACH_INTERNAL_LINKS = [
  { label: "Integrations", href: "/integrations", note: "Connect email, WhatsApp & calendar" },
  { label: "Hiring Workflows", href: "/hiring-workflows", note: "Engage workflows & orchestration" },
  { label: "Huntlo 360", href: "/huntlo360", note: "End-to-end hiring operations" },
  { label: "Book a Demo", href: "/book-a-demo", note: "See outreach in your workflow" },
] as const;

export const CANDIDATE_OUTREACH_RELATED = [
  {
    label: "AI Candidate Outreach capability",
    href: "/capabilities/ai-candidate-outreach",
    note: "Product capability deep-dive",
  },
  {
    label: "Conversation Intelligence™",
    href: "/outreach-engine",
    note: "Category view of hiring conversations",
  },
  {
    label: "AI Sourcing",
    href: "/sourcing",
    note: "Find talent before you enroll",
  },
] as const;

export const CANDIDATE_OUTREACH_FAQS = [
  {
    question: "Which channels does Huntlo support?",
    answer:
      "Huntlo currently supports Email and WhatsApp for candidate outreach. WhatsApp messages use Meta-approved templates. Additional channels may be added over time.",
  },
  {
    question: "How are messages personalized?",
    answer:
      "Use templates with placeholders such as name, role, and company, and let Huntlo draw on sourced profile context so intros and tone fit each candidate - while recruiters can review messaging before high-priority conversations.",
  },
  {
    question: "Can candidates opt out?",
    answer:
      "Yes. Huntlo respects opt-out and do-not-contact signals, including STOP-style keywords and unsubscribe handling for email and WhatsApp, and can stop sequences when those conditions are met.",
  },
  {
    question: "How do I know if outreach is working?",
    answer:
      "Huntlo tracks opens, replies, and campaign progression in one place so you can see which messages earn responses and where to refine sequences. Response levels vary by role, market, and message quality - Huntlo does not guarantee reply rates.",
  },
] as const;

export const CANDIDATE_OUTREACH_KEYWORDS = {
  primary: [
    "automated outreach recruitment",
    "email campaign automation",
    "WhatsApp recruiting",
    "multi-channel recruiting software",
  ],
  secondary: [
    "candidate engagement software",
    "AI messaging automation",
    "recruiting workflow automation",
    "email drip campaigns",
  ],
} as const;
