/**
 * Frontend filterForm ↔ Future Jobs query mapping helpers + geo expansion.
 */

import type { FutureJobsFilterForm, FutureJobsSkillsBuckets } from './futureJobs.types.js';

export {
  DEFAULT_FILTER_FORM,
  FILTER_FORM_RANGE_KEYS,
  enrichFilterFormSkillsFromPrompt,
  ensureSkillsForFutureJobs,
  filterFormFromAnnotation,
  filterFormFromCreateResponse,
  mergeFilterFormIntoSession,
  normalizeFilterFormForUi,
  normalizeRegionForFutureJobs,
} from './futureJobs.mapper.js';

/** Geo expansion order for pending/empty matching when a region filter exists. */
export const GEO_EXPAND_STEPS = ['60_km', '120_km'] as const;
export type GeoExpandStep = (typeof GEO_EXPAND_STEPS)[number];

const GEO_RADIUS_KM: Record<string, number> = {
  '25_km': 25,
  '50_km': 50,
  '60_km': 60,
  '100_km': 100,
  '120_km': 120,
  '200_km': 200,
};

export function parseGeoDistanceKm(value: unknown): number | null {
  const raw = String(value ?? '')
    .trim()
    .toLowerCase();
  if (!raw) return null;
  if (GEO_RADIUS_KM[raw] != null) return GEO_RADIUS_KM[raw];
  const match = raw.match(/^(\d+)\s*_?\s*km$/);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

export function hasRegionOrLocationFilter(form: Partial<FutureJobsFilterForm> | null | undefined): boolean {
  if (!form || typeof form !== 'object') return false;
  const location = form.location as unknown;
  if (Array.isArray(location) && location.some((v) => String(v ?? '').trim())) return true;
  if (typeof location === 'string' && location.trim()) return true;
  const regions = form.selectRegion as unknown;
  if (Array.isArray(regions) && regions.some((v) => String(v ?? '').trim())) return true;
  return false;
}

/**
 * Next geo expansion step for pending/empty results.
 * Returns null when expansion is not valid (no location filter, or already at/beyond 120_km).
 */
export function nextGeoExpandStep(
  form: Partial<FutureJobsFilterForm> | null | undefined,
  currentStep: GeoExpandStep | null | undefined
): GeoExpandStep | null {
  if (!hasRegionOrLocationFilter(form)) return null;

  const currentKm = parseGeoDistanceKm(form?.geoDistance) ?? 50;

  if (!currentStep) {
    if (currentKm < 60) return '60_km';
    if (currentKm < 120) return '120_km';
    return null;
  }

  if (currentStep === '60_km' && currentKm < 120) return '120_km';
  return null;
}

/** Apply a geo expand step onto a copy of the filter form (does not mutate original). */
export function applyGeoExpandStep(
  form: FutureJobsFilterForm,
  step: GeoExpandStep
): FutureJobsFilterForm {
  return {
    ...form,
    geoDistance: step,
  };
}

export function canExpandGeoFurther(
  form: Partial<FutureJobsFilterForm> | null | undefined,
  regionExpandStep: GeoExpandStep | null | undefined
): boolean {
  return nextGeoExpandStep(form, regionExpandStep) != null;
}

function skillList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const s = String(item ?? '').trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function normalizeSkillsBuckets(raw: unknown): FutureJobsSkillsBuckets {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { mandatory: [], core: [], secondary: [] };
  }
  const obj = raw as Record<string, unknown>;
  return {
    mandatory: skillList(obj.mandatory),
    core: skillList(obj.core),
    secondary: skillList(obj.secondary),
  };
}

/** True when mandatory/core buckets or keywordSkills constrain the search. */
export function hasStrictSkillsFilter(
  form: Partial<FutureJobsFilterForm> | null | undefined
): boolean {
  return canRelaxSkillsFilter(form);
}

/**
 * True when at least one more skill can be peeled (mandatory → core → keyword).
 * Secondary-only forms are already soft — no further skills relax.
 */
export function canRelaxSkillsFilter(
  form: Partial<FutureJobsFilterForm> | null | undefined
): boolean {
  return nextSkillsRelaxStep(form as FutureJobsFilterForm) != null;
}

export type SkillsRelaxStepResult = {
  form: FutureJobsFilterForm;
  /** Bucket the skill was removed from. */
  bucket: 'mandatory' | 'core' | 'keyword';
  /** Skill / keyword token that was removed. */
  removed: string;
};

function skillsToKeyword(buckets: FutureJobsSkillsBuckets): string {
  const parts = [...buckets.mandatory, ...buckets.core, ...buckets.secondary];
  return parts.join(', ');
}

function keywordTokens(keyword: string): string[] {
  return String(keyword ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Peel exactly one skill constraint (not all at once):
 * 1) last mandatory skill
 * 2) else last core skill
 * 3) else last keywordSkills token (when no structured mandatory/core)
 * Secondary skills are never removed.
 * Returns null when nothing left to peel.
 */
export function nextSkillsRelaxStep(
  form: Partial<FutureJobsFilterForm> | null | undefined
): SkillsRelaxStepResult | null {
  if (!form || typeof form !== 'object') return null;

  const buckets = normalizeSkillsBuckets(form.skills);
  const base = form as FutureJobsFilterForm;

  if (buckets.mandatory.length > 0) {
    const removed = buckets.mandatory[buckets.mandatory.length - 1]!;
    const skills: FutureJobsSkillsBuckets = {
      mandatory: buckets.mandatory.slice(0, -1),
      core: [...buckets.core],
      secondary: [...buckets.secondary],
    };
    return {
      form: {
        ...base,
        skills,
        keywordSkills: skillsToKeyword(skills),
      },
      bucket: 'mandatory',
      removed,
    };
  }

  if (buckets.core.length > 0) {
    const removed = buckets.core[buckets.core.length - 1]!;
    const skills: FutureJobsSkillsBuckets = {
      mandatory: [],
      core: buckets.core.slice(0, -1),
      secondary: [...buckets.secondary],
    };
    return {
      form: {
        ...base,
        skills,
        keywordSkills: skillsToKeyword(skills),
      },
      bucket: 'core',
      removed,
    };
  }

  // Structured secondary-only → already soft.
  if (buckets.secondary.length > 0) return null;

  // Keyword-only forms map into core in the payload mapper — peel one token.
  const tokens = keywordTokens(String(base.keywordSkills ?? ''));
  if (tokens.length === 0) return null;
  const removed = tokens[tokens.length - 1]!;
  const remaining = tokens.slice(0, -1);
  return {
    form: {
      ...base,
      skills: { mandatory: [], core: [], secondary: [] },
      keywordSkills: remaining.join(', '),
    },
    bucket: 'keyword',
    removed,
  };
}

/**
 * @deprecated Prefer nextSkillsRelaxStep — kept as a one-skill peel alias.
 */
export function applySkillsRelaxStep(form: FutureJobsFilterForm): FutureJobsFilterForm {
  const step = nextSkillsRelaxStep(form);
  return step ? step.form : form;
}

/** Cap provider PATCHes when peeling many skills one-by-one. */
export const MAX_SKILLS_RELAX_STEPS = 12;
