import { describe, expect, it } from 'vitest';

import {
  buildWlSearchFilters,
  parseCountriesFromText,
  parseYearsExperienceRangeFromText,
  yearsRangeFromFilterForm,
} from '../src/providers/future-jobs/futureJobs.filterMapping.js';
import {
  extractCountriesFromGeminiText,
  extractYearsRangeFromGeminiText,
} from '../src/providers/gemini/gemini.search-prompt.js';

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

  it('attaches country_region from selectRegion chips', () => {
    expect(
      buildWlSearchFilters({
        form: {
          yearsExpMin: '4',
          yearsExpMax: '5',
          selectRegion: ['Luxembourg'],
        },
      })
    ).toEqual({
      years_of_experience_raw: { type: 'RANGE', value: [4, 5] },
      country_region: { type: '=', value: ['Luxembourg'] },
    });
  });

  it('derives country_region from location when Country is empty', () => {
    expect(
      buildWlSearchFilters({
        form: { location: ['Dubai, United Arab Emirates'] },
      })
    ).toEqual({
      country_region: { type: '=', value: ['United Arab Emirates'] },
    });
  });

  it('normalizes country abbreviations on country_region', () => {
    expect(
      buildWlSearchFilters({
        form: { selectRegion: ['UAE'] },
      })
    ).toEqual({
      country_region: { type: '=', value: ['United Arab Emirates'] },
    });
  });

  it('uses countriesFromPrompt when drawer country is empty', () => {
    expect(
      buildWlSearchFilters({
        form: { yearsExpMin: '4', yearsExpMax: '5' },
        countriesFromPrompt: ['Luxembourg'],
      })
    ).toEqual({
      years_of_experience_raw: { type: 'RANGE', value: [4, 5] },
      country_region: { type: '=', value: ['Luxembourg'] },
    });
  });

  it('prefers drawer country over countriesFromPrompt', () => {
    expect(
      buildWlSearchFilters({
        form: { selectRegion: ['Germany'] },
        countriesFromPrompt: ['Luxembourg'],
      })
    ).toEqual({
      country_region: { type: '=', value: ['Germany'] },
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

  it('parses country names from NL heuristically', () => {
    expect(
      parseCountriesFromText(
        'Senior Operations Manager in Luxembourg with 4-5 years of experience'
      )
    ).toEqual(['Luxembourg']);
    expect(parseCountriesFromText('Engineers based in UAE or UK')).toEqual([
      'United Kingdom',
      'United Arab Emirates',
    ]);
    expect(parseCountriesFromText('Ops manager in Luxemberg')).toEqual(['Luxembourg']);
  });

  it('infers country from state / province mentions in NL', () => {
    expect(parseCountriesFromText('Product manager in California')).toEqual([
      'United States',
    ]);
    expect(parseCountriesFromText('Backend engineers in Maharashtra')).toEqual(['India']);
    expect(parseCountriesFromText('Sales lead based in Dubai')).toEqual([
      'United Arab Emirates',
    ]);
    expect(parseCountriesFromText('Recruiter in Ontario')).toEqual(['Canada']);
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

  it('parses Gemini JSON countries', () => {
    expect(extractCountriesFromGeminiText('{"countries":["Luxembourg"]}')).toEqual([
      'Luxembourg',
    ]);
    expect(extractCountriesFromGeminiText('{"countries":[]}')).toBeNull();
  });
});
