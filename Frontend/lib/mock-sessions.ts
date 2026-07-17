import type { Status } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Reveal costs & quota                                                 */
/* ------------------------------------------------------------------ */

export const REVEAL_COSTS = {
  email: 2,
  mobile: 5,
} as const;

export const REVEAL_QUOTA = {
  emailRemaining: 1860,
  emailTotal: 2500,
  mobileRemaining: 940,
  mobileTotal: 1200,
} as const;

/* ------------------------------------------------------------------ */
/* Match score breakdown                                                */
/* ------------------------------------------------------------------ */

export interface MatchBreakdown {
  skills: number;
  role: number;
  experience: number;
  location: number;
  industry: number;
  education: number;
}

export const MATCH_CATEGORY_LABELS: Record<keyof MatchBreakdown, string> = {
  skills: "Skills match",
  role: "Role match",
  experience: "Experience match",
  location: "Location match",
  industry: "Industry match",
  education: "Education match",
};

/* ------------------------------------------------------------------ */
/* Candidate model                                                      */
/* ------------------------------------------------------------------ */

export type ContactStatus =
  | "Not contacted"
  | "Contacted"
  | "Replied"
  | "In outreach";

export interface ExperienceEntry {
  company: string;
  role: string;
  duration: string;
  description: string;
  current: boolean;
}

export interface EducationEntry {
  school: string;
  degree: string;
  field: string;
  years: string;
}

export interface CandidateActivityEntry {
  id: string;
  kind:
    | "sourced"
    | "saved"
    | "email-revealed"
    | "phone-revealed"
    | "added-to-list"
    | "added-to-outreach"
    | "screening-started";
  title: string;
  time: string;
}

export interface SessionCandidate {
  id: string;
  name: string;
  headline: string;
  currentRole: string;
  currentCompany: string;
  previousCompany: string;
  location: string;
  experienceYears: number;
  skills: string[];
  matchScore: number;
  matchBreakdown: MatchBreakdown;
  contactStatus: ContactStatus;
  saved: boolean;
  linkedin: boolean;
  /** Future Jobs profile_picture_permalink */
  avatarUrl?: string | null;
  email: string;
  emailVerified: boolean;
  phone: string;
  phoneVerified: boolean;
  emailRevealed: boolean;
  phoneRevealed: boolean;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  summary: string;
  signals: string[];
  status: Status;
  updated: string;
  activity: CandidateActivityEntry[];
  similar: { id: string; name: string; headline: string; matchScore: number }[];
}

function activityFor(name: string): CandidateActivityEntry[] {
  return [
    {
      id: "act-1",
      kind: "sourced",
      title: `${name} sourced from AI search`,
      time: "Today, 9:42 AM",
    },
  ];
}

