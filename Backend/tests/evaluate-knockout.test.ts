import { describe, expect, it } from 'vitest';

import {
  evaluateKnockout,
  parseAnswerMonthYear,
  parseExperienceYearsInAnswer,
  type QualificationQuestion,
} from '../src/modules/outreach/qualification-qa.service.js';

const graduation: QualificationQuestion = {
  id: 'q-grad',
  prompt: 'Have you completed your graduation?',
  answerType: 'Yes / No',
  knockout: true,
  knockoutCondition: 'Reject if No',
};

const relocate: QualificationQuestion = {
  id: 'q-relocate',
  prompt: 'Are you open to relocating to Bangalore and working full time?',
  answerType: 'Yes / No',
  knockout: true,
  knockoutCondition: 'Reject if No',
};

const sep2026 = new Date('2026-09-02T06:30:00.000Z');

describe('parseAnswerMonthYear', () => {
  it('parses named months and ISO-style dates', () => {
    expect(parseAnswerMonthYear('June 2026')).toEqual({ year: 2026, month: 5 });
    expect(parseAnswerMonthYear("Jun'26")).toEqual({ year: 2026, month: 5 });
    expect(parseAnswerMonthYear('2026-06')).toEqual({ year: 2026, month: 5 });
    expect(parseAnswerMonthYear('06/2026')).toEqual({ year: 2026, month: 5 });
  });
});

describe('evaluateKnockout graduation dates', () => {
  it('passes when they completed in a month that is already past', () => {
    expect(
      evaluateKnockout(
        graduation,
        "Yes I've completed my graduation in June 2026",
        sep2026
      )
    ).toBe('pass');
  });

  it('fails when the graduation month is still in the future', () => {
    expect(
      evaluateKnockout(graduation, "Yes I'll complete in June 2027", sep2026)
    ).toBe('fail');
  });

  it('still handles bare yes / no and not-yet phrasing', () => {
    expect(evaluateKnockout(graduation, 'yes', sep2026)).toBe('pass');
    expect(evaluateKnockout(graduation, 'no', sep2026)).toBe('fail');
    expect(evaluateKnockout(graduation, 'not yet, still studying', sep2026)).toBe(
      'fail'
    );
  });

  it('does not treat a relocate yes as a date knockout', () => {
    expect(
      evaluateKnockout(
        relocate,
        "Yes I'm comfortable to relocate and work full time for this role",
        sep2026
      )
    ).toBe('pass');
  });
});

const yearsExp: QualificationQuestion = {
  id: 'q-exp',
  prompt: 'How many years of sales / BD experience do you have?',
  answerType: 'Number',
  knockout: true,
  knockoutCondition: 'Reject if more than 1',
};

const noticeDays: QualificationQuestion = {
  id: 'q-notice',
  prompt: 'What is your notice period in days?',
  answerType: 'Number / days',
  knockout: true,
  knockoutCondition: 'Reject if more than 60',
};

describe('parseExperienceYearsInAnswer', () => {
  it('converts months and combined durations to years', () => {
    expect(parseExperienceYearsInAnswer('2 months')).toBeCloseTo(2 / 12);
    expect(parseExperienceYearsInAnswer('I just have 2 month internship experience.')).toBeCloseTo(
      2 / 12
    );
    expect(parseExperienceYearsInAnswer('1 year 3 months')).toBeCloseTo(1.25);
    expect(parseExperienceYearsInAnswer('fresher')).toBe(0);
  });
});

describe('evaluateKnockout years of experience', () => {
  it('passes internship months under a 1-year maximum', () => {
    expect(
      evaluateKnockout(yearsExp, 'I just have 2 month internship experience.')
    ).toBe('pass');
    expect(evaluateKnockout(yearsExp, '6 months')).toBe('pass');
    expect(evaluateKnockout(yearsExp, '0.2')).toBe('pass');
  });

  it('fails when experience is more than 1 year', () => {
    expect(evaluateKnockout(yearsExp, '2 years')).toBe('fail');
    expect(evaluateKnockout(yearsExp, '2')).toBe('fail');
    expect(evaluateKnockout(yearsExp, '18 months')).toBe('fail');
  });

  it('does not convert notice-period days into years', () => {
    expect(evaluateKnockout(noticeDays, '30 days')).toBe('pass');
    expect(evaluateKnockout(noticeDays, '90 days')).toBe('fail');
  });
});
