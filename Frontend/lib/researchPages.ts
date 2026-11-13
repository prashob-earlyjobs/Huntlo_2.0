import type { BreadcrumbSchemaItem } from "@/lib/jsonLd";
import type { LearnCard, LearnFaq, LearnLink, LearnSource, LearnTable } from "@/lib/learnPages";
import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const RESEARCH_PATH = "/research";
export const RESEARCH_OG_IMAGE = OG_IMAGES.resources;

export const RESEARCH_SEO = {
  title: "AI Hiring Research & Recruitment Benchmarks | Huntlo",
  description:
    "Original Huntlo research on AI recruiting, candidate engagement and hiring operations, with each study's methodology, sample, period and limitations published.",
  ogTitle: "Hiring Intelligence Research",
  ogDescription:
    "How Huntlo researches AI recruitment: open methodology, defined metrics and clear data status for every study and benchmark.",
} as const;

export function researchMetadata() {
  return buildPageMetadata({
    title: RESEARCH_SEO.title,
    description: RESEARCH_SEO.description,
    ogTitle: RESEARCH_SEO.ogTitle,
    ogDescription: RESEARCH_SEO.ogDescription,
    ogImage: RESEARCH_OG_IMAGE,
    path: RESEARCH_PATH,
  });
}

/**
 * `methodology` reports publish their design only and stay out of the index and sitemap;
 * switch to `findings` once the governance checklist is complete and figures are added.
 */
export type ResearchStatus = "methodology" | "findings";

export type GovernanceItem = {
  label: string;
  status: "defined" | "pending";
  detail: string;
};

export type ResearchReport = {
  slug: string;
  /** Breadcrumb label and card title. */
  name: string;
  /** The page H1. */
  title: string;
  kind: "Outlook" | "Benchmark" | "Survey" | "Analysis";
  /** Whether findings come from Huntlo's own data collection or from secondary sources. */
  dataOrigin: "Original Huntlo research" | "Secondary-source analysis";
  icon: string;
  summary: string;
  seo: { title: string; description: string; ogTitle: string; ogDescription: string };
  /** Answer-first block shown under the H1. */
  answer: string;
  /** "About this report" note shown above any figure, e.g. for forward-looking titles. */
  disclosure?: string;
  status: ResearchStatus;
  atAGlance: { label: string; value: string }[];
  researchQuestions: string[];
  scope: { label: string; value: string; pending?: boolean }[];
  methodology: LearnCard[];
  /** Metric definitions or taxonomy the findings will be reported against. */
  definitions: LearnTable;
  definitionsNote?: string;
  plannedOutputs: LearnCard[];
  /** What every statistic in the study will state alongside it. */
  methodologyDisclosure: GovernanceItem[];
  /** Claims the study will not make unless directly supported by its own published data. */
  willNotClaim: string[];
  governance: GovernanceItem[];
  faqs: LearnFaq[];
  related: LearnLink[];
  sources: LearnSource[];
  /** ISO date (YYYY-MM-DD). */
  published: string;
  /** ISO date (YYYY-MM-DD). */
  lastUpdated: string;
};

const PENDING_FIELDS = {
  owner: {
    label: "Metric owner",
    status: "pending",
    detail: "A named owner accountable for the dataset will be listed when findings are published.",
  },
  sample: {
    label: "Sample size",
    status: "pending",
    detail: "Not yet determined. The final sample and its composition will be published with the findings.",
  },
  period: {
    label: "Period",
    status: "pending",
    detail: "The data-collection window has not been set. Start and end dates will be published with the findings.",
  },
  permission: {
    label: "Permission to publish",
    status: "pending",
    detail: "Required before any figure appears on this page.",
  },
  verified: {
    label: "Last verified date",
    status: "pending",
    detail: "Will be added when figures are published and re-checked at each update.",
  },
} satisfies Record<string, GovernanceItem>;

