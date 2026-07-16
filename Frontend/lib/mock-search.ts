import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  GraduationCap,
  LineChart,
  MapPin,
  Radar,
  Timer,
  Wrench,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Filter specification                                                 */
/* ------------------------------------------------------------------ */

export type FilterFieldType =
  | "multi" // searchable multi-select with option list
  | "tags" // free-text tag input
  | "toggle"
  | "select"
  | "range"; // min/max numeric pair with slider

export interface FilterField {
  id: string;
  label: string;
  type: FilterFieldType;
  options?: readonly string[];
  placeholder?: string;
  min?: number;
  max?: number;
  unit?: string;
  hint?: string;
}

export interface FilterSection {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  fields: FilterField[];
}

const TITLE_OPTIONS = [
  "Backend Engineer",
  "Node.js Developer",
  "Full Stack Engineer",
  "Software Engineer",
  "Senior Software Engineer",
  "Staff Engineer",
  "Frontend Engineer",
  "DevOps Engineer",
  "Data Engineer",
  "Engineering Manager",
  "Product Designer",
  "Product Manager",
] as const;

const SKILL_OPTIONS = [
  "Node.js",
  "AWS",
  "TypeScript",
  "React",
  "Go",
  "Python",
  "Kubernetes",
  "PostgreSQL",
  "GraphQL",
  "Kafka",
  "Docker",
  "System design",
  "MongoDB",
  "Redis",
  "Terraform",
] as const;

const FUNCTIONAL_AREAS = [
  "Engineering",
  "Design",
  "Data",
  "Product",
  "Sales",
  "Marketing",
  "Operations",
  "People",
] as const;

const SENIORITY_OPTIONS = [
  "Junior",
  "Mid",
  "Senior",
  "Staff",
  "Principal",
  "Manager",
  "Director",
  "VP+",
] as const;

const COUNTRY_OPTIONS = [
  "India",
  "United States",
  "United Kingdom",
  "Germany",
  "Singapore",
  "UAE",
] as const;

const REGION_OPTIONS = [
  "Karnataka",
  "Maharashtra",
  "Telangana",
  "Tamil Nadu",
  "Delhi NCR",
  "West Bengal",
] as const;

const CITY_OPTIONS = [
  "Bengaluru",
  "Mumbai",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Gurugram",
  "Noida",
  "Kolkata",
  "Remote",
] as const;

const REMOTE_OPTIONS = ["Any", "Remote only", "Hybrid", "On-site"] as const;

const COMPANY_OPTIONS = [
  "Finovate Labs",
  "Loopworks",
  "Paystream",
  "Zenlytic",
  "Cartwheel",
  "Mural Health",
  "Flipkart",
  "Razorpay",
  "Freshworks",
  "Zoho",
  "Swiggy",
  "CRED",
] as const;

const COMPANY_SIZE_OPTIONS = [
  "1–10",
  "11–50",
  "51–200",
  "201–500",
  "501–1,000",
  "1,001–5,000",
  "5,000+",
] as const;

const COMPANY_TYPE_OPTIONS = [
  "Startup",
  "Scale-up",
  "Enterprise",
  "Agency",
  "Non-profit",
  "Public sector",
] as const;

const INDUSTRY_OPTIONS = [
  "SaaS",
  "Fintech",
  "Healthtech",
  "E-commerce",
  "Edtech",
  "Logistics",
  "Gaming",
  "Cybersecurity",
  "AI / ML",
] as const;

const FUNDING_OPTIONS = [
  "Bootstrapped",
  "Seed",
  "Series A",
  "Series B",
  "Series C+",
  "Public",
] as const;

const REVENUE_OPTIONS = [
  "< $1M",
  "$1M – $10M",
  "$10M – $50M",
  "$50M – $250M",
  "$250M+",
] as const;

const GROWTH_OPTIONS = [
  "Shrinking",
  "Flat",
  "Growing 10%+",
  "Growing 25%+",
  "Growing 50%+",
] as const;

const DEGREE_OPTIONS = [
  "B.E. / B.Tech",
  "B.Sc",
  "M.E. / M.Tech",
  "M.Sc",
  "MBA",
  "PhD",
] as const;

