import {
  Briefcase,
  Building2,
  GraduationCap,
  MapPin,
  Radar,
  Timer,
  Wrench,
} from "lucide-react";

import type { CandidateSearchCatalogField } from "@/lib/api/candidate-search";
import type {
  FilterField,
  FilterSection,
  FilterValue,
  SearchFilterState,
} from "@/lib/mock-search";

/** Huntlo-only control. Mapped to Bright Data `experience.duration` on apply. */
export const YEARS_OF_EXPERIENCE_FIELD_ID = "huntlo.years_of_experience";
export const COMPANY_SCOPE_FIELD_ID = "huntlo.company_scope";
export const EMPLOYERS_FIELD_ID = "huntlo.employers";
/** Bright Data Search: max rules in one and/or group. */
export const BRIGHTDATA_MAX_GROUP_RULES = 4;

const HIDDEN_GROUPS = new Set([
  "posts",
  "activity",
  "people_also_viewed",
  "similar_profiles",
  "bio_links",
  "recommendations",
]);

const PRIMARY_DATASET_FIELDS = new Set([
  "position",
  "current_company.title",
  "experience.title",
  "about",
  "country_code",
  "city",
  "location",
  "experience.duration",
  "current_company.name",
  "experience.company",
  "current_company.location",
  "education.title",
  "education.degree",
  "education.field",
  "certifications.title",
  "honors_and_awards.title",
]);

function durationValuesFromYears(min: number | null, max: number | null): string[] {
  if (min == null && max == null) return [];
  const lo = min ?? 1;
  const hi = max ?? min ?? lo;
  const values: string[] = [];
  const start = Math.max(0, Math.min(lo, hi));
  const end = Math.min(30, Math.max(lo, hi));
  for (let years = start; years <= end; years += 1) {
    if (years === 0) {
      values.push("less than a year", "<1 year");
      continue;
    }
    values.push(
      `${years} year${years === 1 ? "" : "s"}`,
      `${years} yr${years === 1 ? "" : "s"}`
    );
  }
  return [...new Set(values)].slice(0, 24);
}

function groupKey(name: string): string {
  if (!name.includes(".")) return "profile";
  return name.split(".")[0] ?? "profile";
}

function yearsRangeFromDuration(
  values: string[]
): { min: number | null; max: number | null } | null {
  const years = values
    .map((value) => {
      const match = value.match(/(\d+)\s*\+?\s*(?:yrs?|years?)/i);
      return match ? Number(match[1]) : NaN;
    })
    .filter((value) => Number.isFinite(value));
  if (!years.length) return null;
  return { min: Math.min(...years), max: Math.max(...years) };
}

