/* ------------------------------------------------------------------ */
/* People Scout — direct person lookup                                  */
/* ------------------------------------------------------------------ */

export const LOOKUP_TYPES = [
  "LinkedIn URL",
  "LinkedIn Username",
  "Email Address",
] as const;

export type LookupType = (typeof LOOKUP_TYPES)[number];

export const LOOKUP_PLACEHOLDERS: Record<LookupType, string> = {
  "LinkedIn URL": "https://linkedin.com/in/candidate-name",
  "LinkedIn Username": "candidate-name",
  "Email Address": "candidate@company.com",
};

export const LOOKUP_QUOTA = {
  total: 200,
  remaining: 142,
  costPerLookup: 2,
  recentCount: 58,
} as const;

/* ------------------------------------------------------------------ */
/* Profile                                                              */
/* ------------------------------------------------------------------ */

export interface ScoutExperience {
  company: string;
  role: string;
  duration: string;
  description: string;
  current: boolean;
}

export interface ScoutEducation {
  school: string;
  degree: string;
  field: string;
  years: string;
}

export interface ScoutProfile {
  id: string;
  name: string;
  currentTitle: string;
  currentCompany: string;
  location: string;
  headline: string;
  about: string;
  linkedinUrl: string;
  linkedinUsername: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  phoneVerified: boolean;
  skills: string[];
  experience: ScoutExperience[];
  education: ScoutEducation[];
  enrichment: {
    status: "Enriched" | "Partially enriched";
    sources: number;
    lastRefreshed: string;
  };
}

export const SCOUT_PROFILE: ScoutProfile = {
  id: "scout-1",
  name: "Arjun Malhotra",
  currentTitle: "Engineering Manager, Platform",
  currentCompany: "Cloudmesh",
  location: "Bengaluru, India",
  headline:
    "Engineering Manager · Platform & Infra · ex-Flipkart · Building teams that ship reliable systems",
  about:
    "Engineering leader with 11 years across marketplaces and developer platforms. Currently managing three platform teams (compute, delivery, observability) at Cloudmesh. Previously led the checkout-reliability group at Flipkart through 10x scale events. Cares deeply about engineer onboarding, blameless operations, and pragmatic architecture. Speaks at community meetups on platform product thinking.",
  linkedinUrl: "https://linkedin.com/in/arjun-malhotra-platform",
  linkedinUsername: "arjun-malhotra-platform",
  email: "arjun.malhotra@cloudmesh.io",
  emailVerified: true,
  phone: "+91 98867 45210",
  phoneVerified: false,
  skills: [
    "Engineering Management",
    "Platform Engineering",
    "Kubernetes",
    "Go",
    "SRE",
    "Hiring & Mentoring",
    "System Design",
  ],
  experience: [
    {
      company: "Cloudmesh",
      role: "Engineering Manager, Platform",
      duration: "2023 – Present · 3 yrs",
      description:
        "Manages 21 engineers across compute, delivery and observability. Cut deploy lead time from 45 to 9 minutes and drove SLO adoption across 40+ services.",
      current: true,
    },
    {
      company: "Flipkart",
      role: "Senior Engineering Manager (interim) / Staff Engineer",
      duration: "2018 – 2023 · 5 yrs",
      description:
        "Led checkout reliability during festival-scale events (1.4M orders/hr peak). Grew the resilience guild from 4 to 30 engineers.",
      current: false,
    },
    {
      company: "Mintel Systems",
      role: "Software Engineer → Tech Lead",
      duration: "2014 – 2018 · 4 yrs",
      description:
        "Built B2B billing and metering systems; first engineer on the platform team.",
      current: false,
    },
  ],
  education: [
    {
      school: "BITS Pilani",
      degree: "B.E.",
      field: "Computer Science",
      years: "2010 – 2014",
    },
  ],
  enrichment: {
    status: "Enriched",
    sources: 4,
    lastRefreshed: "Refreshed 2h ago",
  },
};

export interface ScoutMatchOption {
  id: string;
  name: string;
  headline: string;
  company: string;
  location: string;
  linkedinUsername: string;
}