export const RESEARCH_REPORTS: ResearchReport[] = [
  {
    slug: "state-of-ai-recruitment-2027",
    name: "State of AI Recruitment 2027",
    title: "State of AI Recruitment 2027: Outlook and Predictions",
    kind: "Outlook",
    dataOrigin: "Original Huntlo research",
    icon: "insights",
    summary:
      "An outlook report: how recruiting teams use AI across sourcing, outreach, screening, interviews and scheduling in 2026, and what to expect in 2027.",
    seo: {
      title: "State of AI Recruitment 2027: Trends & Outlook | Huntlo",
      description:
        "Huntlo's planned outlook on AI in recruitment: observed 2026 adoption and human oversight, plus clearly labelled 2027 expectations. Methodology published; findings pending.",
      ogTitle: "State of AI Recruitment 2027: Outlook and Predictions",
      ogDescription:
        "The research questions, scope and methodology behind Huntlo's outlook report on AI in recruitment for 2027.",
    },
    answer:
      "State of AI Recruitment 2027 is Huntlo's planned outlook report. It will describe how recruiting teams use AI at each hiring stage in 2026, which decisions they keep with recruiters, and what that suggests for 2027. This page publishes the research design first. It contains no findings, survey results or platform statistics yet.",
    disclosure:
      "About this report: published in November 2026. The report will examine AI recruitment trends observed in 2026 and outline expectations for 2027. Forecasts will be labelled separately from observed data, and no 2027 outcome will be presented as measured.",
    status: "methodology",
    atAGlance: [
      { label: "Research type", value: "Outlook report (2026 data, 2027 expectations)" },
      { label: "Status", value: "Methodology published · findings pending" },
      { label: "Sample", value: "Not yet determined" },
      { label: "Data-collection period", value: "Not yet set" },
      { label: "Publisher", value: "Huntlo" },
    ],
    researchQuestions: [
      "At which recruiting stages are teams using AI today: discovering candidates, engaging them, evaluating them, coordinating interviews, or analysing their pipeline?",
      "Which recruiting tasks do teams let AI agents run without a manual trigger, and which still require a recruiter's approval?",
      "How do teams judge whether AI is improving hiring? Which metrics do they track, and how are those metrics defined?",
      "What holds back wider adoption: data quality, candidate experience, compliance, integration with existing systems, or trust in the output?",
      "How do these patterns differ between in-house talent acquisition, staffing and RPO, executive search and global capability centre (GCC) teams?",
    ],
    scope: [
      {
        label: "Population",
        value: "Recruiting leaders, recruiters and talent-acquisition operations staff. The final eligibility criteria will be confirmed before fieldwork.",
      },
      {
        label: "Segments",
        value: "In-house talent acquisition, staffing and RPO, executive search, and GCC hiring teams.",
      },
      { label: "Geography", value: "To be confirmed before fieldwork.", pending: true },
      { label: "Data-collection period", value: "Not yet set.", pending: true },
      { label: "Sample size", value: "Not yet determined; published with the findings.", pending: true },
      {
        label: "Proposed data sources",
        value: "A practitioner survey, plus aggregated and anonymised Huntlo platform activity only where Huntlo has permission to publish it. Both will be confirmed in the methodology appendix.",
      },
    ],
    methodology: [
      {
        icon: "account_tree",
        title: "Fix the stage taxonomy and questionnaire",
        body: "Every question maps to one recruiting stage, defined in the table below, so results can be compared stage by stage and year on year.",
      },
      {
        icon: "groups",
        title: "Collect responses and record sample composition",
        body: "Respondent role, team type, team size and region are recorded so readers can see who the findings describe and who they do not.",
      },
      {
        icon: "filter_alt",
        title: "Clean the data and document exclusions",
        body: "Incomplete responses, duplicates and respondents from recruiting-technology vendors are excluded, and the number removed at each step is reported.",
      },
      {
        icon: "rule",
        title: "Separate observed data from interpretation",
        body: "Results are reported as shares of respondents first. Huntlo's interpretation and recommendations are labelled separately and never mixed into the data tables.",
      },
      {
        icon: "fact_check",
        title: "Review before publishing",
        body: "Figures are checked against the governance list on this page. Segments below a minimum sample size, set before analysis begins, are not reported.",
      },
    ],
    definitions: {
      title: "Recruiting stage taxonomy used in the report",
      intro:
        "Findings will be grouped into five stages, so a statement such as \"AI is used for screening\" always has the same meaning.",
      headers: ["Stage", "Workflows covered", "Example question"],
      rows: [
        {
          label: "Discover",
          href: "/capabilities/ai-candidate-sourcing",
          cells: [
            "Candidate sourcing, role-brief search and candidate matching",
            "Do you use AI to find or rank candidates for open roles?",
          ],
        },
        {
          label: "Engage",
          href: "/capabilities/ai-candidate-outreach",
          cells: [
            "Outreach, follow-ups and ongoing candidate conversations",
            "Are outreach messages or follow-ups drafted or sent by AI?",
          ],
        },
        {
          label: "Evaluate",
          href: "/capabilities/ai-candidate-screening",
          cells: [
            "Screening, voice interviews and assessments",
            "Does AI run any part of preliminary screening, and who reviews the result?",
          ],
        },
        {
          label: "Coordinate",
          href: "/capabilities/ai-interview-scheduling",
          cells: [
            "Interview scheduling and workflow automation",
            "Are interviews booked or rescheduled without recruiter involvement?",
          ],
        },
        {
          label: "Remember and improve",
          href: "/capabilities/ai-recruitment-analytics",
          cells: [
            "Recruitment CRM, talent pools and recruitment analytics",
            "Do you reuse past candidates or track pipeline metrics with AI?",
          ],
        },
      ],
    },
    plannedOutputs: [
      {
        icon: "summarize",
        title: "Executive summary",
        body: "A short summary at the top, with each takeaway linked to the table it comes from.",
      },
      {
        icon: "visibility",
        title: "What we observed in 2026",
        body: "Shares of respondents using AI at each of the five stages, shown as a chart with the same figures in a table.",
      },
      {
        icon: "trending_up",
        title: "What is changing",
        body: "Shifts respondents report in how AI is used and governed, with the data behind each one.",
      },
      {
        icon: "online_prediction",
        title: "2027 outlook",
        body: "Expectations for 2027, each labelled as a forecast and kept apart from observed data.",
      },
      {
        icon: "block",
        title: "Adoption barriers",
        body: "The reasons teams give for limiting AI use, reported by team type.",
      },
      {
        icon: "verified_user",
        title: "Governance and human oversight",
        body: "Which tasks run automatically, which need approval, and which decisions stay with recruiters.",
      },
      {
        icon: "science",
        title: "Methodology",
        body: "The questionnaire, sample composition, exclusions and weighting, if any.",
      },
      {
        icon: "table_chart",
        title: "Data tables and sources",
        body: "Every figure in a readable table, with its denominator and source beside it.",
      },
      {
        icon: "report",
        title: "Limitations",
        body: "What the sample can and cannot tell readers, stated plainly.",
      },
    ],
    methodologyDisclosure: [
      {
        label: "Source",
        status: "pending",
        detail: "Proposed: practitioner survey plus permissioned, anonymised platform activity. Confirmed before fieldwork.",
      },
      { label: "Sample", status: "pending", detail: "Number of respondents behind each figure, published with the findings." },
      { label: "Market and geography", status: "pending", detail: "Countries and regions covered, confirmed before fieldwork." },
      {
        label: "Respondent roles",
        status: "defined",
        detail: "Recruiting leaders, recruiters and talent-acquisition operations staff.",
      },
      { label: "Collection dates", status: "pending", detail: "Fieldwork start and end dates, published with the findings." },
      {
        label: "Question wording",
        status: "pending",
        detail: "The exact wording of each question, shown with its figure and in the appendix.",
      },
      {
        label: "Denominator",
        status: "defined",
        detail: "Eligible respondents who answered the question. Non-responses are excluded and their number reported.",
      },
      {
        label: "Rounding",
        status: "defined",
        detail: "Percentages rounded to the nearest whole number, so totals may not add up to exactly 100.",
      },
      { label: "Sponsor and funding", status: "pending", detail: "Stated with the findings, including any external sponsor." },
      {
        label: "Huntlo users among respondents",
        status: "defined",
        detail: "Every figure states whether respondents included Huntlo customers, with results split where samples allow.",
      },
      {
        label: "Confidence and limitations",
        status: "defined",
        detail: "Margins of error for survey figures where the sample supports them, and known limitations listed beside the data.",
      },
    ],
    willNotClaim: [
      "Measured 2027 outcomes. Anything about 2027 is a labelled forecast.",
      "An industry-wide adoption rate, unless the sample supports one.",
      "That Huntlo customers outperform other teams.",
    ],
    governance: [
      PENDING_FIELDS.owner,
      {
        label: "Data source",
        status: "pending",
        detail: "Proposed: practitioner survey plus permissioned, anonymised platform activity. Not yet confirmed.",
      },
      PENDING_FIELDS.sample,
      PENDING_FIELDS.period,
      {
        label: "Definition",
        status: "defined",
        detail: "The five-stage taxonomy and example questions are published on this page.",
      },
      {
        label: "Calculation",
        status: "defined",
        detail: "Results are reported as shares of eligible respondents, unweighted unless a weighting method is stated.",
      },
      {
        label: "Exclusions",
        status: "defined",
        detail: "Incomplete responses, duplicates, vendor respondents and segments below the minimum sample size.",
      },
      PENDING_FIELDS.permission,
      PENDING_FIELDS.verified,
    ],
    faqs: [
      {
        question: "Does this page contain any research findings yet?",
        answer:
          "No. This page publishes the research questions, scope and methodology only. It contains no survey results, adoption rates or platform statistics, and none should be quoted from it.",
      },
      {
        question: "Why is a 2027 report published in 2026?",
        answer:
          "Because it is an outlook. The report will measure what recruiting teams are doing in 2026 and use that to set out expectations for 2027. Observed figures and forecasts will be labelled separately, and no 2027 outcome will be presented as measured data.",
      },
      {
        question: "When will the findings be published?",
        answer:
          "When the dataset passes every item in the data-status checklist above, including sample size, period and permission to publish. This page does not commit to a date.",
      },
      {
        question: "Will Huntlo customer data be used?",
        answer:
          "The proposed design uses only aggregated, anonymised platform activity, and only where Huntlo has permission to publish it. The final data sources will be confirmed in the methodology appendix before any figure is released.",
      },
      {
        question: "How is this different from the Candidate Response Rate Benchmark?",
        answer:
          "This report covers how teams adopt and govern AI across every recruiting stage. The [Candidate Response Rate Benchmark](/research/candidate-response-rate-benchmark) measures one outcome, candidate replies to outreach, using fixed metric definitions.",
      },
      {
        question: "Can my team take part?",
        answer:
          "Recruiting teams interested in contributing can [contact the Huntlo team](/contact). Participation details will be confirmed before fieldwork starts.",
      },
    ],
    related: [
      {
        name: "Candidate Response Rate Benchmark",
        href: "/research/candidate-response-rate-benchmark",
        icon: "forum",
        description: "Planned benchmark of candidate replies to outreach, with published metric definitions.",
      },
      {
        name: "Human + AI Hiring",
        href: "/human-ai-hiring",
        icon: "diversity_3",
        description: "How Huntlo divides work between AI agents and recruiters.",
      },
      {
        name: "What Is Agentic Hiring?",
        href: "/learn/what-is-agentic-hiring",
        icon: "school",
        description: "A vendor-neutral definition of the concept this report measures.",
      },
      {
        name: "AI Recruitment Analytics",
        href: "/capabilities/ai-recruitment-analytics",
        icon: "monitoring",
        description: "Track outreach, replies and pipeline progression as work happens.",
      },
    ],
    sources: [],
    published: "2026-11-13",
    lastUpdated: "2026-11-13",
  },
  {
    slug: "candidate-response-rate-benchmark",
    name: "Candidate Response Rate Benchmark",
    title: "Candidate Response Rate Benchmark",
    kind: "Benchmark",
    dataOrigin: "Original Huntlo research",
    icon: "forum",
    summary:
      "How often candidates reply to recruiter outreach, by channel, role type and sequence step, using one published definition of a response.",
    seo: {
      title: "Candidate Response Rate Benchmark: Metric Definitions & Method | Huntlo",
      description:
        "How Huntlo will benchmark candidate reply rates to recruiter outreach by channel and sequence step. Metric definitions and methodology; figures not yet published.",
      ogTitle: "Candidate Response Rate Benchmark",
      ogDescription:
        "Published definitions for response rate, positive response rate and time to first reply, ahead of Huntlo's candidate outreach benchmark.",
    },
    answer:
      "The Candidate Response Rate Benchmark will report how often candidates reply to recruiter outreach, broken down by channel, role type and follow-up step, using one published definition of a response. The metric definitions and methodology are published here. No benchmark figures have been published yet.",
    status: "methodology",
    atAGlance: [
      { label: "Research type", value: "Benchmark" },
      { label: "Status", value: "Definitions published · figures pending" },
      { label: "Channels", value: "Email and WhatsApp" },
      { label: "Sample", value: "Not yet determined" },
      { label: "Publisher", value: "Huntlo" },
    ],
    researchQuestions: [
      "What share of contacted candidates reply to recruiter outreach?",
      "How do reply rates differ between email and WhatsApp?",
      "How much do follow-up messages add, and at which step do most replies arrive?",
      "How long do candidates take to send a first reply?",
      "How do reply rates vary by seniority, job function and hiring model?",
    ],
    scope: [
      {
        label: "Proposed data source",
        value: "Aggregated, anonymised outreach activity from Huntlo workspaces, used only where Huntlo has permission to publish it.",
      },
      {
        label: "Channels",
        value: "Email and WhatsApp. LinkedIn messages are excluded because Huntlo's integrations page lists the LinkedIn integration as coming soon.",
      },
      {
        label: "Segments",
        value: "Channel, sequence step, seniority, job function, hiring model and region, subject to minimum sample sizes.",
      },
      { label: "Data-collection period", value: "Not yet set.", pending: true },
      { label: "Sample size", value: "Not yet determined; published with the figures.", pending: true },
    ],
    methodology: [
      {
        icon: "rule_settings",
        title: "Fix the metric definitions first",
        body: "Every metric in the table below is defined before any data is pulled, so the definitions cannot be adjusted to flatter the results.",
      },
      {
        icon: "dataset",
        title: "Extract aggregated activity",
        body: "Only counts and timings are used: messages delivered, replies received, reply classification and timestamps. Message content and candidate identities are not part of the dataset.",
      },
      {
        icon: "filter_alt",
        title: "Apply exclusions",
        body: "Bounced and undelivered messages, contacts who had opted out, internal test sends and automated replies are removed, and the number removed is reported.",
      },
      {
        icon: "pie_chart",
        title: "Segment with minimum sample sizes",
        body: "Any segment below a minimum sample size, fixed before analysis, is suppressed rather than reported with a misleading figure.",
      },
      {
        icon: "fact_check",
        title: "Report medians, ranges and limitations",
        body: "Rates are reported with the number of contacts behind them. Time measures use medians, and every chart has a matching data table.",
      },
    ],
    definitions: {
      title: "Metric definitions",
      intro:
        "These definitions apply to every figure the benchmark will publish. You can also use them to calculate your own team's rates on the same basis.",
      headers: ["Metric", "Definition", "Excludes"],
      rows: [
        {
          label: "Contacted candidates",
          cells: [
            "Unique candidates who received at least one delivered outreach message during the period.",
            "Bounced or undelivered messages, contacts who opted out before sending, internal test contacts.",
          ],
        },
        {
          label: "Response rate",
          cells: [
            "Unique candidates who sent any reply written by a person within the measurement window, divided by contacted candidates. A \"not interested\" reply counts as a response. The window will be published with the figures.",
            "Out-of-office and other automated replies, bounce notifications.",
          ],
        },
        {
          label: "Positive response rate",
          cells: [
            "Unique candidates whose reply expresses interest in the role or a conversation, divided by contacted candidates.",
            "Replies that cannot be classified. The classification method will be published with the figures.",
          ],
        },
        {
          label: "Time to first reply",
          cells: [
            "Median time between the first delivered message and the candidate's first reply.",
            "Candidates who did not reply. Medians are used so a few very late replies do not distort the figure.",
          ],
        },
        {
          label: "Replies by sequence step",
          cells: [
            "Share of all first replies that arrive after the first message, the first follow-up, the second follow-up, and so on.",
            "Sequences edited part-way through, where the step order is no longer comparable.",
          ],
        },
        {
          label: "Opt-out rate",
          cells: [
            "Unique candidates who asked not to be contacted again, divided by contacted candidates.",
            "Opt-outs recorded before the first delivered message.",
          ],
        },
      ],
    },
    definitionsNote:
      "Email open rate is deliberately not a benchmark metric: mail privacy features and security scanners can register opens that no person made, so open rates are not a reliable measure of candidate attention.",
    plannedOutputs: [
      {
        icon: "summarize",
        title: "Executive summary and key takeaways",
        body: "Headline rates with the number of contacts behind each, and the caveats that apply.",
      },
      {
        icon: "compare_arrows",
        title: "Email vs WhatsApp",
        body: "Response and positive response rates by channel, shown as a chart with a matching table.",
      },
      {
        icon: "timeline",
        title: "Follow-up effect",
        body: "How replies are distributed across sequence steps, and the point at which more follow-ups stop adding replies.",
      },
      {
        icon: "schedule",
        title: "Time to first reply",
        body: "Median reply times by channel and segment.",
      },
      {
        icon: "segment",
        title: "Segment cuts",
        body: "Seniority, job function, hiring model and region, where sample sizes allow.",
      },
      {
        icon: "description",
        title: "Methodology appendix",
        body: "Sample composition, exclusions applied, the reply classification method and known limitations.",
      },
    ],
    methodologyDisclosure: [
      { label: "Number of messages", status: "pending", detail: "Delivered messages behind each figure, published with the figures." },
      { label: "Number of candidates", status: "pending", detail: "Unique contacted candidates behind each figure." },
      { label: "Time period", status: "pending", detail: "Start and end dates of the outreach measured, plus the reply window." },
      { label: "Industries", status: "pending", detail: "Industries represented, reported only where segments meet the minimum sample." },
      { label: "Geographies", status: "pending", detail: "Countries and regions represented, with the same minimum-sample rule." },
      { label: "Seniority", status: "defined", detail: "Reported as a segment, using seniority bands published with the figures." },
      { label: "Channel", status: "defined", detail: "Email and WhatsApp, reported separately and never silently combined." },
      {
        label: "Sequence length",
        status: "defined",
        detail: "Replies reported by sequence step; sequences edited part-way through are excluded.",
      },
      {
        label: "Positive vs total response",
        status: "defined",
        detail: "Positive response rate is always reported separately from total response rate.",
      },
      { label: "Bounces", status: "defined", detail: "Bounced and undelivered messages are excluded from every denominator." },
      {
        label: "Huntlo customer data",
        status: "defined",
        detail: "Yes. Data comes only from Huntlo workspaces, so it may not represent all recruiting teams.",
      },
      {
        label: "Anonymisation",
        status: "defined",
        detail: "Only aggregated counts and timings are used. No message content or candidate identities are included.",
      },
    ],
    willNotClaim: [
      "An \u201Cindustry average\u201D response rate drawn from Huntlo workspaces alone.",
      "That Huntlo gets more replies than other tools.",
      "That AI increases reply rates by a given amount, unless the data directly supports it.",
    ],
    governance: [
      PENDING_FIELDS.owner,
      {
        label: "Data source",
        status: "pending",
        detail: "Proposed: permissioned, anonymised Huntlo outreach activity. Not yet confirmed.",
      },
      PENDING_FIELDS.sample,
      PENDING_FIELDS.period,
      {
        label: "Definition",
        status: "defined",
        detail: "All six metrics are defined in the table on this page.",
      },
      {
        label: "Calculation",
        status: "defined",
        detail: "Unique candidates as the denominator; medians for time measures.",
      },
      {
        label: "Exclusions",
        status: "defined",
        detail: "Bounces, prior opt-outs, test contacts, automated replies and undersized segments.",
      },
      PENDING_FIELDS.permission,
      PENDING_FIELDS.verified,
    ],
    faqs: [
      {
        question: "Is there benchmark data on this page yet?",
        answer:
          "No. This page publishes the metric definitions and methodology only. It does not contain response-rate figures, and none should be quoted from it.",
      },
      {
        question: "What counts as a candidate response?",
        answer:
          "Any reply written by a person, including \"not interested\". Automated replies such as out-of-office messages do not count. Replies that express interest are tracked separately as the **positive response rate**.",
      },
      {
        question: "Why doesn't the benchmark use email open rates?",
        answer:
          "Mail privacy features and security scanners can register opens that no person made. Replies are a direct signal that a candidate engaged, so the benchmark is built on replies.",
      },
      {
        question: "Why are LinkedIn messages excluded?",
        answer:
          "The benchmark covers channels Huntlo sends through directly. Huntlo's [integrations page](/integrations) lists Gmail and WhatsApp as available and LinkedIn as coming soon.",
      },
      {
        question: "Can I compare my team's reply rate with these definitions now?",
        answer:
          "Yes. Divide the number of unique candidates who replied by the number who received at least one delivered message in the same period, and apply the exclusions in the table above. Then your figure will be comparable with the benchmark once it is published.",
      },
    ],
    related: [
      {
        name: "AI Candidate Outreach",
        href: "/capabilities/ai-candidate-outreach",
        icon: "send",
        description: "Personalised email and WhatsApp outreach with reply-triggered next steps.",
      },
      {
        name: "AI Candidate Engagement",
        href: "/capabilities/ai-candidate-engagement",
        icon: "forum",
        description: "Keep candidates informed between first reply and interview.",
      },
      {
        name: "State of AI Recruitment 2027",
        href: "/research/state-of-ai-recruitment-2027",
        icon: "insights",
        description: "Planned outlook report on AI adoption and oversight across recruiting stages.",
      },
      {
        name: "Recruitment Automation ROI Calculator",
        href: "/tools/recruitment-automation-roi-calculator",
        icon: "calculate",
        description: "Estimate recruiter time freed by automating outreach and follow-ups.",
      },
    ],
    sources: [],
    published: "2026-11-13",
    lastUpdated: "2026-11-13",
  },
];

