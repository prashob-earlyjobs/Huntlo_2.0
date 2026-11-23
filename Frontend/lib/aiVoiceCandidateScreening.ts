import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_VOICE_CANDIDATE_SCREENING_PATH = "/in/ai-voice-candidate-screening";

export const AI_VOICE_CANDIDATE_SCREENING_SEO = {
  title: "AI Voice Candidate Screening Software | Huntlo",
  description:
    "AI voice candidate screening software for India: structured calls for fit and availability, transcripts for recruiters, and human review before shortlist decisions.",
  ogTitle: "Thousands of Applications. Hundreds of Calls. Too Little Time to Speak to Everyone.",
  ogDescription:
    "AI voice candidate screening helps structure initial conversations, collect relevant information, and focus recruiter attention where it is needed most.",
} as const;

export function aiVoiceCandidateScreeningMetadata() {
  return buildPageMetadata({
    title: AI_VOICE_CANDIDATE_SCREENING_SEO.title,
    description: AI_VOICE_CANDIDATE_SCREENING_SEO.description,
    ogTitle: AI_VOICE_CANDIDATE_SCREENING_SEO.ogTitle,
    ogDescription: AI_VOICE_CANDIDATE_SCREENING_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_VOICE_CANDIDATE_SCREENING_PATH,
  });
}

export const AI_VOICE_CANDIDATE_SCREENING_GEO = {
  askTopic: "Huntlo AI voice candidate screening India",
  askPrompt:
    "What is AI voice candidate screening on Huntlo at /in/ai-voice-candidate-screening (https://www.huntlo.ai/in/ai-voice-candidate-screening)? How can automated voice conversations support initial recruitment screening in India with recruiter review?",
} as const;

export const PROBLEM_STEPS = [
  {
    step: "01",
    title: "Applications arrive",
    description: "Large pools for support, field sales, or warehouse roles - phone numbers ready.",
  },
  {
    step: "02",
    title: "Manual first calls",
    description: "Recruiters dial one by one: interest, shifts, location, callbacks, salary questions.",
  },
  {
    step: "03",
    title: "Workload stacks up",
    description: "Notes scatter. Consistency slips. Interviews wait on contact that never finishes.",
  },
] as const;

export const SCREENING_WORKFLOW = [
  {
    step: "01",
    title: "Define the hiring requirement",
    detail:
      "Identify the role, essential information, approved screening questions and circumstances requiring recruiter intervention.",
  },
  {
    step: "02",
    title: "Prepare the candidate contact process",
    detail: "Confirm that contact data and calling permissions meet applicable requirements.",
  },
  {
    step: "03",
    title: "Conduct the initial conversation",
    detail: "Use a clear introduction and a structured set of relevant questions.",
  },
  {
    step: "04",
    title: "Capture candidate responses",
    detail:
      "Record the information needed for recruiter review, subject to appropriate notice and privacy controls.",
  },
  {
    step: "05",
    title: "Identify next steps",
    detail:
      "Separate interested candidates, callback requests, unresolved questions and candidates who do not wish to continue.",
  },
  {
    step: "06",
    title: "Return control to recruiters",
    detail:
      "Provide an understandable summary so recruiters can review the information and decide what happens next.",
  },
] as const;

export const CALL_TRANSCRIPT = [
  {
    speaker: "AI",
    line: "Hello, this is a recruiting call about a customer support role. Is now a good time for two minutes?",
  },
  {
    speaker: "Candidate",
    line: "Yes - can you tell me about the shift?",
  },
  {
    speaker: "AI",
    line: "This role includes evening shifts. Before we continue, this call may be recorded. You can ask for a human recruiter anytime. Are you interested in continuing?",
  },
  {
    speaker: "Candidate",
    line: "Yes, evenings work for me. I am in Pune.",
  },
  {
    speaker: "AI",
    line: "Thank you. I will share your interest and location with the recruiting team for review.",
  },
] as const;

export const USE_CASES = [
  {
    title: "Customer support",
    description: "Confirm interest, shift comfort, and location before a live screen.",
  },
  {
    title: "Logistics",
    description: "Check basic role requirements and preferred work location at scale.",
  },
  {
    title: "Field sales",
    description: "Establish availability and travel expectations before recruiter time.",
  },
  {
    title: "Staffing agencies",
    description: "Confirm availability before arranging a client conversation.",
  },
] as const;

export const TRUST_CONTROLS = [
  {
    title: "Candidate choice",
    description:
      "Clear identity, purpose, and an easy path to decline further contact or request a person.",
  },
  {
    title: "Human escalation",
    description:
      "Unresolved questions and sensitive situations route to recruiters - not another automated loop.",
  },
  {
    title: "Privacy controls",
    description:
      "Consider telecom rules, consent, recording disclosures, and how responses are stored.",
  },
] as const;

export const INTERNAL_LINKS = [
  { label: "Bulk AI Calling for Recruitment", href: "/bulk-ai-calling-recruitment" },
  {
    label: "AI Voice Screening for High-Volume Hiring",
    href: "/ai-voice-screening-high-volume-hiring",
  },
  {
    label: "AI Recruitment Calling for Staffing Agencies",
    href: "/in/ai-recruitment-calling-staffing-agencies",
  },
] as const;

export const AI_VOICE_CANDIDATE_SCREENING_FAQS = [
  {
    question: "What is AI voice screening in recruitment?",
    answer:
      "It is the use of automated voice conversations to collect relevant candidate information and support initial recruitment screening.",
  },
  {
    question: "Can AI voice screening be used for bulk hiring?",
    answer:
      "It can be considered for high-volume recruitment processes, provided calling capacity, candidate permissions, workflow capabilities and operational controls are verified.",
  },
  {
    question: "Can AI screening calls support Indian languages?",
    answer:
      "Language support varies by provider and configuration. Huntlo's supported languages must be confirmed before publishing language-specific claims.",
  },
  {
    question: "Should AI decide whether a candidate is hired?",
    answer:
      "No automated screening output should be treated as an unquestioned final hiring decision. Recruiters should retain appropriate review and accountability.",
  },
] as const;