const FIELD_OF_STUDY_OPTIONS = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mathematics",
  "Design",
  "Business",
] as const;

const CERTIFICATION_OPTIONS = [
  "AWS Certified Solutions Architect",
  "CKA (Kubernetes)",
  "PMP",
  "Google Professional Cloud",
  "Scrum Master",
] as const;

const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Kannada",
  "Tamil",
  "Telugu",
  "Marathi",
  "Bengali",
] as const;

export const FILTER_SECTIONS: FilterSection[] = [
  {
    id: "titles",
    title: "Job Titles",
    icon: Briefcase,
    description: "Current and past titles to match",
    fields: [
      {
        id: "currentTitle",
        label: "Current title",
        type: "multi",
        options: TITLE_OPTIONS,
        placeholder: "Search titles…",
      },
      {
        id: "previousTitle",
        label: "Previous title",
        type: "multi",
        options: TITLE_OPTIONS,
        placeholder: "Search titles…",
      },
      {
        id: "exactTitle",
        label: "Exact title match",
        type: "toggle",
        hint: "Match titles verbatim instead of semantically",
      },
      {
        id: "relatedTitles",
        label: "Include related titles",
        type: "toggle",
        hint: "Expand with similar roles, e.g. Platform Engineer",
      },
      {
        id: "excludeTitles",
        label: "Exclude titles",
        type: "multi",
        options: TITLE_OPTIONS,
        placeholder: "Search titles…",
      },
    ],
  },
  {
    id: "skills",
    title: "Skills & Functions",
    icon: Wrench,
    description: "Capabilities and functional focus",
    fields: [
      {
        id: "requiredSkills",
        label: "Required skills",
        type: "multi",
        options: SKILL_OPTIONS,
        placeholder: "Search skills…",
      },
      {
        id: "preferredSkills",
        label: "Preferred skills",
        type: "multi",
        options: SKILL_OPTIONS,
        placeholder: "Search skills…",
      },
      {
        id: "functionalArea",
        label: "Functional area",
        type: "multi",
        options: FUNCTIONAL_AREAS,
        placeholder: "Search functions…",
      },
      {
        id: "seniority",
        label: "Seniority",
        type: "multi",
        options: SENIORITY_OPTIONS,
        placeholder: "Search levels…",
      },
      {
        id: "excludeKeywords",
        label: "Exclude keywords",
        type: "tags",
        placeholder: "e.g. internship, freelance",
      },
    ],
  },
  {
    id: "location",
    title: "Location",
    icon: MapPin,
    description: "Where candidates live or can work",
    fields: [
      {
        id: "country",
        label: "Country",
        type: "multi",
        options: COUNTRY_OPTIONS,
        placeholder: "Search countries…",
      },
      {
        id: "region",
        label: "State or region",
        type: "multi",
        options: REGION_OPTIONS,
        placeholder: "Search regions…",
      },
      {
        id: "city",
        label: "City",
        type: "multi",
        options: CITY_OPTIONS,
        placeholder: "Search cities…",
      },
      {
        id: "radius",
        label: "Radius",
        type: "range",
        min: 0,
        max: 200,
        unit: "km",
      },
      {
        id: "relocation",
        label: "Open to relocation",
        type: "toggle",
      },
      {
        id: "remotePreference",
        label: "Remote preference",
        type: "select",
        options: REMOTE_OPTIONS,
      },
      {
        id: "excludeLocations",
        label: "Exclude locations",
        type: "multi",
        options: CITY_OPTIONS,
        placeholder: "Search locations…",
      },
    ],
  },
  {
    id: "experience",
    title: "Experience",
    icon: Timer,
    description: "Years of experience and tenure",
    fields: [
      {
        id: "totalExperience",
        label: "Total experience",
        type: "range",
        min: 0,
        max: 30,
        unit: "yrs",
      },
      {
        id: "currentTenure",
        label: "Current company tenure",
        type: "range",
        min: 0,
        max: 15,
        unit: "yrs",
      },
    ],
  },
  {
    id: "employers",
    title: "Employers",
    icon: Building2,
    description: "Company history and profile",
    fields: [
      {
        id: "currentEmployers",
        label: "Current employers",
        type: "multi",
        options: COMPANY_OPTIONS,
        placeholder: "Search companies…",
      },
      {
        id: "previousEmployers",
        label: "Previous employers",
        type: "multi",
        options: COMPANY_OPTIONS,
        placeholder: "Search companies…",
      },
      {
        id: "excludedEmployers",
        label: "Exclude employers",
        type: "multi",
        options: COMPANY_OPTIONS,
        placeholder: "Search companies…",
      },
      {
        id: "companySize",
        label: "Company size",
        type: "multi",
        options: COMPANY_SIZE_OPTIONS,
        placeholder: "Search sizes…",
      },
      {
        id: "companyType",
        label: "Company type",
        type: "multi",
        options: COMPANY_TYPE_OPTIONS,
        placeholder: "Search types…",
      },
    ],
  },
  {
    id: "industry",
    title: "Industry & Company Signals",
    icon: LineChart,
    description: "Sector and company health indicators",
    fields: [
      {
        id: "industry",
        label: "Industry",
        type: "multi",
        options: INDUSTRY_OPTIONS,
        placeholder: "Search industries…",
      },
      {
        id: "fundingStage",
        label: "Funding stage",
        type: "multi",
        options: FUNDING_OPTIONS,
        placeholder: "Search stages…",
      },
      {
        id: "revenue",
        label: "Revenue",
        type: "multi",
        options: REVENUE_OPTIONS,
        placeholder: "Search bands…",
      },
      {
        id: "employeeGrowth",
        label: "Employee growth",
        type: "multi",
        options: GROWTH_OPTIONS,
        placeholder: "Search growth…",
      },
      {
        id: "headcount",
        label: "Company headcount",
        type: "range",
        min: 0,
        max: 10000,
        unit: "people",
      },
    ],
  },
  {
    id: "education",
    title: "Education",
    icon: GraduationCap,
    description: "Schools, degrees and certifications",
    fields: [
      {
        id: "school",
        label: "School",
        type: "tags",
        placeholder: "e.g. IIT Bombay, BITS Pilani",
      },
      {
        id: "degree",
        label: "Degree",
        type: "multi",
        options: DEGREE_OPTIONS,
        placeholder: "Search degrees…",
      },
      {
        id: "fieldOfStudy",
        label: "Field of study",
        type: "multi",
        options: FIELD_OF_STUDY_OPTIONS,
        placeholder: "Search fields…",
      },
      {
        id: "graduationYear",
        label: "Graduation year",
        type: "range",
        min: 1995,
        max: 2026,
      },
      {
        id: "certifications",
        label: "Certifications",
        type: "multi",
        options: CERTIFICATION_OPTIONS,
        placeholder: "Search certifications…",
      },
    ],
  },
  {
    id: "signals",
    title: "Candidate Signals",
    icon: Radar,
    description: "Behavioural and intent signals",
    fields: [
      { id: "openToWork", label: "Open to work", type: "toggle" },
      {
        id: "recentRoleChange",
        label: "Recently changed role",
        type: "toggle",
        hint: "Role change within the last 6 months",
      },
      {
        id: "employmentGap",
        label: "Employment gap",
        type: "toggle",
        hint: "Include candidates with career gaps",
      },
      {
        id: "frequentChanges",
        label: "Frequent job changes",
        type: "toggle",
        hint: "3+ roles in the last 4 years",
      },
      {
        id: "managementExperience",
        label: "Management experience",
        type: "toggle",
      },
      {
        id: "languages",
        label: "Languages",
        type: "multi",
        options: LANGUAGE_OPTIONS,
        placeholder: "Search languages…",
      },
    ],
  },
];