/** Standards every Huntlo study follows, shown on the research hub. */
export const RESEARCH_STANDARDS: LearnCard[] = [
  {
    icon: "help",
    title: "State the question and scope",
    body: "Each study opens with its research question, who it covers, the sample and the date range.",
  },
  {
    icon: "rule",
    title: "Define metrics before collecting data",
    body: "Definitions and exclusions are published first and are not changed to suit the results.",
  },
  {
    icon: "call_split",
    title: "Separate data from interpretation",
    body: "Observed figures, Huntlo's interpretation and recommendations are labelled separately.",
  },
  {
    icon: "table_chart",
    title: "Text and tables, not just charts",
    body: "Every chart has the same figures in a readable, crawlable table.",
  },
  {
    icon: "menu_book",
    title: "Cite sources and dates",
    body: "Primary sources are linked on the page, with the period each figure covers.",
  },
  {
    icon: "badge",
    title: "Clear publisher and review date",
    body: "Each study names Huntlo as publisher and shows when it was first published and last updated.",
  },
];

/** The fields every published figure must carry before release. */
export const METRIC_GOVERNANCE_FIELDS = [
  "Metric owner",
  "Data source",
  "Sample size",
  "Period",
  "Definition",
  "Calculation",
  "Exclusions",
  "Permission to publish",
  "Last verified date",
] as const;

