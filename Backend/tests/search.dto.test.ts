import { describe, expect, it } from 'vitest';

import {
  hasFullFjCandidateDetails,
  toCandidateSummaryDto,
} from '../src/modules/candidates/search/search.dto.js';

function fakeStoredCandidate(rawDoc: unknown) {
  return {
    _id: { toHexString: () => '507f1f77bcf86cd799439011' },
    sourcingSessionId: { toHexString: () => '507f1f77bcf86cd799439012' },
    candidateId: 'ACoAAClExampleId',
    externalCandidateId: 'ACoAAClExampleId',
    name: 'Anita Sharma',
    firstName: 'Anita',
    lastName: 'Sharma',
    basicProfile: { headline: 'Java Developer at Infosys' },
    currentRole: 'Java Developer',
    currentCompany: 'Infosys',
    location: 'Bengaluru',
    experienceYears: 5,
    skills: ['Java'],
    educationPreview: [],
    finalScore: 4,
    matchScore: 4,
    candidateSummary: null,
    contactStatus: 'Not contacted',
    linkedinProfileUrl: 'https://www.linkedin.com/in/anita-sharma',
    profilePictureUrl: null,
    profileSignals: [],
    rank: 1,
    rawDoc,
    rawProviderReference: null,
    mappedCandidate: null,
    firstSeenAt: new Date('2026-01-01T00:00:00.000Z'),
    lastSeenAt: new Date('2026-01-01T00:00:00.000Z'),
    futureJobsSessionId: 'wl-search-1',
  } as never;
}

