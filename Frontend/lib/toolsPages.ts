import type { BreadcrumbSchemaItem } from "@/lib/jsonLd";
import type { LearnCard, LearnFaq, LearnLink, LearnSource } from "@/lib/learnPages";
import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const TOOLS_PATH = "/tools";
export const TOOLS_OG_IMAGE = OG_IMAGES.resources;

export const TOOLS_SEO = {
  title: "Recruitment Calculators & Hiring Tools | Huntlo",
  description:
    "Free recruitment calculators for cost per hire and recruitment automation ROI. Every formula and assumption is shown, and results are estimates you can check by hand.",
  ogTitle: "Recruitment Tools & Calculators",
  ogDescription:
    "Transparent calculators for recruiting teams: cost per hire and recruitment automation ROI, with formulas and assumptions on the page.",
} as const;

export function toolsMetadata() {
  return buildPageMetadata({
    title: TOOLS_SEO.title,
    description: TOOLS_SEO.description,
    ogTitle: TOOLS_SEO.ogTitle,
    ogDescription: TOOLS_SEO.ogDescription,
    ogImage: TOOLS_OG_IMAGE,
    path: TOOLS_PATH,
  });
}

export type ToolSlug = "cost-per-hire-calculator" | "recruitment-automation-roi-calculator";

export type ToolPage = {
  slug: ToolSlug;
  /** Breadcrumb label and card title. */
  name: string;
  /** The page H1. */
  title: string;
  icon: string;
  summary: string;
  seo: { title: string; description: string; ogTitle: string; ogDescription: string };
  /** Answer-first block shown under the H1. */
  answer: string;
  atAGlance: { label: string; value: string }[];
  /** The single most important limitation, shown on the hub card. */
  keyLimitation: string;
  whoFor: LearnCard[];
  estimates: string[];
  formulas: { label: string; formula: string }[];
  assumptions: string[];
  limitations: string[];
  faqs: LearnFaq[];
  related: LearnLink[];
  sources: LearnSource[];
  /** ISO date (YYYY-MM-DD). */
  published: string;
  /** ISO date (YYYY-MM-DD). */
  lastUpdated: string;
};

