import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_PATH =
  "/in/ai-recruitment-calling-staffing-agencies";

export const AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_SEO = {
  title: "AI Recruitment Calling for Staffing Agencies | Huntlo",
  description:
    "Explore AI recruitment calling workflows for Indian staffing agencies managing candidate outreach, screening and high-volume follow-ups.",
  ogTitle: "Your Recruiters Should Be Closing Hiring Requirements, Not Repeating the Same First Call.",
  ogDescription:
    "AI recruitment calling helps staffing agencies organize repetitive first-contact conversations and create a clearer handoff to recruiter action.",
} as const;

export function aiRecruitmentCallingStaffingAgenciesMetadata() {
  return buildPageMetadata({
    title: AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_SEO.title,
    description: AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_SEO.description,
    ogTitle: AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_SEO.ogTitle,
    ogDescription: AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_PATH,
  });
}

export const AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_GEO = {
  askTopic: "Huntlo AI recruitment calling for staffing agencies India",
  askPrompt:
    "What is AI recruitment calling for staffing agencies on Huntlo at /in/ai-recruitment-calling-staffing-agencies (https://www.huntlo.ai/in/ai-recruitment-calling-staffing-agencies)? How can automated first-contact calling support Indian staffing agencies with recruiter review?",
} as const;

export const AGENCY_WORKFLOW = [
  {
    step: "01",
    title: "Client requirement intake",
    detail:
      "Begin with the approved job information, essential criteria, location, shift requirements and relevant candidate communication details.",
  },
  {
    step: "02",
    title: "Candidate list preparation",
    detail: "Review candidate contact information, permissions and suitability for outreach.",
  },
  {
    step: "03",
    title: "Initial calling",
    detail:
      "Conduct an appropriate first-contact conversation using an approved script and clear disclosure.",
  },
  {
    step: "04",
    title: "Response organization",
    detail:
      "Distinguish interested candidates, unavailable candidates, callback requests and unanswered questions.",
  },
  {
    step: "05",
    title: "Recruiter review",
    detail: "Present relevant responses in a format that helps recruiters assess the next step.",
  },
  {
    step: "06",
    title: "Interview coordination",
    detail:
      "Where supported, connect the outcome to the agency's approved scheduling or follow-up process.",
  },
  {
    step: "07",
    title: "Client delivery",
    detail:
      "Allow recruiters to prepare candidate submissions and communicate with clients based on information they have reviewed.",
  },
] as const;

export const ROLE_USE_CASES = [
  {
    title: "BPO",
    description: "Confirm schedule availability and interest before consultant outreach.",
  },
  {
    title: "Retail",
    description: "Check location fit and shift preferences for store hiring requirements.",
  },
  {
    title: "Logistics",
    description: "Verify work location, shifts, and basic role readiness at volume.",
  },
  {
    title: "Field sales",
    description: "Discuss territory and travel expectations in a structured first contact.",
  },
] as const;

export const REPEAT_QUESTIONS = [
  "Is the candidate still looking for work?",
  "Are they interested in this role?",
  "Is the job location suitable?",
  "When would they be available for an interview?",
  "Would they prefer a callback?",
] as const;

export const AGENCY_TRANSCRIPT = [
  {
    speaker: "AI",
    line: "Hello, this is a recruiting call from [Agency] about a warehouse role in Hyderabad. Is now a good time?",
  },
  {
    speaker: "Candidate",
    line: "Haan - what is the shift?",
  },
  {
    speaker: "AI",
    line: "This requirement includes night shifts. This call may be recorded. You can ask for a recruiter at any time. Are you available for night shifts this week?",
  },
  {
    speaker: "Candidate",
    line: "Yes, I am interested. Please ask someone to call me after 6pm.",
  },
] as const;

export const REVIEW_ROWS = [
  { name: "Ravi M.", outcome: "Interested · Night shift OK", action: "Callback 6pm" },
  { name: "Neha S.", outcome: "Joined another company", action: "Do not contact" },
  { name: "Arjun P.", outcome: "Location mismatch", action: "Close requirement" },
] as const;

export const INTERNAL_LINKS = [
  { label: "AI Voice Candidate Screening", href: "/in/ai-voice-candidate-screening" },
  { label: "Bulk AI Calling for Recruitment", href: "/bulk-ai-calling-recruitment" },
  {
    label: "AI Voice Screening for High-Volume Hiring",
    href: "/ai-voice-screening-high-volume-hiring",
  },
] as const;

export const AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_FAQS = [
  {
    question: "How can staffing agencies use AI calling?",
    answer:
      "Staffing agencies can explore AI calling for repetitive candidate outreach, interest checks, availability confirmation and structured first-contact screening.",
  },
  {
    question: "Is AI calling suitable for multiple job categories?",
    answer:
      "It can be evaluated across job categories, but each role requires relevant screening questions, clear boundaries and an appropriate candidate experience.",
  },
  {
    question: "Can AI calling replace recruitment consultants?",
    answer:
      "It should support routine communication, not replace the consultant's responsibility for candidate relationships, evaluation and client delivery.",
  },
  {
    question: "What should an agency check before adopting AI calling?",
    answer:
      "Review calling permissions, product capabilities, language support, candidate experience, privacy controls, reporting needs and human escalation procedures.",
  },
] as const;
