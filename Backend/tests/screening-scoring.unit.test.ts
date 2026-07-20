import { describe, expect, it } from 'vitest';

import { detectTriggeredKnockouts, mapEvaluationScores } from '../src/modules/screening/scoring.js';

describe('mapEvaluationScores', () => {
  it('uses minShortlistScore for recommendations', () => {
    const scored = mapEvaluationScores({
      result: { communication: 80, technical: 70 },
      criteria: [
        { id: 'communication', label: 'Communication', weight: 1 },
        { id: 'technical', label: 'Technical', weight: 1 },
      ],
      minScore: 80,
    });
    expect(scored.overallScore).toBe(75);
    expect(scored.recommendation).toBe('review');
  });

  it('shortlists when score meets threshold', () => {
    const scored = mapEvaluationScores({
      result: { communication: 90 },
      criteria: [{ id: 'communication', label: 'Communication', weight: 1 }],
      minScore: 75,
    });
    expect(scored.recommendation).toBe('shortlist');
  });

  it('rejects when a configured knockout is triggered', () => {
    const scored = mapEvaluationScores({
      result: {
        communication: 95,
        knockouts_triggered: ['Notice period over 90 days'],
      },
      criteria: [{ id: 'communication', label: 'Communication', weight: 1 }],
      minScore: 70,
      knockouts: ['Notice period over 90 days', 'Salary expectation above band'],
    });
    expect(scored.recommendation).toBe('reject');
    expect(scored.triggeredKnockouts).toEqual(['Notice period over 90 days']);
  });
});

describe('detectTriggeredKnockouts', () => {
  it('detects notice period heuristics', () => {
    const triggered = detectTriggeredKnockouts(
      { notice_period_days: 120 },
      ['Notice period over 90 days']
    );
    expect(triggered).toEqual(['Notice period over 90 days']);
  });
});
