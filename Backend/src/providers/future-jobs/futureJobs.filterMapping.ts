/**
 * Frontend filterForm ↔ Future Jobs query mapping helpers + geo expansion.
 */

import type { FutureJobsFilterForm } from './futureJobs.types.js';

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