/** Flat lookup: field id -> { field, sectionId }. */
export const FILTER_FIELD_INDEX: Record<
  string,
  { field: FilterField; sectionId: string }
> = Object.fromEntries(
  FILTER_SECTIONS.flatMap((section) =>
    section.fields.map((field) => [field.id, { field, sectionId: section.id }])
  )
);

/* ------------------------------------------------------------------ */
/* Filter state                                                         */
/* ------------------------------------------------------------------ */

export type RangeValue = { min: number | null; max: number | null };
export type FilterValue = string[] | string | boolean | RangeValue;
export type SearchFilterState = Record<string, FilterValue>;

export function emptyFilterState(): SearchFilterState {
  return {};
}

/** Whether a single field currently holds a meaningful value. */
export function isFieldActive(value: FilterValue | undefined): boolean {
  if (value === undefined) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value !== "" && value !== "Any";
  if (Array.isArray(value)) return value.length > 0;
  return value.min !== null || value.max !== null;
}

/* ------------------------------------------------------------------ */
/* AI interpretation                                                    */
/* ------------------------------------------------------------------ */

export interface InterpretedCriterion {
  id: string;
  label: string;
  /** Field id in the filter spec that this criterion writes to. */
  fieldId: string;
  value: string;
}

export const EXAMPLE_QUERY =
  "Find backend engineers in Bengaluru with 4–7 years of experience, Node.js and AWS skills, currently working at SaaS companies.";