function asStringList(value: FilterValue | unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function tagsField(
  id: string,
  label: string,
  placeholder: string,
  hint?: string
): FilterField {
  return {
    id,
    label,
    type: "tags",
    placeholder,
    hint,
    maxTags: BRIGHTDATA_MAX_GROUP_RULES,
  };
}

function toFilterField(field: CandidateSearchCatalogField): FilterField {
  if (field.type === "boolean") {
    return {
      id: field.name,
      label: field.label,
      type: "toggle",
      hint: field.description || undefined,
    };
  }
  if (field.type === "number") {
    return {
      id: field.name,
      label: field.label,
      type: "range",
      min: 0,
      max: 5000,
      hint: field.description || undefined,
    };
  }
  return {
    id: field.name,
    label: field.label,
    type: "tags",
    placeholder: field.description || `Add ${field.label.toLowerCase()}`,
    maxTags: BRIGHTDATA_MAX_GROUP_RULES,
  };
}

function moreCatalogFields(
  fields: CandidateSearchCatalogField[]
): CandidateSearchCatalogField[] {
  return fields.filter((field) => {
    if (PRIMARY_DATASET_FIELDS.has(field.name)) return false;
    if (HIDDEN_GROUPS.has(groupKey(field.name))) return false;
    if (field.name.includes("positions") || field.name.includes("html")) return false;
    return true;
  });
}

export function sectionsFromBrightDataCatalog(
  _fields: CandidateSearchCatalogField[]
): FilterSection[] {
  const more = moreCatalogFields(_fields);
  const sections: FilterSection[] = [
    {
      id: "titles",
      title: "Job Titles",
      icon: Briefcase,
      description: "Current and past titles to match",
      fields: [
        tagsField("position", "Current title", "Search titles…"),
        tagsField("experience.title", "Previous title", "Search titles…"),
      ],
    },
    {
      id: "skills",
      title: "Skills & Functions",
      icon: Wrench,
      description: "Mandatory, core and secondary skills",
      fields: [
        tagsField(
          "about",
          "Core skills",
          "Search skills…",
          "Bright Data has no skills field; this searches the profile about text."
        ),
      ],
    },
    {
      id: "location",
      title: "Location",
      icon: MapPin,
      description: "Where candidates live or can work",
      fields: [
        tagsField(
          "country_code",
          "Country",
          "e.g. IN, US",
          "ISO country code (IN, US, GB)."
        ),
        tagsField("city", "Region", "Search cities…"),
      ],
    },
    {
      id: "experience",
      title: "Experience",
      icon: Timer,
      description: "Years of experience and tenure",
      fields: [
        {
          id: YEARS_OF_EXPERIENCE_FIELD_ID,
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
          id: COMPANY_SCOPE_FIELD_ID,
          label: "Employer history",
          type: "select",
          options: ["Current + Past", "Current", "Past"],
          className: "ml-auto w-40",
          hideLabel: true,
          compactAfter: true,
        },
        tagsField(EMPLOYERS_FIELD_ID, "Employers", "Search companies…"),
        tagsField(
          "current_company.location",
          "Company HQ location",
          "e.g. Pune, Maharashtra, India"
        ),
      ],
    },
    {
      id: "education",
      title: "Education",
      icon: GraduationCap,
      description: "Schools, degrees and certifications",
      fields: [
        tagsField("education.title", "School / institute", "e.g. University of Mumbai"),
        tagsField("education.degree", "Degree", "Search degrees…"),
        tagsField("education.field", "Field of study", "Search fields…"),
        tagsField("certifications.title", "Certifications", "Search certifications…"),
        tagsField("honors_and_awards.title", "Honors / awards", "e.g. Dean's list"),
      ],
    },
  ];

  if (more.length) {
    sections.push({
      id: "more",
      title: "More dataset filters",
      icon: Radar,
      description: "Extra Bright Data fields not in the Future Jobs layout.",
      fields: more.map(toFilterField),
    });
  }

  return sections;
}

export function searchStateFromDatasetFilters(
  datasetFilters: Record<string, unknown> | undefined,
  fields: CandidateSearchCatalogField[]
): SearchFilterState {
  if (!datasetFilters) return {};
  const types = new Map(fields.map((field) => [field.name, field.type]));
  const state: SearchFilterState = {};
  for (const [name, raw] of Object.entries(datasetFilters)) {
    const type = types.get(name);
    if (typeof raw === "boolean") {
      state[name] = raw;
      continue;
    }
    if (typeof raw === "number" && Number.isFinite(raw)) {
      if (type === "number") {
        state[name] = { min: raw, max: null };
      } else {
        state[name] = [String(raw)];
      }
      continue;
    }
    if (typeof raw === "string" && raw.trim()) {
      state[name] = [raw.trim()];
      continue;
    }
    if (Array.isArray(raw)) {
      const values = raw
        .map((item) => String(item).trim())
        .filter(Boolean)
        .slice(0, BRIGHTDATA_MAX_GROUP_RULES);
      if (values.length) state[name] = values;
    }
  }

  const duration = state["experience.duration"];
  if (Array.isArray(duration)) {
    const range = yearsRangeFromDuration(duration.map(String));
    if (range) state[YEARS_OF_EXPERIENCE_FIELD_ID] = range;
  }

  const current = asStringList(state["current_company.name"]).slice(
    0,
    BRIGHTDATA_MAX_GROUP_RULES
  );
  const past = asStringList(state["experience.company"]).slice(
    0,
    BRIGHTDATA_MAX_GROUP_RULES
  );
  if (current.length || past.length) {
    const same =
      current.length === past.length &&
      current.every((name, index) => name === past[index]);
    if (current.length && past.length && same) {
      state[COMPANY_SCOPE_FIELD_ID] = "Current + Past";
      state[EMPLOYERS_FIELD_ID] = current;
    } else if (current.length && !past.length) {
      state[COMPANY_SCOPE_FIELD_ID] = "Current";
      state[EMPLOYERS_FIELD_ID] = current;
    } else if (past.length && !current.length) {
      state[COMPANY_SCOPE_FIELD_ID] = "Past";
      state[EMPLOYERS_FIELD_ID] = past;
    } else {
      state[COMPANY_SCOPE_FIELD_ID] = "Current + Past";
      state[EMPLOYERS_FIELD_ID] = [...new Set([...current, ...past])].slice(
        0,
        BRIGHTDATA_MAX_GROUP_RULES
      );
    }
    delete state["current_company.name"];
    delete state["experience.company"];
  }

  return state;
}

export function datasetFiltersFromState(
  filters: Record<string, FilterValue | undefined>,
  fieldNames: string[]
): Record<string, unknown> {
  const allowed = new Set([
    ...fieldNames,
    "experience.duration",
    "position",
    "experience.title",
    "about",
    "country_code",
    "city",
    "education.title",
    "education.degree",
    "education.field",
    "certifications.title",
    "honors_and_awards.title",
    "current_company.location",
  ]);
  const payload: Record<string, unknown> = {};
  const employers = asStringList(filters[EMPLOYERS_FIELD_ID]).slice(
    0,
    BRIGHTDATA_MAX_GROUP_RULES
  );
  const scope =
    typeof filters[COMPANY_SCOPE_FIELD_ID] === "string" &&
    filters[COMPANY_SCOPE_FIELD_ID] !== "Any"
      ? filters[COMPANY_SCOPE_FIELD_ID]
      : "Current + Past";

  for (const name of allowed) {
    if (name.startsWith("huntlo.")) continue;
    if (
      employers.length &&
      (name === "current_company.name" || name === "experience.company")
    ) {
      continue;
    }
    const value = filters[name];
    if (value === undefined) continue;
    if (typeof value === "boolean") {
      payload[name] = value;
      continue;
    }
    if (typeof value === "string" && value.trim() && value !== "Any") {
      payload[name] = value.trim();
      continue;
    }
    if (Array.isArray(value) && value.length) {
      payload[name] = value
        .map((item) => String(item).trim())
        .filter(Boolean)
        .slice(0, BRIGHTDATA_MAX_GROUP_RULES);
      continue;
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const range = value as { min: number | null; max: number | null };
      const parts: string[] = [];
      if (range.min != null) parts.push(String(range.min));
      if (range.max != null) parts.push(String(range.max));
      if (parts.length) payload[name] = parts;
    }
  }

  if (employers.length) {
    if (scope === "Current") {
      payload["current_company.name"] = employers;
    } else if (scope === "Past") {
      payload["experience.company"] = employers;
    } else {
      payload["current_company.name"] = employers;
      payload["experience.company"] = employers;
    }
  }

  const yoe = filters[YEARS_OF_EXPERIENCE_FIELD_ID];
  if (yoe && typeof yoe === "object" && !Array.isArray(yoe)) {
    const duration = durationValuesFromYears(yoe.min, yoe.max);
    if (duration.length) payload["experience.duration"] = duration;
  }
  return payload;
}
