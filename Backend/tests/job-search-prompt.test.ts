import { describe, expect, it } from 'vitest';

import {
  assembleJobJdText,
  fallbackSearchPromptFromJob,
  stripHtml,
} from '../src/modules/candidates/search/job-search-prompt.js';
import { extractSearchPromptFromGeminiText } from '../src/providers/gemini/gemini.search-prompt.js';

const mernJob = {
  title: 'MERN Stack Developer',
  department: 'Engineering',
  locations: ['Bengaluru'],
  employmentType: 'full_time',
  workplaceType: 'hybrid',
  seniority: 'mid',
  minimumExperience: 3,
  maximumExperience: 6,
  requiredSkills: ['React', 'Node.js', 'MongoDB'],
  preferredSkills: ['AWS'],
  preferredIndustries: ['SaaS'],
  educationRequirements: 'B.Tech or equivalent',
  descriptionHtml: '<p>Build APIs and dashboards for hiring teams.</p>',
  responsibilities: ['Own feature delivery'],
  requirements: ['Experience with REST APIs', 'Strong JavaScript'],
};

describe('job search prompt', () => {
  it('strips HTML from the JD body', () => {
    expect(stripHtml('<p>Build <strong>APIs</strong></p>')).toBe('Build APIs');
  });

  it('assembles every JD field into Gemini input', () => {
    const text = assembleJobJdText(mernJob);
    expect(text).toContain('Title: MERN Stack Developer');
    expect(text).toContain('Location: Bengaluru');
    expect(text).toContain('Required skills: React, Node.js, MongoDB');
    expect(text).toContain('Preferred skills: AWS');
    expect(text).toContain('Build APIs and dashboards for hiring teams.');
    expect(text).toContain('Experience with REST APIs');
  });

  it('builds a searchable fallback that includes skills and JD body', () => {
    const prompt = fallbackSearchPromptFromJob(mernJob);
    expect(prompt).toMatch(/MERN Stack Developer/i);
    expect(prompt).toContain('Bengaluru');
    expect(prompt).toContain('3–6 years');
    expect(prompt).toContain('React');
    expect(prompt).toContain('Node.js');
    expect(prompt).toContain('Build APIs and dashboards');
    expect(prompt).not.toContain('\n\n');
    expect(prompt.length).toBeLessThan(500);
  });

  it('extracts prompt from Gemini JSON', () => {
    expect(extractSearchPromptFromGeminiText('{"prompt":"Find React engineers in Pune."}')).toBe(
      'Find React engineers in Pune.'
    );
  });
});
