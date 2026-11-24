import type { CompareVsCompetitorContent } from "@/lib/compare/compareVsCompetitorTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const HUNTLO_VS_TENZO_AI_PATH = "/compare/huntlo-vs-tenzo-ai";

export const HUNTLO_VS_TENZO_AI_SEO = {
  title: "Huntlo vs Tenzo AI | AI Interview Comparison",
  description:
    "Compare Huntlo and Tenzo AI for AI phone and video interviews, multilingual screening, recruiter scorecards and hiring workflows.",
  primaryKeyword: "Tenzo AI alternative",
  supportingKeywords: [
    "Tenzo AI competitors",
    "AI interview platform",
    "AI phone interview software",
    "AI video interview software",
    "Automated candidate evaluation",
  ],
} as const;

export const HUNTLO_VS_TENZO_AI: CompareVsCompetitorContent = {
  path: HUNTLO_VS_TENZO_AI_PATH,
  seo: HUNTLO_VS_TENZO_AI_SEO,
  competitorShortName: "Tenzo AI",
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Compare", href: "/compare" },
    { name: "Huntlo vs Tenzo AI", href: HUNTLO_VS_TENZO_AI_PATH },
  ],
  hero: {
    eyebrow: "HUNTLO VS TENZO AI",
    h1: "Huntlo vs Tenzo AI: AI Interviews and the Workflows That Follow.",
    paragraphs: [
      "AI interviews can help recruitment teams gather structured candidate information without requiring a recruiter to conduct every initial conversation.",
      "But interview automation is only one part of the hiring process.",
      "Candidates still need to be engaged, responses reviewed and next steps coordinated.",
      "Tenzo AI offers AI interviews by phone and video, with candidate evaluation and ATS-connected review workflows.",
      "Huntlo connects AI voice with its broader sourcing, engagement and workforce automation proposition.",
      "Compare both approaches through the needs of your recruitment operation.",
    ],
    primaryCta: "Book a Demo",
    primaryCtaIsDemo: true,
    secondaryCta: "Explore Huntlo VoiceAI",
    secondaryCtaHref: "/platform/voice-ai",
    microcopy: "Compare interview formats, evidence quality and recruitment workflows.",
    huntloVisual: [
      "Phone Interview",
      "Video Interview",
      "Structured Candidate Information",
      "Recruiter Review",
      "Next Action",
    ],
    competitorVisual:
      "Tenzo AI — AI phone and video interviews with multilingual candidate experiences, structured scorecards and ATS-connected review described in public materials.",
    panelTitle: "Interview architecture comparison",
    panelSubtitle: "Huntlo vs Tenzo AI · phone and video paths",
    interviewModes: {
      modes: ["Phone Interview", "Video Interview"],
      sharedSteps: [
        "Structured Candidate Information",
        "Recruiter Review",
        "Next Action",
      ],
      evidence: [
        { label: "Communication experience", value: "Customer support examples shared" },
        { label: "Shift availability", value: "Rotational" },
        { label: "Location", value: "Hyderabad" },
        { label: "Joining readiness", value: "30 days" },
      ],
      nextAction: "Review role-specific responses",
      note: "Conceptual comparison — not a product screenshot.",
    },
  },
  directAnswer: {
    h2: "What Is the Difference Between Huntlo and Tenzo AI?",
    intro:
      "Tenzo AI offers AI-powered candidate interviews by phone and video, with structured evaluation and ATS-connected scorecards.",
    differences: [
      {
        title: "Tenzo AI",
        body: "Relevant to teams prioritising automated interviewing and candidate evaluation across phone and video formats.",
      },
      {
        title: "Huntlo",
        body: "Should be evaluated where the requirement includes broader candidate engagement and workforce workflow coordination.",
      },
    ],
    paragraphs: [
      "Huntlo's platform positioning combines AI voice engagement with candidate sourcing, qualification and wider workforce workflows.",
      "The choice depends on supported interview formats, integrations, human oversight and the surrounding recruitment process.",
    ],
  },
  problem: {
    h2: "An Interview Scorecard Is Useful. But It Isn't the Whole Hiring Decision.",
    paragraphs: [
      "A candidate completes an AI interview.",
      "The system produces a summary and evaluation.",
      "The recruiter still needs to understand the candidate's actual responses, review the evidence and decide whether further discussion is appropriate.",
      "If the scorecard is disconnected from the rest of the hiring process, the team may still need manual coordination.",
    ],
    cards: [
      {
        title: "Interview Evidence",
        body: "Recruiters need understandable responses and relevant context.",
      },
      {
        title: "Human Judgment",
        body: "Automated evaluations should not replace accountable hiring decisions.",
      },
      {
        title: "Workflow Continuity",
        body: "Candidate information should support the next stage of recruitment.",
      },
    ],
  },
  productOverview: {
    h2: "AI Interviewing and Workforce Workflow Automation.",
    huntlo: {
      title: "Huntlo",
      body: "AI voice engagement, sourcing and workforce workflow positioning.",
    },
    competitor: {
      title: "Tenzo AI",
      body: "AI phone and video interviews, multilingual candidate experiences and structured scorecards.",
    },
  },
  comparisonMatrix: {
    h2: "Huntlo vs Tenzo AI: Detailed AI Interview Comparison.",
    columns: ["Evaluation Area", "Huntlo", "Tenzo AI", "Buyer Consideration"],
    rows: [
      {
        capability: "AI phone interviews",
        huntlo:
          "Verified available as AI voice engagement and screening conversations connected to hiring workflows.",
        competitor:
          "Described in public materials as AI interviews by phone with structured evaluation and evidence.",
        whatToVerify:
          "Conversation quality, candidate completion rates and recruiter access to evidence.",
      },
      {
        capability: "AI video interviews",
        huntlo: "Confirm current product availability — do not assume video interviewing is available.",
        competitor:
          "Described in public materials as AI interviews by video in addition to phone.",
        whatToVerify:
          "Whether video interviewing is a hard requirement for your roles and markets.",
      },
      {
        capability: "Multilingual support",
        huntlo:
          "Described in product positioning around multilingual voice engagement; confirm supported languages for your candidate base.",
        competitor:
          "Described in public materials as multilingual candidate interviews across a broad language set.",
        whatToVerify:
          "Exact languages, dialect coverage and candidate experience quality in each language.",
      },
      {
        capability: "Interview configuration",
        huntlo:
          "Described in product positioning as configured conversations; confirm role criteria, approval flow and maintenance.",
        competitor:
          "Described in public materials as criteria-driven interview drafting with recruiter approval before going live.",
        whatToVerify:
          "How questions and scoring criteria are created, reviewed and updated.",
      },
      {
        capability: "Candidate experience",
        huntlo:
          "Described in product positioning around accessible voice conversations connected to next actions.",
        competitor:
          "Described in public materials as phone, video or text interviews without requiring an app download.",
        whatToVerify:
          "Completion friction, consent/disclosure and candidate communication clarity.",
      },
      {
        capability: "Scorecards",
        huntlo:
          "Described in product positioning around structured qualification context for human review — any scoring should be evaluated for transparency and oversight.",
        competitor:
          "Described in public materials as structured scorecards with evidence written back to the ATS.",
        whatToVerify:
          "How scores are calculated, explained and overridden by recruiters.",
      },
      {
        capability: "Interview evidence",
        huntlo:
          "Described in product positioning via conversation intelligence and reviewable conversation outcomes.",
        competitor:
          "Described in public materials as scores backed by what the candidate said, available for recruiter review.",
        whatToVerify:
          "Whether recruiters can inspect original answers behind every evaluation signal.",
      },
      {
        capability: "ATS integration",
        huntlo: "Confirm current product availability for your ATS stack.",
        competitor:
          "Described in public materials as ATS-connected scorecards and write-back across a broad ATS/HRIS catalogue.",
        whatToVerify:
          "Supported ATS products, sync behaviour, access controls and implementation effort.",
      },
      {
        capability: "Candidate sourcing",
        huntlo:
          "Verified available as AI sourcing and candidate discovery alongside engagement.",
        competitor:
          "Public positioning centres on interviewing applicants and related agents; confirm sourcing coverage separately.",
        whatToVerify:
          "Whether discovery of new candidates is required beyond interviewing applicants already in flow.",
      },
      {
        capability: "Candidate engagement",
        huntlo:
          "Verified available as AI engagement connected to voice and hiring workflows.",
        competitor:
          "Described in public materials around interview invitations, concierge-style communication and related agents; confirm breadth for your funnel.",
        whatToVerify:
          "Pre-interview and post-interview engagement ownership across channels.",
      },
      {
        capability: "Recruiter review",
        huntlo:
          "Verified available — workflow positioning connects conversations with recruiter review and next-stage coordination.",
        competitor:
          "Described in public materials as recruiter review of shortlists, scorecards and evidence inside the ATS.",
        whatToVerify:
          "How quickly recruiters can move from scorecard to evidence to a hiring decision.",
      },
      {
        capability: "Post-interview workflows",
        huntlo:
          "Verified available as connected recruitment and broader workforce workflow positioning.",
        competitor:
          "Described in public materials as ATS write-back plus related agents for scheduling and adjacent recruiting tasks; confirm end-to-end ownership.",
        whatToVerify:
          "What happens after interview completion — clarification, scheduling, offer prep or handoff.",
      },
    ],
  },
  workflowStory: {
    h2: "From Candidate Interview to a More Informed Recruiter Decision.",
    paragraphs: [
      "A company is hiring customer support associates.",
      "Candidates complete structured initial interviews.",
      "The organisation needs information about communication experience, shift availability, location and joining readiness.",
      "The recruiter reviews the responses and determines whether to schedule another interview, request clarification or take another appropriate action.",
      "The value of an AI interview is not just the completion of the conversation. It is the ability to give human teams useful evidence and maintain a clear recruitment process afterward.",
    ],
    steps: [
      "Interview invite",
      "Phone or video interview",
      "Structured evidence",
      "Recruiter review",
      "Next hiring action",
    ],
  },
  whereHuntloFits: {
    h2: "Where Huntlo Fits Interview and Hiring Teams.",
    cards: [
      {
        title: "Voice beyond the interview",
        body: "Need AI voice engagement connected to sourcing, qualification and later workforce workflows.",
      },
      {
        title: "Evidence with next actions",
        body: "Want candidate responses organised for recruiter review and clear follow-up ownership.",
      },
      {
        title: "Broader funnel coverage",
        body: "Are evaluating discovery and engagement alongside initial interviewing.",
      },
      {
        title: "Human oversight",
        body: "Prefer conversation context that supports accountable hiring decisions rather than scores alone.",
      },
    ],
  },
  whereCompetitorFits: {
    eyebrow: "Buyer fit",
    h2: "When Tenzo AI May Be a Strong Fit.",
    paragraphs: [
      "Tenzo AI is relevant to teams seeking automated interviews across phone and video formats.",
      "Its public materials describe multilingual candidate experiences, structured scorecards and ATS-connected review.",
      "Buyers should assess interview configuration, candidate experience, scoring transparency, integrations and human oversight.",
    ],
  },
  productExperience: {
    h2: "Give Recruiters Context, Not Just a Score.",
    label: "Interview evidence · Customer Support Associate",
    candidate: "Sneha K.",
    role: "Customer Support Associate",
    conversationOutcome: "Conversation completed.",
    qualificationContext: "Pending recruiter decision.",
    nextAction: "Review role-specific responses",
    paragraphs: [
      "Recruiters should see the candidate's answers and context before deciding the next hiring step — not only a summary label.",
    ],
    fields: [
      { label: "Candidate", value: "Sneha K." },
      { label: "Role", value: "Customer Support Associate" },
      { label: "Experience", value: "3 years" },
      { label: "Shift availability", value: "Rotational" },
      { label: "Joining timeline", value: "30 days" },
      { label: "Conversation", value: "Completed" },
      { label: "Review", value: "Pending recruiter decision" },
      { label: "Next action", value: "Review role-specific responses" },
    ],
    transcript: [
      {
        speaker: "AI interviewer",
        text: "Tell me about a time you handled a difficult customer request.",
      },
      {
        speaker: "Candidate",
        text: "I calmed the customer, confirmed the issue and resolved the ticket within the same shift.",
      },
      {
        speaker: "AI interviewer",
        text: "Which shifts can you work, and when could you join?",
      },
      {
        speaker: "Candidate",
        text: "I can work rotational shifts and join in about thirty days.",
      },
    ],
  },
  buyerChecklist: {
    h2: "Seven Questions to Ask Before Choosing an AI Interview Platform.",
    items: [
      "Are phone interviews sufficient, or is video required?",
      "Which languages are supported?",
      "Can interview questions be customised?",
      "Can recruiters inspect the evidence behind scores?",
      "What ATS integrations are available?",
      "How are candidate consent and disclosure handled?",
      "What happens after an interview is completed?",
    ],
  },
  faqs: [
    {
      question: "What is Tenzo AI?",
      answer:
        "Tenzo AI is an AI interviewing platform offering phone and video interviews with structured candidate evaluation.",
    },
    {
      question: "Is Huntlo an alternative to Tenzo AI?",
      answer:
        "Huntlo is relevant to teams evaluating AI voice engagement and recruitment workflows. Tenzo is particularly relevant where phone and video interviewing are central requirements.",
    },
    {
      question: "Does Tenzo support video interviews?",
      answer:
        "Yes. Tenzo's public product materials describe AI interviews by both phone and video.",
    },
    {
      question: "Can AI interviews support multiple languages?",
      answer:
        "Yes, some platforms support multilingual interviews. Buyers should verify the specific languages and candidate experience available in each product.",
    },
    {
      question: "Are AI interview scores enough to make hiring decisions?",
      answer:
        "No. Automated evaluations should support human review and should be assessed for relevance, transparency and fairness.",
    },
    {
      question: "What should teams check about ATS integration?",
      answer:
        "Supported ATS products, data synchronisation, access controls, implementation requirements and the ability to review original interview evidence.",
    },
    {
      question: "How should companies compare AI interviewing tools?",
      answer:
        "Evaluate conversation quality, candidate accessibility, evidence quality, workflow integration, human oversight and total operating cost.",
    },
  ],
  finalCta: {
    h2: "Make Every Candidate Conversation Useful Beyond the Interview.",
    body: "Explore Huntlo's approach to AI voice engagement and connected recruitment workflows.",
    cta: "Book a Huntlo Demo",
    secondaryCta: "Explore AI Hiring Agents",
    secondaryCtaHref: "/solutions/ai-hiring-agents",
  },
  methodology: {
    h2: "Sources and Methodology.",
    paragraphs: [
      "This page compares publicly described positioning for Huntlo and Tenzo AI across AI phone and video interviews, multilingual screening, recruiter scorecards and hiring workflows.",
      "Competitor statements are attributed to public product materials and positioning rather than private demos or unpublished roadmaps.",
      "Tenzo's documented phone and video interview capabilities are acknowledged. Huntlo is not claimed to support video interviewing on this page without verification.",
      "Huntlo capabilities marked as verified are those reflected in current Huntlo platform and solution materials. Items marked \"Confirm current product availability\" are not claimed as generally available on this page.",
      "No suitability scores or fabricated evaluation percentages are published in the product experience examples.",
    ],
    lastReviewed: "23 November 2026",
    sourcesNote:
      "Huntlo product positioning from huntlo.ai platform and solution materials. Tenzo AI claims attributed to publicly available Tenzo product materials at tenzo.ai/platform/ai-interviewer describing phone and video AI interviews, multilingual experiences, scorecards and ATS-connected review, reviewed as of 23 November 2026.",
  },
  relatedComparisons: [
    { label: "Huntlo vs Classet Joy", href: "/compare/huntlo-vs-classet" },
    { label: "Huntlo vs Mishuk Labs", href: "/compare/huntlo-vs-mishuk-labs" },
  ],
  aboutName: "Huntlo vs Tenzo AI",
};

export function huntloVsTenzoAiMetadata() {
  return {
    ...buildPageMetadata({
      title: HUNTLO_VS_TENZO_AI_SEO.title,
      description: HUNTLO_VS_TENZO_AI_SEO.description,
      path: HUNTLO_VS_TENZO_AI_PATH,
      ogImage: OG_IMAGES.solutions,
    }),
    keywords: [
      HUNTLO_VS_TENZO_AI_SEO.primaryKeyword,
      ...HUNTLO_VS_TENZO_AI_SEO.supportingKeywords,
    ],
  };
}

export function huntloVsTenzoAiPageUrl() {
  return absoluteUrl(HUNTLO_VS_TENZO_AI_PATH);
}
