import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  Bookmark,
  CheckCircle2,
  PhoneCall,
  PhoneIncoming,
  Target,
  Users,
} from "lucide-react";

import type { CampaignStatus } from "@/lib/mock-outreach";

/* ------------------------------------------------------------------ */
/* Home metrics                                                         */
/* ------------------------------------------------------------------ */

export interface ScreeningMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  comparison: string;
  tooltip: string;
  icon: LucideIcon;
}

export const SCREENING_METRICS: ScreeningMetric[] = [
  {
    id: "active",
    label: "Active Screenings",
    value: "3",
    change: "+1",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Voice screening batches currently calling or scheduled.",
    icon: AudioLines,
  },
  {
    id: "invited",
    label: "Candidates Invited",
    value: "286",
    change: "+48",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Candidates enrolled across all screening batches.",
    icon: Users,
  },
  {
    id: "completed",
    label: "Calls Completed",
    value: "164",
    change: "+38",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Voice screening calls that finished with a score.",
    icon: PhoneIncoming,
  },
  {
    id: "rate",
    label: "Completion Rate",
    value: "57%",
    change: "+4%",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Completed calls divided by candidates invited.",
    icon: Target,
  },
  {
    id: "avg",
    label: "Average Score",
    value: "74",
    change: "+2",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Mean overall score across completed screenings.",
    icon: CheckCircle2,
  },
  {
    id: "shortlisted",
    label: "Shortlisted Candidates",
    value: "41",
    change: "+9",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Candidates shortlisted from screening results.",
    icon: Bookmark,
  },
];

/* ------------------------------------------------------------------ */
/* Screening batches                                                    */
/* ------------------------------------------------------------------ */

export type ScreeningBatchStatus = Extract<
  CampaignStatus,
  "Draft" | "Scheduled" | "Running" | "Paused" | "Completed"
>;

export interface ScreeningBatch {
  id: string;
  name: string;
  jobId: string | null;
  jobTitle: string | null;
  candidates: number;
  language: string;
  attempts: number;
  completed: number;
  averageScore: number | null;
  shortlisted: number;
  status: ScreeningBatchStatus;
  owner: string;
  lastActivity: string;
  objective: string;
}

export const SCREENING_BATCHES: ScreeningBatch[] = [
  {
    id: "scr-1",
    name: "Backend Engineer — Round 1",
    jobId: "j1",
    jobTitle: "Senior Backend Engineer",
    candidates: 20,
    language: "English",
    attempts: 3,
    completed: 18,
    averageScore: 78,
    shortlisted: 7,
    status: "Running",
    owner: "Ananya Sharma",
    lastActivity: "12m ago",
    objective: "Technical fit and notice-period check",
  },
  {
    id: "scr-2",
    name: "Data Engineer — Round 1",
    jobId: "j3",
    jobTitle: "Data Engineer",
    candidates: 24,
    language: "English",
    attempts: 3,
    completed: 24,
    averageScore: 71,
    shortlisted: 9,
    status: "Completed",
    owner: "Neha Gupta",
    lastActivity: "Jul 12",
    objective: "Pipeline experience and location fit",
  },
  {
    id: "scr-3",
    name: "Design — Portfolio check",
    jobId: "j2",
    jobTitle: "Product Designer",
    candidates: 15,
    language: "English",
    attempts: 2,
    completed: 0,
    averageScore: null,
    shortlisted: 0,
    status: "Scheduled",
    owner: "Rohan Desai",
    lastActivity: "Starts tomorrow",
    objective: "Portfolio walkthrough and availability",
  },
  {
    id: "scr-4",
    name: "Enterprise AE — Hindi voice",
    jobId: "j5",
    jobTitle: "Enterprise Sales Manager",
    candidates: 32,
    language: "Hindi",
    attempts: 3,
    completed: 11,
    averageScore: 68,
    shortlisted: 4,
    status: "Paused",
    owner: "Neha Gupta",
    lastActivity: "Yesterday",
    objective: "Sales pitch and compensation fit",
  },
  {
    id: "scr-5",
    name: "Frontend bench — draft",
    jobId: "j7",
    jobTitle: "Staff Frontend Engineer",
    candidates: 0,
    language: "English",
    attempts: 3,
    completed: 0,
    averageScore: null,
    shortlisted: 0,
    status: "Draft",
    owner: "Ananya Sharma",
    lastActivity: "Edited 3d ago",
    objective: "React depth and hybrid preference",
  },
];

