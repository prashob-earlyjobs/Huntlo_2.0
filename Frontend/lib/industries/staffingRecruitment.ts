import type { IndustryLandingConfig } from "@/lib/industries/industryLandingTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const STAFFING_RECRUITMENT_PATH = "/industries/staffing-recruitment";

export const STAFFING_RECRUITMENT_SEO = {
  title: "AI Voice Recruiting for Staffing Agencies | Huntlo",
  description:
    "Connect candidate sourcing, AI voice engagement, qualification and recruiter follow-ups with Huntlo's staffing agency recruitment workflows.",
  primaryKeyword: "AI recruitment agency automation",
  secondaryKeywords: [
    "AI voice recruiting",
    "AI recruitment software for agencies",
    "Candidate engagement automation",
    "AI staffing software",
    "Candidate qualification automation",
    "Recruitment agency workflow automation",
    "AI candidate rediscovery",
  ],
} as const;

export const STAFFING_RECRUITMENT: IndustryLandingConfig = {
  path: STAFFING_RECRUITMENT_PATH,
  footerName: "Staffing Agencies",
  aboutName: "AI Voice Recruiting for Staffing Agencies",
  seo: STAFFING_RECRUITMENT_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Industries", href: "/industries" },
    { name: "Staffing & Recruitment Agencies", href: STAFFING_RECRUITMENT_PATH },
  ],
  hero: {
    eyebrow: "AI VOICE FOR STAFFING & RECRUITMENT AGENCIES",
    h1: "Turn Candidate Databases into Active Hiring Conversations.",
    paragraphs: [
      "Recruitment agencies already spend significant effort finding candidates. But finding a profile is not the same as reaching an interested, available and qualified candidate.",
      "Recruiters still need to initiate conversations, understand candidate readiness, collect role-specific information and coordinate the next hiring action.",
      "Huntlo connects AI sourcing, voice-powered engagement and structured qualification workflows, helping staffing teams move from candidate discovery to recruiter-ready conversations.",
    ],
    primaryCta: "Book a Huntlo Demo",
    secondaryCta: "Explore AI Sourcing",
    secondaryCtaHref: "/platform/ai-sourcing",
    microcopy:
      "Built around candidate discovery, engagement and recruiter workflow coordination.",
    illustration: {
      variant: "candidate-engagement",
      header: "Candidate Engagement Workflow",
      candidate: "Ananya R.",
      location: "Agency desk · Client A",
      role: "Customer Support Executive",
      owner: "Recruiter review",
      pipeline: [
        "Candidate Database",
        "AI Sourcing",
        "AI Voice Engagement",
        "Candidate Qualification",
        "Recruiter Review",
      ],
      candidates: [
        {
          name: "Ananya R.",
          role: "Customer Support Executive",
          experience: "2 years",
          status: "Awaiting recruiter review",
        },
        {
          name: "Rahul M.",
          role: "Inside Sales Associate",
          experience: "3 years",
          status: "Follow-up required",
        },
        {
          name: "Sneha K.",
          role: "Business Development Executive",
          experience: "2 years",
          status: "Qualification information collected",
        },
      ],
      stages: [
        {
          id: "database",
          label: "Candidate Database",
          status: "Profiles available for rediscovery",
          infoCards: [
            { label: "Requirement", value: "Customer Support Executive" },
            { label: "Client", value: "Client A" },
            { label: "Source pool", value: "Existing agency database" },
            { label: "Candidates surfaced", value: "3 profiles" },
            { label: "Engagement", value: "Not started" },
            { label: "Recruiter review", value: "Pending discovery" },
          ],
          nextAction: "Identify role-relevant candidates",
        },
        {
          id: "sourcing",
          label: "AI Sourcing",
          status: "Role-relevant candidates organised",
          infoCards: [
            { label: "Requirement", value: "Customer Support Executive" },
            { label: "Client", value: "Client A" },
            { label: "Source pool", value: "Supported sourcing capabilities" },
            { label: "Candidates surfaced", value: "Ananya R. · Rahul M. · Sneha K." },
            { label: "Engagement", value: "Ready to initiate" },
            { label: "Recruiter review", value: "Awaiting conversations" },
          ],
          nextAction: "Start configured voice engagement",
        },
        {
          id: "engagement",
          label: "AI Voice Engagement",
          status: "Conversations in progress",
          infoCards: [
            { label: "Requirement", value: "Customer Support Executive" },
            { label: "Client", value: "Client A" },
            { label: "Source pool", value: "Prioritised shortlist" },
            { label: "Candidates surfaced", value: "Voice workflows configured" },
            { label: "Engagement", value: "Interest and availability being collected" },
            { label: "Recruiter review", value: "Awaiting responses" },
          ],
          nextAction: "Organise qualification responses",
        },
        {
          id: "qualification",
          label: "Candidate Qualification",
          status: "Responses organised for review",
          infoCards: [
            { label: "Requirement", value: "Customer Support Executive" },
            { label: "Client", value: "Client A" },
            { label: "Source pool", value: "Engaged candidates" },
            { label: "Candidates surfaced", value: "Structured responses ready" },
            { label: "Engagement", value: "Completed for selected profiles" },
            { label: "Recruiter review", value: "Ready for handoff" },
          ],
          nextAction: "Open recruiter review",
        },
        {
          id: "review",
          label: "Recruiter Review",
          status: "Awaiting recruiter judgment",
          infoCards: [
            { label: "Requirement", value: "Customer Support Executive" },
            { label: "Client", value: "Client A" },
            { label: "Source pool", value: "Qualified shortlist" },
            { label: "Candidates surfaced", value: "Ananya R. ready for review" },
            { label: "Engagement", value: "Conversation summary available" },
            { label: "Recruiter review", value: "Human assessment required" },
          ],
          nextAction: "Decide the next recruitment action",
        },
      ],
      initialStageIndex: 3,
      label: "Huntlo workflow",
    },
  },
  aeo: {
    h2: "How Can AI Voice Support Staffing Agencies?",
    paragraphs: [
      "AI voice can support staffing agencies by helping initiate candidate conversations, collect interest and availability information, and organise responses for recruiter review.",
      "Huntlo connects AI sourcing, voice-powered engagement and structured qualification so recruitment teams can move from candidate discovery to clearer next actions — without treating voice as a standalone dialler.",
    ],
  },
  problem: {
    h2: "Recruitment Agencies Don't Just Need More Profiles. They Need More Meaningful Conversations.",
    paragraphs: [
      "A staffing agency may have access to thousands of candidate profiles collected across previous hiring requirements, sourcing channels and recruitment campaigns.",
      "But when a new client requirement arrives, recruiters still need to determine which candidates are relevant, interested and available. That process often involves repeated outreach, screening questions and manual follow-ups.",
      "The result is a gap between the number of profiles available and the number of candidates ready for meaningful recruiter engagement.",
    ],
    cards: [
      {
        title: "Candidate Data Without Current Context",
        body: "A candidate profile may show experience and skills but not current availability, interest or joining readiness.",
      },
      {
        title: "Repetitive Recruiter Outreach",
        body: "Recruiters spend time contacting candidates, collecting similar information and recording responses.",
      },
      {
        title: "Disconnected Hiring Workflows",
        body: "Candidate sourcing, engagement, qualification and recruiter handoffs may happen across separate tools.",
      },
    ],
    closing:
      "The challenge isn't only finding candidates. It's knowing who is ready for the next conversation.",
  },
  solution: {
    h2: "From Candidate Discovery to Recruiter-Ready Information.",
    paragraphs: [
      "Huntlo brings candidate sourcing, AI voice engagement and structured qualification into a connected recruitment workflow.",
      "Instead of treating candidate search, outreach and screening as isolated activities, staffing teams can organise the information needed to move candidates through the hiring process.",
      "The goal is to help recruiters spend more time on conversations requiring human judgment and less time on repetitive information gathering.",
    ],
    pillars: [
      {
        title: "AI Candidate Sourcing",
        body: "Discover potential candidates using role-relevant information and supported sourcing capabilities. Keep discovery connected to the hiring requirement.",
      },
      {
        title: "AI Voice Engagement",
        body: "Support configured candidate conversations to collect interest, availability and other relevant information through permitted channels.",
      },
      {
        title: "Structured Qualification",
        body: "Organise candidate responses around the hiring requirement so recruiters can review clear, role-relevant context.",
      },
      {
        title: "Recruiter Handoff",
        body: "Connect candidate conversations to the appropriate next recruitment action after human review.",
      },
    ],
  },
  howItWorks: {
    h2: "One Connected Workflow from Search to Shortlist.",
    paragraphs: [
      "Every new hiring requirement begins with a question: which candidates are relevant and ready to engage?",
      "Huntlo's connected workflow approach helps recruitment teams organise the journey from candidate discovery to human review. AI does not autonomously make hiring decisions.",
    ],
    steps: [
      {
        title: "Define the Hiring Requirement",
        body: "Specify the role, relevant skills, experience, location and joining requirements.",
      },
      {
        title: "Discover Potential Candidates",
        body: "Search appropriately sourced candidate information using available product capabilities.",
      },
      {
        title: "Initiate Candidate Engagement",
        body: "Use configured AI voice workflows to contact candidates through permitted communication channels.",
      },
      {
        title: "Capture Qualification Information",
        body: "Organise relevant responses about experience, interest, availability and role requirements.",
      },
      {
        title: "Review Candidate Readiness",
        body: "Make the collected information available for recruiter review.",
      },
      {
        title: "Coordinate the Next Action",
        body: "Support the appropriate recruiter follow-up, interview coordination or further clarification.",
      },
    ],
  },
  useCases: {
    h2: "AI Voice Workflows Built Around Recruitment Agency Operations.",
    cards: [
      {
        title: "Reconnect with Candidates Already in Your Pipeline.",
        body: "Previously sourced candidates may become relevant when a new hiring requirement appears. Huntlo's sourcing and engagement proposition supports a more structured approach to identifying suitable records and collecting updated candidate information — respecting candidate consent, contact permissions and applicable data policies. Suggested path: existing candidate profile → new role → engagement → updated availability.",
      },
      {
        title: "Collect the Information Recruiters Need Before the Next Call.",
        body: "Recurring hiring requirements often involve similar qualification questions. Configured AI voice conversations can help collect relevant information about experience, location preferences, shift availability and joining timelines. Recruiters can then review the information and determine the appropriate next step. Suggested path: role requirements → screening questions → structured responses.",
      },
      {
        title: "Keep Candidate Conversations Connected to the Right Requirement.",
        body: "Staffing agencies frequently work on different client roles at the same time. A structured workflow helps maintain context around which hiring requirement a candidate is being considered for and what information still needs to be reviewed. Suggested path: client requirement cards → candidate conversations → recruiter ownership. Native multi-client workspace features should be confirmed in a product demonstration.",
      },
      {
        title: "Make the Next Candidate Conversation Clear.",
        body: "After initial engagement, candidates may need clarification about interview availability, joining requirements or the next recruitment step. Structured follow-up workflows help teams organise outstanding actions and avoid losing context between conversations. Suggested path: candidate conversation summary → pending action → recruiter follow-up.",
      },
    ],
  },
  productExperience: {
    h2: "See the Candidate Journey, Not Just the Contact List.",
    paragraphs: [
      "A candidate profile tells you what was known at the time it was created. A conversation can provide updated context. A connected workflow helps the recruiter understand what to do next.",
    ],
    worker: "Ananya R.",
    role: "Customer Support Associate",
    location: "Bengaluru",
    shift: "15 days",
    joining: "Awaiting recruiter review",
    conversationSummary:
      "Engagement completed. Qualification information collected for Client A's Customer Support Associate requirement and organised for recruiter review.",
    nextAction: "Review candidate responses",
    fields: [
      { label: "Role", value: "Customer Support Associate" },
      { label: "Client", value: "Client A" },
      { label: "Candidate", value: "Ananya R." },
      { label: "Experience", value: "2 years" },
      { label: "Location", value: "Bengaluru" },
      { label: "Availability", value: "15 days" },
      { label: "Conversation", value: "Completed" },
      { label: "Qualification", value: "Awaiting recruiter review" },
    ],
    timeline: [
      "Candidate identified",
      "Engagement initiated",
      "Qualification information collected",
      "Recruiter review pending",
    ],
    label: "Workflow"
  },
  businessValue: {
    h2: "Make Existing Candidate Relationships More Useful.",
    paragraphs: [
      "Recruitment agencies create value by understanding candidate requirements and connecting the right people with the right opportunities.",
      "Huntlo's AI-powered workflow approach is designed to support that process through structured conversations and clearer information.",
    ],
    cards: [
      {
        title: "Better Candidate Context",
        body: "Organise updated candidate information around the current hiring requirement.",
      },
      {
        title: "More Structured Engagement",
        body: "Connect candidate outreach with qualification and follow-up workflows.",
      },
      {
        title: "Clearer Recruiter Handoffs",
        body: "Give recruiters useful context before they decide the next action.",
      },
    ],
  },
  platformConnection: {
    h2: "One Recruiting Workflow. Connected AI Capabilities.",
    cards: [
      {
        title: "AI Sourcing",
        body: "Discover potential candidates relevant to a hiring requirement.",
        cta: "Explore AI Sourcing",
        href: "/platform/ai-sourcing",
      },
      {
        title: "AI Engagement",
        body: "Connect candidate discovery with configured outreach and communication workflows.",
        cta: "Explore AI Engagement",
        href: "/platform/ai-engagement",
      },
      {
        title: "Huntlo Voice AI",
        body: "Support conversational candidate interactions and information collection.",
        cta: "Explore Huntlo Voice AI",
        href: "/platform/voice-ai",
      },
    ],
  },
  responsible: {
    h2: "Automation Supports Recruiters. It Doesn't Replace Their Judgment.",
    paragraphs: [
      "AI can assist with candidate communication, information collection and workflow coordination. Recruiters remain responsible for evaluating suitability, reviewing candidate information and making consequential hiring decisions.",
      "Candidate data should be used according to applicable privacy requirements, communication permissions and organisational policies.",
    ],
  },
  faqs: {
    h2: "Frequently Asked Questions About AI Voice for Staffing Agencies",
    items: [
      {
        question: "What is AI voice recruiting for staffing agencies?",
        answer:
          "AI voice recruiting uses conversational automation to support candidate engagement, information gathering and recruitment workflows. It can help agencies organise recurring communication around hiring requirements.",
      },
      {
        question: "Can AI voice help staffing agencies reconnect with existing candidates?",
        answer:
          "Configured voice workflows can support outreach to previously sourced candidates when the organisation has appropriate permission to contact them.",
      },
      {
        question: "How does AI candidate qualification work?",
        answer:
          "AI-assisted qualification collects role-relevant information through configured interactions and organises responses for recruiter review.",
      },
      {
        question: "Can AI voice replace recruitment consultants?",
        answer:
          "No. AI can assist with repetitive communication and information collection, while recruiters remain responsible for candidate assessment, client relationships and hiring decisions.",
      },
      {
        question: "Can Huntlo support multiple recruitment requirements?",
        answer:
          "Huntlo's broader workflow positioning addresses recruiting operations. Specific multi-client and multi-role functionality should be confirmed in a product demonstration.",
      },
      {
        question: "How is AI sourcing different from AI engagement?",
        answer:
          "AI sourcing focuses on discovering relevant candidates. AI engagement focuses on initiating and managing candidate communication.",
      },
      {
        question: "What happens after an AI candidate conversation?",
        answer:
          "The relevant responses can be organised for recruiter review and an appropriate next action, subject to the platform's implemented workflow capabilities.",
      },
      {
        question: "Is AI voice recruiting suitable for high-volume hiring?",
        answer:
          "AI-assisted communication can support recurring candidate interactions in high-volume recruitment. Actual capacity and performance should be evaluated through a product demonstration.",
      },
    ],
  },
  finalCta: {
    h2: "Your Candidate Database Has Potential. Start More Meaningful Conversations.",
    body: "Explore how Huntlo connects candidate discovery, AI voice engagement and structured qualification workflows for recruitment agencies.",
    cta: "Book a Huntlo Demo",
    secondaryCta: "Explore AI Sourcing",
    secondaryCtaHref: "/platform/ai-sourcing",
  },
  related: [
    { label: "AI Sourcing", href: "/platform/ai-sourcing" },
    { label: "AI Engagement", href: "/platform/ai-engagement" },
    { label: "Candidate Qualification", href: "/solutions/candidate-qualification" },
    { label: "Huntlo Voice AI", href: "/platform/voice-ai" },
    { label: "Candidate Sourcing", href: "/solutions/candidate-sourcing" },
    { label: "BPO & Support", href: "/industries/bpo-customer-support" },
  ],
  aiAskPrompt: `What is Huntlo AI voice recruiting for staffing agencies on ${STAFFING_RECRUITMENT_PATH} (https://www.huntlo.ai${STAFFING_RECRUITMENT_PATH})? How do AI sourcing, voice engagement and qualification workflows support recruitment agencies?`,
  aiAskTopic: "Huntlo AI voice recruiting for staffing agencies",
};

export function staffingRecruitmentMetadata() {
  return buildPageMetadata({
    title: STAFFING_RECRUITMENT_SEO.title,
    description: STAFFING_RECRUITMENT_SEO.description,
    path: STAFFING_RECRUITMENT_PATH,
    ogImage: OG_IMAGES.solutions,
  });
}

export function staffingRecruitmentPageUrl() {
  return absoluteUrl(STAFFING_RECRUITMENT_PATH);
}
