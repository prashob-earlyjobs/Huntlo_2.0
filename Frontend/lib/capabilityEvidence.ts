export type CapabilityStage = {
  id: string;
  label: string;
  summary: string;
  slugs: string[];
};

/** Process-oriented taxonomy used by the capabilities hub and platform map. */
export const CAPABILITY_STAGES: CapabilityStage[] = [
  {
    id: "discover",
    label: "Discover",
    summary: "Find and prioritise the right people for a role.",
    slugs: ["ai-candidate-sourcing", "vibe-sourcing", "ai-candidate-matching"],
  },
  {
    id: "engage",
    label: "Engage",
    summary: "Start conversations and keep candidates moving.",
    slugs: ["ai-candidate-outreach", "ai-candidate-engagement"],
  },
  {
    id: "evaluate",
    label: "Evaluate",
    summary: "Check fit consistently before people decide.",
    slugs: ["ai-candidate-screening", "ai-voice-interviews", "ai-recruitment-assessments"],
  },
  {
    id: "coordinate",
    label: "Coordinate",
    summary: "Move candidates between stages without manual handoffs.",
    slugs: ["ai-interview-scheduling", "recruitment-workflow-automation"],
  },
  {
    id: "improve",
    label: "Remember & improve",
    summary: "Keep candidate context and learn from every requisition.",
    slugs: ["ai-recruitment-crm", "ai-talent-pool-management", "ai-recruitment-analytics"],
  },
];

export type CapabilitySolutionLink = { title: string; href: string; description: string };

const SOLUTION = {
  rpo: {
    title: "AI Platform for RPO Companies",
    href: "/solutions/rpo",
    description: "Run delivery across client programs from one workspace.",
  },
  executiveSearch: {
    title: "AI Platform for Executive Search",
    href: "/solutions/executive-search",
    description: "Market maps and discreet outreach led by consultants.",
  },
  itStaffing: {
    title: "AI Platform for IT Staffing",
    href: "/solutions/it-staffing",
    description: "Skill-aware sourcing and fast, reviewed submissions.",
  },
  healthcare: {
    title: "AI Healthcare Recruitment",
    href: "/solutions/healthcare-recruitment",
    description: "Reach clinical talent around shifts and rosters.",
  },
  manufacturing: {
    title: "AI Manufacturing Recruitment",
    href: "/solutions/manufacturing-recruitment",
    description: "Staff shifts across sites with less coordination.",
  },
  bpo: {
    title: "AI BPO Recruitment",
    href: "/solutions/bpo-recruitment",
    description: "High-volume hiring without high-volume busywork.",
  },
  gcc: {
    title: "AI Hiring for GCCs",
    href: "/solutions/global-capability-centers",
    description: "Scale capability-center teams on governed automation.",
  },
  campus: {
    title: "AI Campus Recruitment",
    href: "/solutions/campus-recruitment",
    description: "Run campus drives across institutions at scale.",
  },
} satisfies Record<string, CapabilitySolutionLink>;

export type CapabilityEvidence = {
  /** Short description for hub cards. */
  short: string;
  outcomes: [string, string, string];
  solutions: CapabilitySolutionLink[];
};