export function getScreeningBatch(id: string): ScreeningBatch | undefined {
  return SCREENING_BATCHES.find((batch) => batch.id === id);
}

export const SCREENING_OWNERS = [
  "Ananya Sharma",
  "Neha Gupta",
  "Rohan Desai",
] as const;

export const SCREENING_OBJECTIVES = [
  "Technical fit and notice-period check",
  "Role fit and compensation alignment",
  "Portfolio / experience walkthrough",
  "Location and availability confirmation",
  "Custom objective",
] as const;

/* ------------------------------------------------------------------ */
/* Builder catalogues                                                   */
/* ------------------------------------------------------------------ */

/** Hunar language codes (same contract as voice outreach). */
export const SCREENING_LANGUAGE_OPTIONS = [
  { value: "ENGLISH", label: "English" },
  { value: "HINDI", label: "Hindi" },
  { value: "KANNADA", label: "Kannada" },
  { value: "TAMIL", label: "Tamil" },
  { value: "TELUGU", label: "Telugu" },
] as const;

export const SCREENING_LANGUAGES = SCREENING_LANGUAGE_OPTIONS.map(
  (option) => option.value
);

/** Verified Hunar voice persona (matches HUNAR_VOICE_PERSONA default). */
export const SCREENING_VOICE_OPTIONS = [
  { value: "NEHA", label: "Neha (female)" },
] as const;

export const SCREENING_VOICES = SCREENING_VOICE_OPTIONS.map(
  (option) => option.value
);

/** Tone keys used by resolveIntroduction / VOICE_INTRO_BY_TONE. */
export const SCREENING_TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "direct", label: "Direct" },
] as const;

export const SCREENING_TONES = SCREENING_TONE_OPTIONS.map(
  (option) => option.value
);