export const EXAMPLE_QUERIES: string[] = [
  EXAMPLE_QUERY,
  "Product designers with healthcare experience, open to remote work in India",
  "Data engineers with Spark and Airflow, 5+ years, Pune or remote",
  "Engineering managers in Hyderabad from Series B+ startups",
];

/** Deterministic mock of the AI parse for the example prompt. */
export const INTERPRETED_CRITERIA: InterpretedCriterion[] = [
  {
    id: "ic-titles",
    label: "Role",
    fieldId: "currentTitle",
    value: "Backend Engineer, Node.js Developer",
  },
  { id: "ic-skills", label: "Skills", fieldId: "requiredSkills", value: "Node.js, AWS" },
  { id: "ic-location", label: "Location", fieldId: "city", value: "Bengaluru" },
  {
    id: "ic-experience",
    label: "Experience",
    fieldId: "totalExperience",
    value: "4–7 years",
  },
  {
    id: "ic-industry",
    label: "Company profile",
    fieldId: "industry",
    value: "SaaS",
  },
  {
    id: "ic-employment",
    label: "Candidate signals",
    fieldId: "openToWork",
    value: "Currently employed",
  },
];

/** Filter state produced when the interpreted criteria are applied. */
export const INTERPRETED_FILTER_STATE: SearchFilterState = {
  currentTitle: ["Backend Engineer", "Node.js Developer"],
  city: ["Bengaluru"],
  totalExperience: { min: 4, max: 7 },
  requiredSkills: ["Node.js", "AWS"],
  industry: ["SaaS"],
};

/* ------------------------------------------------------------------ */
/* Quota, saved searches                                                */
/* ------------------------------------------------------------------ */

export const SEARCH_QUOTA = {
  remaining: 7420,
  total: 10000,
  costPerSearch: 25,
  planName: "Growth Plan",
} as const;

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: number;
  lastRun: string;
  results: number;
}

export const SAVED_SEARCHES: SavedSearch[] = [
  {
    id: "sv1",
    name: "Backend bench — Bengaluru",
    query: "Senior backend engineers, Go + Kubernetes, Bengaluru",
    filters: 6,
    lastRun: "2h ago",
    results: 214,
  },
  {
    id: "sv2",
    name: "Design leaders 2026",
    query: "Product design leads, healthcare, remote-friendly",
    filters: 4,
    lastRun: "Yesterday",
    results: 158,
  },
  {
    id: "sv3",
    name: "Data platform shortlist",
    query: "Data engineers, Spark + Airflow, Pune or remote",
    filters: 5,
    lastRun: "3d ago",
    results: 191,
  },
];

/** Deterministic pseudo-estimate of candidate reach from active filters. */
export function estimateReach(activeFilters: number, hasQuery: boolean): {
  low: number;
  high: number;
} {
  const base = hasQuery ? 2400 : 8600;
  const narrowed = Math.max(
    120,
    Math.round(base / Math.pow(1.45, activeFilters))
  );
  return { low: narrowed, high: Math.round(narrowed * 2.6) };
}
