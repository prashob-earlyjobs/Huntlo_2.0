import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  GraduationCap,
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
  autocompleteFilterType?: string;
  options?: readonly string[];
  placeholder?: string;
  min?: number;
  max?: number;
  unit?: string;
  hint?: string;
  className?: string;
  hideLabel?: boolean;
  compactAfter?: boolean;
}

export interface FilterSection {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  fields: FilterField[];
}

const TITLE_OPTIONS = [
  ".NET Developer",
  "C# Developer",
  "Software Engineer",
  "Web Developer",
  "Application Developer",
  "Backend Developer",
  "Full Stack Engineer",
  "Frontend Engineer",
  "Senior Software Engineer",
  "Software Developer",
] as const;

const SKILL_OPTIONS = [
  "C#",
  ".NET Core",
  "ASP.NET MVC",
  "Web API",
  "SQL Server",
  "Entity Framework",
  "React",
  "Angular",
  "Docker",
  "Node.js",
  "TypeScript",
  "AWS",
  "Kubernetes",
  "PostgreSQL",
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

const COMPANY_OPTIONS = [
  "Tech Mahindra",
  "Infosys",
  "TCS",
  "Wipro",
  "Accenture",
  "Flipkart",
  "Razorpay",
  "Freshworks",
  "Zoho",
  "Swiggy",
  "CRED",
] as const;

const YEARS_AT_COMPANY_OPTIONS = [
  "Less than 1 year",
  "1 to 2 years",
  "3 to 5 years",
  "6 to 10 years",
  "More than 10 years",
] as const;

const COMPANY_SIZE_OPTIONS = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5001-10000",
  "10001+",
] as const;

const COMPANY_TYPE_OPTIONS = [
  "Public Company",
  "Privately Held",
  "Partnership",
  "Nonprofit",
  "Government Agency",
  "Self-Employed",
  "Educational Institution",
] as const;

const COMPANY_FOCUS_OPTIONS = [
  "B2B SaaS",
  "B2C",
  "AI / Machine Learning",
  "Fintech",
  "E-commerce",
  "Healthcare / Healthtech",
  "Edtech",
  "Deep Tech",
  "Developer Tools",
  "Enterprise Software",
  "Consumer Apps",
  "Cybersecurity",
  "Cloud Infrastructure",
  "Data & Analytics",
  "Gaming",
  "Marketplace",
  "Social Media",
  "IoT",
  "Logistics / Supply Chain",
  "HR Tech",
] as const;

const INDUSTRY_OPTIONS = [
  "Software Development",
  "IT System Custom Software Development",
  "Design Services",
  "SaaS",
  "Fintech",
  "Healthtech",
  "E-commerce",
  "Edtech",
  "AI / ML",
] as const;

const FUNDING_OPTIONS = [
  "Seed",
  "Series A",
  "Series B",
  "Series C",
  "Series D",
  "Series E",
  "Series F+",
  "IPO",
] as const;

const REVENUE_OPTIONS = [
  "Under $1M",
  "$1M – $10M",
  "$10M – $100M",
  "$100M – $1B",
  "Over $1B",
] as const;

const TOTAL_FUNDING_OPTIONS = [
  "Under $1M",
  "$1M – $10M",
  "$10M – $50M",
  "$50M – $500M",
  "Over $500M",
] as const;

const RECENTLY_FUNDED_OPTIONS = [
  "Last 3 months",
  "Last 6 months",
  "Last 12 months",
  "Last 24 months",
] as const;

const DEGREE_OPTIONS = [
  "High School or Above",
  "Associate's or Above",
  "Bachelor's or Above",
  "Master's or Above",
  "Doctorate or Above",
  "Post-Doctorate",
] as const;

const FIELD_OF_STUDY_OPTIONS = [
  "Computer Science",
  "Information Technology",
  "related field",
  "Electronics",
  "Mathematics",
  "Design",
  "Business",
] as const;

const CERTIFICATION_OPTIONS = [
  "AWS Certified Cloud Practitioner",
  "AWS Certified Solutions Architect",
  "CKA (Kubernetes)",
  "PMP",
  "Google Professional Cloud",
  "Scrum Master",
] as const;

const GEO_DISTANCE_OPTIONS = [
  "10_km",
  "25_km",
  "50_km",
  "100_km",
  "200_km",
] as const;

const EMPLOYMENT_TYPE_OPTIONS = [
  "Full-time",
  "Part-time",
  "Permanent",
  "Contract",
  "Internship",
  "Freelance",
] as const;