export const RESEARCH_HUB_FAQS = [
  {
    question: "What is Hiring Intelligence Research?",
    answer:
      "It is where Huntlo publishes original research and benchmarks on AI-assisted recruiting. Each study publishes its research question, scope, sample and methodology, and keeps observed data separate from interpretation.",
  },
  {
    question: "Have any findings been published yet?",
    answer:
      "Not yet. Both studies listed here have published their research design and metric definitions, but no findings. Figures will only appear once every item in the governance checklist is complete.",
  },
  {
    question: "Why publish the methodology before the findings?",
    answer:
      "Publishing definitions first means they cannot be adjusted afterwards to make the results look better. It also lets teams measure their own data on the same basis.",
  },
  {
    question: "Can I use Huntlo research in my own work?",
    answer:
      "Once findings are published, you can cite them with a link to the study page and the period the figures cover. Until then, please do not quote figures as Huntlo research.",
  },
] as const;

export function researchPath(slug: string) {
  return `${RESEARCH_PATH}/${slug}`;
}

export function getResearchReport(slug: string) {
  return RESEARCH_REPORTS.find((report) => report.slug === slug);
}

export function isResearchPublished(report: ResearchReport) {
  return report.status === "findings";
}

export function researchBreadcrumbs(report?: ResearchReport): BreadcrumbSchemaItem[] {
  const trail: BreadcrumbSchemaItem[] = [
    { name: "Home", href: "/" },
    { name: "Research", href: RESEARCH_PATH },
  ];
  if (report) trail.push({ name: report.name, href: researchPath(report.slug) });
  return trail;
}

export function researchStatusLabel(report: ResearchReport) {
  return report.status === "findings" ? "Findings published" : "Methodology published · findings pending";
}
