import { describe, expect, it } from 'vitest';

import {
  buildSessionPayloadFromPromptAndFilter,
  mergeFilterFormIntoSession,
  normalizeFilterFormForUi,
} from '../src/providers/future-jobs/futureJobs.mapper.js';

describe('Future Jobs filter mapper — requested sourcing filters', () => {
  it('maps every requested filter into the expected provider query shape', () => {
    const form = normalizeFilterFormForUi({
      selectRegion: ['India'],
      openToWork: true,
      currentTitle: '.NET Developer, C# Developer, Software Engineer',
      yearsExpMin: '1',
      yearsExpMax: '5',
      skills: {
        mandatory: ['C#', '.NET Core'],
        core: [
          'ASP.NET MVC',
          'Web API',
          'SQL Server',
          'Entity Framework',
          'React',
          'Angular',
          'Docker',
        ],
        secondary: [],
      },
      functionCategory: 'Engineering',
      seniorityLevel: 'Senior',
      currentCompany: ['Tech Mahindra'],
      yearsAtCompany: ['1 to 2 years'],
      location: ['Pune, Maharashtra, India'],
      industry: 'Software Development, IT System Custom Software Development, Design Services',
      school: ['University of Mumbai'],
      fieldOfStudy: ['Computer Science', 'Information Technology', 'related field'],
      degree: ["Bachelor's or Above"],
      pastCompany: ['Infosys'],
      pastTitle: ['Software Developer'],
      companyType: 'Public Company',
      companyHeadquarters: 'Pune, Maharashtra, India',
      companyFocus: ['B2B SaaS'],
      fundingStage: ['Series A'],
      headcountGrowthMin: '10',
      headcountGrowthMax: '20',
      companyHeadcountMin: '10',
      companyHeadcountMax: '100',
      annualRevenue: '1_10',
      totalFundingRaised: ['$1M – $10M'],
      yearFoundedMin: '2000',
      yearFoundedMax: '2010',
      recentlyFunded: ['Last 6 months'],
      certifications: ['AWS Certified Cloud Practitioner'],
      honorsAwards: "Dean's list",
      geoDistance: '50_km',
      employmentType: 'Part-time, Permanent',
      companyHeadcountRange: '51-200',
    });

    expect(form).not.toBeNull();
    expect(form?.skills).toEqual({
      mandatory: ['C#', '.NET Core'],
      core: [
        'ASP.NET MVC',
        'Web API',
        'SQL Server',
        'Entity Framework',
        'React',
        'Angular',
        'Docker',
      ],
      secondary: [],
    });

    const session = mergeFilterFormIntoSession(
      {
        sessionTitle: 'Test session',
        jdDetail: { userText: 'Find .NET engineers in Pune' },
        queries: {},
        nuances: [],
      },
      form
    );

    const queries = session.queries as Record<string, { type: string; value: unknown }>;

    expect(queries.country_region).toEqual({
      type: '(.)',
      value: ['India'],
    });
    expect(queries.open_to_cards).toEqual({
      type: '=',
      value: ['CAREER_INTEREST'],
    });
    expect(queries['current_employers.title']).toEqual({
      type: 'IN',
      value: ['.NET Developer', 'C# Developer', 'Software Engineer'],
    });
    expect(queries.years_of_experience_raw).toEqual({
      type: 'RANGE',
      value: [1, 5],
    });
    expect(queries.skills).toEqual({
      type: 'IN',
      value: {
        mandatory: ['C#', '.NET Core'],
        core: [
          'ASP.NET MVC',
          'Web API',
          'SQL Server',
          'Entity Framework',
          'React',
          'Angular',
          'Docker',
        ],
        secondary: [],
      },
    });
    expect(queries['current_employers.function_category']).toEqual({
      type: 'IN',
      value: ['Engineering'],
    });
    expect(queries['current_employers.seniority_level']).toEqual({
      type: 'IN',
      value: ['Senior'],
    });
    expect(queries['current_employers.name']).toEqual({
      type: 'IN',
      value: ['Tech Mahindra'],
    });
    expect(queries['current_employers.years_at_company']).toEqual({
      type: 'IN',
      value: ['1 to 2 years'],
    });
    expect(queries.region).toEqual({
      type: 'IN',
      value: ['Pune, Maharashtra, India'],
    });
    expect(queries['all_employers.company_industries']).toEqual({
      type: 'IN',
      value: [
        'Software Development',
        'IT System Custom Software Development',
        'Design Services',
      ],
    });
    expect(queries['education_background.institute_name']).toEqual({
      type: 'IN',
      value: ['University of Mumbai'],
    });
    expect(queries['education_background.field_of_study']).toEqual({
      type: 'IN',
      value: ['Computer Science', 'Information Technology', 'related field'],
    });
    expect(queries['education_background.degree_name']).toEqual({
      type: 'IN',
      value: ['BACHELORS'],
    });
    expect(queries['past_employers.name']).toEqual({
      type: 'IN',
      value: ['Infosys'],
    });
    expect(queries['past_employers.title']).toEqual({
      type: 'IN',
      value: ['Software Developer'],
    });
    expect(queries['current_employers.company_type']).toEqual({
      type: 'IN',
      value: ['Public Company'],
    });
    expect(queries['current_employers.company_hq_location']).toEqual({
      type: 'IN',
      value: ['Pune, Maharashtra, India'],
    });
    expect(queries['current_employers.description']).toEqual({
      type: 'IN',
      value: ['B2B SaaS'],
    });
    expect(queries.funding_stage).toEqual({
      type: 'IN',
      value: ['series_a'],
    });
    expect(queries.headcount_growth).toEqual({
      type: 'RANGE',
      value: [10, 20],
    });
    expect(queries['current_employers.company_headcount_latest']).toEqual({
      type: 'RANGE',
      value: [10, 100],
    });
    expect(queries.annual_revenue).toEqual({
      type: '=',
      value: ['1_10'],
    });
    expect(queries.total_funding).toEqual({
      type: '=',
      value: ['1_10'],
    });
    expect(queries.year_founded).toEqual({
      type: 'RANGE',
      value: [2000, 2010],
    });
    expect(queries.recently_funded).toEqual({
      type: '=',
      value: ['6m'],
    });
    expect(queries['certifications.name']).toEqual({
      type: 'IN',
      value: ['AWS Certified Cloud Practitioner'],
    });
    expect(queries['honors.title']).toEqual({
      type: 'IN',
      value: ["Dean's list"],
    });
    expect(queries.geo_distance).toEqual({
      type: '=',
      value: ['50_km'],
    });
    expect(queries['current_employers.employment_type']).toEqual({
      type: 'IN',
      value: ['Part-time', 'Permanent'],
    });
    expect(queries['current_employers.company_headcount_range']).toEqual({
      type: 'IN',
      value: ['51-200'],
    });

    // Unsupported / removed filters must not appear.
    expect(queries.languages).toBeUndefined();
    expect(queries.search_other_regions).toBeUndefined();
    expect(queries['current_employers.industry']).toBeUndefined();
  });

  it('prefers structured skill buckets over keywordSkills', () => {
    const payload = buildSessionPayloadFromPromptAndFilter(
      'Find engineers',
      {
        currentTitle: 'Software Engineer',
        keywordSkills: 'Java, Python',
        skills: {
          mandatory: ['C#'],
          core: ['.NET Core'],
          secondary: ['React'],
        },
      }
    );

    expect(payload.queries.skills).toEqual({
      type: 'IN',
      value: {
        mandatory: ['C#'],
        core: ['.NET Core'],
        secondary: ['React'],
      },
    });
  });

  it('falls back to keywordSkills when structured skills are empty', () => {
    const payload = buildSessionPayloadFromPromptAndFilter(
      'Find engineers',
      {
        currentTitle: 'Software Engineer',
        keywordSkills: 'Node.js, AWS',
        skills: { mandatory: [], core: [], secondary: [] },
      }
    );

    expect(payload.queries.skills).toEqual({
      type: 'IN',
      value: {
        mandatory: [],
        core: ['Node.js', 'AWS'],
        secondary: [],
      },
    });
  });
});