describe('search DTO maps /wl/search profile history', () => {
  const searchItem = {
    profile: {
      id: 'ACoAAClExampleId',
      fullName: 'Anita Sharma',
      headline: 'Java Developer at Infosys',
      summary: 'Builds Java services for banking clients.',
      current_employers: [
        {
          employee_title: 'Java Developer',
          employer_name: 'Infosys',
          employee_description: 'Core payments APIs.',
          start_date: '2022-01-01T00:00:00+00:00',
          end_date: null,
        },
      ],
      past_employers: [
        {
          employee_title: 'Software Engineer',
          employer_name: 'TCS',
          start_date: '2018-06-01T00:00:00+00:00',
          end_date: '2021-12-01T00:00:00+00:00',
        },
      ],
      education_background: [
        {
          degree_name: 'B.Tech',
          institute_name: 'NIT Trichy',
          field_of_study: 'Computer Science',
          start_date: '2014-01-01T00:00:00+00:00',
          end_date: '2018-01-01T00:00:00+00:00',
        },
      ],
    },
  };

  it('reads experience, education, and summary from stored profile', () => {
    const dto = toCandidateSummaryDto(fakeStoredCandidate(searchItem), 'wl-search-1');
    expect(dto.experience).toEqual([
      {
        company: 'Infosys',
        role: 'Java Developer',
        duration: 'Jan 2022–Present',
        description: 'Core payments APIs.',
        current: true,
      },
      {
        company: 'TCS',
        role: 'Software Engineer',
        duration: 'Jun 2018–Dec 2021',
        description: '',
        current: false,
      },
    ]);
    expect(dto.education).toEqual([
      {
        school: 'NIT Trichy',
        degree: 'B.Tech',
        field: 'Computer Science',
        years: '2014–2018',
      },
    ]);
    expect(dto.summary).toBe('Builds Java services for banking clients.');
    expect(dto.candidateSummary).toBe('Builds Java services for banking clients.');
  });

  it('passes through Future Jobs string fit labels', () => {
    const dto = toCandidateSummaryDto(
      fakeStoredCandidate({ fit: 'strong', ...searchItem }),
      'wl-search-1'
    );
    expect(dto.fit).toBe('strong');
    expect(dto.matchScore).toBe(4);
  });

  it('reads years from stored rawDoc when experienceYears is missing', () => {
    const stored = fakeStoredCandidate({
      profile: {
        ...searchItem.profile,
        years_of_experience: '8 years',
      },
    }) as { experienceYears: number | null };
    stored.experienceYears = 0;
    const dto = toCandidateSummaryDto(stored as never, 'wl-search-1');
    expect(dto.experienceYears).toBe(8);
  });

  it('treats a /wl/search profile with history as already complete', () => {
    expect(hasFullFjCandidateDetails(searchItem)).toBe(true);
  });

  it('maps nested employment_details, education.schools, and headline skills', () => {
    const liveProfile = {
      name: 'Akash Sahastrabuddhe',
      headline:
        'MERN Stack Developer | Node.js | React | TypeScript | DSA | System Design | Building Scalable Applications',
      region: 'Bengaluru, Karnataka, India',
      skills: [],
      profile_picture_permalink: 'https://prod.api.futurejobs.ai/api/v1/static/akash.jpg',
      linkedin_profile_url: 'https://www.linkedin.com/in/akash-sahastrabuddhe-a79606184',
      current_employers: [
        {
          name: '0101 Digit All',
          seniority_level: 'Entry Level',
          title: 'Junior MERN Developer',
          start_date: '2026-08-01T00:00:00',
          end_date: null,
        },
      ],
      past_employers: [
        {
          name: '0101 Digit All',
          title: 'MERN Trainee Developer',
          start_date: '2025-10-01T00:00:00',
          end_date: '2026-07-01T00:00:00',
        },
        {
          name: 'XDBS Worldwide',
          title: 'Research Analyst',
          start_date: '2023-09-01T00:00:00',
          end_date: '2024-09-01T00:00:00',
          employment_type: 'Full-time',
        },
      ],
      experience: {
        employment_details: {
          current: [
            {
              name: '0101 Digit All',
              title: 'Junior MERN Developer',
              seniority_level: 'Entry Level',
              start_date: '2026-08-01T00:00:00',
              end_date: null,
              location: { raw: 'Bengaluru' },
              company_headcount_range: '51-200',
              company_hq_location: 'Frisco, Texas, United States',
              company_industries: ['Information Technology & Services'],
              company_profile_picture_permalink: 'https://example.com/logo.jpg',
              company_website: 'http://www.0101digitall.com',
            },
          ],
          past: [
            {
              name: '0101 Digit All',
              title: 'MERN Trainee Developer',
              start_date: '2025-10-01T00:00:00',
              end_date: '2026-07-01T00:00:00',
            },
            {
              name: 'SOFTRONIX IT TRAINING',
              title: 'Frontend developer Intern',
              employment_type: 'Internship',
              start_date: '2024-09-01T00:00:00',
              end_date: '2025-02-01T00:00:00',
            },
            {
              name: 'XDBS Worldwide',
              title: 'Research Analyst',
              start_date: '2023-09-01T00:00:00',
              end_date: '2024-09-01T00:00:00',
            },
          ],
        },
      },
      education: {
        schools: [
          {
            degree: 'Bachelor of Technology',
            end_year: 2023,
            school: 'J D College of Engineering & Management',
            start_year: 2019,
            location: { city: 'Kalmeshwar-Bramhni', country: 'India', state: 'Maharashtra' },
          },
        ],
      },
      basic_profile: {
        current_title: 'Junior MERN Developer',
        headline:
          'MERN Stack Developer | Node.js | React | TypeScript | DSA | System Design | Building Scalable Applications',
        location: {
          city: 'Bengaluru',
          country: 'India',
          full_location: 'Bengaluru, Karnataka, India',
        },
      },
      social_handles: {
        professional_network_identifier: {
          profile_url: 'https://www.linkedin.com/in/akash-sahastrabuddhe-a79606184',
        },
      },
      fit: 'strong',
    };

    const stored = fakeStoredCandidate(liveProfile) as {
      skills: string[];
      educationPreview: unknown[];
      currentRole: string | null;
      currentCompany: string | null;
      location: string;
      basicProfile: { headline: string };
      linkedinProfileUrl: string | null;
    };
    stored.skills = [];
    stored.educationPreview = [];
    stored.currentRole = 'Junior MERN Developer';
    stored.currentCompany = '0101 Digit All';
    stored.location = '';
    stored.basicProfile = { headline: liveProfile.headline };
    stored.linkedinProfileUrl = null;

    const dto = toCandidateSummaryDto(stored as never, 'wl-search-1');
    expect(dto.headline).toContain('MERN Stack Developer');
    expect(dto.skills).toEqual([
      'MERN Stack Developer',
      'Node.js',
      'React',
      'TypeScript',
      'DSA',
      'System Design',
    ]);
    expect(dto.experience.map((job) => job.role)).toEqual([
      'Junior MERN Developer',
      'MERN Trainee Developer',
      'Frontend developer Intern',
      'Research Analyst',
    ]);
    expect(dto.experience[0]).toMatchObject({
      company: '0101 Digit All',
      role: 'Junior MERN Developer',
      duration: 'Aug 2026–Present',
      current: true,
      location: 'Bengaluru',
      seniority: 'Entry Level',
      companySize: '51-200',
      companyHq: 'Frisco, Texas, United States',
      companyWebsite: 'http://www.0101digitall.com',
    });
    expect(dto.education).toEqual([
      {
        school: 'J D College of Engineering & Management',
        degree: 'Bachelor of Technology',
        field: '—',
        years: '2019–2023',
        location: 'Kalmeshwar-Bramhni, Maharashtra, India',
      },
    ]);
    expect(dto.linkedinUrl).toBe(
      'https://www.linkedin.com/in/akash-sahastrabuddhe-a79606184'
    );
    expect(dto.location).toBe('Bengaluru, Karnataka, India');
    expect(dto.summary).toBe(liveProfile.headline);
    expect(hasFullFjCandidateDetails(liveProfile)).toBe(true);
  });
});
