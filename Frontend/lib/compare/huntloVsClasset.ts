import type { CompareVsCompetitorContent } from "@/lib/compare/compareVsCompetitorTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const HUNTLO_VS_CLASSET_PATH = "/compare/huntlo-vs-classet";

export const HUNTLO_VS_CLASSET_SEO = {
  title: "Huntlo vs Classet Joy | AI Phone Interviews",
  description:
    "Compare Huntlo and Classet Joy for AI phone interviews, frontline hiring, ATS integration, candidate follow-ups and workforce workflows.",
  primaryKeyword: "Classet alternative",
  supportingKeywords: [
    "Classet Joy competitors",
    "AI phone interviews",
    "Frontline hiring automation",
    "AI recruitment software",
    "High-volume hiring AI",
  ],
} as const;

export const HUNTLO_VS_CLASSET: CompareVsCompetitorContent = {
  path: HUNTLO_VS_CLASSET_PATH,
  seo: HUNTLO_VS_CLASSET_SEO,
  competitorShortName: "Classet Joy",
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Compare", href: "/compare" },
    { name: "Huntlo vs Classet Joy", href: HUNTLO_VS_CLASSET_PATH },
  ],
  hero: {
    eyebrow: "HUNTLO VS CLASSET JOY",
    h1: "Huntlo vs Classet Joy: AI Phone Interviews for High-Volume Hiring.",
    paragraphs: [
      "High-volume hiring teams need to reach candidates while they are still interested.",
      "For frontline and skilled-trades roles, candidates may prefer a simple phone conversation over a lengthy application or interview process.",
      "Classet's Joy conducts AI phone interviews and connects interview results to recruiter workflows.",
      "Huntlo brings voice-powered engagement into its broader sourcing and workforce automation strategy.",
      "This comparison helps hiring teams evaluate the candidate experience, recruiter workflow and operating requirements behind both approaches.",
    ],
    primaryCta: "Book a Demo",
    primaryCtaIsDemo: true,
    secondaryCta: "Explore AI Hiring Agents",
    secondaryCtaHref: "/solutions/ai-hiring-agents",
    microcopy: "Compare phone-first interviews, recruiter review and workforce workflows.",
    huntloVisual: [
      "Candidate Application",
      "AI Phone Interview",
      "Structured Answers",
      "Recruiter Review",
      "Next Action",
    ],
    competitorVisual:
      "Classet Joy — AI phone interviews for high-volume and frontline hiring, with ATS Sync, Hiring Hub, scheduling and Call to Apply described in public materials.",
    panelTitle: "Frontline phone interview journey",
    panelSubtitle: "Huntlo vs Classet Joy · application to next action",
    frontlineInterview: {
      steps: [
        "Candidate Application",
        "AI Phone Interview",
        "Structured Answers",
        "Recruiter Review",
        "Next Action",
      ],
      candidate: "Rahul M.",
      role: "Warehouse Associate",
      responses: [
        { label: "Experience", value: "2 years warehouse operations" },
        { label: "Shift availability", value: "Rotational shifts acceptable" },
        { label: "Location", value: "Bengaluru" },
        { label: "Joining timeline", value: "15 days" },
      ],
      status: "Interview completed",
      nextAction: "Recruiter review",
    },
  },
  directAnswer: {
    h2: "How Does Huntlo Compare with Classet Joy?",
    intro:
      "Classet Joy is an AI recruiter designed around phone interviews and high-volume hiring. Classet also offers ATS Sync, Hiring Hub, candidate insights, scheduling and Call to Apply.",
    differences: [
      {
        title: "Classet Joy",
        body: "Particularly relevant when the first interview and frontline candidate experience are central buying requirements.",
      },
      {
        title: "Huntlo",
        body: "Should be evaluated where the organisation also wants to assess sourcing, engagement and wider workforce communication workflows.",
      },
    ],
    paragraphs: [
      "Huntlo's broader positioning combines AI voice engagement with sourcing, qualification and workforce workflows.",
      "Buyers should compare candidate accessibility, interview configuration, ATS requirements, recruiter review and the surrounding hiring process.",
    ],
  },
  problem: {
    h2: "Frontline Candidates Don't Always Follow a Traditional Interview Process.",
    paragraphs: [
      "A warehouse worker may be on shift.",
      "A retail associate may have limited time between work and travel.",
      "A technician may be unavailable during standard office hours.",
      "These realities can make conventional recruiter-led screening difficult to coordinate.",
      "Phone-based interviews offer an alternative way to collect relevant information.",
      "But teams still need a clear process for reviewing responses, communicating next steps and progressing candidates appropriately.",
    ],
    cards: [
      {
        title: "Candidate Accessibility",
        body: "The interview experience should fit the candidate's circumstances.",
      },
      {
        title: "Consistent Screening",
        body: "Questions should be relevant to the role and applied appropriately.",
      },
      {
        title: "Recruiter Review",
        body: "Human teams need understandable information before progressing applicants.",
      },
    ],
  },
  productOverview: {
    h2: "Comparing AI Phone Interviews and Connected Workforce Workflows.",
    huntlo: {
      title: "Huntlo",
      body: "AI voice engagement, candidate sourcing and workforce workflow positioning.",
    },
    competitor: {
      title: "Classet Joy",
      body: "Phone-first AI interviews, candidate follow-ups and recruiter review, with additional ATS and hiring workflow products.",
    },
  },
  comparisonMatrix: {
    h2: "Huntlo vs Classet Joy: What Should High-Volume Employers Compare?",
    columns: ["Evaluation Area", "Huntlo", "Classet Joy", "Buyer Consideration"],
    rows: [
      {
        capability: "AI phone interviews",
        huntlo:
          "Verified available as AI voice engagement and screening conversations connected to hiring workflows.",
        competitor:
          "Described in public materials as Joy AI phone interviews for high-volume hiring, including nights and weekends.",
        whatToVerify:
          "Call quality, candidate accessibility outside office hours and recruiter review of summaries.",
      },
      {
        capability: "Frontline hiring focus",
        huntlo:
          "Described in product positioning for high-volume and frontline workforce conversations; confirm role coverage for your hiring mix.",
        competitor:
          "Public positioning centres on staffing, skilled trades, healthcare, manufacturing, logistics and other frontline hiring.",
        whatToVerify:
          "Fit for hourly, shift-based and skilled-trades roles in your organisation.",
      },
      {
        capability: "Candidate accessibility",
        huntlo:
          "Described in product positioning around voice conversations candidates can complete without complex process friction; confirm channel options.",
        competitor:
          "Described in public materials as phone interviews candidates can complete around their day, without requiring an app install.",
        whatToVerify:
          "Whether candidates can finish interviews without apps, forms or fixed office-hour slots.",
      },
      {
        capability: "Interview configuration",
        huntlo:
          "Described in product positioning as configured screening conversations; confirm role-specific question design and review controls.",
        competitor:
          "Described in public materials as configurable questions, must-haves and job details that Joy follows during the call.",
        whatToVerify:
          "How role-specific scripts are built, approved and maintained across sites.",
      },
      {
        capability: "Candidate transcripts",
        huntlo:
          "Described in product positioning via conversation intelligence and reviewable conversation outcomes; confirm transcript and recording access.",
        competitor:
          "Described in public materials as summaries, transcripts and recordings available for recruiter review, including ATS write-back via ATS Sync.",
        whatToVerify:
          "Where transcripts and recordings live, retention policy and recruiter access.",
      },
      {
        capability: "ATS integration",
        huntlo: "Confirm current product availability for your ATS stack.",
        competitor:
          "Described in public materials as ATS Sync connecting Joy interviews with existing ATS workflows, alongside Classet Hiring Hub for teams without an ATS.",
        whatToVerify:
          "Supported ATS systems, sync direction, setup timeline and write-back fields.",
      },
      {
        capability: "Candidate insights",
        huntlo:
          "Described in product positioning around structured qualification context; confirm aggregate insight views for your plan.",
        competitor:
          "Described in public materials as structured answers and candidate insights across the applicant pool.",
        whatToVerify:
          "Which structured fields and pool-level insights are available for TA analysis.",
      },
      {
        capability: "Scheduling",
        huntlo:
          "Described in product positioning around interview scheduling and hiring coordination; confirm current product availability.",
        competitor:
          "Described in public materials as scheduling for qualified candidates, including group or one-on-one interviews with confirmations and reminders.",
        whatToVerify:
          "Booking flow, calendar ownership and how scheduling connects after the phone interview.",
      },
      {
        capability: "Call to Apply",
        huntlo: "Confirm current product availability.",
        competitor:
          "Described in public materials as Call to Apply — a hiring phone number that lets candidates talk with Joy instead of completing a form.",
        whatToVerify:
          "Whether phone-based application entry is required for your sourcing channels.",
      },
      {
        capability: "Candidate sourcing",
        huntlo:
          "Verified available as AI sourcing and candidate discovery alongside engagement.",
        competitor:
          "Public positioning centres on interviewing and converting applicants from ATS, career pages, job boards and Call to Apply; confirm sourcing needs separately.",
        whatToVerify:
          "Whether you need discovery of new candidates or mainly conversion of existing applicants.",
      },
      {
        capability: "Recruiter oversight",
        huntlo:
          "Verified available — workflow positioning connects conversations with recruiter review and next-stage coordination.",
        competitor:
          "Described in public materials as recruiter review of summaries, transcripts and fit signals; hiring decisions remain with people.",
        whatToVerify:
          "How strongly automated signals influence progression and how easily recruiters can override them.",
      },
      {
        capability: "Onboarding coordination",
        huntlo:
          "Verified available as broader workforce workflow positioning including onboarding-related agents and coordination.",
        competitor:
          "Public materials emphasise interview, follow-up and hiring workflow products; confirm post-offer and onboarding coverage separately.",
        whatToVerify:
          "Whether you need interview automation alone or connected post-hire workforce workflows.",
      },
    ],
  },
  workflowStory: {
    h2: "A Warehouse Candidate Shouldn't Need a Complicated Process to Be Heard.",
    paragraphs: [
      "A warehouse candidate applies for a shift-based role.",
      "The employer needs to understand relevant experience, location, shift availability, joining timeline and required certifications.",
      "The candidate completes a structured conversation.",
      "The recruiter reviews the responses and determines the appropriate next step.",
      "The goal is not to remove the recruiter from hiring. It is to make candidate information available in a way that supports timely, informed decisions.",
    ],
    steps: [
      "Application",
      "Phone interview",
      "Structured answers",
      "Recruiter review",
      "Next action",
    ],
  },
  whereHuntloFits: {
    h2: "Where Huntlo Fits High-Volume Hiring Teams.",
    cards: [
      {
        title: "Voice with sourcing",
        body: "Want AI voice engagement alongside candidate discovery — not only phone interviews of existing applicants.",
      },
      {
        title: "Connected workflows",
        body: "Need conversations connected to qualification context and visible next hiring actions.",
      },
      {
        title: "Broader workforce scope",
        body: "Are assessing hiring and later workforce communication in one platform strategy.",
      },
      {
        title: "Agent-led hiring ops",
        body: "Want to explore AI hiring agents across screening, coordination and follow-ups.",
      },
    ],
  },
  whereCompetitorFits: {
    eyebrow: "Buyer fit",
    h2: "When Classet Joy May Be a Strong Fit.",
    paragraphs: [
      "Classet is particularly relevant to teams hiring frontline, hourly and skilled-trades workers.",
      "Its public product offering includes AI phone interviews, ATS-connected workflows, a hiring workspace, candidate insights, scheduling and phone-based application entry.",
      "Buyers should examine the candidate experience, ATS requirements, deployment model and total cost of the relevant Classet products.",
    ],
  },
  productExperience: {
    h2: "See the Candidate's Answers Before the Next Conversation.",
    label: "Frontline hiring · Warehouse Associate",
    candidate: "Rahul M.",
    role: "Warehouse Associate",
    conversationOutcome: "Conversation completed.",
    qualificationContext: "Structured answers ready for recruiter review.",
    nextAction: "Recruiter review",
    paragraphs: [
      "A useful interview summary preserves role-specific answers and makes the next hiring action clear for the recruiter.",
    ],
    fields: [
      { label: "Candidate", value: "Rahul M." },
      { label: "Role", value: "Warehouse Associate" },
      { label: "Experience", value: "2 years" },
      { label: "Shift availability", value: "Rotational shifts acceptable" },
      { label: "Location", value: "Bengaluru" },
      { label: "Joining timeline", value: "15 days" },
      { label: "Conversation", value: "Completed" },
      { label: "Next action", value: "Recruiter review" },
    ],
    transcript: [
      {
        speaker: "AI interviewer",
        text: "Can you share your warehouse experience and the shifts you can work?",
      },
      {
        speaker: "Candidate",
        text: "I have two years in warehouse operations and can work rotational shifts.",
      },
      {
        speaker: "AI interviewer",
        text: "Where are you based, and how soon can you join if selected?",
      },
      {
        speaker: "Candidate",
        text: "I am in Bengaluru and can join in about fifteen days.",
      },
    ],
  },
  buyerChecklist: {
    h2: "Seven Questions to Ask Before Choosing AI Phone Interview Software.",
    items: [
      "Can candidates complete interviews without installing an app?",
      "Are phone interviews available outside working hours?",
      "How are role-specific questions configured?",
      "Can recruiters review recordings and transcripts?",
      "Which ATS systems are supported?",
      "How are interview follow-ups handled?",
      "What happens after the candidate passes screening?",
    ],
  },
  faqs: [
    {
      question: "What is Classet Joy?",
      answer:
        "Joy is Classet's AI recruiter for conducting first-round phone interviews and supporting candidate communication.",
    },
    {
      question: "Is Huntlo an alternative to Classet?",
      answer:
        "Huntlo is relevant to teams comparing AI voice recruitment and broader workforce workflows. Classet is particularly relevant to high-volume phone interviewing.",
    },
    {
      question: "Does Classet integrate with ATS platforms?",
      answer:
        "Yes. Classet describes ATS Sync as a way to connect AI interviews with existing applicant tracking systems.",
    },
    {
      question: "Can frontline candidates interview by phone?",
      answer:
        "Yes. Phone-based interviews can provide an accessible option for candidates who cannot attend a conventional screening call at a fixed time.",
    },
    {
      question: "Does Classet offer scheduling?",
      answer:
        "Classet publicly describes interview scheduling as part of its broader hiring workflow offering.",
    },
    {
      question: "Can AI interviews replace human recruiters?",
      answer:
        "AI can support first-round information collection, but recruiters should retain oversight of hiring decisions.",
    },
    {
      question: "What matters most in high-volume hiring?",
      answer:
        "Candidate accessibility, timely engagement, consistent questions, clear review processes and reliable next-step coordination.",
    },
  ],
  finalCta: {
    h2: "Make the First Conversation Easier. Keep the Hiring Journey Connected.",
    body: "Explore how Huntlo brings AI voice engagement into broader recruitment and workforce workflows.",
    cta: "Book a Huntlo Demo",
    secondaryCta: "Explore Huntlo VoiceAI",
    secondaryCtaHref: "/platform/voice-ai",
  },
  methodology: {
    h2: "Sources and Methodology.",
    paragraphs: [
      "This page compares publicly described positioning for Huntlo and Classet Joy across AI phone interviews, frontline hiring, ATS integration, candidate follow-ups and workforce workflows.",
      "Competitor statements are attributed to public product materials and positioning rather than private demos or unpublished roadmaps.",
      "Classet capabilities acknowledged from public materials include Joy AI phone interviews, ATS Sync, Hiring Hub, candidate insights, scheduling and Call to Apply. Classet is not described here as a phone-interview-only product.",
      "Huntlo capabilities marked as verified are those reflected in current Huntlo platform and solution materials. Items marked \"Confirm current product availability\" are not claimed as generally available on this page.",
      "Public Classet commercial figures such as Hiring Hub and ATS Sync starting prices are not republished as a Huntlo price comparison. Buyers should verify current pricing, included interviews and plan terms directly.",
    ],
    lastReviewed: "23 November 2026",
    sourcesNote:
      "Huntlo product positioning from huntlo.ai platform and solution materials. Classet Joy claims attributed to publicly available Classet product and marketing materials at classet.ai describing Joy phone interviews, ATS Sync, Hiring Hub, candidate insights, scheduling and Call to Apply, reviewed as of 23 November 2026.",
  },
  relatedComparisons: [
    { label: "Huntlo vs Tenzo AI", href: "/compare/huntlo-vs-tenzo-ai" },
    { label: "Huntlo vs ConverzAI", href: "/compare/huntlo-vs-converzai" },
  ],
  aboutName: "Huntlo vs Classet Joy",
};

export function huntloVsClassetMetadata() {
  return {
    ...buildPageMetadata({
      title: HUNTLO_VS_CLASSET_SEO.title,
      description: HUNTLO_VS_CLASSET_SEO.description,
      path: HUNTLO_VS_CLASSET_PATH,
      ogImage: OG_IMAGES.solutions,
    }),
    keywords: [
      HUNTLO_VS_CLASSET_SEO.primaryKeyword,
      ...HUNTLO_VS_CLASSET_SEO.supportingKeywords,
    ],
  };
}

export function huntloVsClassetPageUrl() {
  return absoluteUrl(HUNTLO_VS_CLASSET_PATH);
}
