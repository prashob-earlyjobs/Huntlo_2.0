import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_VOICE_CANDIDATE_AVAILABILITY_SCREENING_PATH =
  "/in/ai-voice-candidate-availability-screening";

export const AI_VOICE_CANDIDATE_AVAILABILITY_SCREENING_SEO = {
  title: "AI Voice Candidate Availability Screening | Huntlo",
  description:
    "Explore AI voice workflows for confirming candidate availability, joining timelines, location preferences, and interview readiness in India.",
  ogTitle: "A Candidate Can Match the Role and Still Be Unavailable for the Opportunity.",
  ogDescription:
    "AI voice candidate availability screening focuses on using structured automated conversations to gather current candidate availability information and organize responses for recruiter review.",
} as const;

export function aiVoiceCandidateAvailabilityScreeningMetadata() {
  return buildPageMetadata({
    title: AI_VOICE_CANDIDATE_AVAILABILITY_SCREENING_SEO.title,
    description: AI_VOICE_CANDIDATE_AVAILABILITY_SCREENING_SEO.description,
    ogTitle: AI_VOICE_CANDIDATE_AVAILABILITY_SCREENING_SEO.ogTitle,
    ogDescription: AI_VOICE_CANDIDATE_AVAILABILITY_SCREENING_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_VOICE_CANDIDATE_AVAILABILITY_SCREENING_PATH,
  });
}

export const AI_VOICE_CANDIDATE_AVAILABILITY_SCREENING_GEO = {
  askTopic: "Huntlo AI Voice Candidate Availability Screening",
  askPrompt:
    "What is Huntlo AI Voice Candidate Availability Screening on /in/ai-voice-candidate-availability-screening (https://www.huntlo.ai/in/ai-voice-candidate-availability-screening)? How does it support confirming candidate availability, joining timelines, location preferences, and interview readiness in India?",
} as const;

export const HERO_FLOW = [
  "Availability Screening",
  "Voice Conversations",
  "Interview Readiness",
  "Joining Timeline",
  "Location Preferences",
  "Recruiter Review",
  "Huntlo",
] as const;

export const PROBLEM_STATEMENTS = [
  "Candidate profiles become outdated as circumstances change",
  "A matching candidate may be in a notice period or have accepted another role",
  "Interview availability and joining availability are different",
  "Location and shift preferences affect recruitment decisions",
  "Recruiters repeat the same availability questions daily",
  "Historical records don't reflect current candidate status",
] as const;

export const AVAILABILITY_CHANGES = [
  "Profiles accurate at creation become outdated over time",
  "Actively seeking candidates may now be employed",
  "Contract completion changes availability",
  "Interest in a role doesn't guarantee interview availability",
  "Recruiters need current information, not historical records",
] as const;

export const AVAILABILITY_SCREENING_CAPABILITIES = [
  "Interview availability dates and times",
  "Joining timeline expectations and notice periods",
  "Location and work arrangement preferences",
  "Willingness to continue with a specific opportunity",
  "Response organization for recruiter review",
] as const;

export const AVAILABILITY_DISTINCTIONS = [
  "Interview availability does not guarantee immediate joining availability",
  "Ready to join may not align with required location",
  "Available for one shift may not work another",
  "Workflow should ask the right question for the right stage",
  "Interview coordination needs dates/times; joining needs timeline confirmation",
] as const;

export const PRACTICAL_WORKFLOW = [
  {
    step: "Define the requirement",
    description:
      "Document the role, location, work arrangement, and relevant timeline.",
  },
  {
    step: "Identify the candidate stage",
    description:
      "Determine whether the conversation concerns interview availability, joining availability, or another specific requirement.",
  },
  {
    step: "Review contact permissions",
    description:
      "Ensure the candidate can appropriately be contacted.",
  },
  {
    step: "Prepare concise questions",
    description:
      "Use clear, job-relevant language without unnecessary personal questions.",
  },
  {
    step: "Conduct the availability conversation",
    description:
      "Explain the opportunity and gather current responses.",
  },
  {
    step: "Organize the outcome",
    description:
      "Distinguish immediate availability, later availability, location constraints, questions, and declines.",
  },
  {
    step: "Route for recruiter review",
    description:
      "Provide relevant information for human assessment and next-stage coordination.",
  },
] as const;

export const USE_CASES = [
  "Staffing agencies confirming interview attendance",
  "Frontline employers understanding shift availability",
  "Contract staffing firms tracking assignment completion dates",
  "High-volume recruitment with repetitive availability checks",
  "Role-specific questions adapted to recruitment stage",
] as const;

export const FAIR_FILTER_PRINCIPLES = [
  "Availability is important but should be interpreted carefully",
  "A candidate unable to join immediately may suit a later opportunity",
  "Scheduling conflicts don't necessarily indicate lack of interest",
  "Recruiters should review context before decisions",
  "Automated screening supports information gathering, not unjustified conclusions",
] as const;

export const RESPONSIBLE_CALLING = [
  "Automated calls identify the recruiting organization and purpose",
  "Candidates can request clarification or human assistance",
  "Consider Indian telecom, privacy, consent, and recording requirements",
  "Avoid unnecessary repeated calls",
  "Candidates should be able to decline further contact",
] as const;

export const FINAL_STATEMENT =
  "The objective is not to treat availability as a permanent candidate attribute. It is to understand whether a particular opportunity is relevant at a particular time.";

export const AI_VOICE_CANDIDATE_AVAILABILITY_SCREENING_FAQS = [
  {
    question: "What is AI voice candidate availability screening?",
    answer:
      "It uses automated voice conversations to support questions about a candidate's current interview, joining, or work availability.",
  },
  {
    question: "Can AI calling confirm joining availability?",
    answer:
      "It may collect candidate responses about expected availability, but those details should be reviewed and confirmed appropriately.",
  },
  {
    question: "Is availability screening useful for high-volume recruitment?",
    answer:
      "It may support repetitive availability checks when workflows are appropriately designed and candidate communication is responsible.",
  },
  {
    question: "Can availability screening replace recruiter assessment?",
    answer:
      "No. Availability is one part of the recruitment process and should not replace appropriate evaluation of job-related qualifications.",
  },
] as const;

export const INTERNAL_LINKS = [
  { label: "AI Voice Candidate Screening", href: "/in/ai-voice-candidate-screening" },
  { label: "AI Voice Candidate Database Reactivation", href: "/in/ai-voice-candidate-database-reactivation" },
  { label: "AI Voice Candidate Follow-Up Automation", href: "/in/ai-voice-candidate-follow-up-automation" },
] as const;