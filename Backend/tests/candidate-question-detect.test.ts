import { describe, expect, it } from 'vitest';

import {
  looksLikeCandidateQuestion,
  looksLikeJdDetailRequest,
} from '../src/modules/outreach/candidate-question-detect.js';

describe('candidate JD-detail detection', () => {
  it('treats “share further details” as a JD request even without a question mark', () => {
    expect(looksLikeJdDetailRequest('Hi, Yes share further details')).toBe(true);
    expect(looksLikeCandidateQuestion('Hi, Yes share further details')).toBe(true);
    expect(looksLikeJdDetailRequest('please send more info about the role')).toBe(true);
    expect(looksLikeJdDetailRequest('tell me more')).toBe(true);
    expect(looksLikeJdDetailRequest('can you share the JD')).toBe(true);
    expect(looksLikeJdDetailRequest('details please')).toBe(true);
  });

  it('still treats an explicit question as a candidate question', () => {
    expect(looksLikeCandidateQuestion('What is the job description?')).toBe(true);
    expect(looksLikeCandidateQuestion('Could you share more about the role?')).toBe(true);
  });

  it('does not treat a bare yes or a screening answer as a JD request', () => {
    expect(looksLikeJdDetailRequest('yes')).toBe(false);
    expect(looksLikeJdDetailRequest('Yes')).toBe(false);
    expect(looksLikeJdDetailRequest('interested')).toBe(false);
    expect(looksLikeJdDetailRequest('I am in Bangalore')).toBe(false);
    expect(looksLikeJdDetailRequest('I just have 2 month internship experience.')).toBe(
      false
    );
    expect(looksLikeCandidateQuestion('yes')).toBe(false);
    expect(looksLikeCandidateQuestion('I am in Bangalore')).toBe(false);
  });

  it('honors ask_question intent even when the body has no ? or detail phrase', () => {
    expect(looksLikeCandidateQuestion('checking', 'ask_question')).toBe(true);
  });
});
