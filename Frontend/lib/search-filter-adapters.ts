import type { CandidateFilterForm } from "@/lib/api/candidate-search";
import {
  FILTER_FIELD_INDEX,
  isFieldActive,
  type FilterValue,
  type RangeValue,
  type SearchFilterState,
} from "@/lib/mock-search";

const ANNUAL_REVENUE_LABEL_TO_TOKEN: Record<string, string> = {
  "Under $1M": "under_1",
  "$1M – $10M": "1_10",
  "$1M - $10M": "1_10",
  "$10M – $100M": "10_100",
  "$10M - $100M": "10_100",
  "$100M – $1B": "100_1000",
  "$100M - $1B": "100_1000",
  "Over $1B": "over_1000",
};

const ANNUAL_REVENUE_TOKEN_TO_LABEL: Record<string, string> = {
  under_1: "Under $1M",
  "1_10": "$1M – $10M",
  "10_100": "$10M – $100M",
  "100_1000": "$100M – $1B",
  over_1000: "Over $1B",
};

function asStringList(value: FilterValue | undefined): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[,;|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function asOptionalString(value: FilterValue | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "Any") return undefined;
  return trimmed;
}

function asRange(value: FilterValue | undefined): RangeValue | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const range = value as RangeValue;
  if (range.min == null && range.max == null) return null;
  return range;
}

/**
 * Convert drawer filter state into the flat Future Jobs filter-form keys
 * accepted by POST /candidates/search/apply.
 */
export function filtersToProviderPayload(
  filters: SearchFilterState
): CandidateFilterForm {
  const payload: CandidateFilterForm = {};

  const selectRegion = asStringList(filters.selectRegion);
  if (selectRegion.length > 0) payload.selectRegion = selectRegion;

  const currentTitle = asStringList(filters.currentTitle);
  if (currentTitle.length > 0) {
    payload.currentTitle = currentTitle.join(", ");
  }

  const pastTitle = asStringList(filters.pastTitle);
  if (pastTitle.length > 0) payload.pastTitle = pastTitle;

  const mandatory = asStringList(filters.mandatorySkills);
  const core = asStringList(filters.coreSkills);
  const secondary = asStringList(filters.secondarySkills);
  if (mandatory.length > 0 || core.length > 0 || secondary.length > 0) {
    payload.skills = { mandatory, core, secondary };
    // Keep keywordSkills as a readable fallback for older paths / display.
    payload.keywordSkills = [...mandatory, ...core, ...secondary].join(", ");
  }

  const functionCategory = asStringList(filters.functionCategory);
  if (functionCategory.length > 0) {
    payload.functionCategory = functionCategory.join(", ");
  }

  const seniorityLevel = asOptionalString(filters.seniorityLevel);
  if (seniorityLevel) payload.seniorityLevel = seniorityLevel;

  const location = asStringList(filters.location);
  if (location.length > 0) payload.location = location;

  const geoDistance = asOptionalString(filters.geoDistance);
  if (geoDistance) payload.geoDistance = geoDistance;

  const yearsExperience = asRange(filters.yearsExperience);
  if (yearsExperience) {
    if (yearsExperience.min != null) {
      payload.yearsExpMin = String(yearsExperience.min);
    }
    if (yearsExperience.max != null) {
      payload.yearsExpMax = String(yearsExperience.max);
    }
  }

  const yearsAtCompany = asStringList(filters.yearsAtCompany);
  if (yearsAtCompany.length > 0) payload.yearsAtCompany = yearsAtCompany;

  const companyNames = asStringList(filters.companyNames);
  if (companyNames.length > 0) {
    const companyScope =
      asOptionalString(filters.companyScope) ?? "Current + Past";
    if (companyScope === "Current") {
      payload.targetCompanyScope = "current";
      payload.currentCompany = companyNames;
    } else if (companyScope === "Past") {
      payload.targetCompanyScope = "past";
      payload.pastCompany = companyNames;
    } else {
      payload.targetCompanyScope = "current_past";
      payload.currentCompany = companyNames;
      payload.pastCompany = companyNames;
    }
  }

  const companyType = asOptionalString(filters.companyType);
  if (companyType) payload.companyType = companyType;

  const companyHeadquarters = asStringList(filters.companyHeadquarters);
  if (companyHeadquarters.length > 0) {
    payload.companyHeadquarters = companyHeadquarters[0];
  }

  const companyFocus = asStringList(filters.companyFocus);
  if (companyFocus.length > 0) payload.companyFocus = companyFocus;

  const employmentType = asStringList(filters.employmentType);
  if (employmentType.length > 0) {
    payload.employmentType = employmentType.join(", ");
  }

  const companyHeadcountRange = asOptionalString(filters.companyHeadcountRange);
  if (companyHeadcountRange) {
    payload.companyHeadcountRange = companyHeadcountRange;
  }

  const industry = asStringList(filters.industry);
  if (industry.length > 0) payload.industry = industry.join(", ");

  const fundingStage = asStringList(filters.fundingStage);
  if (fundingStage.length > 0) payload.fundingStage = fundingStage;

  const annualRevenueLabel = asOptionalString(filters.annualRevenue);
  if (annualRevenueLabel) {
    payload.annualRevenue =
      ANNUAL_REVENUE_LABEL_TO_TOKEN[annualRevenueLabel] ?? annualRevenueLabel;
  }

  const totalFunding = asOptionalString(filters.totalFundingRaised);
  if (totalFunding) payload.totalFundingRaised = [totalFunding];

  const headcountGrowth = asRange(filters.headcountGrowth);
  if (headcountGrowth) {
    if (headcountGrowth.min != null) {
      payload.headcountGrowthMin = String(headcountGrowth.min);
    }
    if (headcountGrowth.max != null) {
      payload.headcountGrowthMax = String(headcountGrowth.max);
    }
  }

  const companyHeadcount = asRange(filters.companyHeadcount);
  if (companyHeadcount) {
    if (companyHeadcount.min != null) {
      payload.companyHeadcountMin = String(companyHeadcount.min);
    }
    if (companyHeadcount.max != null) {
      payload.companyHeadcountMax = String(companyHeadcount.max);
    }
  }

  const yearFounded = asRange(filters.yearFounded);
  if (yearFounded) {
    if (yearFounded.min != null) {
      payload.yearFoundedMin = String(yearFounded.min);
    }
    if (yearFounded.max != null) {
      payload.yearFoundedMax = String(yearFounded.max);
    }
  }

  const recentlyFunded = asOptionalString(filters.recentlyFunded);
  if (recentlyFunded) payload.recentlyFunded = [recentlyFunded];

  const school = asStringList(filters.school);
  if (school.length > 0) payload.school = school;

  const degree = asStringList(filters.degree);
  if (degree.length > 0) payload.degree = degree;

  const fieldOfStudy = asStringList(filters.fieldOfStudy);
  if (fieldOfStudy.length > 0) payload.fieldOfStudy = fieldOfStudy;

  const certifications = asStringList(filters.certifications);
  if (certifications.length > 0) payload.certifications = certifications;

  const honors = asStringList(filters.honorsAwards);
  if (honors.length > 0) payload.honorsAwards = honors[0];

  if (filters.openToWork === true) payload.openToWork = true;

  return payload;
}

function parseOptionalNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function rangeFromMinMax(
  minRaw: unknown,
  maxRaw: unknown
): RangeValue | undefined {
  const min = parseOptionalNumber(minRaw);
  const max = parseOptionalNumber(maxRaw);
  if (min == null && max == null) return undefined;
  return { min, max };
}

function stringListFromUnknown(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? "").trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[,;|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Convert a backend/annotate flat filter form into drawer SearchFilterState.
 */
export function providerPayloadToFilters(
  form: CandidateFilterForm | null | undefined
): SearchFilterState {
  if (!form || typeof form !== "object") return {};

  const next: SearchFilterState = {};

  const selectRegion = stringListFromUnknown(form.selectRegion);
  if (selectRegion.length > 0) next.selectRegion = selectRegion;

  const currentTitle = stringListFromUnknown(form.currentTitle);
  if (currentTitle.length > 0) next.currentTitle = currentTitle;

  const pastTitle = stringListFromUnknown(form.pastTitle);
  if (pastTitle.length > 0) next.pastTitle = pastTitle;

  const skills =
    form.skills && typeof form.skills === "object" && !Array.isArray(form.skills)
      ? (form.skills as {
          mandatory?: unknown;
          core?: unknown;
          secondary?: unknown;
        })
      : null;

  const mandatory = stringListFromUnknown(skills?.mandatory);
  const coreFromBuckets = stringListFromUnknown(skills?.core);
  const secondary = stringListFromUnknown(skills?.secondary);
  const coreFromKeywords = stringListFromUnknown(form.keywordSkills);
  const core = coreFromBuckets.length > 0 ? coreFromBuckets : coreFromKeywords;

  if (mandatory.length > 0) next.mandatorySkills = mandatory;
  if (core.length > 0) next.coreSkills = core;
  if (secondary.length > 0) next.secondarySkills = secondary;

  const functionCategory = stringListFromUnknown(form.functionCategory);
  if (functionCategory.length > 0) next.functionCategory = functionCategory;

  if (typeof form.seniorityLevel === "string" && form.seniorityLevel.trim()) {
    next.seniorityLevel = form.seniorityLevel.trim();
  }

  const location = stringListFromUnknown(form.location);
  if (location.length > 0) next.location = location;

  if (typeof form.geoDistance === "string" && form.geoDistance.trim()) {
    next.geoDistance = form.geoDistance.trim();
  }

  const yearsExperience = rangeFromMinMax(form.yearsExpMin, form.yearsExpMax);
  if (yearsExperience) next.yearsExperience = yearsExperience;

  const yearsAtCompany = stringListFromUnknown(form.yearsAtCompany);
  if (yearsAtCompany.length > 0) next.yearsAtCompany = yearsAtCompany;

  const currentCompany = stringListFromUnknown(form.currentCompany);
  const pastCompany = stringListFromUnknown(form.pastCompany);
  const companyNames = [...currentCompany, ...pastCompany].filter(
    (company, index, all) =>
      all.findIndex(
        (candidate) =>
          candidate.toLocaleLowerCase() === company.toLocaleLowerCase()
      ) === index
  );
  if (companyNames.length > 0) {
    next.companyNames = companyNames;
    if (currentCompany.length > 0 && pastCompany.length > 0) {
      next.companyScope = "Current + Past";
    } else if (pastCompany.length > 0) {
      next.companyScope = "Past";
    } else {
      next.companyScope = "Current";
    }
  }

  if (typeof form.companyType === "string" && form.companyType.trim()) {
    next.companyType = form.companyType.trim();
  }

  if (
    typeof form.companyHeadquarters === "string" &&
    form.companyHeadquarters.trim()
  ) {
    next.companyHeadquarters = [form.companyHeadquarters.trim()];
  }

  const companyFocus = stringListFromUnknown(form.companyFocus);
  if (companyFocus.length > 0) next.companyFocus = companyFocus;

  const employmentType = stringListFromUnknown(form.employmentType);
  if (employmentType.length > 0) next.employmentType = employmentType;

  if (
    typeof form.companyHeadcountRange === "string" &&
    form.companyHeadcountRange.trim()
  ) {
    next.companyHeadcountRange = form.companyHeadcountRange.trim();
  }

  const industry = stringListFromUnknown(form.industry);
  if (industry.length > 0) next.industry = industry;

  const fundingStage = stringListFromUnknown(form.fundingStage);
  if (fundingStage.length > 0) next.fundingStage = fundingStage;

  if (typeof form.annualRevenue === "string" && form.annualRevenue.trim()) {
    const token = form.annualRevenue.trim();
    next.annualRevenue = ANNUAL_REVENUE_TOKEN_TO_LABEL[token] ?? token;
  }

  const totalFunding = stringListFromUnknown(form.totalFundingRaised);
  if (totalFunding.length > 0) next.totalFundingRaised = totalFunding[0];

  const headcountGrowth = rangeFromMinMax(
    form.headcountGrowthMin,
    form.headcountGrowthMax
  );
  if (headcountGrowth) next.headcountGrowth = headcountGrowth;

  const companyHeadcount = rangeFromMinMax(
    form.companyHeadcountMin,
    form.companyHeadcountMax
  );
  if (companyHeadcount) next.companyHeadcount = companyHeadcount;

  const yearFounded = rangeFromMinMax(form.yearFoundedMin, form.yearFoundedMax);
  if (yearFounded) next.yearFounded = yearFounded;

  const recentlyFunded = stringListFromUnknown(form.recentlyFunded);
  if (recentlyFunded.length > 0) next.recentlyFunded = recentlyFunded[0];

  const school = stringListFromUnknown(form.school);
  if (school.length > 0) next.school = school;

  const degree = stringListFromUnknown(form.degree);
  if (degree.length > 0) next.degree = degree;

  const fieldOfStudy = stringListFromUnknown(form.fieldOfStudy);
  if (fieldOfStudy.length > 0) next.fieldOfStudy = fieldOfStudy;

  const certifications = stringListFromUnknown(form.certifications);
  if (certifications.length > 0) next.certifications = certifications;

  if (typeof form.honorsAwards === "string" && form.honorsAwards.trim()) {
    next.honorsAwards = [form.honorsAwards.trim()];
  }

  if (form.openToWork === true) next.openToWork = true;

  // Drop anything that is not a known drawer field.
  return Object.fromEntries(
    Object.entries(next).filter(([fieldId, value]) => {
      return FILTER_FIELD_INDEX[fieldId] && isFieldActive(value);
    })
  );
}