export const TOOL_PAGES: ToolPage[] = [
  {
    slug: "cost-per-hire-calculator",
    name: "Cost Per Hire Calculator",
    title: "Cost Per Hire Calculator",
    icon: "payments",
    summary:
      "Add up external and internal recruiting costs for a period and divide by hires to get cost per hire, with a breakdown of which costs drive it.",
    seo: {
      title: "Cost Per Hire Calculator: Free Formula & Breakdown | Huntlo",
      description:
        "Calculate cost per hire from external and internal recruiting costs using the ANSI/SHRM formula. See which cost lines drive your result. Free, no sign-up.",
      ogTitle: "Cost Per Hire Calculator",
      ogDescription:
        "Work out cost per hire from external and internal recruiting costs, with the formula and every assumption shown on the page.",
    },
    answer:
      "Cost per hire is the total cost of recruiting in a period, external spend plus internal costs, divided by the number of hires made in that same period. This calculator follows the structure of the ANSI/SHRM cost-per-hire standard and shows which cost lines drive your result.",
    atAGlance: [
      { label: "Estimates", value: "Cost per hire and cost breakdown" },
      { label: "Formula basis", value: "ANSI/SHRM cost-per-hire structure" },
      { label: "Inputs", value: "12 cost lines and number of hires" },
      { label: "Data handling", value: "Runs in your browser; inputs are not submitted" },
      { label: "Stored by Huntlo", value: "No; nothing you enter is saved" },
    ],
    keyLimitation: "Measures cost, not quality of hire or time to fill.",
    whoFor: [
      {
        icon: "account_balance",
        title: "Talent-acquisition leaders",
        body: "Set or defend a recruiting budget with a cost-per-hire figure you can trace back to individual cost lines.",
      },
      {
        icon: "tune",
        title: "Recruiting operations",
        body: "Find the cost lines that dominate spend, such as agency fees or advertising, and track them from one period to the next.",
      },
      {
        icon: "request_quote",
        title: "Finance and HR business partners",
        body: "Check that recruiting cost is reported the same way each period, with internal team cost included alongside external spend.",
      },
    ],
    estimates: [
      "Your cost per hire for the period you enter.",
      "Total external and internal recruiting cost, and the split between them.",
      "Each cost line's share of total cost and its contribution to cost per hire.",
    ],
    formulas: [
      { label: "Cost per hire", formula: "(Total external costs + Total internal costs) ÷ Number of hires" },
      { label: "Total external costs", formula: "Sum of the external cost lines you enter" },
      { label: "Total internal costs", formula: "Sum of the internal cost lines you enter" },
      { label: "Share of a cost line", formula: "Cost line ÷ (Total external costs + Total internal costs)" },
      { label: "Cost line per hire", formula: "Cost line ÷ Number of hires" },
    ],
    assumptions: [
      "Costs and hires cover the same period, for example one quarter or one financial year.",
      "Costs are entered as totals for the period, not per hire. Year-long items such as software licences are divided across the period you measure.",
      "Cost lines are grouped as the standard groups them: recruiting technology, referral awards, relocation and sign-on bonuses are external costs; recruiting staff, hiring-manager time and office overhead are internal.",
      "Internal labour is fully loaded (salary, benefits and incentives) and limited to time spent on recruiting.",
      "Hires are counted from one system of record, using one definition (accepted offer or start date) consistently.",
      "The currency selector changes the symbol only. No exchange-rate conversion is applied.",
    ],
    limitations: [
      "Cost per hire excludes post-hire costs such as the new employee's salary, training or time to productivity, in line with the standard.",
      "It measures cost, not quality. A low cost per hire can hide poor quality of hire or slow time to fill.",
      "This calculator follows the standard's internal version, where every line is optional. The standard defines a stricter comparable version for benchmarking between organisations.",
      "The result is an estimate for planning, not an accounting figure.",
    ],
    faqs: [
      {
        question: "What is the formula for cost per hire?",
        answer:
          "Cost per hire = (total external recruiting costs + total internal recruiting costs) ÷ total hires in the same period. External costs are paid to outside parties, such as agencies, job boards, recruiting technology and background checks. Internal costs are your own resources, such as recruiting-team pay, hiring-manager interview time and office overhead.",
      },
      {
        question: "What is a good cost per hire?",
        answer:
          "There is no single good figure: it depends on role mix, seniority, location and hiring volume. This page does not publish a benchmark figure. Compare your result against your own previous periods with the same cost lines first.",
      },
      {
        question: "Should recruiter salaries be included?",
        answer:
          "Yes. Include the fully loaded cost (salary, benefits and overheads) of the time your recruiting team spends on recruiting. Leaving it out understates cost per hire, especially for teams that rely less on agencies.",
      },
      {
        question: "What is the difference between cost per hire and cost of vacancy?",
        answer:
          "Cost per hire measures what you spend to fill roles. Cost of vacancy estimates what an unfilled role costs the business while it stays open, such as lost output or overtime. They answer different questions and should not be added together.",
      },
      {
        question: "How can automation reduce cost per hire?",
        answer:
          "Automating sourcing, outreach follow-ups and interview scheduling reduces the recruiter time each hire needs. That lowers the internal cost line only if the time is redeployed or not backfilled. Use the [Recruitment Automation ROI Calculator](/tools/recruitment-automation-roi-calculator) to estimate it with your own assumptions.",
      },
    ],
    related: [
      {
        name: "Recruitment Automation ROI Calculator",
        href: "/tools/recruitment-automation-roi-calculator",
        icon: "calculate",
        description: "Estimate the recruiter time and cost automation could free up.",
      },
      {
        name: "AI Recruitment Analytics",
        href: "/capabilities/ai-recruitment-analytics",
        icon: "monitoring",
        description: "Track outreach, replies and pipeline progression as work happens.",
      },
      {
        name: "Recruitment Workflow Automation",
        href: "/capabilities/recruitment-workflow-automation",
        icon: "account_tree",
        description: "Connect candidate events to approved follow-ups, screening and scheduling.",
      },
      {
        name: "Huntlo pricing",
        href: "/pricing",
        icon: "sell",
        description: "Plan costs to enter as a recruiting-technology cost line.",
      },
    ],
    sources: [
      {
        title: "What external and internal costs should be included in a cost-per-hire calculation?",
        publisher: "SHRM (Society for Human Resource Management)",
        url: "https://www.shrm.org/topics-tools/tools/hr-answers/external-internal-costs-included-cost-per-hire-calculation",
        date: "2023-12-06",
      },
    ],
    published: "2026-11-13",
    lastUpdated: "2026-11-13",
  },
  {
    slug: "recruitment-automation-roi-calculator",
    name: "Recruitment Automation ROI Calculator",
    title: "Recruitment Automation ROI Calculator",
    icon: "calculate",
    summary:
      "Estimate the recruiter hours automation could free up across sourcing, outreach, screening and scheduling, what that time is worth, and the payback against platform cost.",
    seo: {
      title: "Recruitment Automation ROI Calculator: Time & Cost Savings | Huntlo",
      description:
        "Estimate hours saved, value of recruiter time, ROI and payback from recruitment automation using your own team data. Formulas shown; results are estimates.",
      ogTitle: "Recruitment Automation ROI Calculator",
      ogDescription:
        "Estimate recruiter time freed, ROI and payback from automating sourcing, outreach, screening and scheduling, using your own assumptions.",
    },
    answer:
      "This calculator estimates how many recruiter hours automation could free up across sourcing, outreach, screening and scheduling, what that time is worth at your team's own cost, and how it compares with the cost of an automation platform. Every input, including the expected time reduction for each task, is your own assumption; the calculator uses no Huntlo performance data.",
    atAGlance: [
      { label: "Estimates", value: "Hours saved, value of time, ROI and payback" },
      { label: "Formula basis", value: "Time saved × fully loaded hourly cost" },
      { label: "Inputs", value: "Measured team data, then your stated assumptions" },
      { label: "Data handling", value: "Runs in your browser; inputs are not submitted" },
      { label: "Stored by Huntlo", value: "No; nothing you enter is saved" },
    ],
    keyLimitation: "Time freed is capacity, not cash, until it is redeployed or avoids hiring.",
    whoFor: [
      {
        icon: "groups",
        title: "Recruiting leaders building a business case",
        body: "Turn time spent on repetitive recruiting work into a capacity and cost estimate that finance can check.",
      },
      {
        icon: "work_history",
        title: "Staffing, RPO and search teams",
        body: "See how much recruiter capacity automation could return to client delivery, candidate relationships and submissions.",
      },
      {
        icon: "science",
        title: "Teams running a pilot",
        body: "Enter the time reductions you measured in a trial to check whether results justify a wider rollout.",
      },
    ],
    estimates: [
      "Recruiter hours freed per week and per year across the whole team.",
      "The value of that time at your team's fully loaded hourly cost.",
      "Capacity freed, expressed as full-time-equivalent recruiters.",
      "Net first-year benefit, first-year and ongoing ROI, and payback period against platform and implementation cost.",
    ],
    formulas: [
      { label: "Hourly cost", formula: "Annual cost per recruiter ÷ (Working hours per week × Working weeks per year)" },
      {
        label: "Team hours saved per week",
        formula: "Σ (Recruiters × Hours per week on task × Expected time reduction %) × Adoption level %",
      },
      { label: "Hours saved per year", formula: "Team hours saved per week × Working weeks per year" },
      { label: "Annual benefit (value of time saved)", formula: "Hours saved per year × Hourly cost" },
      { label: "Capacity freed (FTE)", formula: "Hours saved per year ÷ (Working hours per week × Working weeks per year)" },
      { label: "First-year benefit", formula: "Annual benefit × (12 − Implementation months) ÷ 12" },
      { label: "First-year cost", formula: "Annual platform cost + One-time implementation cost" },
      { label: "Net first-year benefit", formula: "First-year benefit − First-year cost" },
      { label: "First-year ROI", formula: "Net first-year benefit ÷ First-year cost × 100" },
      { label: "Ongoing annual ROI", formula: "(Annual benefit − Annual platform cost) ÷ Annual platform cost × 100" },
      { label: "Payback period", formula: "Implementation months + First-year cost ÷ (Annual benefit ÷ 12) months" },
    ],
    assumptions: [
      "Inputs are split into measured facts (team, hours, costs) and your assumptions (time reduction, adoption, implementation period). Each result lists the assumptions beneath it.",
      "Time reductions are entered by you. There are no defaults, because Huntlo has not published verified benchmark data for them.",
      "Hours per task should be measured, for example from a two-week time log, rather than estimated from memory.",
      "Annual cost per recruiter is fully loaded: salary, benefits, taxes and overheads.",
      "Adoption defaults to 100% and the implementation period to zero if left blank. Savings are otherwise applied evenly to every recruiter and working week.",
      "The currency selector changes the symbol only. No exchange-rate conversion is applied.",
    ],
    limitations: [
      "Time saved is capacity, not cash. It only becomes a cost saving if the time is redeployed to higher-value work or avoids extra hiring.",
      "It does not model quality of hire, time to fill, candidate experience, or placement revenue for staffing firms.",
      "It assumes the time reduction you enter holds across every role and recruiter, which real teams rarely see.",
      "Results are estimates, not guaranteed savings or a quote.",
    ],
    faqs: [
      {
        question: "What time reduction percentage should I use?",
        answer:
          "Use figures from your own pilot or trial wherever possible, and be conservative. This calculator deliberately provides no default reduction rates, because Huntlo has not published verified benchmark data for them.",
      },
      {
        question: "Does time saved mean we can reduce headcount?",
        answer:
          "Not necessarily. Most teams use freed time for candidate relationships, hiring-manager alignment and harder-to-fill roles. Treat the result as capacity first; it becomes a cash saving only if it avoids hiring or reduces agency spend.",
      },
      {
        question: "Which recruiting tasks does Huntlo automate?",
        answer:
          "Huntlo automates [candidate outreach](/capabilities/ai-candidate-outreach) and follow-ups, preliminary [AI voice interviews](/capabilities/ai-voice-interviews), [interview scheduling](/capabilities/ai-interview-scheduling) and [workflow automation](/capabilities/recruitment-workflow-automation), while recruiters keep every hiring decision.",
      },
      {
        question: "Where do I find the platform cost to enter?",
        answer:
          "Use the annual cost of the plan and seats you would actually need. Huntlo's plans are listed on the [pricing page](/pricing); for enterprise pricing, [book a demo](/book-a-demo).",
      },
      {
        question: "Why is my ROI negative?",
        answer:
          "Either the time saved is worth less than the first-year cost, or the hours and reductions you entered are small. Check that hours per task are per recruiter per week, and remember that one-time implementation costs only affect the first year.",
      },
    ],
    related: [
      {
        name: "Cost Per Hire Calculator",
        href: "/tools/cost-per-hire-calculator",
        icon: "payments",
        description: "Work out cost per hire from external and internal recruiting costs.",
      },
      {
        name: "Recruitment Workflow Automation",
        href: "/capabilities/recruitment-workflow-automation",
        icon: "account_tree",
        description: "Connect candidate events to approved follow-ups, screening and scheduling.",
      },
      {
        name: "AI Interview Scheduling",
        href: "/capabilities/ai-interview-scheduling",
        icon: "event_available",
        description: "Let qualified candidates self-book against panel availability.",
      },
      {
        name: "AI Candidate Outreach",
        href: "/capabilities/ai-candidate-outreach",
        icon: "send",
        description: "Personalised email and WhatsApp outreach with automated follow-ups.",
      },
      {
        name: "Autonomous Recruiting",
        href: "/autonomous-recruiting",
        icon: "rule",
        description: "Workflows that keep moving within recruiter-defined guardrails.",
      },
    ],
    sources: [],
    published: "2026-11-13",
    lastUpdated: "2026-11-13",
  },
];