export const CAPABILITY_EVIDENCE: Record<string, CapabilityEvidence> = {
  "ai-candidate-sourcing": {
    short: "Find active and passive candidates from a plain-language role brief.",
    outcomes: [
      "Start from a role brief, not a Boolean string",
      "Reach passive candidates that keyword search misses",
      "Hand shortlisted profiles straight to outreach",
    ],
    solutions: [SOLUTION.itStaffing, SOLUTION.executiveSearch],
  },
  "vibe-sourcing": {
    short: "Describe who succeeds in the role and discover by working style.",
    outcomes: [
      "Describe success in the role, not CV keywords",
      "Surface overlooked and non-linear backgrounds",
      "Recruiters confirm every working-style match",
    ],
    solutions: [SOLUTION.executiveSearch, SOLUTION.gcc],
  },
  "ai-candidate-matching": {
    short: "Rank candidates by skill depth, seniority, domain and trajectory.",
    outcomes: [
      "Review the strongest role matches first",
      "See why each candidate ranks where they do",
      "Spot gaps to probe before screening",
    ],
    solutions: [SOLUTION.itStaffing, SOLUTION.gcc],
  },
  "ai-candidate-outreach": {
    short: "Personalised Email and WhatsApp sequences with automatic follow-ups.",
    outcomes: [
      "Personalised messages from real candidate context",
      "Email and WhatsApp sequences with automatic follow-ups",
      "Replies trigger the next step instantly",
    ],
    solutions: [SOLUTION.rpo, SOLUTION.healthcare],
  },
  "ai-candidate-engagement": {
    short: "Keep candidates informed between first reply and interview.",
    outcomes: [
      "Candidates hear from you between every stage",
      "Timely nudges for screens and scheduling",
      "One conversation across Email, WhatsApp and calendar",
    ],
    solutions: [SOLUTION.healthcare, SOLUTION.campus],
  },
  "ai-candidate-screening": {
    short: "Evaluate applicants consistently against role criteria and rubrics.",
    outcomes: [
      "Apply the same criteria to every applicant",
      "See the evidence behind each rubric result",
      "Recruiters decide who advances, with override",
    ],
    solutions: [SOLUTION.bpo, SOLUTION.rpo],
  },
  "ai-voice-interviews": {
    short: "Structured preliminary voice screens with transcripts and summaries.",
    outcomes: [
      "Preliminary screens run without recruiter phone time",
      "Transcript, rubric and summary for every call",
      "Recruiters review outcomes and decide next steps",
    ],
    solutions: [SOLUTION.bpo, SOLUTION.manufacturing],
  },
  "ai-recruitment-assessments": {
    short: "Role-relevant skill assessments with scoring and candidate reports.",
    outcomes: [
      "Role-relevant skill evidence before panel interviews",
      "Automated scoring with task-level detail",
      "Reports panels can use to focus interviews",
    ],
    solutions: [SOLUTION.campus, SOLUTION.itStaffing],
  },
  "ai-interview-scheduling": {
    short: "Candidate self-booking against panel calendars and time zones.",
    outcomes: [
      "Qualified candidates self-book while interest is high",
      "Panel availability and time zones handled",
      "Confirmations, reminders and reschedules automated",
    ],
    solutions: [SOLUTION.campus, SOLUTION.manufacturing],
  },
  "recruitment-workflow-automation": {
    short: "Connect candidate events to approved next steps across stages.",
    outcomes: [
      "Candidate events trigger approved next steps",
      "Fewer manual handoffs between stages",
      "Every automated step is visible and reviewable",
    ],
    solutions: [SOLUTION.bpo, SOLUTION.gcc],
  },
  "ai-recruitment-crm": {
    short: "One searchable record of every conversation and candidate history.",
    outcomes: [
      "One record per candidate across requisitions",
      "Conversations, transcripts and notes in one place",
      "History that stays with the team, not one inbox",
    ],
    solutions: [SOLUTION.rpo, SOLUTION.executiveSearch],
  },
  "ai-talent-pool-management": {
    short: "Turn past sourcing into reusable, campaign-ready talent pools.",
    outcomes: [
      "Reuse past sourcing work for new roles",
      "Filter pools into campaign-ready shortlists",
      "Shared records the whole team can work from",
    ],
    solutions: [SOLUTION.itStaffing, SOLUTION.rpo],
  },
  "ai-recruitment-analytics": {
    short: "Track outreach, replies and pipeline progression as work happens.",
    outcomes: [
      "See outreach, replies and progression as it happens",
      "Find bottlenecks before monthly reporting",
      "Recruiter and agent activity in one view",
    ],
    solutions: [SOLUTION.gcc, SOLUTION.rpo],
  },
};
