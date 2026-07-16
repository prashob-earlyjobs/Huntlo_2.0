import {
  DEFAULT_FILTER_FORM,
  enrichFilterFormSkillsFromPrompt,
  filterFormFromAnnotation,
  getFutureJobsProvider,
  normalizeFilterFormForUi,
  normalizePromptPlainText,
  type FutureJobsFilterForm,
} from '../../providers/future-jobs/index.js';
import { enhanceInterpretedCriteria } from '../../providers/gemini/index.js';
import type { InterpretedCriterion } from './sourcing.validation.js';

const FIELD_META: Array<{
  fieldId: keyof FutureJobsFilterForm | string;
  label: string;
  id: string;
  format?: (form: FutureJobsFilterForm) => string | null;
}> = [
  {
    id: 'ic-titles',
    fieldId: 'currentTitle',
    label: 'Role',
    format: (form) => (form.currentTitle?.trim() ? form.currentTitle.trim() : null),
  },
  {
    id: 'ic-skills',
    fieldId: 'keywordSkills',
    label: 'Skills',
    format: (form) => (form.keywordSkills?.trim() ? form.keywordSkills.trim() : null),
  },
  {
    id: 'ic-location',
    fieldId: 'location',
    label: 'Location',
    format: (form) => {
      const locations = Array.isArray(form.location) ? form.location.filter(Boolean) : [];
      return locations.length > 0 ? locations.join(', ') : null;
    },
  },
  {
    id: 'ic-region',
    fieldId: 'selectRegion',
    label: 'Country / region',
    format: (form) => {
      const regions = Array.isArray(form.selectRegion) ? form.selectRegion.filter(Boolean) : [];
      return regions.length > 0 ? regions.join(', ') : null;
    },
  },
  {
    id: 'ic-experience',
    fieldId: 'yearsExpMin',
    label: 'Experience',
    format: (form) => {
      const min = String(form.yearsExpMin ?? '').trim();
      const max = String(form.yearsExpMax ?? '').trim();
      if (!min && !max) return null;
      if (min && max && min !== max) return `${min}–${max} years`;
      return `${min || max} years`;
    },
  },
  {
    id: 'ic-seniority',
    fieldId: 'seniorityLevel',
    label: 'Seniority',
    format: (form) => (form.seniorityLevel?.trim() ? form.seniorityLevel.trim() : null),
  },
  {
    id: 'ic-industry',
    fieldId: 'industry',
    label: 'Industry',
    format: (form) => (form.industry?.trim() ? form.industry.trim() : null),
  },
  {
    id: 'ic-function',
    fieldId: 'functionCategory',
    label: 'Function',
    format: (form) => (form.functionCategory?.trim() ? form.functionCategory.trim() : null),
  },
  {
    id: 'ic-open-to-work',
    fieldId: 'openToWork',
    label: 'Open to work',
    format: (form) => (form.openToWork ? 'Open to work' : null),
  },
  {
    id: 'ic-school',
    fieldId: 'school',
    label: 'School',
    format: (form) => {
      const schools = Array.isArray(form.school) ? form.school.filter(Boolean) : [];
      return schools.length > 0 ? schools.join(', ') : null;
    },
  },
  {
    id: 'ic-degree',
    fieldId: 'degree',
    label: 'Degree',
    format: (form) => {
      const degrees = Array.isArray(form.degree) ? form.degree.filter(Boolean) : [];
      return degrees.length > 0 ? degrees.join(', ') : null;
    },
  },
];

export function criteriaFromFilterForm(
  form: FutureJobsFilterForm,
  source: InterpretedCriterion['source'] = 'ai'
): InterpretedCriterion[] {
  const criteria: InterpretedCriterion[] = [];
  for (const meta of FIELD_META) {
    const value = meta.format?.(form) ?? null;
    if (!value) continue;
    criteria.push({
      id: meta.id,
      fieldId: String(meta.fieldId),
      label: meta.label,
      value,
      source,
    });
  }
  return criteria;
}

export function mergeFiltersFromInput(
  filters: Record<string, unknown> | null | undefined,
  prompt?: string
): FutureJobsFilterForm {
  const base = normalizeFilterFormForUi({
    ...DEFAULT_FILTER_FORM,
    ...(filters && typeof filters === 'object' ? filters : {}),
  }) as FutureJobsFilterForm;

  if (prompt) {
    return enrichFilterFormSkillsFromPrompt(base, prompt) as FutureJobsFilterForm;
  }
  return base;
}

export type InterpretResult = {
  query: string;
  interpretedCriteria: InterpretedCriterion[];
  normalizedFilters: FutureJobsFilterForm;
  annotation: unknown;
};

export class InterpretService {
  async interpret(query: string): Promise<InterpretResult> {
    const normalizedQuery = normalizePromptPlainText(query);
    if (!normalizedQuery) {
      return {
        query: '',
        interpretedCriteria: [],
        normalizedFilters: { ...DEFAULT_FILTER_FORM },
        annotation: null,
      };
    }

    const provider = getFutureJobsProvider();
    const annotationRes = await provider.getSourcingSessionAnnotation({
      userText: normalizedQuery,
    });
    const annotationData = annotationRes?.data ?? null;
    let filters = filterFormFromAnnotation(annotationData) as FutureJobsFilterForm;
    filters = enrichFilterFormSkillsFromPrompt(filters, normalizedQuery) as FutureJobsFilterForm;
    filters = (normalizeFilterFormForUi(filters) ?? filters) as FutureJobsFilterForm;

    let criteria = criteriaFromFilterForm(filters, 'ai');
    criteria = await enhanceInterpretedCriteria(normalizedQuery, criteria);

    return {
      query: normalizedQuery,
      interpretedCriteria: criteria,
      normalizedFilters: filters,
      annotation: annotationData,
    };
  }
}

export const interpretService = new InterpretService();