export const TOOLS_STANDARDS: LearnCard[] = [
  {
    icon: "functions",
    title: "Formula on the page",
    body: "Every calculation is written out in plain text so you can check the result by hand.",
  },
  {
    icon: "edit_note",
    title: "Your inputs, your assumptions",
    body: "No hidden defaults or benchmark figures. Example numbers are optional and clearly labelled.",
  },
  {
    icon: "lock",
    title: "Runs in your browser",
    body: "The calculators do not submit what you type to Huntlo, and no sign-up is needed.",
  },
  {
    icon: "accessibility_new",
    title: "Accessible and mobile-ready",
    body: "Labelled fields, full keyboard support and results written out in text as well as shown visually.",
  },
];

export const TOOLS_HUB_FAQS = [
  {
    question: "Are the calculators free?",
    answer: "Yes. They are free to use, need no sign-up, and run entirely in your browser.",
  },
  {
    question: "Are the results guaranteed savings?",
    answer:
      "No. Results are estimates based on the numbers and assumptions you enter. Each calculator lists its formula and limitations so you can judge how far to rely on it.",
  },
  {
    question: "Does Huntlo see the numbers I enter?",
    answer:
      "No. The calculations happen in your browser, and the calculators do not send your inputs to Huntlo.",
  },
  {
    question: "Why don't the calculators include industry benchmarks?",
    answer:
      "Huntlo only publishes figures it can back with a defined source, sample and period. Benchmarks will be added once the studies in [Hiring Intelligence Research](/research) publish findings.",
  },
] as const;

export function toolPath(slug: string) {
  return `${TOOLS_PATH}/${slug}`;
}

export function getToolPage(slug: string) {
  return TOOL_PAGES.find((tool) => tool.slug === slug);
}

export function toolBreadcrumbs(tool?: ToolPage): BreadcrumbSchemaItem[] {
  const trail: BreadcrumbSchemaItem[] = [
    { name: "Home", href: "/" },
    { name: "Tools", href: TOOLS_PATH },
  ];
  if (tool) trail.push({ name: tool.name, href: toolPath(tool.slug) });
  return trail;
}
