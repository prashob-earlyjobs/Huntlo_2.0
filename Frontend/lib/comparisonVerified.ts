import type { ComparisonSource, VerifiedComparisonPage } from "./comparisonTypes";

/** Competitor rows are re-checked against first-party sources at least this often. */
export const COMPARISON_REVIEW_INTERVAL_DAYS = 90;

const REVIEWED = "2026-11-13";

function huntloPage(id: string, title: string, url: string): ComparisonSource {
  return { id, title, publisher: "Huntlo", url, accessed: REVIEWED };
}

const HUNTLO = {
  sourcing: huntloPage("huntlo-sourcing", "AI Candidate Sourcing", "/capabilities/ai-candidate-sourcing"),
  screening: huntloPage("huntlo-screening", "AI Candidate Screening", "/capabilities/ai-candidate-screening"),
  outreach: huntloPage("huntlo-outreach", "AI Candidate Outreach", "/capabilities/ai-candidate-outreach"),
  voice: huntloPage("huntlo-voice", "AI Voice Interviews", "/capabilities/ai-voice-interviews"),
  scheduling: huntloPage("huntlo-scheduling", "AI Interview Scheduling", "/capabilities/ai-interview-scheduling"),
  automation: huntloPage(
    "huntlo-automation",
    "Recruitment Workflow Automation",
    "/capabilities/recruitment-workflow-automation",
  ),
  autonomous: huntloPage("huntlo-autonomous", "Autonomous Recruiting", "/autonomous-recruiting"),
  talentPool: huntloPage("huntlo-talent-pool", "AI Talent Pool Management", "/capabilities/ai-talent-pool-management"),
  analytics: huntloPage("huntlo-analytics", "AI Recruitment Analytics", "/capabilities/ai-recruitment-analytics"),
  integrations: huntloPage("huntlo-integrations", "Integrations", "/integrations"),
} satisfies Record<string, ComparisonSource>;

const NOT_DESCRIBED = (vendor: string) => `Not described in the ${vendor} materials reviewed; confirm with ${vendor}`;

export function verifiedComparison(slug: string): VerifiedComparisonPage {
  const page = VERIFIED_COMPARISON_PAGES.find((item) => item.slug === slug);
  if (!page) throw new Error(`Missing verified comparison page: ${slug}`);
  return page;
}

