import type { IndustryLandingConfig } from "@/lib/industries/industryLandingTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const RETAIL_QSR_PATH = "/industries/retail-qsr";

export const RETAIL_QSR_SEO = {
  title: "AI Voice Hiring for Retail & QSR Teams | Huntlo",
  description:
    "Support retail and restaurant hiring with AI voice screening, candidate communication, joining coordination and employee follow-up workflows.",
  primaryKeyword: "AI hiring for retail",
  secondaryKeywords: [
    "Retail recruitment automation",
    "Restaurant hiring automation",
    "QSR workforce hiring",
    "Store associate screening",
    "AI voice recruitment for retail",
  ],
} as const;

export const RETAIL_QSR: IndustryLandingConfig = {
  path: RETAIL_QSR_PATH,
  footerName: "Retail & QSR",
  aboutName: "AI Voice Hiring for Retail & QSR Teams",
  seo: RETAIL_QSR_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Industries", href: "/industries" },
    { name: "Retail & QSR", href: RETAIL_QSR_PATH },
  ],
  hero: {
    eyebrow: "AI VOICE FOR RETAIL & QSR",
    h1: "Keep Every Store and Restaurant Hiring Workflow Moving.",
    paragraphs: [
      "Retail stores and quick-service restaurants depend on people being available for the right roles and shifts.",
      "But store managers and HR teams often coordinate candidate communication alongside day-to-day operations.",
      "Huntlo connects AI voice conversations with structured hiring and workforce workflows, helping teams organise candidate qualification, joining communication and employee check-ins across locations.",
    ],
    primaryCta: "Book a Retail Hiring Demo",
    secondaryCta: "Explore AI Hiring Agents",
    secondaryCtaHref: "/solutions/ai-hiring-agents",
    illustration: {
      variant: "multi-store-dashboard",
      header: "Multi-Store Hiring Dashboard",
      candidate: "Sneha K.",
      location: "Koramangala Store",
      role: "Retail Associate",
      owner: "Store HR",
      locations: [
        { id: "koramangala", label: "Koramangala Store" },
        { id: "indiranagar", label: "Indiranagar Store" },
        { id: "whitefield", label: "Whitefield QSR" },
      ],
      stages: [
        {
          id: "open-role",
          label: "Open Position",
          status: "Role opened for review",
          infoCards: [
            { label: "Store location", value: "Koramangala Store" },
            { label: "Open position", value: "Retail Associate" },
            { label: "Candidate qualification", value: "Awaiting engagement" },
            { label: "Shift availability", value: "Not yet captured" },
            { label: "Joining status", value: "Not started" },
            { label: "HR next action", value: "Start candidate conversations" },
          ],
          nextAction: "Engage candidates",
        },
        {
          id: "screening",
          label: "Screening",
          status: "Voice qualification in progress",
          infoCards: [
            { label: "Store location", value: "Koramangala Store" },
            { label: "Open position", value: "Retail Associate" },
            { label: "Candidate qualification", value: "Responses being organised" },
            { label: "Shift availability", value: "Morning preference noted" },
            { label: "Joining status", value: "Pending review" },
            { label: "HR next action", value: "Review qualification details" },
          ],
          nextAction: "Continue to review",
        },
        {
          id: "review",
          label: "Ready for Review",
          status: "Ready for manager review",
          infoCards: [
            { label: "Store location", value: "Koramangala Store" },
            { label: "Open position", value: "Retail Associate" },
            { label: "Candidate qualification", value: "Ready for review" },
            { label: "Shift availability", value: "Morning" },
            { label: "Joining status", value: "Awaiting follow-up" },
            { label: "HR next action", value: "Store manager follow-up" },
          ],
          nextAction: "Coordinate joining",
        },
        {
          id: "joining",
          label: "Joining",
          status: "Joining coordination open",
          infoCards: [
            { label: "Store location", value: "Koramangala Store" },
            { label: "Open position", value: "Retail Associate" },
            { label: "Candidate qualification", value: "Reviewed" },
            { label: "Shift availability", value: "Morning confirmed" },
            { label: "Joining status", value: "Instructions pending" },
            { label: "HR next action", value: "Share reporting instructions" },
          ],
          nextAction: "Confirm store readiness",
        },
      ],
      initialStageIndex: 2,
      label: "Workflow",
    },
  },
  aeo: {
    h2: "How Can AI Voice Support Retail Hiring?",
    paragraphs: [
      "AI voice can assist with candidate communication, screening questions and structured recruiter handoffs for retail and restaurant roles.",
      "Huntlo connects those conversations with hiring and workforce workflows so store and HR teams can organise qualification, joining communication and employee follow-ups across locations.",
    ],
  },
  problem: {
    h2: "Store Hiring Is Operationally Urgent. Communication Is Often Fragmented.",
    paragraphs: [
      "A store may need an associate for an upcoming shift. A restaurant may be recruiting kitchen staff or service crew. A regional HR team may be supporting several locations at once.",
      "Each role involves candidate conversations, availability checks and joining coordination.",
      "When communication depends on disconnected calls and manual updates, managers may struggle to understand which candidates are ready and what still needs attention.",
    ],
    cards: [
      {
        title: "Store-Level Hiring Pressure",
        body: "Managers need workforce availability while managing daily operations.",
      },
      {
        title: "Shift and Location Requirements",
        body: "Candidates may have different preferences and practical constraints.",
      },
      {
        title: "Joining Coordination",
        body: "Hiring teams need clear visibility into pending confirmations and next steps.",
      },
    ],
  },
  solution: {
    h2: "One Connected Approach to Store-Level Workforce Communication.",
    paragraphs: [
      "Huntlo's voice-powered workflow approach helps retail and restaurant teams organise recurring hiring conversations and workforce coordination.",
    ],
    pillars: [
      {
        title: "Candidate Screening",
        body: "Collect relevant candidate responses through configured conversations.",
      },
      {
        title: "Shift Availability Checks",
        body: "Ask candidates about shift preferences and organise responses for review.",
      },
      {
        title: "Joining Coordination",
        body: "Support confirmation and follow-up workflows before associates report to store.",
      },
      {
        title: "Employee Check-ins",
        body: "Connect recurring check-ins and employee questions with appropriate HR review.",
      },
    ],
  },
  howItWorks: {
    h2: "From Application to Store Readiness.",
    steps: [
      {
        title: "Define Store Requirements",
        body: "Define the store, role and shift requirements.",
      },
      {
        title: "Engage Candidates",
        body: "Engage candidates through configured AI voice conversations.",
      },
      {
        title: "Capture Availability",
        body: "Capture availability and relevant qualification details.",
      },
      {
        title: "Organise for Review",
        body: "Organise responses for recruiter or manager review.",
      },
      {
        title: "Coordinate Joining",
        body: "Coordinate joining instructions.",
      },
      {
        title: "Support Follow-ups",
        body: "Support appropriate employee follow-ups.",
      },
    ],
  },
  useCases: {
    h2: "AI Voice Workflows for Store and Restaurant Teams.",
    cards: [
      {
        title: "Retail Associate Screening",
        body: "Capture relevant experience, location and availability information.",
      },
      {
        title: "Restaurant Crew Hiring",
        body: "Support recurring conversations about role requirements and joining readiness.",
      },
      {
        title: "Multi-Location Coordination",
        body: "Organise candidate information across different stores or restaurants.",
      },
      {
        title: "Employee Check-ins",
        body: "Collect feedback and route questions requiring HR attention.",
      },
    ],
  },
  productExperience: {
    h2: "A Clearer View of Hiring Across Locations.",
    worker: "Sneha K.",
    role: "Retail Associate",
    location: "Koramangala Store",
    shift: "Morning",
    joining: "Store manager follow-up",
    conversationSummary:
      "Candidate preferred morning shifts at the Koramangala store and provided role-relevant responses ready for manager review.",
    nextAction: "Store manager follow-up",
    fields: [
      { label: "Location", value: "Koramangala Store" },
      { label: "Role", value: "Retail Associate" },
      { label: "Candidate", value: "Sneha K." },
      { label: "Shift preference", value: "Morning" },
      { label: "Qualification", value: "Ready for review" },
    ],
    timeline: ["Open Position", "Screening", "Ready for Review", "Joining"],
    label: "Store workflow",
  },
  businessValue: {
    h2: "Give Store Teams More Clarity Without Adding More Manual Coordination.",
    cards: [
      {
        title: "Structured Screening",
        body: "Organise recurring candidate information.",
      },
      {
        title: "Clearer Location Context",
        body: "Connect candidates to relevant store requirements.",
      },
      {
        title: "Visible Next Actions",
        body: "Help managers and HR teams understand pending coordination tasks.",
      },
    ],
  },
  responsible: {
    h2: "Automation That Supports Store Teams.",
    paragraphs: [
      "AI can assist with repetitive conversations and information gathering. Store managers and HR teams remain responsible for employment decisions, sensitive concerns and employee support.",
      "Employee and candidate data must be handled under applicable privacy requirements and organisational policies.",
    ],
  },
  faqs: {
    h2: "Frequently Asked Questions About AI Voice for Retail & QSR Hiring",
    items: [
      {
        question: "How can AI voice support retail hiring?",
        answer:
          "AI voice can assist with candidate communication, screening questions and structured recruiter handoffs.",
      },
      {
        question: "Can AI support restaurant crew recruitment?",
        answer:
          "Configured workflows can collect relevant availability, location and role information for review.",
      },
      {
        question: "How can AI help with multi-location hiring?",
        answer:
          "Structured workflows can organise communication around different store requirements.",
      },
      {
        question: "Can AI voice confirm shift availability?",
        answer:
          "Voice conversations can ask candidates about shift preferences and capture responses.",
      },
      {
        question: "Can Huntlo support joining coordination?",
        answer:
          "Joining coordination is part of Huntlo's onboarding workflow positioning. Specific configuration options should be confirmed in a product demonstration.",
      },
      {
        question: "Does AI replace store managers?",
        answer: "No. Managers retain responsibility for hiring and workforce decisions.",
      },
    ],
  },
  contextualCta: {
    h2: "Keep multi-location store hiring conversations moving.",
    body: "Explore AI hiring agents, interview coordination and employee check-ins for retail and restaurant teams.",
    primaryCta: "Book a Retail Hiring Demo",
    secondaryCta: "Explore AI Hiring Agents",
    secondaryCtaHref: "/solutions/ai-hiring-agents",
  },
  finalCta: {
    h2: "Make Every Store Hiring Conversation Count.",
    body: "Explore how Huntlo connects AI voice communication with retail and restaurant hiring, joining coordination and HR workflows.",
    cta: "Book a Retail Hiring Demo",
  },
  related: [
    { label: "AI Hiring Agents", href: "/solutions/ai-hiring-agents" },
    { label: "Interview Coordination", href: "/solutions/interview-coordination" },
    { label: "Employee Check-ins", href: "/solutions/employee-check-ins" },
    { label: "Huntlo Voice AI", href: "/platform/voice-ai" },
    { label: "E-Commerce & Quick Commerce", href: "/industries/ecommerce-quick-commerce" },
    { label: "BPO & Support", href: "/industries/bpo-customer-support" },
  ],
  aiAskPrompt: `What is Huntlo AI voice hiring for retail and QSR on ${RETAIL_QSR_PATH} (https://www.huntlo.ai${RETAIL_QSR_PATH})? How do voice-powered workflows support store associate screening, joining coordination and HR follow-up?`,
  aiAskTopic: "Huntlo AI voice for retail & QSR hiring",
};

export function retailQsrMetadata() {
  return buildPageMetadata({
    title: RETAIL_QSR_SEO.title,
    description: RETAIL_QSR_SEO.description,
    path: RETAIL_QSR_PATH,
    ogImage: OG_IMAGES.solutions,
  });
}

export function retailQsrPageUrl() {
  return absoluteUrl(RETAIL_QSR_PATH);
}
