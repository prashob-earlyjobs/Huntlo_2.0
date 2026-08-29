import { describe, expect, it } from 'vitest';

import { mapFjDocToCandidate } from '../src/providers/future-jobs/futureJobs.mapper.js';
import {
  extractSearchProfileDocs,
  extractSearchTotalDocs,
  normalizeFjProfileDoc,
} from '../src/providers/future-jobs/futureJobs.search-docs.js';

describe('Future Jobs /wl/search response mapping', () => {
  const livePayload = {
    statusCode: 200,
    data: [
      {
        fit: 'strong',
        profile: {
          id: 'ACoAAClExampleId',
          firstName: 'Anita',
          lastName: 'Sharma',
          fullName: 'Anita Sharma',
          headline: 'Java Developer at Infosys',
          location: 'Bengaluru, Karnataka, India',
          linkedin_profile_url: 'https://www.linkedin.com/in/anita-sharma',
          profile_picture_url: 'https://media.licdn.com/dms/image/anita.jpg',
          skills: ['Java', 'Spring Boot', 'Microservices'],
          yearsOfExperience: 5,
          current_employers: [
            { employee_title: 'Java Developer', employer_name: 'Infosys' },
          ],
        },
      },
      {
        profile: {
          id: 'ACoAAClSecondId',
          fullName: 'Rahul Verma',
          headline: 'Senior Java Engineer',
          location: { city: 'Mumbai', country: 'India' },
        },
      },
    ],
  };

  it('reads live data[] instead of data.docs', () => {
    const docs = extractSearchProfileDocs(livePayload);
    expect(docs).toHaveLength(2);
    expect(docs[0]?._id).toBe('ACoAAClExampleId');
    expect(docs[0]?.profile?.name).toBe('Anita Sharma');
    expect(docs[0]?.profile?.region).toBe('Bengaluru, Karnataka, India');
    expect(docs[0]?.profile?.linkedin_profile_url).toBe(
      'https://www.linkedin.com/in/anita-sharma'
    );
    expect(docs[0]?.profile?.current_employers_object?.[0]?.job_title).toBe(
      'Java Developer'
    );
    expect(docs[0]?.fit).toBe('strong');
    expect(docs[1]?.profile?.name).toBe('Rahul Verma');
    expect(docs[1]?.profile?.region).toBe('Mumbai, India');
    expect(extractSearchTotalDocs(livePayload, docs)).toBe(2);
  });

  it('still supports the older data.docs envelope', () => {
    const docs = extractSearchProfileDocs({
      statusCode: 200,
      data: {
        docs: [
          {
            _id: 'legacy-1',
            profile: {
              name: 'Aisha Rahman',
              region: 'Bangalore, Karnataka, India',
              linkedin_profile_url: 'https://www.linkedin.com/in/aisha',
              current_employers_object: [
                { job_title: 'Senior Software Engineer', name: 'Nimbus Labs' },
              ],
              years_of_experience_raw: 7,
              skills: ['TypeScript'],
            },
          },
        ],
        totalDocs: 9,
      },
    });
    expect(docs).toHaveLength(1);
    expect(docs[0]?._id).toBe('legacy-1');
    expect(docs[0]?.profile?.name).toBe('Aisha Rahman');
    expect(
      extractSearchTotalDocs(
        { data: { docs, totalDocs: 9 } },
        docs
      )
    ).toBe(9);
  });

  it('maps a live /wl/search profile onto a dashboard candidate row', () => {
    const mapped = mapFjDocToCandidate(livePayload.data[0]);
    expect(mapped).not.toBeNull();
    expect(mapped?.id).toBe('ACoAAClExampleId');
    expect(mapped?.name).toBe('Anita Sharma');
    expect(mapped?.role).toBe('Java Developer');
    expect(mapped?.location).toBe('Bengaluru, Karnataka, India');
    expect(mapped?.experience).toBe('5 years');
    expect(mapped?.skills).toContain('Java');
  });

  it('reads fit from the nested profile when the wrapper has none', () => {
    const normalized = normalizeFjProfileDoc({
      profile: { id: 'ACoAAClOnlyId', fullName: 'No Url', fit: 'good' },
    });
    expect(normalized?.fit).toBe('good');
  });

  it('reads string years of experience such as "8 years"', () => {
    const normalized = normalizeFjProfileDoc({
      profile: {
        id: 'ACoAAYearsStr',
        fullName: 'Years String',
        years_of_experience: '8 years',
      },
    });
    expect(normalized?.profile?.years_of_experience_raw).toBe(8);
  });

  it('estimates years from employer start dates when no YOE field exists', () => {
    const start = new Date();
    start.setFullYear(start.getFullYear() - 6);
    const normalized = normalizeFjProfileDoc({
      profile: {
        id: 'ACoAAYearsJobs',
        fullName: 'Job Dates',
        current_employers: [
          {
            employee_title: 'Engineer',
            employer_name: 'Acme',
            start_date: start.toISOString(),
          },
        ],
      },
    });
    expect(normalized?.profile?.years_of_experience_raw).toBe(6);
  });

  it('builds a LinkedIn URL from an ACoAA member id when none is provided', () => {
    const normalized = normalizeFjProfileDoc({
      profile: { id: 'ACoAAClOnlyId', fullName: 'No Url' },
    });
    expect(normalized?.profile?.linkedin_profile_url).toBe(
      'https://www.linkedin.com/in/ACoAAClOnlyId'
    );
  });
});
