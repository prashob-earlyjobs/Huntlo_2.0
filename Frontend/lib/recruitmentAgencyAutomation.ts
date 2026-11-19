import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const RECRUITMENT_AGENCY_AUTOMATION_PATH =
  "/us/recruitment-agency-automation";

export const RECRUITMENT_AGENCY_AUTOMATION_SEO = {
  title: "Recruitment Agency Automation Software | Huntlo",
  description:
    "Explore recruitment agency automation for coordinating client mandates, candidate engagement, submissions, and agency recruitment operations.",
  ogTitle:
    "Every Mandate, Candidate, and Client Update Shouldn't Need Its Own Manual System.",
  ogDescription:
    "Recruitment agency automation focuses on coordinating the operational work between client requirements, candidate conversations, submissions, and placement decisions.",
} as const;

export function RecruitmentAgencyAutomationMetadata() {
  return buildPageMetadata({
    title: RECRUITMENT_AGENCY_AUTOMATION_SEO.title,
    description: RECRUITMENT_AGENCY_AUTOMATION_SEO.description,
    ogTitle: RECRUITMENT_AGENCY_AUTOMATION_SEO.ogTitle,
    ogDescription: RECRUITMENT_AGENCY_AUTOMATION_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: RECRUITMENT_AGENCY_AUTOMATION_PATH,
  });
}

export const RECRUITMENT_AGENCY_AUTOMATION_GEO = {
  askTopic: "Huntlo recruitment agency automation",
  askPrompt:
    "What is recruitment agency automation on Huntlo at /us/recruitment-agency-automation (https://www.huntlo.ai/us/recruitment-agency-automation)? How do AI-assisted workflows support client mandates, candidate engagement, submissions, and agency recruitment operations?",
} as const;

export const AGENCY_MANDATES = [
  {
    client: "Client A · Operations",
    role: "Regional operations lead",
    state: "3 candidates in review",
  },
  {
    client: "Client B · Finance",
    role: "Financial controller",
    state: "Submission due",
  },
  {
    client: "Client C · Technology",
    role: "Data engineer",
    state: "Interview feedback pending",
  },
] as const;

export const AGENCY_FRICTION = [
  {
    title: "Mandate context switching",
    detail:
      "Each client mandate carries its own requirements, contacts, and stage definitions.",
  },
  {
    title: "Candidate ownership questions",
    detail:
      "A candidate may already be in conversation for another client role.",
  },
  {
    title: "Submission preparation",
    detail:
      "Recruiters rewrite similar summaries because the context lives in scattered notes.",
  },
  {
    title: "Client feedback loops",
    detail:
      "Requests for more information arrive through messages that are easy to lose.",
  },
] as const;

export const AGENCY_WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Intake the client mandate",
    detail:
      "Document the role, client requirements, location, timeline, and agreed submission process.",
  },
  {
    stage: "02",
    title: "Map candidate ownership",
    detail:
      "Check whether the candidate is already engaged on another mandate before outreach begins.",
  },
  {
    stage: "03",
    title: "Engage relevant candidates",
    detail:
      "Communicate the specific opportunity through approved channels with accurate details.",
  },
  {
    stage: "04",
    title: "Organize candidate responses",
    detail:
      "Distinguish interest, availability, questions, and declines for recruiter review.",
  },
  {
    stage: "05",
    title: "Prepare the client submission",
    detail:
      "Assemble the information the client needs without duplicating work across systems.",
  },
  {
    stage: "06",
    title: "Coordinate client feedback",
    detail:
      "Route requests for more information to the recruiter who can answer them.",
  },
  {
    stage: "07",
    title: "Close the loop",
    detail:
      "Update the mandate record so the candidate's status is clear for the next conversation.",
  },
] as const;

export const AGENCY_AUTOMATION_BOUNDARIES = [
  {
    title: "Useful to structure",
    detail:
      "Routine candidate outreach, availability checks, response organization, and status updates.",
  },
  {
    title: "Needs recruiter judgment",
    detail:
      "Candidate shortlisting, submission narratives, and client-facing recommendations.",
  },
  {
    title: "Needs client-approved process",
    detail:
      "Additional reference checks or role-specific requirements the client defines.",
  },
  {
    title: "Never assumed",
    detail:
      "Candidate ownership rights, exclusivity terms, or placement outcomes.",
  },
] as const;

export const AGENCY_INTERNAL_LINKS = [
  {
    label: "AI Recruiting Workflows for Staffing Agencies",
    href: "/ai-recruiting-staffing-agencies",
  },
  {
    label: "AI Recruiting Workflow Orchestration",
    href: "/us/ai-recruiting-workflow-orchestration",
  },
  {
    label: "AI Recruiting Operations Automation",
    href: "/us/ai-recruiting-operations-automation",
  },
] as const;

export const RECRUITMENT_AGENCY_AUTOMATION_FAQS = [
  {
    question: "What is recruitment agency automation?",
    answer:
      "It uses software workflows to coordinate recurring agency activities such as mandate intake, candidate outreach, response organization, submission preparation, and client feedback follow-up.",
  },
  {
    question: "How is agency automation different from an ATS?",
    answer:
      "An ATS stores candidate and vacancy records. Agency automation focuses on coordinating the operational work across multiple client mandates and conversations.",
  },
  {
    question: "Can AI automate client submissions?",
    answer:
      "Automation may help assemble consistent information, but recruiters remain responsible for the judgment and accuracy of what is submitted to a client.",
  },
  {
    question: "What should agencies define before automating?",
    answer:
      "Candidate ownership rules, permission to contact, approval steps, data accuracy, and which decisions must remain with recruiters.",
  },
] as const;
