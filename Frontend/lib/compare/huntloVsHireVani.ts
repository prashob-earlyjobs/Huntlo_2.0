import type { CompareVsCompetitorContent } from "@/lib/compare/compareVsCompetitorTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const HUNTLO_VS_HIRE_VANI_PATH = "/compare/huntlo-vs-hire-vani";

export const HUNTLO_VS_HIRE_VANI_SEO = {
  title: "Huntlo vs Hire Vani | AI Screening for Staffing Agencies",
  description:
    "Compare Huntlo and Hire Vani for AI candidate screening, parallel calling, recruiter shortlists, pricing and staffing workflows.",
  primaryKeyword: "Hire Vani alternative",
  supportingKeywords: [
    "Hire Vani competitors",
    "AI screening software India",
    "AI voice interviewer for staffing agencies",
    "AI recruitment calling",
    "Automated candidate screening",
  ],
} as const;

export const HUNTLO_VS_HIRE_VANI: CompareVsCompetitorContent = {
  path: HUNTLO_VS_HIRE_VANI_PATH,
  seo: HUNTLO_VS_HIRE_VANI_SEO,
  competitorShortName: "Hire Vani",
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Compare", href: "/compare" },
    { name: "Huntlo vs Hire Vani", href: HUNTLO_VS_HIRE_VANI_PATH },
  ],
  hero: {
    eyebrow: "HUNTLO VS HIRE VANI",
    h1: "Huntlo vs Hire Vani: From Screening Calls to Connected Recruiting Workflows.",
    paragraphs: [
      "A candidate list is only useful when recruiters know who is interested, available and relevant to the hiring requirement.",
      "AI screening can help staffing agencies collect that information without manually repeating every introductory conversation.",
      "Hire Vani focuses on candidate-list uploads, automated screening calls and structured shortlists for Indian recruitment teams.",
      "Huntlo brings AI voice into a broader sourcing, engagement and workforce workflow proposition.",
      "This comparison explores the differences that matter when selecting AI recruitment software for a staffing agency.",
    ],
    primaryCta: "Book a Huntlo Demo",
    primaryCtaIsDemo: true,
    secondaryCta: "Explore Huntlo Voice AI",
    secondaryCtaHref: "/platform/voice-ai",
    microcopy: "Compare screening, candidate context and recruiter workflows.",
    huntloVisual: [
      "Candidate List",
      "AI Voice Screening",
      "Qualification Details",
      "Recruiter Review",
      "Next Hiring Action",
    ],
    competitorVisual:
      "Hire Vani — India-focused AI voice screening with spreadsheet uploads, concurrent candidate calling and ranked shortlists described in public materials.",
    panelTitle: "Staffing screening workflow",
    panelSubtitle: "Huntlo vs Hire Vani · list to next action",
    staffingWorkflow: {
      steps: [
        "Candidate List",
        "AI Voice Screening",
        "Qualification Details",
        "Recruiter Review",
        "Next Hiring Action",
      ],
      candidate: "Ananya R.",
      role: "Inside Sales Executive",
      experience: "2 years",
      availability: "15 days",
      status: "Awaiting recruiter review",
    },
  },
  directAnswer: {
    h2: "What Is the Difference Between Huntlo and Hire Vani?",
    intro:
      "Hire Vani is an India-focused AI voice screening platform for staffing agencies. Its public product materials describe spreadsheet uploads, concurrent candidate calling, collection of compensation and notice-period information, and ranked screening results.",
    differences: [
      {
        title: "Hire Vani",
        body: "Particularly relevant when a team wants to automate an existing candidate screening batch with list upload, parallel calling and ranked shortlists.",
      },
      {
        title: "Huntlo",
        body: "Should be evaluated when the requirement extends to connected candidate discovery, engagement and subsequent workforce workflows.",
      },
    ],
    paragraphs: [
      "Huntlo's broader platform positioning connects candidate sourcing, AI engagement, voice conversations and recruitment workflow coordination.",
      "Both platforms should be assessed against their current product capabilities, implementation requirements and total operating costs.",
    ],
  },
  problem: {
    h2: "The Screening Call Is Important. But the Recruiter Still Needs the Next Step.",
    paragraphs: [
      "Consider a staffing agency working on multiple sales and customer support positions.",
      "The agency may already have a spreadsheet containing potential candidates.",
      "Before presenting profiles to clients, recruiters need to confirm experience, current compensation, salary expectations, notice period and interest.",
      "AI voice can support the initial information collection.",
      "But the agency still needs to review responses, clarify missing information, coordinate interviews and maintain context for each client requirement.",
    ],
    cards: [
      {
        title: "Repetitive Screening",
        body: "Recruiters repeatedly ask similar questions across candidate lists.",
      },
      {
        title: "Shortlists Without Full Context",
        body: "A ranking may help prioritise review, but recruiters need to understand the information behind it.",
      },
      {
        title: "Follow-Up Ownership",
        body: "Candidates who need clarification or additional communication require a clear next action.",
      },
    ],
  },
  productOverview: {
    h2: "Comparison Overview: Batch Screening vs Connected Recruiting Workflows.",
    huntlo: {
      title: "Huntlo",
      body: "AI sourcing, engagement and voice conversations connected to recruiting and broader workforce workflow positioning.",
    },
    competitor: {
      title: "Hire Vani",
      body: "India-focused AI voice screening for staffing agencies, centred on candidate-list uploads, concurrent screening calls and ranked shortlists.",
    },
  },
  comparisonMatrix: {
    h2: "Huntlo vs Hire Vani: Detailed Capability Comparison.",
    columns: ["Evaluation Area", "Huntlo", "Hire Vani", "Buyer Consideration"],
    rows: [
      {
        capability: "Primary product focus",
        huntlo:
          "Verified available positioning as voice-powered AI agents for workforce workflows — sourcing, engagement, voice and recruiting coordination.",
        competitor:
          "Described in product positioning as an India-focused AI voice screening platform for staffing agencies.",
        whatToVerify:
          "Whether you need batch screening alone or a broader connected recruiting stack.",
      },
      {
        capability: "Candidate-list upload",
        huntlo: "Confirm current product availability.",
        competitor:
          "Described in public materials as CSV/Excel candidate upload for screening batches.",
        whatToVerify:
          "Supported formats, required fields, validation rules and multi-client list handling.",
      },
      {
        capability: "AI phone screening",
        huntlo:
          "Verified available as AI voice engagement and screening conversations connected to hiring workflows.",
        competitor:
          "Described in product positioning as automated outbound candidate screening calls.",
        whatToVerify:
          "Call quality, Indian accent handling, interruption recovery and recruiter visibility.",
      },
      {
        capability: "Parallel calling",
        huntlo:
          "Described in product positioning around scalable voice engagement; confirm concurrent call capacity for your volume.",
        competitor:
          "Described in public materials as concurrent / parallel candidate screening calls.",
        whatToVerify:
          "Simultaneous call limits, queue behaviour, peak-volume handling and plan constraints.",
      },
      {
        capability: "Compensation information",
        huntlo:
          "Described in product positioning — configured screening conversations can collect compensation expectations; confirm live field capture and review UX.",
        competitor:
          "Described in public materials as collecting CTC / compensation information during screening.",
        whatToVerify:
          "Which compensation fields are captured, how they are stored and whether recruiters can edit them.",
      },
      {
        capability: "Notice-period collection",
        huntlo:
          "Described in product positioning — configured conversations can ask about notice period and joining availability; confirm current field support.",
        competitor:
          "Described in public materials as collecting notice-period information during screening.",
        whatToVerify:
          "Structured capture, validation and how values appear in recruiter shortlists.",
      },
      {
        capability: "Technical screening",
        huntlo: "Confirm current product availability.",
        competitor:
          "Requires vendor confirmation for depth of technical / skills screening beyond standard staffing qualification questions.",
        whatToVerify:
          "Role-specific technical question support, scoring relevance and human review controls.",
      },
      {
        capability: "Candidate scoring",
        huntlo:
          "Described in product positioning around structured qualification context for human review — any scoring should be evaluated for transparency and oversight.",
        competitor:
          "Described in public materials as ranked / scored screening results for recruiter prioritisation.",
        whatToVerify:
          "How scores are calculated, whether they can be overridden and how evidence is shown.",
      },
      {
        capability: "Transcripts and recordings",
        huntlo:
          "Described in product positioning via conversation intelligence and reviewable conversation outcomes; confirm transcript and recording access for your plan.",
        competitor:
          "Requires vendor confirmation for transcript access, recording retention and export options.",
        whatToVerify:
          "Recruiter access, retention policy, export formats and consent handling.",
      },
      {
        capability: "Candidate sourcing",
        huntlo:
          "Verified available as AI sourcing and candidate discovery alongside engagement.",
        competitor:
          "Public positioning centres on screening existing candidate lists; confirm whether sourcing is in-product.",
        whatToVerify:
          "How candidates enter the workflow before the first screening call.",
      },
      {
        capability: "Recruiter follow-ups",
        huntlo:
          "Verified available — workflow positioning connects conversations with recruiter follow-up and next-stage coordination.",
        competitor:
          "Described in product positioning as producing shortlists for recruiter review; confirm post-screen clarification and handoff tools.",
        whatToVerify:
          "Ownership of next actions, clarification loops and multi-client requirement context.",
      },
      {
        capability: "Pricing and billing",
        huntlo:
          "Confirm current product availability for commercial terms — compare connected-minute charges, unanswered-call policy, subscription requirements, setup charges, minimum commitments, billing increments and included features. Do not assume Huntlo is lower-priced without verification.",
        competitor:
          "Described in public materials as usage-based pricing; confirm connected minutes, unanswered-call billing, setup fees, minimums and included features.",
        whatToVerify:
          "Total cost at expected call volume — not only headline per-minute rates.",
      },
    ],
  },
  workflowStory: {
    h2: "From 100 Candidate Records to Clearer Recruiter Decisions.",
    paragraphs: [
      "A staffing agency receives a requirement for customer support executives.",
      "The team identifies a candidate list.",
      "Configured AI voice conversations collect relevant qualification information.",
      "The recruiter reviews candidate responses and identifies missing details.",
      "Suitable candidates move toward client interviews through the agency's existing process.",
      "A useful screening workflow does more than produce a ranked list. It helps recruiters understand what each candidate said, which information still needs clarification and who should handle the next conversation.",
    ],
    steps: [
      "Client requirement",
      "Candidate list",
      "AI voice screening",
      "Recruiter review",
      "Client interviews",
    ],
  },
  whereHuntloFits: {
    h2: "Which Approach Fits Your Staffing Agency?",
    cards: [
      {
        title: "AI sourcing alongside engagement",
        body: "Want to evaluate AI sourcing alongside engagement — not only screen an existing spreadsheet.",
      },
      {
        title: "Voice connected to workflows",
        body: "Need voice conversations connected to recruiting workflows and visible next actions.",
      },
      {
        title: "Multiple AI modules",
        body: "Are exploring multiple AI modules across discovery, engagement and qualification.",
      },
      {
        title: "Hiring to workforce communication",
        body: "Want to assess hiring and later workforce communication in one platform strategy.",
      },
    ],
  },
  whereCompetitorFits: {
    eyebrow: "Buyer fit",
    h2: "When Hire Vani May Fit Your Staffing Agency.",
    paragraphs: [
      "Neither list is an exclusive capability claim. Fit depends on current workflows, feature requirements and commercial terms.",
      "Hire Vani may fit teams that already operate batch screening from existing candidate lists and want usage-based screening costs evaluated carefully.",
    ],
    bullets: [
      "Already have candidate lists",
      "Want batch-based AI screening",
      "Need compensation and notice-period information",
      "Prefer evaluating usage-based screening costs",
    ],
  },
  productExperience: {
    h2: "See the Context Behind a Candidate Screening Result.",
    label: "Recruitment requirement · Customer Support Executive",
    candidate: "Ananya R.",
    role: "Customer Support Executive",
    conversationOutcome: "Conversation completed.",
    qualificationContext: "Pending recruiter review.",
    nextAction: "Clarify salary expectations",
    paragraphs: [
      "A recruiter-ready workflow should preserve relevant information, show the status of the conversation and identify the next action.",
    ],
    fields: [
      { label: "Recruitment requirement", value: "Customer Support Executive" },
      { label: "Candidate", value: "Ananya R." },
      { label: "Experience", value: "2 years" },
      { label: "Current location", value: "Bengaluru" },
      { label: "Joining availability", value: "15 days" },
      { label: "Conversation status", value: "Completed" },
      { label: "Qualification", value: "Pending recruiter review" },
      { label: "Next action", value: "Clarify salary expectations" },
    ],
  },
  buyerChecklist: {
    h2: "Seven Questions to Ask Before Choosing AI Screening Software.",
    items: [
      "How are candidate lists imported?",
      "What information can screening calls collect?",
      "Can recruiters review transcripts?",
      "How is candidate scoring explained?",
      "What happens after the screening call?",
      "How are unanswered calls billed?",
      "Can the workflow support multiple client requirements?",
    ],
  },
  faqs: [
    {
      question: "Is Huntlo an alternative to Hire Vani?",
      answer:
        "Huntlo is relevant for teams evaluating AI voice screening and connected recruitment workflows. Hire Vani focuses on automated screening for Indian staffing agencies. Product fit depends on the specific workflows and features required.",
    },
    {
      question: "Does Hire Vani support parallel candidate calls?",
      answer:
        "Hire Vani publicly describes concurrent outbound candidate screening. Buyers should verify current capacity and plan limits.",
    },
    {
      question: "Can AI collect notice period and expected CTC?",
      answer:
        "Configured screening conversations can ask candidates about notice period and compensation expectations, subject to the platform's available functionality.",
    },
    {
      question: "How should staffing agencies evaluate AI screening scores?",
      answer:
        "Scores should be transparent, relevant to the job and available for recruiter review. They should not automatically determine consequential hiring decisions.",
    },
    {
      question: "Is pay-as-you-go pricing better than a subscription?",
      answer:
        "Neither model is universally better. Compare expected call volume, average duration, failed-call charges, minimum commitments and the total cost of the required workflows.",
    },
    {
      question: "Can AI voice replace recruitment consultants?",
      answer:
        "AI can support repetitive screening and information gathering. Recruitment consultants remain important for client relationships, candidate assessment and hiring decisions.",
    },
    {
      question: "What should agencies test before buying?",
      answer:
        "Test realistic candidate conversations, Indian accents, data accuracy, transcript quality, billing and recruiter handoffs.",
    },
  ],
  finalCta: {
    h2: "Your Candidate List Is the Starting Point. Make Every Next Step Clear.",
    body: "Explore how Huntlo connects AI voice engagement with structured recruiting workflows.",
    cta: "Book a Huntlo Demo",
    secondaryCta: "Explore AI Sourcing",
    secondaryCtaHref: "/platform/ai-sourcing",
  },
  methodology: {
    h2: "Sources and Methodology.",
    paragraphs: [
      "This page compares publicly described positioning for Huntlo and Hire Vani across AI candidate screening, parallel calling, recruiter shortlists, pricing considerations and staffing workflows.",
      "Competitor statements are attributed to public product materials and positioning rather than private demos or unpublished roadmaps.",
      "Huntlo capabilities marked as verified are those reflected in current Huntlo platform and solution materials. Items marked \"Confirm current product availability\" are not claimed as generally available on this page.",
      "No numerical price comparison is published here. Buyers should compare connected-minute charges, unanswered-call policy, subscription requirements, setup charges, minimum commitments, billing increments and included features with both vendors.",
    ],
    lastReviewed: "23 November 2026",
    sourcesNote:
      "Huntlo product positioning from huntlo.ai platform and solution materials. Hire Vani claims attributed to publicly available Hire Vani product and marketing materials describing CSV/Excel upload, concurrent screening calls, CTC and notice-period collection, candidate ranking and usage-based pricing, reviewed as of 23 November 2026.",
  },
  relatedComparisons: [
    { label: "Huntlo vs Recruit Bud AI", href: "/compare/huntlo-vs-recruit-bud-ai" },
    { label: "Huntlo vs Hirin.ai", href: "/compare/huntlo-vs-hirin-ai" },
  ],
  aboutName: "Huntlo vs Hire Vani",
};

export function huntloVsHireVaniMetadata() {
  return {
    ...buildPageMetadata({
      title: HUNTLO_VS_HIRE_VANI_SEO.title,
      description: HUNTLO_VS_HIRE_VANI_SEO.description,
      path: HUNTLO_VS_HIRE_VANI_PATH,
      ogImage: OG_IMAGES.solutions,
    }),
    keywords: [
      HUNTLO_VS_HIRE_VANI_SEO.primaryKeyword,
      ...HUNTLO_VS_HIRE_VANI_SEO.supportingKeywords,
    ],
  };
}

export function huntloVsHireVaniPageUrl() {
  return absoluteUrl(HUNTLO_VS_HIRE_VANI_PATH);
}