const VERIFIED_COMPARISON_PAGES: VerifiedComparisonPage[] = [
  {
    layout: "verified",
    slug: "juicebox",
    name: "Juicebox",
    shortName: "Juicebox",
    metaTitle: "Huntlo vs Juicebox: Agentic Sourcing and Hiring Workflow Compared | Huntlo",
    metaDescription:
      "Compare Huntlo and Juicebox. Juicebox centres on AI candidate discovery, agentic sourcing and outreach; Huntlo continues into screening, voice interviews and scheduling.",
    ogDescription:
      "A sourced, dated comparison of Juicebox's agentic sourcing and outreach with Huntlo's hiring workflow from sourcing to scheduling.",
    breadcrumbLabel: "Huntlo vs Juicebox",
    webPageName: "Huntlo vs Juicebox",
    webPageDescription:
      "A side-by-side comparison of Juicebox's AI candidate discovery and outreach platform and Huntlo's hiring workflow, with sources for every claim.",
    geoAskTopic: "comparing Huntlo and Juicebox",
    geoAskLabelTemplate: "Ask {platform} to compare Huntlo and Juicebox",
    geoAskPrompt:
      "Compare Huntlo (https://huntlo.ai/compare/juicebox) and Juicebox for AI recruiting. How do they differ on candidate discovery, outreach, screening, interviews and scheduling?",
    headline: "Huntlo vs Juicebox",
    intro: [
      "Juicebox is an AI recruiting platform centred on candidate discovery, agentic sourcing and outreach. Its own materials describe autonomous AI agents that search across multiple sources, adapt from recruiter feedback and keep working over longer time horizons.",
      "Huntlo overlaps on sourcing and outreach. This page differentiates Huntlo only on capabilities documented on its own product pages: criteria-based screening, preliminary voice interviews, interview scheduling and workflow automation.",
    ],
    verdict:
      "Choose Juicebox if continuous, agent-led candidate discovery and outreach is the main job. Choose Huntlo if you want sourcing and outreach to continue into screening, voice interviews and scheduling in the same workflow. Many teams test both on one live role.",
    lastReviewed: REVIEWED,
    bestFor: {
      huntlo: "Sourcing through screening, voice interviews and scheduling",
      competitor: "Agentic candidate discovery and outreach",
    },
    featureComparison: [
      {
        capability: "Core focus",
        huntlo: "A hiring workflow from sourcing and outreach through screening, voice interviews and scheduling",
        competitor: "AI recruiting platform centred on candidate discovery, agentic sourcing and outreach",
        huntloSource: HUNTLO.automation.id,
        competitorSource: "juicebox-about",
      },
      {
        capability: "AI candidate sourcing",
        huntlo: "Yes. Intent-driven discovery of active and passive candidates",
        competitor: "Yes. AI agents search across multiple sources and adapt from feedback",
        huntloSource: HUNTLO.sourcing.id,
        competitorSource: "juicebox-about",
      },
      {
        capability: "Continuous, autonomous sourcing",
        huntlo: "Recruiter-led searches; workflow rules automate the steps that follow",
        competitor: "Yes. Described as autonomous agents that keep discovering candidates over time",
        huntloSource: HUNTLO.automation.id,
        competitorSource: "juicebox-about",
      },
      {
        capability: "Automated outreach",
        huntlo: "Yes. Personalised email and WhatsApp outreach with automated follow-ups",
        competitor: "Yes. Automated outreach is part of the platform",
        huntloSource: HUNTLO.outreach.id,
        competitorSource: "juicebox-about",
      },
      {
        capability: "Screening against role criteria",
        huntlo: "Yes. Criteria-based evaluation that recruiters review",
        competitor: NOT_DESCRIBED("Juicebox"),
        huntloSource: HUNTLO.screening.id,
        competitorSource: "juicebox-about",
      },
      {
        capability: "Preliminary interviews",
        huntlo: "Yes. Structured AI voice screens with transcripts and summaries; async video screening is also available",
        competitor: NOT_DESCRIBED("Juicebox"),
        huntloSource: HUNTLO.voice.id,
        competitorSource: "juicebox-about",
      },
      {
        capability: "Interview scheduling",
        huntlo: "Yes. Candidate self-booking against panel calendars, with reminders",
        competitor: NOT_DESCRIBED("Juicebox"),
        huntloSource: HUNTLO.scheduling.id,
        competitorSource: "juicebox-about",
      },
      {
        capability: "Relationship to your ATS",
        huntlo: "Runs alongside your ATS. Listed integrations: Gmail, WhatsApp and Calendly, with LinkedIn coming soon",
        competitor: "Confirm current integrations with Juicebox",
        huntloSource: HUNTLO.integrations.id,
      },
    ],
    workflowHuntlo: ["Source", "Email and WhatsApp outreach", "AI screening", "Voice interview", "Schedule", "Recruiter decision"],
    workflowCompetitor: [
      "Define the search",
      "Agents discover candidates",
      "Refine from feedback",
      "Automated outreach",
      "Hand off to your interview process",
    ],
    workflowNote:
      "Both workflows start with AI-led discovery. Juicebox emphasises keeping discovery running over time; Huntlo emphasises carrying candidates through screening and scheduling, with recruiter checkpoints along the way.",
    chooseHuntlo: [
      "You want screening, voice interviews and scheduling in the same system as sourcing and outreach",
      "You reach candidates on WhatsApp as well as email",
      "You want written workflow rules with recruiter approval gates",
      "Your bottleneck is after first contact, not finding candidates",
    ],
    chooseCompetitor: [
      "Continuous, agent-led candidate discovery is your main need",
      "You want sourcing agents that keep refining searches from your feedback",
      "You already have screening and scheduling tools you are happy with",
      "Your bottleneck is building pipeline, not progressing it",
    ],
    useCases: [
      { useCase: "Continuous, agent-led candidate discovery", recommended: "Juicebox" },
      { useCase: "Automated candidate outreach", recommended: "Both" },
      { useCase: "Screening against role criteria", recommended: "Huntlo" },
      { useCase: "Preliminary voice interviews", recommended: "Huntlo" },
      { useCase: "Interview scheduling in the same workflow", recommended: "Huntlo" },
    ],
    sources: [
      {
        id: "juicebox-about",
        title: "About Juicebox: Company, Founders, and Product Facts",
        publisher: "Juicebox",
        url: "https://juicebox.ai/about",
        accessed: REVIEWED,
      },
      HUNTLO.sourcing,
      HUNTLO.outreach,
      HUNTLO.screening,
      HUNTLO.voice,
      HUNTLO.scheduling,
      HUNTLO.automation,
      HUNTLO.integrations,
    ],
    faq: [
      {
        question: "What is the difference between Huntlo and Juicebox?",
        answer:
          "Juicebox is an AI recruiting platform centred on candidate discovery, agentic sourcing and outreach. Huntlo covers sourcing and outreach too, and continues into criteria-based screening, preliminary voice interviews and interview scheduling, with recruiters approving key steps.",
      },
      {
        question: "Is Juicebox only a sourcing tool?",
        answer:
          "No. Juicebox describes AI recruiting agents that run autonomous, continuous sourcing and automated outreach, so calling it a search tool alone would be out of date. This page reflects Juicebox's own published materials as of the review date shown.",
      },
      {
        question: "Does Juicebox offer AI screening or voice interviews?",
        answer:
          "They were not described in the Juicebox materials reviewed for this page. Product scope changes quickly, so confirm current capabilities with Juicebox. Huntlo documents criteria-based screening and preliminary voice interviews on its capability pages.",
      },
      {
        question: "Can teams use Huntlo and Juicebox together?",
        answer:
          "Yes. Some teams use a dedicated discovery tool to build pipeline and Huntlo for outreach, screening and scheduling. Check how candidate records move between the two before committing.",
      },
    ],
  },
  {
    layout: "verified",
    slug: "linkedin-recruiter",
    name: "LinkedIn Recruiter",
    shortName: "LinkedIn Recruiter",
    metaTitle: "Huntlo vs LinkedIn Recruiter: AI Hiring Platform Comparison",
    metaDescription:
      "Compare Huntlo and LinkedIn Recruiter with Hiring Assistant. Both use AI across recruiting; they differ in product context, candidate channels and workflow. Sourced and dated.",
    ogDescription:
      "How Huntlo compares with LinkedIn Recruiter and Hiring Assistant across sourcing, evaluation, outreach, screening and scheduling, with sources for every claim.",
    breadcrumbLabel: "Huntlo vs LinkedIn Recruiter",
    webPageName: "Huntlo vs LinkedIn Recruiter",
    webPageDescription:
      "A side-by-side comparison of LinkedIn Recruiter with Hiring Assistant and Huntlo's hiring workflow, with sources for every claim.",
    geoAskTopic: "comparing Huntlo and LinkedIn Recruiter",
    geoAskLabelTemplate: "Ask {platform} to compare Huntlo and LinkedIn Recruiter",
    geoAskPrompt:
      "Compare Huntlo (https://huntlo.ai/compare/linkedin-recruiter) and LinkedIn Recruiter with Hiring Assistant. How do they differ on product context, outreach channels, screening and scheduling?",
    headline: "Huntlo vs LinkedIn Recruiter",
    intro: [
      "Huntlo and LinkedIn Recruiter both use AI to support recruiting workflows, but their underlying product contexts differ. LinkedIn Recruiter is built around LinkedIn's professional network and Hiring Assistant, while Huntlo should be evaluated on the breadth of its own hiring workflow, screening, interview and orchestration capabilities.",
      "LinkedIn's 2026 hiring release describes Hiring Assistant supporting agentic workflows across sourcing, applicant evaluation, outreach, screening, feedback, scheduling and ATS workflows. This page therefore compares product context and workflow fit, not which product has AI.",
    ],
    verdict:
      "Choose LinkedIn Recruiter if your hiring runs on LinkedIn's member network and you want Hiring Assistant working inside it. Choose Huntlo if you want an independent workflow that reaches candidates over email and WhatsApp and carries them through screening, voice interviews and scheduling. Many teams use both.",
    lastReviewed: REVIEWED,
    bestFor: {
      huntlo: "An independent hiring workflow across email, WhatsApp and calendars",
      competitor: "Teams deeply using the LinkedIn talent ecosystem",
    },
    featureComparison: [
      {
        capability: "Core environment",
        huntlo: "Huntlo's hiring workflow, used alongside your ATS",
        competitor: "LinkedIn's professional network and LinkedIn Recruiter",
        huntloSource: HUNTLO.integrations.id,
        competitorSource: "linkedin-recruiter",
      },
      {
        capability: "Talent network",
        huntlo: "Intent-driven discovery of active and passive candidates. Huntlo does not provide LinkedIn's member network",
        competitor: "LinkedIn member ecosystem",
        huntloSource: HUNTLO.sourcing.id,
        competitorSource: "linkedin-recruiter",
      },
      {
        capability: "AI sourcing",
        huntlo: "Yes",
        competitor: "Yes, through Hiring Assistant",
        huntloSource: HUNTLO.sourcing.id,
        competitorSource: "linkedin-release",
      },
      {
        capability: "Applicant evaluation",
        huntlo: "Yes. Criteria-based screening that recruiters review",
        competitor: "Yes, through Hiring Assistant",
        huntloSource: HUNTLO.screening.id,
        competitorSource: "linkedin-release",
      },
      {
        capability: "Outreach",
        huntlo: "Personalised email and WhatsApp outreach with automated follow-ups",
        competitor: "Yes. Personalised outreach through Hiring Assistant",
        huntloSource: HUNTLO.outreach.id,
        competitorSource: "linkedin-release",
      },
      {
        capability: "Screening",
        huntlo: "Structured AI voice screens with transcripts and summaries, reviewed by recruiters",
        competitor: "Yes, through Hiring Assistant",
        huntloSource: HUNTLO.voice.id,
        competitorSource: "linkedin-release",
      },
      {
        capability: "Scheduling and workflow",
        huntlo: "Candidate self-booking against panel calendars; trigger-and-action rules between stages",
        competitor: "Increasingly supported through Hiring Assistant, including scheduling and ATS workflows",
        huntloSource: HUNTLO.scheduling.id,
        competitorSource: "linkedin-release",
      },
      {
        capability: "LinkedIn connection",
        huntlo: "LinkedIn integration listed as coming soon",
        competitor: "Native",
        huntloSource: HUNTLO.integrations.id,
        competitorSource: "linkedin-recruiter",
      },
    ],
    workflowHuntlo: ["Source", "Email and WhatsApp outreach", "AI screening", "Voice interview", "Schedule", "Recruiter decision"],
    workflowCompetitor: [
      "Search LinkedIn members",
      "Hiring Assistant evaluates applicants",
      "Personalised outreach",
      "Screening and feedback",
      "Scheduling and ATS workflow",
    ],
    workflowNote:
      "Both products can now cover much of the hiring process. The practical difference is environment: LinkedIn Recruiter works inside LinkedIn's network, while Huntlo works across email, WhatsApp and calendars alongside your ATS.",
    chooseHuntlo: [
      "You want to reach candidates over email and WhatsApp, not only within one network",
      "You want preliminary voice interviews with transcripts on the candidate record",
      "You want written workflow rules with recruiter approval gates",
      "You want a workflow that does not depend on a single talent network",
    ],
    chooseCompetitor: [
      "Your sourcing strategy centres on LinkedIn's member network",
      "You want AI assistance inside the tool your recruiters already use every day",
      "You want Hiring Assistant to carry work from sourcing through scheduling within LinkedIn",
      "LinkedIn profiles and network connections are central to your searches",
    ],
    useCases: [
      { useCase: "Searching LinkedIn member profiles", recommended: "LinkedIn Recruiter" },
      { useCase: "AI assistance inside LinkedIn", recommended: "LinkedIn Recruiter" },
      { useCase: "Email and WhatsApp outreach", recommended: "Huntlo" },
      { useCase: "Preliminary voice interviews", recommended: "Huntlo" },
      { useCase: "Applicant evaluation and screening", recommended: "Both" },
      { useCase: "Interview scheduling", recommended: "Both" },
    ],
    sources: [
      {
        id: "linkedin-release",
        title: "2026 LinkedIn Hiring Release features",
        publisher: "LinkedIn Talent Solutions",
        url: "https://business.linkedin.com/hire/product-update/hire-release",
        accessed: REVIEWED,
      },
      {
        id: "linkedin-recruiter",
        title: "LinkedIn Recruiter | Hiring on LinkedIn",
        publisher: "LinkedIn Talent Solutions",
        url: "https://business.linkedin.com/hire/recruiter",
        accessed: REVIEWED,
      },
      HUNTLO.sourcing,
      HUNTLO.screening,
      HUNTLO.outreach,
      HUNTLO.voice,
      HUNTLO.scheduling,
      HUNTLO.integrations,
    ],
    faq: [
      {
        question: "What is the difference between Huntlo and LinkedIn Recruiter?",
        answer:
          "Both use AI across recruiting. LinkedIn Recruiter is built around LinkedIn's professional network and Hiring Assistant. Huntlo is an independent hiring workflow that reaches candidates over email and WhatsApp and carries them through screening, preliminary voice interviews and scheduling, alongside your ATS.",
      },
      {
        question: "Does LinkedIn Recruiter include AI screening now?",
        answer:
          "Yes. LinkedIn describes Hiring Assistant as supporting applicant evaluation, outreach and screening, and its 2026 release extends that to feedback, scheduling and ATS workflows. Describing LinkedIn Recruiter as a manual sourcing tool would be out of date.",
      },
      {
        question: "Can Huntlo replace LinkedIn Recruiter?",
        answer:
          "Not for LinkedIn network access. Huntlo does not provide LinkedIn's member network, and its LinkedIn integration is listed as coming soon. Teams that rely on LinkedIn for search often use Huntlo for outreach on other channels, screening and scheduling.",
      },
      {
        question: "How should we compare them on our own roles?",
        answer:
          "Run the same live role through both for a fixed period. Compare qualified candidates reached, recruiter hours spent and time to first interview, using one definition of each metric for both tools.",
      },
    ],
  },
  {
    layout: "verified",
    slug: "seekout",
    name: "SeekOut",
    shortName: "SeekOut",
    metaTitle: "Huntlo vs SeekOut: Agentic Recruiting Platform Comparison",
    metaDescription:
      "Compare Huntlo and SeekOut. SeekOut offers AI sourcing, applicant evaluation, screening, outreach, rediscovery and an AI Coworker; see how Huntlo's workflow differs. Sourced and dated.",
    ogDescription:
      "How Huntlo compares with SeekOut's agentic recruiting platform across talent data, screening, outreach and AI assistance, with sources for every claim.",
    breadcrumbLabel: "Huntlo vs SeekOut",
    webPageName: "Huntlo vs SeekOut",
    webPageDescription:
      "A side-by-side comparison of SeekOut's agentic recruiting platform and Huntlo's hiring workflow, with sources for every claim.",
    geoAskTopic: "comparing Huntlo and SeekOut",
    geoAskLabelTemplate: "Ask {platform} to compare Huntlo and SeekOut",
    geoAskPrompt:
      "Compare Huntlo (https://huntlo.ai/compare/seekout) and SeekOut for agentic recruiting. How do they differ on talent data, screening, outreach, rediscovery and AI assistance?",
    headline: "Huntlo vs SeekOut",
    intro: [
      "SeekOut is an agentic recruiting platform. Its help centre describes AI sourcing, applicant evaluation, AI screening, personalised outreach, talent rediscovery, labour-market insights and an AI Coworker, and says SeekOut can be used inside third-party AI assistants through MCP.",
      "Because both products now use AI across several stages, this page compares how each is built: SeekOut around talent data and an AI coworker, Huntlo around a recruiter-controlled workflow from outreach through voice interviews and scheduling.",
    ],
    verdict:
      "Choose SeekOut if talent data, rediscovery and labour-market insight drive your recruiting, or you want an AI coworker you can use inside other AI assistants. Choose Huntlo if your priority is email and WhatsApp outreach, preliminary voice interviews and scheduling in one recruiter-controlled workflow.",
    lastReviewed: REVIEWED,
    bestFor: {
      huntlo: "A recruiter-controlled workflow from outreach to booked interview",
      competitor: "Talent data, rediscovery and an AI coworker",
    },
    featureComparison: [
      {
        capability: "Talent data model",
        huntlo: "Candidate records built from sourcing, outreach and screening activity, kept in reusable talent pools",
        competitor: "Talent data used for sourcing, rediscovery and labour-market insights",
        huntloSource: HUNTLO.talentPool.id,
        competitorSource: "seekout-ai",
      },
      {
        capability: "External sourcing",
        huntlo: "Yes. Intent-driven discovery of active and passive candidates",
        competitor: "Yes. AI sourcing",
        huntloSource: HUNTLO.sourcing.id,
        competitorSource: "seekout-ai",
      },
      {
        capability: "Applicant evaluation and screening",
        huntlo: "Criteria-based screening that recruiters review, plus structured AI voice screens",
        competitor: "Yes. Applicant evaluation and AI screening",
        huntloSource: HUNTLO.screening.id,
        competitorSource: "seekout-ai",
      },
      {
        capability: "Outreach",
        huntlo: "Personalised email and WhatsApp outreach with automated follow-ups",
        competitor: "Yes. Personalised outreach",
        huntloSource: HUNTLO.outreach.id,
        competitorSource: "seekout-ai",
      },
      {
        capability: "Talent rediscovery",
        huntlo: "Reusable talent pools for future roles",
        competitor: "Yes. Talent rediscovery",
        huntloSource: HUNTLO.talentPool.id,
        competitorSource: "seekout-ai",
      },
      {
        capability: "Labour-market insights",
        huntlo: "Not a documented Huntlo capability. Huntlo analytics cover outreach, replies and pipeline progress",
        competitor: "Yes",
        huntloSource: HUNTLO.analytics.id,
        competitorSource: "seekout-ai",
      },
      {
        capability: "AI assistant model",
        huntlo: "Task agents governed by recruiter-written rules, with review gates and a log of every run",
        competitor: "AI Coworker, also usable inside third-party AI assistants through MCP",
        huntloSource: HUNTLO.autonomous.id,
        competitorSource: "seekout-ai",
      },
      {
        capability: "Interview scheduling",
        huntlo: "Candidate self-booking against panel calendars, with reminders",
        competitor: NOT_DESCRIBED("SeekOut"),
        huntloSource: HUNTLO.scheduling.id,
        competitorSource: "seekout-ai",
      },
    ],
    workflowHuntlo: ["Source", "Email and WhatsApp outreach", "AI screening", "Voice interview", "Schedule", "Recruiter decision"],
    workflowCompetitor: [
      "AI sourcing and rediscovery",
      "Applicant evaluation",
      "AI screening",
      "Personalised outreach",
      "AI Coworker assists throughout",
    ],
    workflowNote:
      "SeekOut's workflow is organised around talent data and an AI coworker that assists at each step. Huntlo's is organised around stage-to-stage hand-offs, with written rules deciding what happens next and when a recruiter must approve.",
    chooseHuntlo: [
      "You want preliminary voice interviews with transcripts on the candidate record",
      "You reach candidates on WhatsApp as well as email",
      "You want scheduling and stage hand-offs automated under recruiter approval rules",
      "You want a focused hiring workflow rather than a broad talent-data platform",
    ],
    chooseCompetitor: [
      "Talent data and rediscovery of past candidates drive your sourcing",
      "You need labour-market insights alongside recruiting",
      "You want an AI coworker you can use inside other AI assistants through MCP",
      "You want applicant evaluation and screening inside a sourcing-led platform",
    ],
    useCases: [
      { useCase: "Talent rediscovery at scale", recommended: "SeekOut" },
      { useCase: "Labour-market insights", recommended: "SeekOut" },
      { useCase: "AI coworker inside third-party AI assistants", recommended: "SeekOut" },
      { useCase: "Preliminary voice interviews", recommended: "Huntlo" },
      { useCase: "Interview scheduling in the same workflow", recommended: "Huntlo" },
      { useCase: "Applicant evaluation and screening", recommended: "Both" },
      { useCase: "Personalised outreach", recommended: "Both" },
    ],
    sources: [
      {
        id: "seekout-ai",
        title: "AI Features in SeekOut",
        publisher: "SeekOut Help Center",
        url: "https://support.seekout.com/en/articles/13719568-ai-features-in-seekout",
        accessed: REVIEWED,
      },
      HUNTLO.sourcing,
      HUNTLO.screening,
      HUNTLO.outreach,
      HUNTLO.scheduling,
      HUNTLO.talentPool,
      HUNTLO.analytics,
      HUNTLO.autonomous,
    ],
    faq: [
      {
        question: "What is the difference between Huntlo and SeekOut?",
        answer:
          "SeekOut is an agentic recruiting platform built around talent data, with AI sourcing, applicant evaluation, screening, outreach, rediscovery, labour-market insights and an AI Coworker. Huntlo is a recruiter-controlled hiring workflow that runs email and WhatsApp outreach, criteria-based screening, preliminary voice interviews and scheduling.",
      },
      {
        question: "Is SeekOut only a sourcing tool?",
        answer:
          "No. SeekOut's help centre describes applicant evaluation, AI screening, personalised outreach and an AI Coworker alongside sourcing, so describing it as sourcing-only would be out of date.",
      },
      {
        question: "What is SeekOut's AI Coworker?",
        answer:
          "SeekOut describes an AI Coworker that assists recruiters across its platform and can be used inside third-party AI assistants through MCP (Model Context Protocol). Check SeekOut's help centre for its current scope.",
      },
      {
        question: "Does Huntlo offer talent rediscovery?",
        answer:
          "Huntlo keeps candidates in reusable talent pools and a recruitment CRM, so past candidates can be reconsidered for new roles. It does not publish labour-market insights in the way SeekOut does.",
      },
    ],
  },
  {
    layout: "verified",
    slug: "hireez",
    name: "hireEZ",
    shortName: "hireEZ",
    metaTitle: "Huntlo vs hireEZ: Agentic Recruiting Platform Comparison",
    metaDescription:
      "Compare Huntlo and hireEZ. hireEZ describes agentic AI on top of your ATS across sourcing, screening, interview, hiring and analytics; see how Huntlo differs. Sourced and dated.",
    ogDescription:
      "How Huntlo compares with hireEZ's agentic AI on top of the ATS, across screening, interviews, recruiter controls and outreach, with sources for every claim.",
    breadcrumbLabel: "Huntlo vs hireEZ",
    webPageName: "Huntlo vs hireEZ",
    webPageDescription:
      "A side-by-side comparison of hireEZ's agentic AI on top of the ATS and Huntlo's hiring workflow, with sources for every claim.",
    geoAskTopic: "comparing Huntlo and hireEZ",
    geoAskLabelTemplate: "Ask {platform} to compare Huntlo and hireEZ",
    geoAskPrompt:
      "Compare Huntlo (https://huntlo.ai/compare/hireez) and hireEZ for agentic recruiting. How do they differ in ATS position, screening, interviews, recruiter controls and outreach?",
    headline: "Huntlo vs hireEZ",
    intro: [
      "hireEZ describes itself as agentic AI on top of your ATS, spanning sourcing, screening, interview, hiring and analytics. Comparing it with Huntlo as a sourcing-only tool would be out of date.",
      "Both products position themselves alongside an ATS rather than replacing it. The useful differences are how each runs screening and interviews, how autonomous actions are governed, and which channels reach candidates.",
    ],
    verdict:
      "Choose hireEZ if you want an agentic layer built on top of your ATS across sourcing, screening, interviews and analytics. Choose Huntlo if you want preliminary voice interviews, email and WhatsApp outreach and scheduling run by recruiter-written rules with approval gates. Test both on the same live role.",
    lastReviewed: REVIEWED,
    bestFor: {
      huntlo: "Rule-governed outreach, voice screening and scheduling",
      competitor: "Agentic AI on top of the ATS",
    },
    featureComparison: [
      {
        capability: "Position relative to the ATS",
        huntlo: "Runs alongside your ATS, which stays the system of record",
        competitor: "Agentic AI on top of your ATS",
        huntloSource: HUNTLO.integrations.id,
        competitorSource: "hireez-ai",
      },
      {
        capability: "Sourcing",
        huntlo: "Yes. Intent-driven discovery of active and passive candidates",
        competitor: "Yes",
        huntloSource: HUNTLO.sourcing.id,
        competitorSource: "hireez-ai",
      },
      {
        capability: "Screening",
        huntlo: "Criteria-based screening that recruiters review",
        competitor: "Part of the described platform; confirm the format with hireEZ",
        huntloSource: HUNTLO.screening.id,
        competitorSource: "hireez-ai",
      },
      {
        capability: "Interviews",
        huntlo: "Structured AI voice screens with transcripts and summaries; async video screening is also available",
        competitor: "Part of the described platform; confirm the format with hireEZ",
        huntloSource: HUNTLO.voice.id,
        competitorSource: "hireez-ai",
      },
      {
        capability: "Outreach channels",
        huntlo: "Personalised email and WhatsApp outreach with automated follow-ups",
        competitor: "Confirm current channels with hireEZ",
        huntloSource: HUNTLO.outreach.id,
      },
      {
        capability: "Recruiter controls on autonomous actions",
        huntlo: "Each rule has a trigger, condition, action, review gate and named owner, and every run is logged",
        competitor: "Confirm approval and audit controls with hireEZ",
        huntloSource: HUNTLO.autonomous.id,
      },
      {
        capability: "Hiring and analytics",
        huntlo: "Visibility into outreach, replies and pipeline progress",
        competitor: "Yes. Hiring and analytics are part of the described platform",
        huntloSource: HUNTLO.analytics.id,
        competitorSource: "hireez-ai",
      },
    ],
    workflowHuntlo: ["Source", "Email and WhatsApp outreach", "AI screening", "Voice interview", "Schedule", "Recruiter decision"],
    workflowCompetitor: ["Your ATS data", "AI sourcing", "Screening", "Interview", "Hiring and analytics"],
    workflowNote:
      "Both sit next to the ATS. hireEZ describes building its agentic layer on top of ATS data; Huntlo runs its own workflow across email, WhatsApp and calendars and keeps the ATS as the system of record.",
    chooseHuntlo: [
      "You want preliminary voice interviews with transcripts on each candidate record",
      "You reach candidates over WhatsApp as well as email",
      "You want every automated step governed by a written rule with an owner and a review gate",
      "You want a recruiter approval point before shortlist decisions",
    ],
    chooseCompetitor: [
      "You want an agentic layer that works directly on top of your existing ATS",
      "You want one vendor for sourcing, screening, interviews and analytics on the ATS",
      "Analytics across sourcing and hiring stages is a priority",
      "Your team already uses hireEZ for sourcing and wants to extend it",
    ],
    useCases: [
      { useCase: "Agentic AI on top of existing ATS data", recommended: "hireEZ" },
      { useCase: "Preliminary voice interviews", recommended: "Huntlo" },
      { useCase: "Rule-based recruiter approval gates", recommended: "Huntlo" },
      { useCase: "AI sourcing", recommended: "Both" },
      { useCase: "AI screening", recommended: "Both" },
    ],
    sources: [
      {
        id: "hireez-ai",
        title: "AI Sourcing | Automated Candidate Sourcing",
        publisher: "hireEZ",
        url: "https://hireez.com/ai-sourcing/",
        accessed: REVIEWED,
      },
      HUNTLO.sourcing,
      HUNTLO.screening,
      HUNTLO.voice,
      HUNTLO.outreach,
      HUNTLO.autonomous,
      HUNTLO.analytics,
      HUNTLO.integrations,
    ],
    faq: [
      {
        question: "What is the difference between Huntlo and hireEZ?",
        answer:
          "hireEZ describes agentic AI on top of your ATS across sourcing, screening, interview, hiring and analytics. Huntlo runs its own hiring workflow alongside the ATS, with email and WhatsApp outreach, criteria-based screening, preliminary voice interviews and scheduling governed by recruiter-written rules.",
      },
      {
        question: "Is hireEZ only a sourcing tool?",
        answer:
          "No. hireEZ describes itself as agentic AI spanning sourcing, screening, interview, hiring and analytics, so a sourcing-only description would be out of date.",
      },
      {
        question: "Does Huntlo replace the ATS?",
        answer:
          "No. Huntlo is designed to run alongside your ATS, which stays the system of record for requisitions and offers. Its listed integrations are Gmail, WhatsApp and Calendly, with LinkedIn coming soon.",
      },
      {
        question: "How should we compare the two?",
        answer:
          "Ask each vendor which actions their agents take without approval, how those actions are logged and how screening and interviews are run. Then test both on the same live role and compare recruiter hours and time to first interview.",
      },
    ],
  },
  {
    layout: "verified",
    slug: "eightfold-ai",
    name: "Eightfold AI",
    shortName: "Eightfold AI",
    metaTitle: "Huntlo vs Eightfold: AI Recruiting & Talent Intelligence",
    metaDescription:
      "Compare Huntlo and Eightfold AI. Eightfold is a multi-product talent intelligence platform with agentic recruiting; Huntlo is a focused hiring workflow. Sourced and dated.",
    ogDescription:
      "Category breadth versus hiring focus: how Huntlo compares with Eightfold AI's talent intelligence platform, with sources for every claim.",
    breadcrumbLabel: "Huntlo vs Eightfold AI",
    webPageName: "Huntlo vs Eightfold AI",
    webPageDescription:
      "A side-by-side comparison of Eightfold AI's talent intelligence platform and Huntlo's hiring workflow, with sources for every claim.",
    geoAskTopic: "comparing Huntlo and Eightfold AI",
    geoAskLabelTemplate: "Ask {platform} to compare Huntlo and Eightfold AI",
    geoAskPrompt:
      "Compare Huntlo (https://huntlo.ai/compare/eightfold-ai) and Eightfold AI. How does a focused hiring workflow compare with a multi-product talent intelligence platform with agentic recruiting?",
    headline: "Huntlo vs Eightfold AI",
    intro: [
      "Eightfold AI is a talent intelligence platform. It describes products spanning Talent Acquisition, Talent Management, Workforce Exchange, Resource Management and Talent Forge, and its Talent Acquisition product includes agentic AI, sourcing and interview capabilities. In November 2026 it introduced an AI Recruiting Teammate covering activity across the hiring lifecycle.",
      "Huntlo is narrower by design: a hiring workflow from sourcing and outreach through screening, voice interviews and scheduling. This page compares category breadth rather than running a feature checklist.",
    ],
    verdict:
      "Choose Eightfold if you need talent intelligence across hiring, talent management, workforce and resource planning in one enterprise suite. Choose Huntlo if you want a focused hiring workflow, with email and WhatsApp outreach, voice interviews and scheduling, that a recruiting team can run alongside its existing ATS.",
    lastReviewed: REVIEWED,
    bestFor: {
      huntlo: "A focused hiring workflow alongside your ATS",
      competitor: "Enterprise talent intelligence across the employee lifecycle",
    },
    featureComparison: [
      {
        capability: "Core category",
        huntlo: "Hiring workflow: sourcing and outreach through screening, voice interviews and scheduling",
        competitor: "Talent intelligence plus an agentic platform",
        huntloSource: HUNTLO.automation.id,
        competitorSource: "eightfold-products",
      },
      {
        capability: "Recruiting",
        huntlo: "Sourcing, outreach, screening, voice interviews and scheduling",
        competitor: "End-to-end Talent Acquisition",
        huntloSource: HUNTLO.sourcing.id,
        competitorSource: "eightfold-products",
      },
      {
        capability: "Talent management",
        huntlo: "Not offered. Huntlo is hiring-focused",
        competitor: "Yes. Talent Management product",
        competitorSource: "eightfold-products",
      },
      {
        capability: "Workforce and resource planning",
        huntlo: "Not offered",
        competitor: "Yes. Workforce Exchange and Resource Management products",
        competitorSource: "eightfold-products",
      },
      {
        capability: "AI interviews",
        huntlo: "Structured AI voice screens with transcripts, reviewed by recruiters",
        competitor: "Yes. Interview capabilities in Talent Acquisition",
        huntloSource: HUNTLO.voice.id,
        competitorSource: "eightfold-products",
      },
      {
        capability: "Agentic recruiting",
        huntlo: "Task agents governed by recruiter-written rules, with review gates and a log of every run",
        competitor: "Yes. Agentic AI, including the AI Recruiting Teammate",
        huntloSource: HUNTLO.autonomous.id,
        competitorSource: "eightfold-products",
      },
      {
        capability: "Outreach channels",
        huntlo: "Personalised email and WhatsApp outreach with automated follow-ups",
        competitor: "Confirm current channels with Eightfold",
        huntloSource: HUNTLO.outreach.id,
      },
      {
        capability: "Enterprise HR breadth",
        huntlo: "Hiring only, used alongside your ATS and HR systems",
        competitor: "Broad multi-product suite",
        huntloSource: HUNTLO.integrations.id,
        competitorSource: "eightfold-products",
      },
    ],
    workflowHuntlo: ["Source", "Email and WhatsApp outreach", "AI screening", "Voice interview", "Schedule", "Recruiter decision"],
    workflowCompetitor: [
      "Talent intelligence",
      "Agentic sourcing",
      "AI interviews",
      "Hire",
      "Talent management and mobility",
    ],
    workflowNote:
      "Eightfold's workflow continues past the hire into talent management and workforce planning. Huntlo stops at the hiring decision and leaves the record with your ATS and HR systems.",
    chooseHuntlo: [
      "You want a hiring-focused tool rather than an HR-wide suite",
      "You reach candidates over WhatsApp as well as email",
      "You want your recruiting team to configure and run workflows itself, with approval gates",
      "You want to start with one hiring workflow alongside your existing ATS",
    ],
    chooseCompetitor: [
      "You want talent intelligence across hiring, talent management and workforce planning",
      "Internal mobility and resource management are in scope",
      "You want an AI recruiting teammate inside a broader enterprise talent suite",
      "You are standardising HR technology on one multi-product platform",
    ],
    useCases: [
      { useCase: "Talent management and internal mobility", recommended: "Eightfold AI" },
      { useCase: "Workforce and resource planning", recommended: "Eightfold AI" },
      { useCase: "Enterprise-wide talent intelligence", recommended: "Eightfold AI" },
      { useCase: "Focused hiring workflow alongside an existing ATS", recommended: "Huntlo" },
      { useCase: "AI interviews", recommended: "Both" },
      { useCase: "Agentic sourcing", recommended: "Both" },
    ],
    sources: [
      {
        id: "eightfold-products",
        title: "Talent Intelligence Platform",
        publisher: "Eightfold AI",
        url: "https://eightfold.ai/products/",
        accessed: REVIEWED,
      },
      HUNTLO.sourcing,
      HUNTLO.outreach,
      HUNTLO.voice,
      HUNTLO.automation,
      HUNTLO.autonomous,
      HUNTLO.integrations,
    ],
    faq: [
      {
        question: "What is the difference between Huntlo and Eightfold AI?",
        answer:
          "Eightfold AI is a multi-product talent intelligence platform covering talent acquisition, talent management, workforce exchange and resource management, with agentic recruiting inside it. Huntlo is a focused hiring workflow: sourcing, email and WhatsApp outreach, screening, preliminary voice interviews and scheduling, run alongside your ATS.",
      },
      {
        question: "Is Eightfold only a recruiting tool?",
        answer:
          "No. Eightfold describes products across Talent Acquisition, Talent Management, Workforce Exchange, Resource Management and Talent Forge. Comparing it with Huntlo feature by feature misses that difference in category breadth.",
      },
      {
        question: "Does Eightfold have an AI interviewer?",
        answer:
          "Eightfold describes interview capabilities in its Talent Acquisition product and introduced an AI Recruiting Teammate in November 2026. Confirm the interview format and depth with Eightfold for your roles.",
      },
      {
        question: "When does Huntlo make more sense?",
        answer:
          "When the need is specifically hiring: a recruiting team that wants to run outreach, screening, voice interviews and scheduling itself, alongside an existing ATS, without adopting an HR-wide suite.",
      },
    ],
  },
];
