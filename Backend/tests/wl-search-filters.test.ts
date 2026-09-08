import { describe, expect, it } from 'vitest';

import {
  buildWlSearchFilters,
  parseYearsExperienceRangeFromText,
  yearsRangeFromFilterForm,
} from '../src/providers/future-jobs/futureJobs.filterMapping.js';
import { extractYearsRangeFromGeminiText } from '../src/providers/gemini/gemini.search-prompt.js';

describe('wl/search years_of_experience_raw filters', () => {
  it('builds RANGE directly from drawer yearsExpMin/Max', () => {
    expect(
      yearsRangeFromFilterForm({ yearsExpMin: '1', yearsExpMax: '3' })
    ).toEqual({ type: 'RANGE', value: [1, 3] });
    expect(yearsRangeFromFilterForm({ yearsExpMin: '5', yearsExpMax: '' })).toEqual({
      type: 'RANGE',
      value: [5, 5],
    });
  });

  it('prefers drawer YoE over prompt-derived range', () => {
    expect(
      buildWlSearchFilters({
        form: { yearsExpMin: '4', yearsExpMax: '6' },
        yearsFromPrompt: { type: 'RANGE', value: [1, 3] },
      })
    ).toEqual({
      years_of_experience_raw: { type: 'RANGE', value: [4, 6] },
    });
  });

  it('falls back to prompt-derived range when drawer YoE is empty', () => {
    expect(
      buildWlSearchFilters({
        form: { yearsExpMin: '', yearsExpMax: '' },
        yearsFromPrompt: { type: 'RANGE', value: [1, 3] },
      })
    ).toEqual({
      years_of_experience_raw: { type: 'RANGE', value: [1, 3] },
    });
  });

  it('parses common NL year phrases heuristically', () => {
    expect(
      parseYearsExperienceRangeFromText(
        'Product manager with around 2 years of experience'
      )
    ).toEqual({ type: 'RANGE', value: [1, 3] });
    expect(
      parseYearsExperienceRangeFromText(
        'Find backend engineers with 4–7 years of experience'
      )
    ).toEqual({ type: 'RANGE', value: [4, 7] });
    expect(
      parseYearsExperienceRangeFromText('Java developer with 5 years experience')
    ).toEqual({ type: 'RANGE', value: [5, 5] });
  });

  it('parses Gemini JSON year ranges', () => {
    expect(extractYearsRangeFromGeminiText('{"min":1,"max":3}')).toEqual({
      type: 'RANGE',
      value: [1, 3],
    });
    expect(extractYearsRangeFromGeminiText('{"min":5,"max":null}')).toEqual({
      type: 'RANGE',
      value: [5, 5],
    });
    expect(extractYearsRangeFromGeminiText('{"min":null,"max":null}')).toBeNull();
  });
});
