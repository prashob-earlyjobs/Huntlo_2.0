import { describe, expect, it } from 'vitest';

import {
  buildWlSearchFilters,
  canonicalizeWlLocationFilters,
  parseCountriesFromText,
  parseRegionsFromText,
  parseYearsExperienceRangeFromText,
  yearsRangeFromFilterForm,
} from '../src/providers/future-jobs/futureJobs.filterMapping.js';
import {
  extractLocationFiltersFromGeminiText,
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

  it('derives country_region + region from location chips', () => {
    expect(
      buildWlSearchFilters({
        form: { location: ['Dubai, United Arab Emirates'] },
      })
    ).toEqual({
      country_region: { type: '=', value: ['United Arab Emirates'] },
      region: { type: '(.)', value: ['Dubai'] },
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

  it('uses countriesFromPrompt + regionsFromPrompt when drawer is empty', () => {
    expect(
      buildWlSearchFilters({
        form: { yearsExpMin: '4', yearsExpMax: '5' },
        countriesFromPrompt: ['India'],
        regionsFromPrompt: ['Pune'],
      })
    ).toEqual({
      years_of_experience_raw: { type: 'RANGE', value: [4, 5] },
      country_region: { type: '=', value: ['India'] },
      region: { type: '(.)', value: ['Pune'] },
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

  it('moves state labels out of country_region into region', () => {
    expect(
      buildWlSearchFilters({
        countriesFromPrompt: ['Kerala'],
      })
    ).toEqual({
      region: { type: '(.)', value: ['Kerala'] },
    });
    expect(
      canonicalizeWlLocationFilters({
        countries: ['Kerala', 'India'],
        regions: ['Bengaluru'],
      })
    ).toEqual({
      countries: ['India'],
      regions: ['Kerala', 'Bengaluru'],
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

  it('parses country names from NL heuristically (no state→country invent)', () => {
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
    expect(parseCountriesFromText('node js developer from kerala')).toEqual([]);
    expect(parseCountriesFromText('Digital Marketing Manager in Bengaluru, India')).toEqual([
      'India',
    ]);
  });

  it('parses states/emirates as regions, not countries', () => {
    expect(parseRegionsFromText('Product manager in California')).toEqual(['California']);
    expect(parseRegionsFromText('Backend engineers in Maharashtra')).toEqual(['Maharashtra']);
    expect(parseRegionsFromText('Sales lead based in Dubai')).toEqual(['Dubai']);
    expect(parseRegionsFromText('node js develoepr from kerala')).toEqual(['Kerala']);
    expect(parseCountriesFromText('Product manager in California')).toEqual([]);
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

  it('parses Gemini JSON countries + regions', () => {
    expect(extractCountriesFromGeminiText('{"countries":["Luxembourg"]}')).toEqual([
      'Luxembourg',
    ]);
    expect(extractCountriesFromGeminiText('{"countries":["Raipur"]}')).toEqual([
      'Raipur',
    ]);
    expect(extractCountriesFromGeminiText('{"countries":["Bangalore"]}')).toEqual([
      'Bangalore',
    ]);
    expect(extractCountriesFromGeminiText('{"countries":[]}')).toBeNull();
    expect(
      extractLocationFiltersFromGeminiText(
        '{"countries":["India"],"regions":["Bengaluru"]}'
      )
    ).toEqual({
      countries: ['India'],
      regions: ['Bengaluru'],
    });
    expect(
      extractLocationFiltersFromGeminiText('{"countries":[],"regions":["Kerala"]}')
    ).toEqual({
      countries: null,
      regions: ['Kerala'],
    });
  });
});
