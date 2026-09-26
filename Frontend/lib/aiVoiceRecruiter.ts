import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_VOICE_RECRUITER_PATH = "/ai-voice-recruiter";

export const AI_VOICE_RECRUITER_SEO = {
  title: "AI Voice Recruiter — Screen Every Candidate Before You Call | Huntlo",
  description:
    "Huntlo AI Voice Recruiter calls candidates, asks role-specific questions, qualifies intent, and delivers interview-ready shortlists — before recruiters spend a minute on the phone.",
  ogTitle: "The AI Recruiter that screens every candidate before your team picks up the phone.",
  ogDescription:
    "Stop screening candidates manually. Huntlo calls, qualifies, and shortlists — then your recruiters interview.",
} as const;

export function aiVoiceRecruiterMetadata() {
  return buildPageMetadata({
    title: AI_VOICE_RECRUITER_SEO.title,
    description: AI_VOICE_RECRUITER_SEO.description,
    ogTitle: AI_VOICE_RECRUITER_SEO.ogTitle,
    ogDescription: AI_VOICE_RECRUITER_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_VOICE_RECRUITER_PATH,
  });
}

export const AI_VOICE_RECRUITER_GEO = {
  askTopic: "Huntlo AI Voice Recruiter",
  askPrompt:
    "What is Huntlo AI Voice Recruiter on /ai-voice-recruiter (https://www.huntlo.ai/ai-voice-recruiter)? How does it call, qualify, and shortlist candidates before recruiters spend time screening?",
} as const;

export const DEMO_CALL_LIMIT = 2;

export const DEMO_JOBS = [
  "Customer Care Executive",
  "Business Development Executive",
  "MERN Developer",
  "Delivery Partner",
] as const;

export const TRUST_METRICS = [
  { value: "80%", label: "Less Manual Screening" },
  { value: "5x", label: "Faster Candidate Qualification" },
  { value: "24×7", label: "AI Recruiter Availability" },
  { value: "100%", label: "Conversation Logs" },
] as const;

export const TODAY_STEPS = [
  "Search",
  "Find Number",
  "Call",
  "Repeat Questions",
  "Take Notes",
  "Update ATS",
  "Repeat",
] as const;

export const HUNTLO_STEPS = [
  "AI Finds Candidates",
  "AI Calls",
  "AI Qualifies",
  "AI Scores",
  "Interview Ready",
  "Recruiter Reviews",
] as const;

export const CAPABILITIES = [
  "Calls candidates automatically",
  "Human-like conversations",
  "Understands candidate responses",
  "Screens based on your JD",
  "Answers FAQs",
  "Detects interest",
  "Captures notice period",
  "Salary expectations",
  "Availability",
  "Interview readiness",
  "Sends recruiter summary",
] as const;

export const CONVERSATION = [
  {
    speaker: "AI" as const,
    text: "Hi Rahul, I'm calling regarding the Backend Engineer opportunity at ABC Technologies. Is this a good time to talk?",
  },
  { speaker: "Candidate" as const, text: "Yes." },
  {
    speaker: "AI" as const,
    text: "Great. I have a few quick questions. How many years have you worked with Node.js in production?",
  },
  {
    speaker: "Candidate" as const,
    text: "About five years — mostly APIs, queues, and Postgres.",
  },
  {
    speaker: "AI" as const,
    text: "What's your notice period, and the compensation range you're considering?",
  },
  {
    speaker: "Candidate" as const,
    text: "30 days. Around 18 LPA.",
  },
  {
    speaker: "AI" as const,
    text: "Would you be open to an interview this week if the team shortlists you?",
  },
  { speaker: "Candidate" as const, text: "Yes, I'm interested." },
] as const;

export const SCORE_ROWS = [
  { label: "Node.js", stars: 5 },
  { label: "Communication", stars: 5 },
  { label: "Relevant Experience", stars: 4 },
] as const;

export const WORKFLOW = [
  "Hiring Need",
  "AI Search",
  "People Scout",
  "AI Voice Recruiter",
  "Candidate Qualified",
  "Recruiter Review",
  "Interview",
  "Hire",
] as const;

export const WHY_CARDS = [
  {
    title: "Human-like Conversations",
    description: "Natural conversations that adapt based on candidate responses.",
  },
  {
    title: "JD-aware Interviews",
    description: "Every call is personalized using your job description.",
  },
  {
    title: "Automatic Qualification",
    description: "AI identifies relevant candidates before recruiters spend time.",
  },
  {
    title: "Smart Summaries",
    description: "Every conversation becomes structured recruiter insights.",
  },
  {
    title: "Works 24×7",
    description: "Candidates respond when they're available.",
  },
  {
    title: "Integrated Workflow",
    description: "Works seamlessly with Huntlo sourcing and campaigns.",
  },
] as const;

export const TEAMS = [
  { title: "Startup Hiring", description: "Founders get a shortlist without building a recruiting desk." },
  { title: "Agency Recruiting", description: "Screen client roles overnight and send interview-ready profiles." },
  { title: "Staffing Firms", description: "Run high-volume calls without adding coordinators." },
  { title: "Enterprise TA", description: "Standardize screening across teams with audit-ready logs." },
  { title: "Bulk Hiring", description: "Qualify hundreds of applicants before a recruiter opens a profile." },
  { title: "Campus Hiring", description: "Ask the same role questions, fairly, at campus scale." },
] as const;

export const SECURITY = [
  "Role Based Access",
  "Audit Logs",
  "Encrypted Calls",
  "GDPR Ready",
  "SOC2 Roadmap",
  "API Ready",
  "ATS Integrations",
] as const;

export const AI_VOICE_RECRUITER_FAQS = [
  {
    question: "Can AI replace recruiter screening?",
    answer:
      "It replaces the repetitive first screen — calling, repeating questions, and taking notes. Recruiters still decide who to interview and who to hire.",
  },
  {
    question: "How human does the conversation sound?",
    answer:
      "The recruiter agent speaks in natural turns, listens to answers, and follows up. It is built to feel like a short screening call, not a robocall script.",
  },
  {
    question: "Can AI answer candidate questions?",
    answer:
      "Yes. It can answer FAQs from the job description — role, location, work mode, and process — and flag anything it should hand to a recruiter.",
  },
  {
    question: "Can I customize questions?",
    answer:
      "Yes. Questions come from your job description and the signals you care about: skills, notice period, salary, availability, and interview readiness.",
  },
  {
    question: "Does it integrate with our ATS?",
    answer:
      "Huntlo is API-ready and built to sit beside your ATS. Qualified candidates, scores, and conversation summaries can move into the hiring pipeline your team already uses.",
  },
  {
    question: "Can AI qualify based on any JD?",
    answer:
      "Upload a job description or paste the role. The agent screens against that JD — title, must-have skills, and the questions a recruiter would ask first.",
  },
  {
    question: "How many demo calls do I get?",
    answer:
      "Each company receives 2 complimentary AI demo calls. The AI Recruiter calls the mobile number you enter and runs the same screen it would with a candidate.",
  },
] as const;
