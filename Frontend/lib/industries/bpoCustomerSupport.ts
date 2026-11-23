import type { IndustryLandingConfig } from "@/lib/industries/industryLandingTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const BPO_CUSTOMER_SUPPORT_PATH = "/industries/bpo-customer-support";

export const BPO_CUSTOMER_SUPPORT_SEO = {
  title: "AI Voice Screening for BPO & Support Hiring | Huntlo",
  description:
    "Support BPO and customer support recruitment with AI voice conversations, candidate qualification, shift checks and recruiter workflows.",
  primaryKeyword: "AI BPO recruitment",
  secondaryKeywords: [
    "AI voice screening for BPO",
    "Customer support hiring automation",
    "Contact centre recruitment",
    "AI candidate qualification",
    "Voice AI recruitment software",
  ],
} as const;

export const BPO_CUSTOMER_SUPPORT: IndustryLandingConfig = {
  path: BPO_CUSTOMER_SUPPORT_PATH,
  footerName: "BPO & Support",
  aboutName: "AI Voice Screening for BPO & Support Hiring",
  seo: BPO_CUSTOMER_SUPPORT_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Industries", href: "/industries" },
    { name: "BPO & Customer Support", href: BPO_CUSTOMER_SUPPORT_PATH },
  ],
  hero: {
    eyebrow: "AI VOICE FOR BPO & CUSTOMER SUPPORT",
    h1: "Qualify More Support Candidates. Coordinate Every Next Step.",
    paragraphs: [
      "BPO and customer support recruitment often involves recurring conversations about communication requirements, work experience, shift preferences and joining availability.",
      "Huntlo connects AI voice engagement with structured candidate qualification and recruiting workflows, helping teams organise information before recruiter review.",
    ],
    primaryCta: "Explore AI Candidate Screening",
    secondaryCta: "Explore Candidate Qualification",
    secondaryCtaHref: "/solutions/candidate-qualification",
    illustration: {
      variant: "qualification-workspace",
      header: "Candidate Qualification Workspace",
      candidate: "Ananya R. — fictional example",
      location: "Noida Support Centre",
      role: "Customer Support Executive",
      owner: "Recruiter review",
      stages: [
        {
          id: "engagement",
          label: "Voice Engagement",
          status: "Conversation in progress",
          infoCards: [
            { label: "Candidate profile", value: "Ananya R. · fictional example" },
            { label: "Role requirements", value: "Customer Support Executive" },
            { label: "Conversation summary", value: "Interest confirmed · experience discussed" },
            { label: "Shift preference", value: "Not yet confirmed" },
            { label: "Availability", value: "Joining window open" },
            { label: "Recruiter review status", value: "Awaiting qualification details" },
          ],
          nextAction: "Capture shift and availability responses",
        },
        {
          id: "qualification",
          label: "Qualification",
          status: "Responses organised",
          infoCards: [
            { label: "Candidate profile", value: "Ananya R. · two years experience noted" },
            { label: "Role requirements", value: "Customer Support Executive" },
            { label: "Conversation summary", value: "Experience and joining window captured" },
            { label: "Shift preference", value: "Rotational shifts acceptable" },
            { label: "Availability", value: "15 days" },
            { label: "Recruiter review status", value: "Ready for recruiter review" },
          ],
          nextAction: "Open recruiter assessment",
        },
        {
          id: "review",
          label: "Recruiter Review",
          status: "Ready for recruiter review",
          infoCards: [
            { label: "Candidate profile", value: "Ananya R. · fictional example" },
            { label: "Role requirements", value: "Customer Support Executive" },
            { label: "Conversation summary", value: "Structured responses ready for handoff" },
            { label: "Shift preference", value: "Rotational shifts acceptable" },
            { label: "Availability", value: "15 days" },
            { label: "Recruiter review status", value: "Awaiting recruiter assessment" },
          ],
          nextAction: "Recruiter assessment",
        },
        {
          id: "follow-up",
          label: "Follow-up",
          status: "Follow-up coordination open",
          infoCards: [
            { label: "Candidate profile", value: "Ananya R. · fictional example" },
            { label: "Role requirements", value: "Customer Support Executive" },
            { label: "Conversation summary", value: "Qualification reviewed by recruiter" },
            { label: "Shift preference", value: "Rotational shifts acceptable" },
            { label: "Availability", value: "15 days" },
            { label: "Recruiter review status", value: "Next communication pending" },
          ],
          nextAction: "Coordinate follow-up communication",
        },
      ],
      initialStageIndex: 1,
      label: "Illustrative qualification workspace",
    },
  },
  aeo: {
    h2: "What Is AI Voice Screening for BPO Recruitment?",
    paragraphs: [
      "AI voice screening for BPO recruitment uses voice-based automation to support candidate conversations and collect information relevant to hiring requirements.",
      "Huntlo connects AI voice engagement with structured candidate qualification and recruiting workflows, helping teams organise information before recruiter review — without treating voice as a standalone dialler.",
    ],
  },
  problem: {
    h2: "High Applicant Volume Makes Consistent Screening Difficult.",
    paragraphs: [
      "A contact centre may receive applications for customer support, technical support, sales and service roles.",
      "Recruiters need to understand relevant experience, communication requirements, work location, shift flexibility and joining timelines.",
      "When every candidate requires the same introductory questions, teams spend significant time collecting information before they can determine the next action.",
    ],
    cards: [
      {
        title: "Repeated Screening Questions",
        body: "Recruiters gather similar information across large applicant pools.",
      },
      {
        title: "Incomplete Candidate Context",
        body: "Important availability and role information may remain unclear.",
      },
      {
        title: "Manual Recruiter Coordination",
        body: "Screening responses and next steps may be scattered across systems.",
      },
    ],
  },
  solution: {
    h2: "Make Candidate Conversations Easier to Review and Act On.",
    paragraphs: [
      "Huntlo's voice-powered workflow approach helps organise candidate communication around role-specific qualification requirements.",
      "AI voice conversations can support information collection, while structured workflows help recruiters review responses and determine the next step.",
    ],
    pillars: [
      {
        title: "Voice-Based Candidate Engagement",
        body: "Support configured conversations that collect role-relevant responses.",
      },
      {
        title: "Role-Specific Qualification",
        body: "Organise experience, location and requirement-related information for review.",
      },
      {
        title: "Shift and Availability Checks",
        body: "Ask candidates about schedule preferences and joining timelines.",
      },
      {
        title: "Recruiter Review and Handoff",
        body: "Surface structured context so recruiters can decide the next action.",
      },
    ],
  },
  howItWorks: {
    h2: "From Candidate Application to Recruiter-Ready Information.",
    steps: [
      {
        title: "Define Screening Requirements",
        body: "Define the role and relevant screening requirements.",
      },
      {
        title: "Start AI Voice Conversations",
        body: "Initiate configured AI voice conversations.",
      },
      {
        title: "Capture Responses",
        body: "Capture experience, location and shift-related responses.",
      },
      {
        title: "Organise Qualification View",
        body: "Organise information into a structured qualification view.",
      },
      {
        title: "Route for Recruiter Review",
        body: "Route candidates for recruiter review.",
      },
      {
        title: "Coordinate Follow-up",
        body: "Coordinate appropriate follow-up communication.",
      },
    ],
  },
  useCases: {
    h2: "AI Voice Workflows for Contact Centre Recruitment.",
    cards: [
      {
        title: "Customer Support Screening",
        body: "Collect relevant work experience and availability information.",
      },
      {
        title: "Inside Sales Qualification",
        body: "Organise candidate responses about role expectations and relevant experience.",
      },
      {
        title: "Shift Availability Checks",
        body: "Understand candidate preferences for applicable working schedules.",
      },
      {
        title: "Joining Coordination",
        body: "Support communication about joining dates and outstanding requirements.",
      },
    ],
  },
  productExperience: {
    h2: "See Candidate Context Before the Recruiter Conversation.",
    worker: "Ananya R.",
    role: "Customer Support Executive",
    location: "Noida Support Centre",
    shift: "Rotational shifts acceptable",
    joining: "15 days",
    conversationSummary:
      "Candidate shared two years of support experience, confirmed rotational shift flexibility and a 15-day joining window for recruiter review.",
    nextAction: "Recruiter assessment",
    fields: [
      { label: "Candidate", value: "Ananya R. — fictional example" },
      { label: "Role", value: "Customer Support Executive" },
      { label: "Experience", value: "Two years" },
      { label: "Shift preference", value: "Rotational shifts acceptable" },
      { label: "Joining availability", value: "15 days" },
      { label: "Status", value: "Ready for recruiter review" },
    ],
    timeline: ["Voice Engagement", "Qualification", "Recruiter Review", "Follow-up"],
    label: "Illustrative workspace · fictional example · no automated hiring decision",
  },
  businessValue: {
    h2: "Help Recruiters Focus on the Conversations That Need Human Attention.",
    cards: [
      {
        title: "Consistent Information Collection",
        body: "Use structured qualification questions.",
      },
      {
        title: "Clearer Candidate Context",
        body: "Organise responses for recruiter review.",
      },
      {
        title: "Connected Next Steps",
        body: "Link candidate conversations with the hiring workflow.",
      },
    ],
  },
  responsible: {
    h2: "AI Supports Screening. Recruiters Make Hiring Decisions.",
    paragraphs: [
      "AI-generated summaries and qualification information should be reviewed appropriately. Automated voice interactions should not be treated as definitive assessments of language proficiency, personality, suitability or protected personal characteristics.",
      "Employee and candidate data must be handled under applicable privacy requirements and organisational policies.",
    ],
  },
  faqs: {
    h2: "Frequently Asked Questions About AI Voice Screening for BPO Hiring",
    items: [
      {
        question: "What is AI voice screening for BPO recruitment?",
        answer:
          "It uses voice-based automation to support candidate conversations and collect information relevant to hiring requirements.",
      },
      {
        question: "Can AI screen customer support candidates?",
        answer: "AI can help gather structured responses for recruiter review.",
      },
      {
        question: "Can AI voice assess communication skills?",
        answer:
          "Voice systems may collect spoken responses, but reliable communication assessment requires validated methods and appropriate human oversight.",
      },
      {
        question: "Can AI confirm shift availability?",
        answer:
          "Configured conversations can ask candidates about their shift preferences and availability.",
      },
      {
        question: "Can Huntlo support high-volume hiring?",
        answer:
          "Huntlo is positioned for structured recruiting workflows. Actual capacity and performance should be confirmed through product evaluation.",
      },
      {
        question: "Does AI screening replace recruiter interviews?",
        answer:
          "No. AI can assist with information gathering while recruiters retain responsibility for hiring decisions.",
      },
    ],
  },
  contextualCta: {
    h2: "Organise high-volume support candidate conversations.",
    body: "Explore AI candidate screening, Huntlo Voice and conversation intelligence for BPO recruiting teams.",
    primaryCta: "Explore AI Candidate Screening",
    secondaryCta: "Explore Candidate Qualification",
    secondaryCtaHref: "/solutions/candidate-qualification",
  },
  finalCta: {
    h2: "Turn Candidate Conversations into Clearer Hiring Decisions.",
    body: "Explore how Huntlo connects AI voice engagement with candidate qualification and recruiter review workflows.",
    cta: "Explore AI Candidate Screening",
  },
  related: [
    { label: "Candidate Qualification", href: "/solutions/candidate-qualification" },
    { label: "Huntlo Voice", href: "/platform/voice" },
    { label: "Conversation Intelligence", href: "/platform/conversation-intelligence" },
    { label: "AI Screening", href: "/solutions/ai-screening" },
    { label: "Retail & QSR", href: "/industries/retail-qsr" },
    { label: "Staffing Agencies", href: "/industries/staffing-recruitment" },
  ],
  aiAskPrompt: `What is Huntlo AI voice screening for BPO and customer support on ${BPO_CUSTOMER_SUPPORT_PATH} (https://www.huntlo.ai${BPO_CUSTOMER_SUPPORT_PATH})? How do voice-powered workflows support candidate qualification, shift checks and recruiter review?`,
  aiAskTopic: "Huntlo AI voice screening for BPO & support hiring",
};

export function bpoCustomerSupportMetadata() {
  return buildPageMetadata({
    title: BPO_CUSTOMER_SUPPORT_SEO.title,
    description: BPO_CUSTOMER_SUPPORT_SEO.description,
    path: BPO_CUSTOMER_SUPPORT_PATH,
    ogImage: OG_IMAGES.solutions,
  });
}

export function bpoCustomerSupportPageUrl() {
  return absoluteUrl(BPO_CUSTOMER_SUPPORT_PATH);
}