export const QUESTION_TYPES = [
  "Introduction",
  "Experience",
  "Skills",
  "Salary",
  "Notice period",
  "Location",
  "Availability",
  "Role-specific",
  "Custom",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export interface ScreeningQuestionTemplate {
  type: QuestionType;
  text: string;
  expectedVariable: string;
}

export const DEFAULT_QUESTIONS: ScreeningQuestionTemplate[] = [
  {
    type: "Introduction",
    text: "Hi {{first_name}}, thanks for taking this call. Could you briefly introduce yourself and your current role?",
    expectedVariable: "current_role",
  },
  {
    type: "Experience",
    text: "Walk me through a recent project where you owned a distributed system end to end.",
    expectedVariable: "flagship_project",
  },
  {
    type: "Skills",
    text: "Which technologies and tools do you use most day to day?",
    expectedVariable: "primary_skills",
  },
  {
    type: "Salary",
    text: "What is your current and expected compensation (CTC)?",
    expectedVariable: "salary_expectation",
  },
  {
    type: "Notice period",
    text: "What is your notice period, and can it be negotiated?",
    expectedVariable: "notice_period",
  },
  {
    type: "Location",
    text: "Are you open to working from {{location}} in a hybrid setup?",
    expectedVariable: "preferred_location",
  },
  {
    type: "Availability",
    text: "When would you be available to start if things move quickly?",
    expectedVariable: "availability",
  },
];

export const EVALUATION_CATEGORIES = [
  { id: "communication", label: "Communication score", defaultWeight: 15 },
  { id: "roleFit", label: "Role-fit score", defaultWeight: 20 },
  { id: "technical", label: "Technical score", defaultWeight: 25 },
  { id: "experience", label: "Experience score", defaultWeight: 15 },
  { id: "salaryFit", label: "Salary-fit score", defaultWeight: 10 },
  { id: "noticePeriod", label: "Notice-period score", defaultWeight: 10 },
  { id: "overall", label: "Overall score", defaultWeight: 5 },
] as const;

export const KNOCKOUT_CRITERIA = [
  "Notice period over 90 days",
  "Not open to hybrid / office location",
  "Salary expectation above band",
  "No relevant experience",
  "Declined recording consent",
] as const;

export const ATTEMPT_OPTIONS = ["1", "2", "3", "4"] as const;
export const DELAY_OPTIONS = [
  "2 hours",
  "4 hours",
  "12 hours",
  "24 hours",
  "48 hours",
] as const;
export const CALL_WINDOWS = [
  "9 AM – 6 PM",
  "10 AM – 7 PM",
  "Weekdays only · 9 AM – 6 PM",
  "Any time",
] as const;
export const TIMEZONE_OPTIONS_SCREENING = [
  "Candidate's local timezone",
  "IST (Asia/Kolkata)",
  "Fixed — IST window only",
] as const;
export const VOICEMAIL_BEHAVIOURS = [
  "Leave a short callback message",
  "Hang up silently",
  "Count as a failed attempt",
] as const;

/* ------------------------------------------------------------------ */
/* Batch detail — enrolled candidates                                   */
/* ------------------------------------------------------------------ */

export type CallStatus =
  | "Queued"
  | "Ringing"
  | "Completed"
  | "No answer"
  | "Voicemail"
  | "Failed"
  | "Opted out";

export interface BatchCandidate {
  id: string;
  candidateId: string | null;
  name: string;
  callStatus: CallStatus;
  attemptsUsed: number;
  attemptsMax: number;
  duration: string | null;
  score: number | null;
  resultId: string | null;
  lastActivity: string;
}

export const BATCH_CANDIDATES: BatchCandidate[] = [
  {
    id: "bc-1",
    candidateId: "cand-1",
    name: "Priya Nair",
    callStatus: "Completed",
    attemptsUsed: 1,
    attemptsMax: 3,
    duration: "7m 40s",
    score: 92,
    resultId: "res-1",
    lastActivity: "2d ago",
  },
  {
    id: "bc-2",
    candidateId: "cand-8",
    name: "Rahul Venkatesh",
    callStatus: "Completed",
    attemptsUsed: 1,
    attemptsMax: 3,
    duration: "6m 12s",
    score: 84,
    resultId: "res-2",
    lastActivity: "Today, 9:55 AM",
  },
  {
    id: "bc-3",
    candidateId: "cand-3",
    name: "Sneha Kulkarni",
    callStatus: "No answer",
    attemptsUsed: 1,
    attemptsMax: 3,
    duration: null,
    score: null,
    resultId: null,
    lastActivity: "3h ago",
  },
  {
    id: "bc-4",
    candidateId: "cand-2",
    name: "Karthik Iyer",
    callStatus: "Queued",
    attemptsUsed: 0,
    attemptsMax: 3,
    duration: null,
    score: null,
    resultId: null,
    lastActivity: "Queued",
  },
  {
    id: "bc-5",
    candidateId: "cand-7",
    name: "Ishaan Mehta",
    callStatus: "Completed",
    attemptsUsed: 2,
    attemptsMax: 3,
    duration: "5m 03s",
    score: 71,
    resultId: "res-3",
    lastActivity: "2d ago",
  },
  {
    id: "bc-6",
    candidateId: "cand-6",
    name: "Vikram Bhat",
    callStatus: "Failed",
    attemptsUsed: 1,
    attemptsMax: 3,
    duration: null,
    score: null,
    resultId: null,
    lastActivity: "1d ago",
  },
  {
    id: "bc-7",
    candidateId: "cand-4",
    name: "Divya Rao",
    callStatus: "Opted out",
    attemptsUsed: 0,
    attemptsMax: 3,
    duration: null,
    score: null,
    resultId: null,
    lastActivity: "Yesterday",
  },
  {
    id: "bc-8",
    candidateId: null,
    name: "Arvind Menon",
    callStatus: "Voicemail",
    attemptsUsed: 2,
    attemptsMax: 3,
    duration: "0m 18s",
    score: null,
    resultId: null,
    lastActivity: "5h ago",
  },
];

export const BATCH_SETTINGS = [
  { id: "language", label: "Language", value: "English" },
  { id: "voice", label: "Voice", value: "Aanya (female) · Professional tone" },
  { id: "attempts", label: "Attempts", value: "3 · 24h apart · 9 AM – 6 PM window" },
  { id: "timezone", label: "Timezone", value: "Candidate's local timezone" },
  { id: "voicemail", label: "Voicemail", value: "Leave a short callback message" },
  { id: "minScore", label: "Minimum shortlist score", value: "75 / 100" },
  {
    id: "knockouts",
    label: "Knockout criteria",
    value: "Notice > 90 days · Not open to Bengaluru hybrid",
  },
];

/* ------------------------------------------------------------------ */
/* Results                                                              */
/* ------------------------------------------------------------------ */

export type AiRecommendation =
  | "Shortlist"
  | "Reject"
  | "Needs review";

export type RecruiterDecision =
  | "Pending"
  | "Shortlisted"
  | "Rejected"
  | "Interview scheduled";

export interface ScreeningResult {
  id: string;
  candidateId: string | null;
  candidateName: string;
  jobId: string | null;
  jobTitle: string;
  screeningId: string;
  screeningName: string;
  callStatus: CallStatus;
  attemptsUsed: number;
  attemptsMax: number;
  duration: string;
  overallScore: number;
  recommendation: AiRecommendation;
  keyVariables: string[];
  completedDate: string;
  decision: RecruiterDecision;
}

export const SCREENING_RESULTS: ScreeningResult[] = [
  {
    id: "res-1",
    candidateId: "cand-1",
    candidateName: "Priya Nair",
    jobId: "j1",
    jobTitle: "Senior Backend Engineer",
    screeningId: "scr-1",
    screeningName: "Backend Engineer — Round 1",
    callStatus: "Completed",
    attemptsUsed: 1,
    attemptsMax: 3,
    duration: "7m 40s",
    overallScore: 92,
    recommendation: "Shortlist",
    keyVariables: ["45d notice", "₹42–48 LPA", "Bengaluru hybrid"],
    completedDate: "Jul 14, 2026",
    decision: "Shortlisted",
  },
  {
    id: "res-2",
    candidateId: "cand-8",
    candidateName: "Rahul Venkatesh",
    jobId: "j1",
    jobTitle: "Senior Backend Engineer",
    screeningId: "scr-1",
    screeningName: "Backend Engineer — Round 1",
    callStatus: "Completed",
    attemptsUsed: 1,
    attemptsMax: 3,
    duration: "6m 12s",
    overallScore: 84,
    recommendation: "Shortlist",
    keyVariables: ["45d notice", "₹38 LPA", "Open to relocate"],
    completedDate: "Jul 16, 2026",
    decision: "Pending",
  },
  {
    id: "res-3",
    candidateId: "cand-7",
    candidateName: "Ishaan Mehta",
    jobId: "j1",
    jobTitle: "Senior Backend Engineer",
    screeningId: "scr-1",
    screeningName: "Backend Engineer — Round 1",
    callStatus: "Completed",
    attemptsUsed: 2,
    attemptsMax: 3,
    duration: "5m 03s",
    overallScore: 71,
    recommendation: "Needs review",
    keyVariables: ["60d notice", "₹52 LPA", "Remote only"],
    completedDate: "Jul 14, 2026",
    decision: "Pending",
  },
  {
    id: "res-4",
    candidateId: "cand-5",
    candidateName: "Ananya Krishnan",
    jobId: "j3",
    jobTitle: "Data Engineer",
    screeningId: "scr-2",
    screeningName: "Data Engineer — Round 1",
    callStatus: "Completed",
    attemptsUsed: 1,
    attemptsMax: 3,
    duration: "8m 05s",
    overallScore: 88,
    recommendation: "Shortlist",
    keyVariables: ["30d notice", "₹34 LPA", "Hyderabad"],
    completedDate: "Jul 11, 2026",
    decision: "Interview scheduled",
  },
  {
    id: "res-5",
    candidateId: "cand-9",
    candidateName: "Nikhil Bose",
    jobId: "j1",
    jobTitle: "Senior Backend Engineer",
    screeningId: "scr-1",
    screeningName: "Backend Engineer — Round 1",
    callStatus: "Completed",
    attemptsUsed: 1,
    attemptsMax: 3,
    duration: "4m 22s",
    overallScore: 52,
    recommendation: "Reject",
    keyVariables: ["90d+ notice", "₹60 LPA", "Not open to office"],
    completedDate: "Jul 13, 2026",
    decision: "Rejected",
  },
  {
    id: "res-6",
    candidateId: "cand-10",
    candidateName: "Meera Iyer",
    jobId: "j3",
    jobTitle: "Data Engineer",
    screeningId: "scr-2",
    screeningName: "Data Engineer — Round 1",
    callStatus: "Completed",
    attemptsUsed: 3,
    attemptsMax: 3,
    duration: "6m 48s",
    overallScore: 76,
    recommendation: "Needs review",
    keyVariables: ["45d notice", "₹36 LPA", "Hyderabad hybrid"],
    completedDate: "Jul 12, 2026",
    decision: "Pending",
  },
];

export function getScreeningResult(id: string): ScreeningResult | undefined {
  return SCREENING_RESULTS.find((result) => result.id === id);
}

/* ------------------------------------------------------------------ */
/* Result detail                                                        */
/* ------------------------------------------------------------------ */

export interface ScoreCategory {
  id: string;
  label: string;
  score: number;
  evidence: string;
}

export interface KnockoutResult {
  criterion: string;
  passed: boolean;
  detail: string;
}

export interface TranscriptTurn {
  id: string;
  speaker: "AI" | "Candidate";
  text: string;
  time: string;
}

export interface ExtractedField {
  id: string;
  label: string;
  value: string;
  confidence: "High" | "Medium" | "Low";
}

export interface ResultActivityEntry {
  id: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  time: string;
}

export interface ScreeningResultDetail {
  resultId: string;
  summary: string;
  strengths: string[];
  concerns: string[];
  keyAnswers: { question: string; answer: string }[];
  salaryExpectation: string;
  noticePeriod: string;
  preferredLocation: string;
  candidateInterest: string;
  categories: ScoreCategory[];
  knockouts: KnockoutResult[];
  transcript: TranscriptTurn[];
  recording: {
    durationSeconds: number;
    label: string;
    size: string;
  };
  extracted: ExtractedField[];
  activity: ResultActivityEntry[];
}

export const RESULT_DETAILS: Record<string, ScreeningResultDetail> = {
  "res-1": {
    resultId: "res-1",
    summary:
      "Priya demonstrates strong systems ownership and clear communication. She articulates distributed-systems trade-offs confidently, aligns with the Bengaluru hybrid model, and her compensation expectation sits within band. Notice period of 45 days is acceptable. Recommended for shortlist and panel interview.",
    strengths: [
      "Deep ownership of Kafka-based event pipelines at scale",
      "Clear, structured communication throughout the call",
      "Compensation and location fit without negotiation friction",
      "Genuine interest in the role and team",
    ],
    concerns: [
      "Notice period is 45 days — may need early buyout discussion",
      "Limited mention of Go; primarily Java/Kotlin experience",
    ],
    keyAnswers: [
      {
        question: "Flagship project",
        answer:
          "Led a multi-region order pipeline on Kafka handling 40k events/sec with idempotent consumers.",
      },
      {
        question: "Primary skills",
        answer: "Java, Kotlin, Kafka, PostgreSQL, Kubernetes, AWS.",
      },
      {
        question: "Availability",
        answer: "Can start after serving notice; open to joining earlier if buyout is supported.",
      },
    ],
    salaryExpectation: "₹42–48 LPA",
    noticePeriod: "45 days (negotiable with buyout)",
    preferredLocation: "Bengaluru · hybrid 3 days",
    candidateInterest: "High — asked about team size and on-call rotation",
    categories: [
      {
        id: "communication",
        label: "Communication",
        score: 94,
        evidence: "Structured answers, minimal filler, asked clarifying questions.",
      },
      {
        id: "roleFit",
        label: "Role fit",
        score: 91,
        evidence: "Backend ownership matches Senior Backend Engineer scope.",
      },
      {
        id: "technical",
        label: "Technical",
        score: 90,
        evidence: "Solid Kafka, consistency and failure-mode reasoning.",
      },
      {
        id: "experience",
        label: "Experience",
        score: 88,
        evidence: "6+ years with progressive ownership of production systems.",
      },
      {
        id: "salaryFit",
        label: "Salary fit",
        score: 95,
        evidence: "Expectation ₹42–48 LPA is within the open band.",
      },
      {
        id: "noticePeriod",
        label: "Notice period",
        score: 85,
        evidence: "45 days is within policy; buyout possible.",
      },
    ],
    knockouts: [
      {
        criterion: "Notice period over 90 days",
        passed: true,
        detail: "45 days — within limit",
      },
      {
        criterion: "Not open to hybrid / office location",
        passed: true,
        detail: "Open to Bengaluru hybrid 3 days",
      },
      {
        criterion: "Salary expectation above band",
        passed: true,
        detail: "₹42–48 LPA within ₹35–50 LPA band",
      },
      {
        criterion: "Declined recording consent",
        passed: true,
        detail: "Consent given at call start",
      },
    ],
    transcript: [
      {
        id: "t1",
        speaker: "AI",
        text: "Hi Priya, this is Aanya from Huntlo calling about the Senior Backend Engineer role. This call is recorded for evaluation — is that okay?",
        time: "0:00",
      },
      {
        id: "t2",
        speaker: "Candidate",
        text: "Yes, that's fine. Happy to chat.",
        time: "0:12",
      },
      {
        id: "t3",
        speaker: "AI",
        text: "Great. Could you briefly introduce yourself and your current role?",
        time: "0:18",
      },
      {
        id: "t4",
        speaker: "Candidate",
        text: "I'm a senior backend engineer at Razorpay. I own our order-event pipeline — Kafka, consumers, and the reconciliation service.",
        time: "0:24",
      },
      {
        id: "t5",
        speaker: "AI",
        text: "Walk me through a recent project where you owned a distributed system end to end.",
        time: "1:10",
      },
      {
        id: "t6",
        speaker: "Candidate",
        text: "We rebuilt the multi-region order pipeline. Peak is about 40k events per second. I designed the partitioning, idempotent consumers, and dead-letter handling.",
        time: "1:18",
      },
      {
        id: "t7",
        speaker: "AI",
        text: "What is your current and expected compensation?",
        time: "4:02",
      },
      {
        id: "t8",
        speaker: "Candidate",
        text: "I'm at about 40 LPA now. Looking at 42 to 48 depending on the rest of the package.",
        time: "4:10",
      },
      {
        id: "t9",
        speaker: "AI",
        text: "What is your notice period?",
        time: "4:40",
      },
      {
        id: "t10",
        speaker: "Candidate",
        text: "45 days. We can discuss a buyout if needed.",
        time: "4:46",
      },
      {
        id: "t11",
        speaker: "AI",
        text: "Are you open to working from Bengaluru in a hybrid setup?",
        time: "5:10",
      },
      {
        id: "t12",
        speaker: "Candidate",
        text: "Yes — three days in office works for me.",
        time: "5:16",
      },
      {
        id: "t13",
        speaker: "AI",
        text: "Thanks Priya. We'll share next steps with the recruiting team shortly. Have a great day.",
        time: "7:20",
      },
      {
        id: "t14",
        speaker: "Candidate",
        text: "Thanks, looking forward to it.",
        time: "7:32",
      },
    ],
    recording: {
      durationSeconds: 460,
      label: "priya-nair-scr-1.mp3",
      size: "2.4 MB",
    },
    extracted: [
      { id: "e1", label: "Current company", value: "Razorpay", confidence: "High" },
      { id: "e2", label: "Current role", value: "Senior Backend Engineer", confidence: "High" },
      { id: "e3", label: "Primary skills", value: "Java, Kotlin, Kafka, PostgreSQL, K8s", confidence: "High" },
      { id: "e4", label: "Salary expectation", value: "₹42–48 LPA", confidence: "High" },
      { id: "e5", label: "Notice period", value: "45 days", confidence: "High" },
      { id: "e6", label: "Preferred location", value: "Bengaluru hybrid", confidence: "High" },
      { id: "e7", label: "Buyout open", value: "Yes", confidence: "Medium" },
      { id: "e8", label: "Candidate interest", value: "High", confidence: "Medium" },
    ],
    activity: [
      {
        id: "a1",
        icon: PhoneCall,
        title: "Call completed",
        detail: "7m 40s · score 92 · AI recommendation: Shortlist",
        time: "Jul 14, 11:42 AM",
      },
      {
        id: "a2",
        icon: CheckCircle2,
        title: "AI scorecard generated",
        detail: "All category scores and knockout checks passed",
        time: "Jul 14, 11:43 AM",
      },
      {
        id: "a3",
        icon: Bookmark,
        title: "Recruiter shortlisted Priya Nair",
        detail: "Decision by Ananya Sharma",
        time: "Jul 14, 2:10 PM",
      },
    ],
  },
};

/** Fallback detail for results without a fully authored transcript. */
export function getResultDetail(id: string): ScreeningResultDetail | undefined {
  if (RESULT_DETAILS[id]) return RESULT_DETAILS[id];

  const result = getScreeningResult(id);
  if (!result) return undefined;

  return {
    resultId: id,
    summary: `${result.candidateName} completed the voice screening with an overall score of ${result.overallScore}. AI recommendation: ${result.recommendation}. Review the scorecard and extracted variables before deciding.`,
    strengths: [
      "Completed the full screening script",
      "Answered compensation and notice questions clearly",
    ],
    concerns:
      result.recommendation === "Reject"
        ? ["Score below shortlist threshold", "One or more knockout criteria may apply"]
        : result.recommendation === "Needs review"
          ? ["Score near the shortlist boundary — recruiter review recommended"]
          : ["None flagged by the AI"],
    keyAnswers: [
      {
        question: "Key variables",
        answer: result.keyVariables.join(" · "),
      },
    ],
    salaryExpectation: result.keyVariables.find((v) => v.includes("LPA")) ?? "—",
    noticePeriod: result.keyVariables.find((v) => v.includes("notice") || v.includes("d ")) ?? "—",
    preferredLocation:
      result.keyVariables.find(
        (v) =>
          v.includes("Bengaluru") ||
          v.includes("Hyderabad") ||
          v.includes("Remote") ||
          v.includes("relocate")
      ) ?? "—",
    candidateInterest:
      result.recommendation === "Shortlist"
        ? "High"
        : result.recommendation === "Reject"
          ? "Low"
          : "Moderate",
    categories: [
      {
        id: "communication",
        label: "Communication",
        score: Math.min(100, result.overallScore + 4),
        evidence: "Derived from call fluency and turn-taking.",
      },
      {
        id: "roleFit",
        label: "Role fit",
        score: result.overallScore,
        evidence: "Alignment with the related job requirement.",
      },
      {
        id: "technical",
        label: "Technical",
        score: Math.max(40, result.overallScore - 3),
        evidence: "Depth shown on role-specific questions.",
      },
      {
        id: "experience",
        label: "Experience",
        score: Math.max(40, result.overallScore - 5),
        evidence: "Years and ownership signals from the call.",
      },
      {
        id: "salaryFit",
        label: "Salary fit",
        score: result.recommendation === "Reject" ? 40 : 80,
        evidence: "Compared against the open compensation band.",
      },
      {
        id: "noticePeriod",
        label: "Notice period",
        score: result.recommendation === "Reject" ? 35 : 82,
        evidence: "Checked against the 90-day knockout rule.",
      },
    ],
    knockouts: [
      {
        criterion: "Notice period over 90 days",
        passed: result.recommendation !== "Reject",
        detail:
          result.recommendation === "Reject"
            ? "May exceed policy — verify in transcript"
            : "Within policy",
      },
      {
        criterion: "Salary expectation above band",
        passed: result.recommendation !== "Reject",
        detail:
          result.recommendation === "Reject"
            ? "Expectation may be above band"
            : "Within or near band",
      },
      {
        criterion: "Declined recording consent",
        passed: true,
        detail: "Consent given",
      },
    ],
    transcript: [
      {
        id: "tf1",
        speaker: "AI",
        text: `Hi ${result.candidateName.split(" ")[0]}, this is the Huntlo screening agent. This call is recorded — is that okay?`,
        time: "0:00",
      },
      {
        id: "tf2",
        speaker: "Candidate",
        text: "Yes, go ahead.",
        time: "0:10",
      },
      {
        id: "tf3",
        speaker: "AI",
        text: "Thanks. Let's walk through a few questions about your experience and availability.",
        time: "0:16",
      },
      {
        id: "tf4",
        speaker: "Candidate",
        text: "Sure.",
        time: "0:22",
      },
      {
        id: "tf5",
        speaker: "AI",
        text: "Thank you for your time. We'll share next steps with the recruiting team.",
        time: result.duration.replace("m ", ":").replace("s", ""),
      },
    ],
    recording: {
      durationSeconds: parseDuration(result.duration),
      label: `${result.candidateName.toLowerCase().replace(/\s+/g, "-")}-${result.screeningId}.mp3`,
      size: "1.8 MB",
    },
    extracted: result.keyVariables.map((value, index) => ({
      id: `ex-${index}`,
      label: `Variable ${index + 1}`,
      value,
      confidence: "Medium" as const,
    })),
    activity: [
      {
        id: "af1",
        icon: PhoneCall,
        title: "Call completed",
        detail: `${result.duration} · score ${result.overallScore} · ${result.recommendation}`,
        time: result.completedDate,
      },
      {
        id: "af2",
        icon: CheckCircle2,
        title: "AI scorecard generated",
        detail: "Category scores and knockout checks ready for review",
        time: result.completedDate,
      },
    ],
  };
}

function parseDuration(label: string): number {
  const match = label.match(/(\d+)m\s*(\d+)s/);
  if (!match) return 300;
  return Number(match[1]) * 60 + Number(match[2]);
}
