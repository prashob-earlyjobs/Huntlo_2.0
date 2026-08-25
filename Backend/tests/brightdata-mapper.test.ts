import { describe, expect, it } from 'vitest';

import {
  contactsFromBrightDataProfile,
  detailsFromBrightDataRawDoc,
  mapBrightDataProfileToFjDoc,
  profileNeedsBrightDataEnrichment,
  resolveBrightDataDisplayFields,
  skillsFromBrightDataProfile,
  yearsOfExperienceFromBrightDataProfile,
} from '../src/providers/bright-data/brightData.mapper.js';

describe('Bright Data profile mapper — experience and skills', () => {
  it('still uses a scalar years_experience when Bright Data sends one', () => {
    expect(
      yearsOfExperienceFromBrightDataProfile({ years_experience: 9 })
    ).toBe(9);
    const mapped = mapBrightDataProfileToFjDoc({
      name: 'Ada Lovelace',
      years_experience: '7',
      skills: ['Python'],
    });
    expect(mapped?.profile?.years_of_experience_raw).toBe(7);
    expect(mapped?.profile?.skills).toEqual(['Python']);
  });

  it('derives years from experience[] dates when years_experience is missing', () => {
    const years = yearsOfExperienceFromBrightDataProfile({
      experience: [
        {
          title: 'Implementation Consultant',
          company: 'Epic',
          start_date: 'Jan 2014',
          end_date: 'Present',
        },
        {
          title: 'Analyst',
          company: 'Accenture',
          start_date: 'Jun 2010',
          end_date: 'Dec 2013',
        },
      ],
    });
    expect(years).toBeGreaterThanOrEqual(15);
    expect(years).toBeLessThanOrEqual(17);
  });

  it('merges overlapping jobs into career span instead of summing them', () => {
    const years = yearsOfExperienceFromBrightDataProfile({
      experience: [
        { start_date: 'Jan 2010', end_date: 'Dec 2020' },
        { start_date: 'Jan 2018', end_date: 'Dec 2024' },
      ],
    });
    // 2010→2024 = 14, not 10+6 = 16
    expect(years).toBeGreaterThanOrEqual(13);
    expect(years).toBeLessThanOrEqual(15);
  });

  it('parses Bright Data year-range durations like "2015 - 2019"', () => {
    expect(
      yearsOfExperienceFromBrightDataProfile({
        experience: [
          { title: 'Analyst', duration: '2015 - 2019' },
          { title: 'Coordinator', duration: '2008 - 2009' },
        ],
      })
    ).toBe(5);
  });

  it('reads dates from nested experience.positions when the company row is empty', () => {
    const years = yearsOfExperienceFromBrightDataProfile({
      experience: [
        {
          title: 'Epic',
          start_date: null,
          end_date: null,
          duration: null,
          positions: [
            {
              title: 'Implementation Consultant',
              start_date: 'Jan 2018',
              end_date: 'Present',
            },
          ],
        },
      ],
    });
    expect(years).toBeGreaterThanOrEqual(7);
  });

  it('parses LinkedIn duration strings when dates are absent', () => {
    expect(
      yearsOfExperienceFromBrightDataProfile({
        experience: [
          { title: 'Engineer', duration: '3 years 6 months' },
          { title: 'Intern', subtitle: 'Full-time · 18 months' },
        ],
      })
    ).toBe(5);
  });

  it('reads object-shaped skills that labelList would otherwise drop as empty', () => {
    expect(
      skillsFromBrightDataProfile({
        skills: [
          { title: 'Python', subtitle: 'Endorsed by 12 people' },
          { name: 'SQL' },
          'Tableau',
        ],
      })
    ).toEqual(['Python', 'SQL', 'Tableau']);
  });

  it('falls back to certifications and about Skills: when skills[] is missing', () => {
    expect(
      skillsFromBrightDataProfile({
        certifications: [{ title: 'AWS Certified Solutions Architect' }],
        courses: [{ name: 'Data Structures' }],
      })
    ).toEqual(['AWS Certified Solutions Architect', 'Data Structures']);

    expect(
      skillsFromBrightDataProfile({
        about: 'HR generalist in Houston.\nSkills: Recruiting, Onboarding, HRIS',
      })
    ).toEqual(['Recruiting', 'Onboarding', 'HRIS']);
  });

  it('maps a realistic Bright Data snapshot (no years_experience, no skills[])', () => {
    const mapped = mapBrightDataProfileToFjDoc({
      id: 'devon-haverly',
      name: 'Devon Haverly',
      position: 'HR Generalist at Acme',
      city: 'Houston',
      url: 'https://www.linkedin.com/in/devon-haverly',
      current_company: { name: 'Acme', title: 'HR Generalist' },
      experience: [
        {
          title: 'HR Generalist',
          company: 'Acme',
          start_date: 'Mar 2018',
          end_date: 'Present',
        },
      ],
      certifications: [{ title: 'SHRM-CP' }, { title: 'PHR' }],
    });

    expect(mapped).not.toBeNull();
    expect(mapped?.profile?.years_of_experience_raw).toBeGreaterThanOrEqual(7);
    expect(mapped?.profile?.skills).toEqual(['SHRM-CP', 'PHR']);
    expect(mapped?.profile?.current_employers_object?.[0]?.job_title).toContain(
      'HR Generalist'
    );
  });

  it('leaves years empty when a Bright Data row has no usable history', () => {
    expect(
      resolveBrightDataDisplayFields({
        source: 'bright_data',
        experienceYears: 0,
        skills: [],
        rawDoc: { profile: { name: 'Slim Discovery Row' } },
      })
    ).toEqual({ experienceYears: null, skills: [] });
  });

  it('rehydrates stored Bright Data rows from experience[] when persist saved 0 years', () => {
    const display = resolveBrightDataDisplayFields({
      source: 'bright_data',
      experienceYears: 0,
      skills: [],
      rawDoc: {
        profile: {
          experience: [{ duration: '2015 - 2019' }],
          skills: [{ title: 'Recruiting' }, { name: 'HRIS' }],
        },
      },
    });
    expect(display.experienceYears).toBe(4);
    expect(display.skills).toEqual(['Recruiting', 'HRIS']);
  });

  it('builds drawer summary, experience, and skills from a Bright Data snapshot', () => {
    const details = detailsFromBrightDataRawDoc({
      profile: {
        about: 'Coordinates chromatography operations across North India.',
        skills: [{ title: 'Procurement' }, 'SAP'],
        experience: [
          {
            company: 'Chromatography World',
            title: 'Business Coordinator',
            start_date: 'Jan 2017',
            end_date: 'Present',
            description: 'Vendor and operations coordination.',
          },
        ],
        education: [
          {
            title: 'Delhi University',
            degree: 'MCOM',
            field: 'Commerce',
            start_year: '2012',
            end_year: '2014',
          },
        ],
      },
    });
    expect(details.summary).toContain('chromatography');
    expect(details.skills).toEqual(['Procurement', 'SAP']);
    expect(details.experience[0]).toMatchObject({
      company: 'Chromatography World',
      role: 'Business Coordinator',
      current: true,
    });
    expect(details.education[0]?.school).toBe('Delhi University');
  });

  it('prefers about_html over a truncated about snippet', () => {
    const details = detailsFromBrightDataRawDoc({
      profile: {
        about:
          'Specialized in building people-first organizations that thrive on purpose, performance...',
        about_html:
          '<p>Specialized in building people-first organizations that thrive on purpose, performance, and belonging. I have led HR for travel businesses across the US and UK for six years.</p>',
      },
    });
    expect(details.summary).toContain('belonging');
    expect(details.summary).not.toMatch(/\.\.\.\s*$/);
  });

  it('fills a truncated about with experience descriptions', () => {
    const details = detailsFromBrightDataRawDoc({
      profile: {
        about:
          'Specialized in building people-first organizations that thrive on purpose, performance...',
        experience: [
          {
            company: 'Travel Co',
            title: 'Head of Human Resources',
            description:
              'Built a people-first HR function covering hiring, performance, and belonging for US and UK travel sales teams.',
          },
        ],
      },
    });
    expect(details.summary).toContain('US and UK travel');
  });

  it('treats a truncated about as needing collect-by-URL enrichment', () => {
    expect(
      profileNeedsBrightDataEnrichment({
        about:
          'Specialized in building people-first organizations that thrive on purpose, performance...',
        skills: ['Human Resources'],
        years_experience: 6,
        experience: [{ start_date: '2018', end_date: 'Present', title: 'Head of HR' }],
      })
    ).toBe(true);
  });
});

describe('Bright Data contact extraction', () => {
  it('reads business email and phone from contact-enriched field names', () => {
    expect(
      contactsFromBrightDataProfile({
        url: 'https://www.linkedin.com/in/ada',
        professional_email: 'ada@analytical.engine',
        mobile_phone: '+44 7700 900123',
      })
    ).toEqual({
      emails: ['ada@analytical.engine'],
      phones: ['+44 7700 900123'],
    });
  });

  it('walks nested contacts[] without picking emails out of about text', () => {
    const found = contactsFromBrightDataProfile({
      about: 'Reach me at not-a-real-contact in the bio',
      contacts: [{ email: 'work@brightdata.example', phone: '+15550199' }],
    });
    expect(found.emails).toEqual(['work@brightdata.example']);
    expect(found.phones).toEqual(['+15550199']);
  });
});