export const SESSION_CANDIDATES: SessionCandidate[] = [
  {
    id: "cand-1",
    name: "Priya Nair",
    headline: "Senior Backend Engineer · payments & ledgers",
    currentRole: "Senior Backend Engineer",
    currentCompany: "Finovate Labs",
    previousCompany: "Paystream",
    location: "Bengaluru",
    experienceYears: 6,
    skills: ["Node.js", "AWS", "PostgreSQL", "Kafka", "TypeScript"],
    matchScore: 92,
    matchBreakdown: {
      skills: 95,
      role: 94,
      experience: 90,
      location: 100,
      industry: 88,
      education: 84,
    },
    contactStatus: "Not contacted",
    saved: true,
    linkedin: true,
    email: "priya.nair@finovatelabs.in",
    emailVerified: true,
    phone: "+91 98450 12345",
    phoneVerified: true,
    emailRevealed: true,
    phoneRevealed: false,
    education: [
      {
        school: "IIT Madras",
        degree: "B.Tech",
        field: "Computer Science",
        years: "2014 – 2018",
      },
    ],
    experience: [
      {
        company: "Finovate Labs",
        role: "Senior Backend Engineer",
        duration: "2022 – Present · 4 yrs",
        description:
          "Owns settlement and ledger services processing ₹4,000 Cr annually. Led migration from monolith to Go/Node microservices on EKS.",
        current: true,
      },
      {
        company: "Paystream",
        role: "Backend Engineer",
        duration: "2019 – 2022 · 3 yrs",
        description:
          "Built UPI collection flows and reconciliation pipelines with Node.js and Postgres.",
        current: false,
      },
      {
        company: "Zenlytic",
        role: "Software Engineer",
        duration: "2018 – 2019 · 1 yr",
        description: "Full-stack product work on analytics dashboards.",
        current: false,
      },
    ],
    summary:
      "Payments-focused backend engineer with 6 years across fintech scale-ups. Strong distributed-systems fundamentals, comfortable owning services end to end, and mentors two junior engineers.",
    signals: [
      "Open to work signals detected",
      "Tenure 4 yrs at current company",
      "Fintech domain match",
      "Active on GitHub this month",
    ],
    status: "Shortlisted",
    updated: "2d ago",
    activity: [
      ...activityFor("Priya Nair"),
      {
        id: "act-2",
        kind: "saved",
        title: "Saved to “Backend bench — Bengaluru”",
        time: "Today, 9:48 AM",
      },
      {
        id: "act-3",
        kind: "email-revealed",
        title: "Email revealed by Ananya Sharma",
        time: "Today, 10:02 AM",
      },
    ],
    similar: [
      { id: "cand-2", name: "Karthik Iyer", headline: "Staff Engineer · Loopworks", matchScore: 89 },
      { id: "cand-4", name: "Divya Rao", headline: "Backend Engineer · Paystream", matchScore: 81 },
    ],
  },
  {
    id: "cand-2",
    name: "Karthik Iyer",
    headline: "Staff Engineer · platform & infra",
    currentRole: "Staff Engineer",
    currentCompany: "Loopworks",
    previousCompany: "Razorpay",
    location: "Bengaluru",
    experienceYears: 9,
    skills: ["Node.js", "Go", "AWS", "Kubernetes", "Terraform"],
    matchScore: 89,
    matchBreakdown: {
      skills: 90,
      role: 82,
      experience: 96,
      location: 100,
      industry: 85,
      education: 80,
    },
    contactStatus: "Contacted",
    saved: false,
    linkedin: true,
    email: "karthik.iyer@loopworks.io",
    emailVerified: true,
    phone: "+91 98860 22334",
    phoneVerified: false,
    emailRevealed: false,
    phoneRevealed: false,
    education: [
      {
        school: "NIT Trichy",
        degree: "B.Tech",
        field: "Information Technology",
        years: "2011 – 2015",
      },
    ],
    experience: [
      {
        company: "Loopworks",
        role: "Staff Engineer",
        duration: "2021 – Present · 5 yrs",
        description:
          "Platform team lead for developer experience; owns CI/CD, service mesh and golden paths for 40+ services.",
        current: true,
      },
      {
        company: "Razorpay",
        role: "Senior Software Engineer",
        duration: "2017 – 2021 · 4 yrs",
        description: "Scaled payment gateway APIs to 3× TPS during festive peaks.",
        current: false,
      },
    ],
    summary:
      "Infra-leaning staff engineer who likes ambiguous zero-to-one platform problems. Prefers hybrid Bengaluru roles with strong engineering culture.",
    signals: ["Recently promoted", "High-growth company background"],
    status: "Contacted",
    updated: "5h ago",
    activity: [
      ...activityFor("Karthik Iyer"),
      {
        id: "act-2",
        kind: "added-to-outreach",
        title: "Added to “Backend Engineer — Sequence A”",
        time: "Yesterday, 4:20 PM",
      },
    ],
    similar: [
      { id: "cand-1", name: "Priya Nair", headline: "Senior Backend Engineer · Finovate Labs", matchScore: 92 },
      { id: "cand-6", name: "Nikhil Bose", headline: "Backend Engineer · CRED", matchScore: 74 },
    ],
  },
  {
    id: "cand-3",
    name: "Sneha Kulkarni",
    headline: "Backend Engineer · marketplaces",
    currentRole: "Backend Engineer II",
    currentCompany: "Swiggy",
    previousCompany: "Freshworks",
    location: "Bengaluru",
    experienceYears: 5,
    skills: ["Node.js", "AWS", "Redis", "MongoDB"],
    matchScore: 84,
    matchBreakdown: {
      skills: 86,
      role: 88,
      experience: 82,
      location: 100,
      industry: 70,
      education: 78,
    },
    contactStatus: "Not contacted",
    saved: false,
    linkedin: true,
    email: "sneha.k@swiggy.in",
    emailVerified: false,
    phone: "+91 99010 44556",
    phoneVerified: true,
    emailRevealed: false,
    phoneRevealed: false,
    education: [
      {
        school: "PES University",
        degree: "B.E.",
        field: "Computer Science",
        years: "2015 – 2019",
      },
    ],
    experience: [
      {
        company: "Swiggy",
        role: "Backend Engineer II",
        duration: "2022 – Present · 4 yrs",
        description:
          "Order orchestration services handling 2M+ daily orders; on-call champion for the fulfilment pod.",
        current: true,
      },
      {
        company: "Freshworks",
        role: "Software Engineer",
        duration: "2019 – 2022 · 3 yrs",
        description: "Built CRM automation workflows and public APIs.",
        current: false,
      },
    ],
    summary:
      "Product-minded backend engineer from high-scale consumer marketplaces. Interested in fintech and developer-tools roles.",
    signals: ["Recently changed role", "Marketplace scale experience"],
    status: "Qualified",
    updated: "1d ago",
    activity: activityFor("Sneha Kulkarni"),
    similar: [
      { id: "cand-4", name: "Divya Rao", headline: "Backend Engineer · Paystream", matchScore: 81 },
    ],
  },
  {
    id: "cand-4",
    name: "Divya Rao",
    headline: "Backend Engineer · payments infra",
    currentRole: "Backend Engineer",
    currentCompany: "Paystream",
    previousCompany: "Zoho",
    location: "Bengaluru",
    experienceYears: 4,
    skills: ["Node.js", "Kafka", "PostgreSQL", "Docker"],
    matchScore: 81,
    matchBreakdown: {
      skills: 84,
      role: 86,
      experience: 72,
      location: 100,
      industry: 90,
      education: 68,
    },
    contactStatus: "Replied",
    saved: true,
    linkedin: false,
    email: "divya.rao@paystream.in",
    emailVerified: true,
    phone: "+91 97400 77889",
    phoneVerified: true,
    emailRevealed: true,
    phoneRevealed: true,
    education: [
      {
        school: "RV College of Engineering",
        degree: "B.E.",
        field: "Information Science",
        years: "2016 – 2020",
      },
    ],
    experience: [
      {
        company: "Paystream",
        role: "Backend Engineer",
        duration: "2022 – Present · 4 yrs",
        description:
          "Event-driven settlement pipelines with Kafka; reduced reconciliation lag from hours to minutes.",
        current: true,
      },
      {
        company: "Zoho",
        role: "Member Technical Staff",
        duration: "2020 – 2022 · 2 yrs",
        description: "Backend features for Zoho Books invoicing.",
        current: false,
      },
    ],
    summary:
      "Hands-on engineer strong in event streaming and data consistency. Actively interviewing; prefers payments or lending problems.",
    signals: ["Open to work", "Replied positively to outreach"],
    status: "Interested",
    updated: "3h ago",
    activity: [
      ...activityFor("Divya Rao"),
      {
        id: "act-2",
        kind: "email-revealed",
        title: "Email revealed by Neha Gupta",
        time: "Yesterday, 11:15 AM",
      },
      {
        id: "act-3",
        kind: "phone-revealed",
        title: "Mobile revealed by Neha Gupta",
        time: "Yesterday, 11:16 AM",
      },
      {
        id: "act-4",
        kind: "screening-started",
        title: "AI voice screening started",
        time: "Today, 8:30 AM",
      },
    ],
    similar: [
      { id: "cand-3", name: "Sneha Kulkarni", headline: "Backend Engineer II · Swiggy", matchScore: 84 },
    ],
  },
  {
    id: "cand-5",
    name: "Arjun Verma",
    headline: "Full Stack Engineer · SaaS platforms",
    currentRole: "Full Stack Engineer",
    currentCompany: "Zenlytic",
    previousCompany: "Cartwheel",
    location: "Remote (Pune)",
    experienceYears: 7,
    skills: ["Node.js", "React", "AWS", "GraphQL"],
    matchScore: 76,
    matchBreakdown: {
      skills: 78,
      role: 66,
      experience: 88,
      location: 60,
      industry: 92,
      education: 74,
    },
    contactStatus: "In outreach",
    saved: false,
    linkedin: true,
    email: "arjun.verma@zenlytic.com",
    emailVerified: true,
    phone: "+91 98220 33445",
    phoneVerified: false,
    emailRevealed: false,
    phoneRevealed: false,
    education: [
      {
        school: "COEP Pune",
        degree: "B.Tech",
        field: "Computer Science",
        years: "2012 – 2016",
      },
    ],
    experience: [
      {
        company: "Zenlytic",
        role: "Full Stack Engineer",
        duration: "2021 – Present · 5 yrs",
        description:
          "Owns analytics query layer and embedded dashboards; heavy Node.js + GraphQL backend work.",
        current: true,
      },
      {
        company: "Cartwheel",
        role: "Software Engineer",
        duration: "2016 – 2021 · 5 yrs",
        description: "E-commerce checkout and promotions engine.",
        current: false,
      },
    ],
    summary:
      "Generalist with deep SaaS product experience, leaning backend. Remote-first, open to Bengaluru visits monthly.",
    signals: ["Remote preference", "Long tenures"],
    status: "Screening",
    updated: "6h ago",
    activity: [
      ...activityFor("Arjun Verma"),
      {
        id: "act-2",
        kind: "added-to-outreach",
        title: "Added to “Warm WhatsApp follow-up”",
        time: "2d ago",
      },
    ],
    similar: [
      { id: "cand-2", name: "Karthik Iyer", headline: "Staff Engineer · Loopworks", matchScore: 89 },
    ],
  },
  {
    id: "cand-6",
    name: "Nikhil Bose",
    headline: "Backend Engineer · consumer fintech",
    currentRole: "Backend Engineer",
    currentCompany: "CRED",
    previousCompany: "Flipkart",
    location: "Bengaluru",
    experienceYears: 5,
    skills: ["Node.js", "AWS", "MongoDB", "Redis"],
    matchScore: 74,
    matchBreakdown: {
      skills: 76,
      role: 80,
      experience: 74,
      location: 100,
      industry: 82,
      education: 40,
    },
    contactStatus: "Not contacted",
    saved: false,
    linkedin: true,
    email: "nikhil.bose@cred.club",
    emailVerified: false,
    phone: "+91 96320 55667",
    phoneVerified: false,
    emailRevealed: false,
    phoneRevealed: false,
    education: [
      {
        school: "Jadavpur University",
        degree: "B.E.",
        field: "Electronics",
        years: "2014 – 2018",
      },
    ],
    experience: [
      {
        company: "CRED",
        role: "Backend Engineer",
        duration: "2023 – Present · 3 yrs",
        description: "Rewards and payments services on Node.js and DynamoDB.",
        current: true,
      },
      {
        company: "Flipkart",
        role: "Software Development Engineer",
        duration: "2018 – 2023 · 5 yrs",
        description: "Supply-chain services and order management.",
        current: false,
      },
    ],
    summary:
      "Consumer-scale backend engineer, strong delivery record. Exploring senior roles with clearer growth paths.",
    signals: ["Frequent job changes flag: no", "High-scale systems"],
    status: "Contacted",
    updated: "4d ago",
    activity: activityFor("Nikhil Bose"),
    similar: [
      { id: "cand-1", name: "Priya Nair", headline: "Senior Backend Engineer · Finovate Labs", matchScore: 92 },
    ],
  },
  {
    id: "cand-7",
    name: "Meera Pillai",
    headline: "Node.js Developer · healthtech APIs",
    currentRole: "Node.js Developer",
    currentCompany: "Mural Health",
    previousCompany: "Edvantage",
    location: "Bengaluru",
    experienceYears: 4,
    skills: ["Node.js", "TypeScript", "PostgreSQL", "AWS"],
    matchScore: 71,
    matchBreakdown: {
      skills: 82,
      role: 84,
      experience: 64,
      location: 100,
      industry: 46,
      education: 72,
    },
    contactStatus: "Not contacted",
    saved: false,
    linkedin: false,
    email: "meera.pillai@muralhealth.com",
    emailVerified: true,
    phone: "+91 95910 66778",
    phoneVerified: true,
    emailRevealed: false,
    phoneRevealed: false,
    education: [
      {
        school: "Manipal Institute of Technology",
        degree: "B.Tech",
        field: "Computer Science",
        years: "2017 – 2021",
      },
    ],
    experience: [
      {
        company: "Mural Health",
        role: "Node.js Developer",
        duration: "2023 – Present · 3 yrs",
        description: "FHIR-compliant patient APIs and integrations.",
        current: true,
      },
      {
        company: "Edvantage",
        role: "Junior Developer",
        duration: "2021 – 2023 · 2 yrs",
        description: "Learning-platform backend features.",
        current: false,
      },
    ],
    summary:
      "API-focused Node.js developer with compliance-heavy domain experience. Looking for stronger engineering mentorship.",
    signals: ["Open to work"],
    status: "Qualified",
    updated: "1w ago",
    activity: activityFor("Meera Pillai"),
    similar: [
      { id: "cand-3", name: "Sneha Kulkarni", headline: "Backend Engineer II · Swiggy", matchScore: 84 },
    ],
  },
  {
    id: "cand-8",
    name: "Rohan Mehta",
    headline: "Senior Software Engineer · data-heavy backends",
    currentRole: "Senior Software Engineer",
    currentCompany: "Cartwheel",
    previousCompany: "Loopworks",
    location: "Pune",
    experienceYears: 8,
    skills: ["Node.js", "Python", "AWS", "Kafka", "System design"],
    matchScore: 68,
    matchBreakdown: {
      skills: 74,
      role: 72,
      experience: 92,
      location: 30,
      industry: 76,
      education: 66,
    },
    contactStatus: "Replied",
    saved: true,
    linkedin: true,
    email: "rohan.mehta@cartwheel.in",
    emailVerified: true,
    phone: "+91 98500 88990",
    phoneVerified: true,
    emailRevealed: true,
    phoneRevealed: false,
    education: [
      {
        school: "VIT Vellore",
        degree: "B.Tech",
        field: "Computer Science",
        years: "2010 – 2014",
      },
    ],
    experience: [
      {
        company: "Cartwheel",
        role: "Senior Software Engineer",
        duration: "2020 – Present · 6 yrs",
        description:
          "Search and recommendations backends; owns the catalogue ingestion pipeline.",
        current: true,
      },
      {
        company: "Loopworks",
        role: "Software Engineer",
        duration: "2014 – 2020 · 6 yrs",
        description: "Core platform services and internal tooling.",
        current: false,
      },
    ],
    summary:
      "Experienced engineer with long tenures and deep data-pipeline skills. Pune-based; open to relocation for the right role.",
    signals: ["Open to relocation", "Replied on WhatsApp"],
    status: "Interested",
    updated: "38m ago",
    activity: [
      ...activityFor("Rohan Mehta"),
      {
        id: "act-2",
        kind: "saved",
        title: "Saved to “Data platform shortlist”",
        time: "3d ago",
      },
      {
        id: "act-3",
        kind: "email-revealed",
        title: "Email revealed by Ananya Sharma",
        time: "3d ago",
      },
    ],
    similar: [
      { id: "cand-5", name: "Arjun Verma", headline: "Full Stack Engineer · Zenlytic", matchScore: 76 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Sourcing sessions                                                    */
/* ------------------------------------------------------------------ */

export type SessionState =
  | "completed"
  | "running"
  | "partial"
  | "failed"
  | "empty";

export interface SourcingSession {
  id: string;
  name: string;
  query: string;
  resultCount: number;
  date: string;
  relatedJobId: string | null;
  relatedJobTitle: string | null;
  owner: string;
  quotaUsed: number;
  state: SessionState;
  candidateIds: string[];
  /** For partial states: how much of the graph was scanned. */
  coverage?: number;
  failureReason?: string;
}

export const SOURCING_SESSIONS: SourcingSession[] = [
  {
    id: "s1",
    name: "Backend engineers — Bengaluru SaaS",
    query:
      "Find backend engineers in Bengaluru with 4–7 years of experience, Node.js and AWS skills, currently working at SaaS companies.",
    resultCount: 8,
    date: "16 Jul 2026, 9:42 AM",
    relatedJobId: "j1",
    relatedJobTitle: "Senior Backend Engineer",
    owner: "Ananya Sharma",
    quotaUsed: 25,
    state: "completed",
    candidateIds: SESSION_CANDIDATES.map((candidate) => candidate.id),
  },
  {
    id: "s2",
    name: "Live scout — backend bench refresh",
    query: "Backend engineers similar to my shortlist, Bengaluru or remote",
    resultCount: 8,
    date: "16 Jul 2026, 1:20 AM",
    relatedJobId: "j1",
    relatedJobTitle: "Senior Backend Engineer",
    owner: "Ananya Sharma",
    quotaUsed: 25,
    state: "running",
    candidateIds: SESSION_CANDIDATES.map((candidate) => candidate.id),
  },
  {
    id: "s3",
    name: "Design leaders — healthcare",
    query: "Product design leads with healthcare experience, remote-friendly",
    resultCount: 5,
    date: "14 Jul 2026, 4:05 PM",
    relatedJobId: "j2",
    relatedJobTitle: "Product Designer",
    owner: "Neha Gupta",
    quotaUsed: 25,
    state: "partial",
    coverage: 62,
    candidateIds: SESSION_CANDIDATES.slice(0, 5).map((candidate) => candidate.id),
  },
  {
    id: "s4",
    name: "Rust systems engineers — Mumbai",
    query: "Rust systems engineers in Mumbai with embedded experience",
    resultCount: 0,
    date: "13 Jul 2026, 11:12 AM",
    relatedJobId: null,
    relatedJobTitle: null,
    owner: "Rohan Desai",
    quotaUsed: 25,
    state: "empty",
    candidateIds: [],
  },
  {
    id: "s5",
    name: "EMs from Series B+ startups",
    query: "Engineering managers in Hyderabad from Series B+ startups",
    resultCount: 0,
    date: "12 Jul 2026, 6:47 PM",
    relatedJobId: "j4",
    relatedJobTitle: "Engineering Manager",
    owner: "Ananya Sharma",
    quotaUsed: 0,
    state: "failed",
    candidateIds: [],
    failureReason:
      "The search timed out while scanning company-signal data. Your quota was not charged.",
  },
];

export function getSession(id: string): SourcingSession | undefined {
  return SOURCING_SESSIONS.find((session) => session.id === id);
}

export function getSessionCandidates(session: SourcingSession): SessionCandidate[] {
  return session.candidateIds
    .map((id) => SESSION_CANDIDATES.find((candidate) => candidate.id === id))
    .filter((candidate): candidate is SessionCandidate => Boolean(candidate));
}

/* ------------------------------------------------------------------ */
/* Sort options                                                         */
/* ------------------------------------------------------------------ */

export const SORT_OPTIONS = [
  { id: "best-match", label: "Best Match" },
  { id: "relevant-experience", label: "Most Relevant Experience" },
  { id: "recently-updated", label: "Recently Updated" },
  { id: "current-company", label: "Current Company" },
  { id: "total-experience", label: "Total Experience" },
] as const;

export type SortOptionId = (typeof SORT_OPTIONS)[number]["id"];

export function sortCandidates(
  candidates: SessionCandidate[],
  sort: SortOptionId
): SessionCandidate[] {
  const list = [...candidates];
  switch (sort) {
    case "best-match":
      return list.sort((a, b) => b.matchScore - a.matchScore);
    case "relevant-experience":
      return list.sort(
        (a, b) =>
          b.matchBreakdown.experience + b.matchBreakdown.role -
          (a.matchBreakdown.experience + a.matchBreakdown.role)
      );
    case "recently-updated":
      return list; // mock order already reflects recency labels
    case "current-company":
      return list.sort((a, b) =>
        a.currentCompany.localeCompare(b.currentCompany)
      );
    case "total-experience":
      return list.sort((a, b) => b.experienceYears - a.experienceYears);
  }
}

/* ------------------------------------------------------------------ */
/* Search history                                                       */
/* ------------------------------------------------------------------ */

export interface SearchHistoryEntry {
  id: string;
  sessionId: string | null;
  name: string;
  query: string;
  relatedJob: string | null;
  results: number;
  saved: number;
  owner: string;
  date: string;
  usage: number;
  state: SessionState;
}

export const SEARCH_HISTORY: SearchHistoryEntry[] = [
  {
    id: "h1",
    sessionId: "s1",
    name: "Backend engineers — Bengaluru SaaS",
    query:
      "Backend engineers in Bengaluru, 4–7 yrs, Node.js + AWS, SaaS companies",
    relatedJob: "Senior Backend Engineer",
    results: 8,
    saved: 3,
    owner: "Ananya Sharma",
    date: "Today, 9:42 AM",
    usage: 25,
    state: "completed",
  },
  {
    id: "h2",
    sessionId: "s2",
    name: "Live scout — backend bench refresh",
    query: "Backend engineers similar to my shortlist, Bengaluru or remote",
    relatedJob: "Senior Backend Engineer",
    results: 8,
    saved: 0,
    owner: "Ananya Sharma",
    date: "Today, 1:20 AM",
    usage: 25,
    state: "running",
  },
  {
    id: "h3",
    sessionId: "s3",
    name: "Design leaders — healthcare",
    query: "Product design leads with healthcare experience, remote-friendly",
    relatedJob: "Product Designer",
    results: 5,
    saved: 2,
    owner: "Neha Gupta",
    date: "2d ago",
    usage: 25,
    state: "partial",
  },
  {
    id: "h4",
    sessionId: "s4",
    name: "Rust systems engineers — Mumbai",
    query: "Rust systems engineers in Mumbai with embedded experience",
    relatedJob: null,
    results: 0,
    saved: 0,
    owner: "Rohan Desai",
    date: "3d ago",
    usage: 25,
    state: "empty",
  },
  {
    id: "h5",
    sessionId: "s5",
    name: "EMs from Series B+ startups",
    query: "Engineering managers in Hyderabad from Series B+ startups",
    relatedJob: "Engineering Manager",
    results: 0,
    saved: 0,
    owner: "Ananya Sharma",
    date: "4d ago",
    usage: 0,
    state: "failed",
  },
  {
    id: "h6",
    sessionId: "s1",
    name: "Data engineers — Spark + Airflow",
    query: "Data engineers, Spark + Airflow, Pune or remote, 5+ years",
    relatedJob: "Data Engineer",
    results: 191,
    saved: 12,
    owner: "Rohan Desai",
    date: "5d ago",
    usage: 25,
    state: "completed",
  },
];