export const SCOUT_MATCH_OPTIONS: ScoutMatchOption[] = [
  {
    id: "match-1",
    name: "Arjun Malhotra",
    headline: "Engineering Manager, Platform at Cloudmesh",
    company: "Cloudmesh",
    location: "Bengaluru, India",
    linkedinUsername: "arjun-malhotra-platform",
  },
  {
    id: "match-2",
    name: "Arjun Malhotra",
    headline: "Product Manager — Payments at Razorpay",
    company: "Razorpay",
    location: "Bengaluru, India",
    linkedinUsername: "arjunmalhotra-pm",
  },
  {
    id: "match-3",
    name: "Arjun S. Malhotra",
    headline: "Data Scientist at Fractal Analytics",
    company: "Fractal Analytics",
    location: "Mumbai, India",
    linkedinUsername: "arjun-s-malhotra",
  },
];

/* ------------------------------------------------------------------ */
/* Recent lookups                                                       */
/* ------------------------------------------------------------------ */

export type LookupResult =
  | "Found"
  | "Multiple matches"
  | "Not found"
  | "Failed";

export type LookupReveal = "Email" | "Phone" | "Both" | "None";

export interface RecentLookup {
  id: string;
  candidateName: string | null;
  input: string;
  type: LookupType;
  result: LookupResult;
  contactRevealed: LookupReveal;
  saved: boolean;
  date: string;
  performedBy: string;
  creditsUsed: number;
  note: string;
}

export const RECENT_LOOKUPS: RecentLookup[] = [
  {
    id: "lk-1",
    candidateName: "Arjun Malhotra",
    input: "linkedin.com/in/arjun-malhotra-platform",
    type: "LinkedIn URL",
    result: "Found",
    contactRevealed: "Both",
    saved: true,
    date: "Today, 10:42 AM",
    performedBy: "Ananya Sharma",
    creditsUsed: 2,
    note: "Saved to AI Engineering Pipeline and enrolled in EM outreach.",
  },
  {
    id: "lk-2",
    candidateName: "Sneha Kulkarni",
    input: "sneha.kulkarni@brightpay.in",
    type: "Email Address",
    result: "Found",
    contactRevealed: "Email",
    saved: true,
    date: "Today, 9:15 AM",
    performedBy: "Neha Gupta",
    creditsUsed: 2,
    note: "Email already on file — reveal was free.",
  },
  {
    id: "lk-3",
    candidateName: "Arjun Malhotra",
    input: "arjun malhotra bengaluru",
    type: "LinkedIn Username",
    result: "Multiple matches",
    contactRevealed: "None",
    saved: false,
    date: "Yesterday, 6:03 PM",
    performedBy: "Ananya Sharma",
    creditsUsed: 2,
    note: "Three close matches returned; none selected yet.",
  },
  {
    id: "lk-4",
    candidateName: "Rahul Venkatesh",
    input: "linkedin.com/in/rahul-venkatesh-sre",
    type: "LinkedIn URL",
    result: "Found",
    contactRevealed: "None",
    saved: false,
    date: "Yesterday, 3:40 PM",
    performedBy: "Rohan Desai",
    creditsUsed: 2,
    note: "Profile viewed but not saved.",
  },
  {
    id: "lk-5",
    candidateName: null,
    input: "priyanka.rao@stealthstartup.xyz",
    type: "Email Address",
    result: "Not found",
    contactRevealed: "None",
    saved: false,
    date: "Tuesday, 4:22 PM",
    performedBy: "Neha Gupta",
    creditsUsed: 2,
    note: "No profile matched this address across providers.",
  },
  {
    id: "lk-6",
    candidateName: null,
    input: "linkedin.com/in/vf-2210a",
    type: "LinkedIn URL",
    result: "Failed",
    contactRevealed: "None",
    saved: false,
    date: "Tuesday, 11:08 AM",
    performedBy: "Rohan Desai",
    creditsUsed: 0,
    note: "Provider timed out — no credits were charged.",
  },
  {
    id: "lk-7",
    candidateName: "Meera Krishnan",
    input: "meera-krishnan-design",
    type: "LinkedIn Username",
    result: "Found",
    contactRevealed: "Phone",
    saved: true,
    date: "Monday, 5:51 PM",
    performedBy: "Ananya Sharma",
    creditsUsed: 2,
    note: "Saved to Product Design Shortlist.",
  },
];
