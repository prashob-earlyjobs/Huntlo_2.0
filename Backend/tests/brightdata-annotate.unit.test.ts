import { describe, expect, it } from 'vitest';

import { MOCK_BRIGHTDATA_METADATA_FIELDS, catalogFromMetadataFields } from '../src/providers/brightdata/brightdata.catalog.js';
import { buildBrightDataSearchFilter } from '../src/providers/brightdata/brightdata.mapper.js';
import {
  heuristicBrightDataFilters,
  buildBrightDataAnnotatePrompt,
  extractDatasetFilterValues,
  relaxedExperienceYearRange,
} from '../src/providers/gemini/gemini.brightdata-annotate.js';

describe('Bright Data Gemini annotate', () => {
  const fields = catalogFromMetadataFields({
    ...MOCK_BRIGHTDATA_METADATA_FIELDS,
    educations_details: { type: 'text', active: true, description: 'Education summary' },
    education: {
      type: 'array',
      active: true,
      items: {
        type: 'object',
        fields: {
          title: { type: 'text', active: true, description: 'School or degree' },
          degree: { type: 'text', active: true, description: 'Education degree' },
        },
      },
    },
    certifications: {
      type: 'array',
      active: true,
      items: {
        type: 'object',
        fields: { title: { type: 'text', active: true, description: 'Certification' } },
      },
    },
    honors_and_awards: {
      type: 'array',
      active: true,
      items: {
        type: 'object',
        fields: { title: { type: 'text', active: true, description: 'Honor' } },
      },
    },
  });

  it('extracts position, city, country, and skills from a recruiter prompt', () => {
    const filters = heuristicBrightDataFilters(
      'node js developer from bangalore having 2 yrs of exp',
      fields
    );
    expect(filters.city).toEqual(['Bangalore', 'Hosur', 'Mysore']);
    expect(filters.country_code).toEqual(['IN']);
    expect(filters.position).toEqual(expect.arrayContaining([expect.stringMatching(/node\.js/i)]));
    expect(filters.about).toEqual(
      expect.arrayContaining(['Node.js', 'JavaScript', 'Express', 'TypeScript'])
    );
    expect(filters['experience.duration']).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/1 year/i),
        expect.stringMatching(/2 years/i),
        expect.stringMatching(/3 years/i),
      ])
    );
  });

  it('maps education only when a degree is mentioned', () => {
    const withDegree = heuristicBrightDataFilters('Java developer with BTech from Pune', fields);
    expect(withDegree.city).toEqual(expect.arrayContaining(['Pune']));
    expect(
      withDegree.educations_details ?? withDegree['education.title'] ?? withDegree['education.degree']
    ).toBeTruthy();

    const withoutDegree = heuristicBrightDataFilters('Java developer from Pune', fields);
    expect(withoutDegree.educations_details).toBeUndefined();
    expect(withoutDegree['education.title']).toBeUndefined();
  });

  it('expands a single current title into related titles (max 4)', () => {
    const filters = heuristicBrightDataFilters('Accountant from Chennai', fields);
    expect(filters.position?.[0]).toMatch(/accountant/i);
    expect(filters.position).toEqual(
      expect.arrayContaining([
        'Accountant',
        'Accounts Executive',
        'Finance Executive',
        'Bookkeeper',
      ])
    );
    expect((filters.position as string[]).length).toBeGreaterThanOrEqual(4);
    expect((filters.position as string[]).length).toBeLessThanOrEqual(8);
    expect(String(filters.position?.[0] ?? '')).not.toMatch(/chennai/i);
  });

  it('embeds catalog field names in the Gemini prompt', () => {
    const prompt = buildBrightDataAnnotatePrompt('React developers in London', fields);
    expect(prompt).toContain('GET /api/v1/candidates/search/catalog');
    expect(prompt).toContain('Do not write filter syntax');
    expect(prompt).toContain('"name":"position"');
    expect(prompt).toContain('"name":"city"');
    expect(prompt).toContain('Recruiter query:\nReact developers in London');
  });

  it('keeps Gemini values and lets Huntlo build Dataset API filter syntax', () => {
    const extracted = extractDatasetFilterValues(
      {
        extracted: {
          position: ['Senior Java Developer'],
          city: ['Coimbatore', 'Tiruppur'],
          country_code: ['IN'],
        },
      },
      fields
    );
    expect(extracted.position).toEqual(['Senior Java Developer']);
    expect(extracted).not.toHaveProperty('operator');

    const discarded = extractDatasetFilterValues(
      {
        operator: 'and',
        filters: [{ name: 'position', operator: 'includes', value: 'Java' }],
      },
      fields
    );
    expect(discarded).toEqual({});

    const filter = buildBrightDataSearchFilter(extracted);
    expect(filter).toMatchObject({ operator: 'and' });
    expect(JSON.stringify(filter)).toContain('"operator":"includes"');
  });

  it('expands a single skill like Java into at least four related skills', () => {
    const filters = heuristicBrightDataFilters(
      'looking for java developers from kasargod having 4-5 years of exp',
      fields
    );
    expect(filters.city).toEqual(['Kasaragod', 'Kannur', 'Kanhangad']);
    expect(filters.country_code).toEqual(['IN']);
    expect(Array.isArray(filters.about) ? filters.about.length : 0).toBeGreaterThanOrEqual(4);
    expect(filters.about).toEqual(
      expect.arrayContaining(['Java', 'Spring', 'Spring Boot', 'Hibernate'])
    );
  });

  it('relaxes a single years value by ±1', () => {
    expect(relaxedExperienceYearRange(2)).toEqual({ min: 1, max: 3 });
    expect(relaxedExperienceYearRange(0)).toEqual({ min: 0, max: 1 });
  });

  it('keeps job titles short and splits companies, school, and certs out of the prompt', () => {
    const filters = heuristicBrightDataFilters(
      'Senior Java Developers from Coimbathore, Kerala, India having 4-5 years of experience, currently at Infosys or previously at TCS, BTech in Computer Science from NIT Calicut, AWS Certified Solutions Architect, Dean\'s List, skills around Java Spring and backend',
      fields
    );
    expect(filters.position?.[0]).toBe('Senior Java Developer');
    expect(filters.position).toEqual(
      expect.arrayContaining([
        'Senior Java Developer',
        'Java Developer',
        'Backend Developer',
        'Software Engineer',
      ])
    );
    expect((filters.position as string[]).length).toBeGreaterThanOrEqual(4);
    expect((filters.position as string[]).length).toBeLessThanOrEqual(8);
    expect(String(filters.position?.[0] ?? '')).not.toMatch(/Infosys|Kerala|having/i);
    expect(filters['current_company.name']).toEqual(expect.arrayContaining([expect.stringMatching(/infosys/i)]));
    expect(filters['experience.company']).toEqual(expect.arrayContaining([expect.stringMatching(/tcs/i)]));
    expect(filters['education.title']).toEqual(expect.arrayContaining([expect.stringMatching(/nit calicut/i)]));
    expect(filters['certifications.title']).toEqual(
      expect.arrayContaining([expect.stringMatching(/aws certified/i)])
    );
    expect(filters.city).toEqual(expect.arrayContaining(['Coimbatore']));
  });
});
