import { describe, expect, it } from 'vitest';

import { catalogFromMetadataFields } from '../src/providers/brightdata/brightdata.catalog.js';
import { BRIGHTDATA_PEOPLE_DATASET_ID } from '../src/providers/brightdata/brightdata.constants.js';
import {
  annotationFromPrompt,
  filterFromFutureJobsPayload,
  mapBrightDataRecordToFjDoc,
} from '../src/providers/brightdata/brightdata.mapper.js';
import {
  DEFAULT_CANDIDATE_SEARCH_VENDOR,
  normalizeCandidateSearchVendor,
} from '../src/shared/candidate-search-vendors.js';

describe('Bright Data candidate-search adapter', () => {
  it('defaults unknown vendors to Future Jobs', () => {
    expect(normalizeCandidateSearchVendor(undefined)).toBe(DEFAULT_CANDIDATE_SEARCH_VENDOR);
    expect(normalizeCandidateSearchVendor('nope')).toBe('future-jobs');
    expect(normalizeCandidateSearchVendor('brightdata')).toBe('brightdata');
  });

  it('maps Future Jobs session payload into a Bright Data filter', () => {
    const filter = filterFromFutureJobsPayload({
      jdDetail: { userText: 'React developers in Bangalore' },
      queries: {
        'current_employers.title': { value: ['React Developer'] },
        region: { value: ['Bangalore'] },
      },
    });
    expect(filter).toMatchObject({ operator: 'and' });
  });

  it('maps a Bright Data record onto the Future Jobs profile shape', () => {
    const doc = mapBrightDataRecordToFjDoc(
      {
        id: 'p1',
        name: 'Priya Nair',
        position: 'Staff Engineer',
        current_company: { name: 'Acme', title: 'Staff Engineer' },
        city: 'Bengaluru',
        country_code: 'IN',
        url: 'https://www.linkedin.com/in/priya',
        skills: ['TypeScript'],
      },
      'bd_session',
      0
    );
    expect(doc._id).toBe('p1');
    expect(doc.profile?.name).toBe('Priya Nair');
    expect(doc.profile?.linkedin_profile_url).toContain('linkedin.com');
    expect(doc.profile?.current_employers_object?.[0]?.name).toBe('Acme');
  });

  it('maps a Filter snapshot person onto a Huntlo profile card', () => {
    const doc = mapBrightDataRecordToFjDoc(
      {
        about: 'Self learned Node.js developer having passion in trending technologies.',
        avatar: 'https://static.licdn.com/aero-v1/sc/h/9c8pery4andzj6ohjkjp54ma2',
        city: 'Trivandrum, Kerala, India',
        country_code: 'IN',
        current_company: { name: 'Herts', title: null },
        current_company_name: 'Herts',
        first_name: 'AKHIL',
        id: 'akhil-r-s-3b2164245',
        input_url: 'https://www.linkedin.com/in/akhil-r-s-3b2164245',
        last_name: 'R S',
        linkedin_id: 'akhil-r-s-3b2164245',
        location: 'Trivandrum',
        name: 'AKHIL R S',
        position: 'Node.js Developer',
        url: 'https://www.linkedin.com/in/akhil-r-s-3b2164245',
      },
      'bd_session',
      0
    );
    expect(doc._id).toBe('akhil-r-s-3b2164245');
    expect(doc.profile?.name).toBe('AKHIL R S');
    expect(doc.profile?.linkedin_profile_url).toContain('akhil-r-s-3b2164245');
    expect(doc.profile?.current_employers_object?.[0]).toMatchObject({
      job_title: 'Node.js Developer',
      name: 'Herts',
    });
  });

  it('builds a local annotation from a prompt', () => {
    const annotation = annotationFromPrompt('Product designers in London');
    expect(annotation['current_employers.title']?.presence).toBe(true);
  });

  it('builds a loose Bright Data Search filter with AND across groups and OR within a group', () => {
    const filter = filterFromFutureJobsPayload({
      datasetFilters: {
        position: ['Senior Java Developer'],
        city: ['Coimbatore', 'Tiruppur', 'Erode'],
        country_code: ['IN'],
        about: ['Java', 'Spring', 'Spring Boot', 'Hibernate'],
        'current_company.name': ['Infosys'],
        'experience.company': ['TCS'],
        'education.title': ['NIT Calicut'],
        'education.degree': ['BTech'],
      },
    });
    expect(filter).toMatchObject({ operator: 'and' });
    const json = JSON.stringify(filter);
    expect(json).toContain('"operator":"in"');
    expect(json).toContain('["IN"]');
    expect(json).toContain('Tiruppur');
    expect(json).not.toContain('current_company.name');
    expect(json).not.toContain('experience.duration');
    expect(json).not.toContain('"operator":"or"');
    const assertGroupSize = (node: unknown, depth = 1) => {
      if (!node || typeof node !== 'object') return;
      const group = node as { filters?: unknown[] };
      if (Array.isArray(group.filters)) {
        expect(depth).toBeLessThanOrEqual(3);
        expect(group.filters.length).toBeLessThanOrEqual(4);
        group.filters.forEach((child) => assertGroupSize(child, depth + 1));
      }
    };
    assertGroupSize(filter);
  });

  it('prefers datasetFilters from Bright Data metadata field names', () => {
    const filter = filterFromFutureJobsPayload({
      datasetFilters: {
        position: ['Staff Engineer'],
        country_code: ['IN', 'GB'],
      },
    });
    expect(filter).toMatchObject({ operator: 'and' });
  });

  it('flattens metadata fields into a filter catalog', () => {
    const fields = catalogFromMetadataFields({
      name: { type: 'text', active: true, description: 'Profile name' },
      country_code: { type: 'text', active: true, quick_filter: true },
      groups: { type: 'array', active: false },
      current_company: {
        type: 'object',
        active: true,
        fields: { name: { type: 'text', active: true, description: 'Company' } },
      },
    });
    expect(fields.some((field) => field.name === 'name')).toBe(true);
    expect(fields.some((field) => field.name === 'current_company.name')).toBe(true);
    expect(fields.some((field) => field.name === 'groups')).toBe(false);
    expect(fields[0]?.name).toBe('country_code');
    expect(BRIGHTDATA_PEOPLE_DATASET_ID).toBe('gd_l1viktl72bvl7bjuj0');
  });

  it('flattens the experience array into searchable fields', () => {
    const fields = catalogFromMetadataFields({
      experience: {
        type: 'array',
        active: true,
        items: {
          type: 'object',
          fields: {
            title: { type: 'text', active: true, description: 'Experience title' },
            company: { type: 'text', active: true, description: 'Experience company' },
            duration: { type: 'text', active: true, description: 'Experience duration' },
            description_html: { type: 'text', active: true },
            positions: {
              type: 'array',
              active: true,
              items: {
                type: 'object',
                fields: {
                  title: { type: 'text', active: true, description: 'Positions title' },
                },
              },
            },
          },
        },
      },
    });
    expect(fields.some((field) => field.name === 'experience.title')).toBe(true);
    expect(fields.some((field) => field.name === 'experience.company')).toBe(true);
    expect(fields.some((field) => field.name === 'experience.duration')).toBe(true);
    expect(fields.some((field) => field.name === 'experience.positions.title')).toBe(true);
    expect(fields.some((field) => field.name === 'experience.description_html')).toBe(false);
  });
});
