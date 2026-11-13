import {
  buildInfrastructureComparison,
  type DetailedComparisonPage,
} from "./comparisonTypes";

export const ADDITIONAL_COMPARISON_PAGES: DetailedComparisonPage[] = [
  buildInfrastructureComparison({
    slug: "linkedin-recruiter",
    name: "LinkedIn Recruiter",
    metaTitle: "Huntlo AI vs LinkedIn Recruiter: Sourcing Tool vs Hiring Infrastructure | Huntlo AI",
    metaDescription:
      "Compare Huntlo AI and LinkedIn Recruiter. See how LinkedIn's member-network sourcing and InMail tool compares with Huntlo AI's Agentic AI Hiring Infrastructure for sourcing, multichannel outreach, AI voice screening, and AI video interviews.",
    ogDescription:
      "See how LinkedIn Recruiter's member-network sourcing and InMail tool compares with Huntlo AI's Agentic AI Hiring Infrastructure.",
    twitterDescription:
      "Compare Huntlo AI and LinkedIn Recruiter across sourcing, outreach, AI screening, interviews, and recruiter workflows.",
    ogSiteName: "Huntlo AI",
    breadcrumbLabel: "Huntlo AI vs LinkedIn Recruiter",
    serviceName: "Huntlo AI vs LinkedIn Recruiter Comparison",
    serviceDescription:
      "A comparison of Huntlo AI's Agentic AI Hiring Infrastructure and LinkedIn Recruiter's member-network sourcing and InMail platform, covering candidate sourcing, outreach, AI screening, and interview automation.",
    webPageName: "Huntlo AI vs LinkedIn Recruiter",
    webPageDescription:
      "A side-by-side comparison of Huntlo AI's Agentic AI Hiring Infrastructure and LinkedIn Recruiter's sourcing and InMail platform.",
    comparisonTableTitle: "Huntlo AI vs LinkedIn Recruiter",
    comparisonTableIntro:
      "LinkedIn Recruiter is LinkedIn's dedicated recruiting product, built around search across LinkedIn's member network, InMail messaging, and project-based pipelines. Huntlo AI is an Agentic AI Hiring Infrastructure that covers sourcing and outreach and extends into AI voice screening, AI video interviews, and recruiter workflow coordination.",
    comparisonDisclaimer:
      "Feature and pricing information about LinkedIn Recruiter reflects publicly available information as of November 2026 and may not capture every capability, plan, or regional variation. Always confirm current details directly with LinkedIn before making a purchasing decision.",
    geoAskTopic: "comparing Huntlo AI and LinkedIn Recruiter",
    geoAskLabelTemplate: "Ask {platform} to compare Huntlo AI and LinkedIn Recruiter",
    geoAskPrompt:
      "Compare Huntlo AI (https://huntlo.ai/compare/linkedin-recruiter) vs LinkedIn Recruiter for recruiting. How do they differ on sourcing, outreach, AI screening, interviews and recruiter workflows?",
    headline: "Huntlo AI vs LinkedIn Recruiter: Sourcing Tool vs Hiring Infrastructure",
    intro: [
      "LinkedIn Recruiter is LinkedIn's dedicated recruiting product, built around search across LinkedIn's member network, InMail messaging, and project-based pipelines. Huntlo AI is an Agentic AI Hiring Infrastructure that covers sourcing and outreach and extends into AI voice screening, AI video interviews, and recruiter workflow coordination.",
      "This comparison is about scope rather than a takedown: LinkedIn Recruiter gives direct access to one of the largest professional networks, while Huntlo AI focuses on running the hiring workflow that follows sourcing. Many teams use a network tool and a workflow platform together.",
    ],
    quickComparisonRows: [
      {
        feature: "Primary focus",
        huntlo:
          "Full agentic hiring infrastructure: sourcing through AI screening, interviews, and recruiter workflow coordination",
        competitor: "Sourcing and messaging inside LinkedIn's member network",
      },
      {
        feature: "AI candidate sourcing",
        huntlo: "yes",
        competitor: "Yes — search and recommendations across LinkedIn members, with AI-assisted search",
      },
      {
        feature: "Outreach channels",
        huntlo: "Email and WhatsApp, with automated follow-ups",
        competitor: "InMail within LinkedIn, limited by monthly InMail credits per seat",
      },
      {
        feature: "Talent data source",
        huntlo: "Intent-based discovery across professional networks",
        competitor: "LinkedIn member profiles — a distinctive strength",
      },
      {
        feature: "AI phone/voice screening",
        huntlo: "yes",
        competitor: "Not a documented feature of LinkedIn Recruiter",
      },
      {
        feature: "AI video interviews",
        huntlo: "yes",
        competitor: "Not a documented feature of LinkedIn Recruiter",
      },
      {
        feature: "Dedicated solutions per hiring team type",
        huntlo:
          "Yes — staffing agencies, recruitment firms, executive search, startups, enterprise, and GCCs",
        competitor: "Offered as seat-based plans (such as Recruiter Lite and Recruiter) rather than per-team workflows",
      },
    ],
    bestFor: {
      huntlo: "Agentic AI Hiring Infrastructure",
      competitor: "Sourcing and InMail outreach within LinkedIn's network",
    },
    chooseHuntlo: [
      "Want sourcing and outreach plus AI voice screening and AI video interviews in one workflow",
      "Need to reach candidates on Email and WhatsApp rather than relying on InMail credits",
      "Need dedicated solutions across staffing agencies, recruitment firms, executive search, startups, enterprise, and GCCs",
      "Want recruiters to keep control while AI agents handle follow-ups, screening, and scheduling",
    ],
    chooseCompetitor: [
      "Direct search across LinkedIn member profiles is the primary need",
      "Your team's outreach strategy is built around InMail and LinkedIn engagement",
      "You rely on LinkedIn-specific signals such as profile activity and network connections",
      "You need a widely recognized sourcing tool that most recruiters already know",
    ],
    whatIsHuntlo: {
      lead: "Huntlo AI is an Agentic AI Hiring Infrastructure that covers sourcing and outreach and extends into AI voice screening, AI video interviews, and recruiter workflow coordination.",
      bullets: [
        "AI candidate sourcing",
        "Automated outreach across Email and WhatsApp",
        "Dedicated AI voice screening and AI video interviews",
        "Recruiter workflow coordination",
        "Dedicated solutions for staffing agencies, recruitment firms, executive search, startups, enterprise, and GCCs",
      ],
      philosophy: "Run the hiring workflow after sourcing, with recruiters in control.",
      closing:
        "Huntlo AI is designed to complement existing tools such as an ATS and sourcing networks rather than replace them.",
    },
    whatIsCompetitor: {
      lead: "LinkedIn Recruiter is LinkedIn's dedicated recruiting product for searching LinkedIn's member network, messaging candidates through InMail, and managing candidates in projects.",
      bullets: [
        "Search and filters across LinkedIn member profiles",
        "InMail messaging with monthly credits per seat",
        "Projects and pipelines for organizing candidates",
        "AI-assisted search and messaging features announced by LinkedIn",
        "ATS integrations through LinkedIn's partner program",
      ],
      closing:
        "Plans range from Recruiter Lite to the full Recruiter product, with pricing generally quoted per seat — verify current plans and pricing directly with LinkedIn.",
    },
    featureComparison: [
      {
        capability: "Primary focus",
        huntlo:
          "Full agentic hiring infrastructure: sourcing through AI screening, interviews, and recruiter workflow coordination",
        competitor: "Sourcing and messaging inside LinkedIn's member network",
      },
      {
        capability: "AI candidate sourcing",
        huntlo: "Yes",
        competitor: "Yes — search and recommendations across LinkedIn members, with AI-assisted search",
      },
      {
        capability: "Outreach channels",
        huntlo: "Email and WhatsApp, with automated follow-ups",
        competitor: "InMail within LinkedIn, limited by monthly InMail credits per seat",
      },
      {
        capability: "Talent data source",
        huntlo: "Intent-based discovery across professional networks",
        competitor: "LinkedIn member profiles — a distinctive strength",
      },
      {
        capability: "AI phone/voice screening",
        huntlo: "Yes",
        competitor: "Not a documented feature of LinkedIn Recruiter",
      },
      {
        capability: "AI video interviews",
        huntlo: "Yes",
        competitor: "Not a documented feature of LinkedIn Recruiter",
      },
      {
        capability: "Interview scheduling",
        huntlo: "Yes — candidate self-booking with calendar sync and reminders",
        competitor: "Typically handled in a connected ATS or separate scheduling tool",
      },
      {
        capability: "Dedicated solutions per hiring team type",
        huntlo:
          "Yes — staffing agencies, recruitment firms, executive search, startups, enterprise, and GCCs",
        competitor: "Offered as seat-based plans (such as Recruiter Lite and Recruiter) rather than per-team workflows",
      },
      {
        capability: "Pricing model",
        huntlo: "Platform-based, used across ongoing and high-volume hiring",
        competitor: "Per-seat subscription plans; full Recruiter pricing is typically quoted by LinkedIn sales",
      },
    ],
    biggestDifference:
      "LinkedIn Recruiter is strongest at finding and messaging people inside LinkedIn's network; Huntlo AI is an Agentic AI Hiring Infrastructure that continues past sourcing into multichannel follow-ups, AI screening, interviews, and scheduling.",
    workflowCompetitor: [
      "Search LinkedIn members",
      "Save to project",
      "Send InMail",
      "Track replies",
      "Recruiter action",
    ],
    workflowNote:
      "Teams whose sourcing strategy centres on LinkedIn's network and InMail may prefer LinkedIn Recruiter. Teams that want sourcing to flow into Email and WhatsApp outreach, AI voice and video screening, and scheduling in one workflow may prefer Huntlo AI — and some teams use both.",
    useCases: [
      { useCase: "AI voice & video interview automation", recommended: "Huntlo" },
      { useCase: "Multichannel outreach (Email + WhatsApp)", recommended: "Huntlo" },
      { useCase: "Staffing and recruitment firm workflows", recommended: "Huntlo" },
      { useCase: "GCCs", recommended: "Huntlo" },
      { useCase: "Searching LinkedIn member profiles", recommended: "LinkedIn Recruiter" },
      { useCase: "InMail-based outreach", recommended: "LinkedIn Recruiter" },
      { useCase: "LinkedIn network and activity signals", recommended: "LinkedIn Recruiter" },
    ],
    prosHuntlo: [
      "Agentic AI Hiring Infrastructure extending into AI voice screening and AI video interviews",
      "Outreach across Email and WhatsApp with automated follow-ups",
      "Sourcing, screening, and scheduling in one recruiter-controlled workflow",
      "Dedicated solutions across staffing, recruitment firms, executive search, startups, enterprise, and GCCs",
    ],
    considerationHuntlo:
      "Huntlo AI does not provide LinkedIn's native member network, InMail, or LinkedIn activity signals.",
    prosCompetitor: [
      "Direct access to LinkedIn's large professional network",
      "InMail reaches members inside a platform many professionals already use",
      "Familiar to most recruiters, with established ATS integrations",
    ],
    considerationCompetitor:
      "Focused on sourcing and messaging within LinkedIn. AI voice screening and AI video interviews are not documented features, outreach depends on InMail credits, and full Recruiter pricing is typically quoted per seat — verify directly with LinkedIn.",
    faq: [
      {
        question: "What is the difference between Huntlo AI and LinkedIn Recruiter?",
        answer:
          "LinkedIn Recruiter is LinkedIn's recruiting product for searching its member network, messaging candidates through InMail, and organizing candidates in projects. Huntlo AI is an Agentic AI Hiring Infrastructure that covers sourcing and outreach and extends into AI voice screening, AI video interviews, scheduling, and recruiter workflow coordination.",
      },
      {
        question: "Can Huntlo AI replace LinkedIn Recruiter?",
        answer:
          "Not entirely. Huntlo AI does not provide LinkedIn's native member network, InMail, or LinkedIn activity signals. Many teams use LinkedIn for network access and Huntlo AI to run outreach, screening, interviews, and scheduling after candidates are identified.",
      },
      {
        question: "Does LinkedIn Recruiter offer AI voice screening or AI video interviews?",
        answer:
          "AI voice screening and AI video interviews are not documented features of LinkedIn Recruiter, which focuses on sourcing and messaging. Huntlo AI includes AI voice screening and AI video interviews as part of its hiring workflow.",
      },
      {
        question: "Which channels can each platform use to reach candidates?",
        answer:
          "LinkedIn Recruiter reaches candidates through InMail inside LinkedIn, limited by monthly credits per seat. Huntlo AI runs outreach across Email and WhatsApp, with WhatsApp messages sent through approved templates and follow-ups triggered by candidate response.",
      },
    ],
    finalVerdict: [
      "LinkedIn Recruiter remains a leading tool for searching and messaging LinkedIn's professional network — acknowledge that strength directly.",
      "Huntlo AI is an Agentic AI Hiring Infrastructure that continues past sourcing into multichannel outreach, AI screening, interviews, and scheduling.",
      "The fair differentiation is scope: network access and InMail versus a hiring workflow that runs through interviews — and the two can work side by side.",
    ],
  }),
];