const ANY_OPTION = "Any" as const;

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
        id: "pastTitle",
        label: "Previous title",
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
    description: "Mandatory, core and secondary skills",
    fields: [
      {
        id: "mandatorySkills",
        label: "Mandatory skills",
        type: "multi",
        options: SKILL_OPTIONS,
        placeholder: "Search skills…",
      },
      {
        id: "coreSkills",
        label: "Core skills",
        type: "multi",
        options: SKILL_OPTIONS,
        placeholder: "Search skills…",
      },
      {
        id: "secondarySkills",
        label: "Secondary skills",
        type: "multi",
        options: SKILL_OPTIONS,
        placeholder: "Search skills…",
      },
      {
        id: "functionCategory",
        label: "Functional area",
        type: "multi",
        options: FUNCTIONAL_AREAS,
        placeholder: "Search functions…",
      },
      {
        id: "seniorityLevel",
        label: "Seniority",
        type: "select",
        options: [ANY_OPTION, ...SENIORITY_OPTIONS],
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
        id: "selectRegion",
        label: "Country",
        type: "multi",
        autocompleteFilterType: "location_country",
        options: COUNTRY_OPTIONS,
        placeholder: "Search countries…",
      },
      {
        id: "location",
        label: "Region",
        type: "multi",
        autocompleteFilterType: "region",
        options: [],
        placeholder: "Search regions…",
      },
      {
        id: "geoDistance",
        label: "Geo distance",
        type: "select",
        options: [ANY_OPTION, ...GEO_DISTANCE_OPTIONS],
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
        id: "yearsExperience",
        label: "Total experience",
        type: "range",
        min: 0,
        max: 30,
        unit: "yrs",
      },
    ],
  },
  {
    id: "employers",
    title: "Employers & Company Signals",
    icon: Building2,
    description: "Company history, profile and growth",
    fields: [
      {
        id: "companyScope",
        label: "Employer history",
        type: "select",
        options: ["Current + Past", "Current", "Past"],
        className: "ml-auto w-40",
        hideLabel: true,
        compactAfter: true,
      },
      {
        id: "companyNames",
        label: "Employers",
        type: "multi",
        autocompleteFilterType: "current_employers.name",
        options: COMPANY_OPTIONS,
        placeholder: "Search companies…",
      },
      {
        id: "companyFocus",
        label: "Company description",
        type: "multi",
        options: COMPANY_FOCUS_OPTIONS,
        placeholder: "Search company descriptions…",
      },
      {
        id: "industry",
        label: "Industry",
        type: "multi",
        options: INDUSTRY_OPTIONS,
        placeholder: "Search industries…",
      },
      {
        id: "yearsAtCompany",
        label: "Years at current company",
        type: "multi",
        options: YEARS_AT_COMPANY_OPTIONS,
        placeholder: "e.g. 3 to 5 years",
      },
      {
        id: "fundingStage",
        label: "Funding stage",
        type: "multi",
        options: FUNDING_OPTIONS,
        placeholder: "e.g. Series A, Series B",
      },
      {
        id: "headcountGrowth",
        label: "Headcount Growth (6-month %)",
        type: "range",
        min: 0,
        max: 100,
        unit: "%",
      },
      {
        id: "companyHeadcount",
        label: "Company Headcount",
        type: "range",
        min: 0,
        max: 10000,
        unit: "people",
      },
      {
        id: "annualRevenue",
        label: "Annual Revenue",
        type: "select",
        options: [ANY_OPTION, ...REVENUE_OPTIONS],
      },
      {
        id: "totalFundingRaised",
        label: "Total Funding Raised",
        type: "select",
        options: [ANY_OPTION, ...TOTAL_FUNDING_OPTIONS],
      },
      {
        id: "yearFounded",
        label: "Year Founded",
        type: "range",
        min: 1950,
        max: 2026,
      },
      {
        id: "recentlyFunded",
        label: "Recently Funded",
        type: "select",
        options: [ANY_OPTION, ...RECENTLY_FUNDED_OPTIONS],
      },
      {
        id: "companyType",
        label: "Company type",
        type: "select",
        options: [ANY_OPTION, ...COMPANY_TYPE_OPTIONS],
      },
      {
        id: "companyHeadquarters",
        label: "Company HQ location",
        type: "tags",
        placeholder: "e.g. Pune, Maharashtra, India",
      },
      {
        id: "employmentType",
        label: "Employment type",
        type: "multi",
        options: EMPLOYMENT_TYPE_OPTIONS,
        placeholder: "Search types…",
      },
      {
        id: "companyHeadcountRange",
        label: "Company headcount range",
        type: "select",
        options: [ANY_OPTION, ...COMPANY_SIZE_OPTIONS],
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
        label: "School / institute",
        type: "multi",
        autocompleteFilterType: "education_background.institute_name",
        options: [],
        placeholder: "e.g. University of Mumbai",
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
        autocompleteFilterType: "education_background.field_of_study",
        options: FIELD_OF_STUDY_OPTIONS,
        placeholder: "Search fields…",
      },
      {
        id: "certifications",
        label: "Certifications",
        type: "multi",
        autocompleteFilterType: "certifications.name",
        options: CERTIFICATION_OPTIONS,
        placeholder: "Search certifications…",
      },
      {
        id: "honorsAwards",
        label: "Honors / awards",
        type: "tags",
        placeholder: "e.g. Dean's list",
      },
    ],
  },
  {
    id: "signals",
    title: "Candidate Signals",
    icon: Radar,
    description: "Intent signals",
    fields: [
      {
        id: "openToWork",
        label: "Open to work",
        type: "toggle",
        hint: "Maps to CAREER_INTEREST open-to-work cards",
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
  {
    id: "ic-skills",
    label: "Skills",
    fieldId: "coreSkills",
    value: "Node.js, AWS",
  },
  {
    id: "ic-location",
    label: "Location",
    fieldId: "location",
    value: "Bengaluru, Karnataka, India",
  },
  {
    id: "ic-experience",
    label: "Experience",
    fieldId: "yearsExperience",
    value: "4–7 years",
  },
  {
    id: "ic-industry",
    label: "Company profile",
    fieldId: "industry",
    value: "Software Development",
  },
  {
    id: "ic-employment",
    label: "Candidate signals",
    fieldId: "openToWork",
    value: "Open to work",
  },
];

/** Filter state produced when the interpreted criteria are applied. */
export const INTERPRETED_FILTER_STATE: SearchFilterState = {
  currentTitle: ["Backend Engineer", "Node.js Developer"],
  location: ["Bengaluru, Karnataka, India"],
  yearsExperience: { min: 4, max: 7 },
  coreSkills: ["Node.js", "AWS"],
  industry: ["Software Development"],
  openToWork: true,
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
export function estimateReach(
  activeFilters: number,
  hasQuery: boolean
): {
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
